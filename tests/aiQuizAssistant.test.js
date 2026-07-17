const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../server');
const database = require('../database/db');
const authService = require('../services/authService');
const aiQuizService = require('../services/aiQuizService');
const settingsService = require('../services/settingsService');
const { parseAndValidateAIQuiz, validateGenerationInput } = require('../validators/aiQuizValidator');

const TEST_DB = path.join(__dirname, 'test_ai_quiz.db');
const FAKE_KEY = 'unit-test-placeholder-key-1234';
let courseId;
let teacherCookie;
let studentCookie;

function removeDbFiles() {
  Object.values(database.resolveDatabaseFiles(TEST_DB)).forEach(file => {
    [file, `${file}-shm`, `${file}-wal`].forEach(candidate => {
      if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
    });
  });
}

function quizResponse(count = 2) {
  return {
    title: 'AI Review Draft',
    description: 'A draft that must be reviewed.',
    difficulty: 'medium',
    questions: Array.from({ length: count }, (_, index) => ({
      type: 'multiple_choice',
      text: `Which answer is correct for item ${index + 1}?`,
      options: ['First', 'Second', `Correct ${index + 1}`],
      correctAnswer: `Correct ${index + 1}`,
      explanation: `Correct ${index + 1} is the expected answer.`,
      sourceHint: ''
    }))
  };
}

function oversizedDocxArchive() {
  const name = Buffer.from('[Content_Types].xml');
  const local = Buffer.alloc(30 + name.length);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(0, 8);
  local.writeUInt32LE(0, 18);
  local.writeUInt32LE(40 * 1024 * 1024, 22);
  local.writeUInt16LE(name.length, 26);
  name.copy(local, 30);

  const central = Buffer.alloc(46 + name.length);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(0, 10);
  central.writeUInt32LE(0, 20);
  central.writeUInt32LE(40 * 1024 * 1024, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(0, 42);
  name.copy(central, 46);

  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(local.length, 16);
  return Buffer.concat([local, central, end]);
}

beforeAll(() => {
  removeDbFiles();
  delete process.env.AZURE_OPENAI_ENDPOINT;
  delete process.env.AZURE_OPENAI_API_KEY;
  delete process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  delete process.env.AZURE_OPENAI_API_VERSION;
  database.initDatabase(TEST_DB);
  database.seedDatabase();
  settingsService.setMaintenanceMode(false);
  courseId = database.getDatabase().prepare('SELECT id FROM courses WHERE code = ?').get('DEMO101').id;
  teacherCookie = `auth_token=${authService.login('teacher@example.com', 'Teacher123!').token}`;
  studentCookie = `auth_token=${authService.login('STU-0003', 'Student123!').token}`;
});

afterAll(() => {
  database.closeDatabase();
  removeDbFiles();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AI quiz validation', () => {
  test('rejects malformed JSON, duplicate options, and invalid question counts', () => {
    expect(() => parseAndValidateAIQuiz('{not json}', { questionCount: 1 })).toThrow(/malformed JSON/i);
    const duplicate = quizResponse(1);
    duplicate.questions[0].options = ['Same', 'same', 'Different'];
    duplicate.questions[0].correctAnswer = 'Different';
    expect(() => parseAndValidateAIQuiz(duplicate, { questionCount: 1 })).toThrow(/unique/i);
    expect(() => validateGenerationInput({ topic: 'Trees', questionCount: 21 })).toThrow(/between 1 and 20/i);
  });

  test('rejects source references whose material does not own the cited chunk', () => {
    const grounded = quizResponse(1);
    grounded.questions[0].sourceReferences = [{
      chunkId: 7,
      materialId: 999,
      label: 'Fabricated source label'
    }];
    expect(() => parseAndValidateAIQuiz(grounded, {
      questionCount: 1,
      allowedSourceChunkIds: [7],
      sourceChunks: [{
        id: 7,
        materialId: 3,
        sourceLabel: 'Week 4 notes',
        content: 'The correct answer appears in these notes.'
      }]
    })).toThrow(/does not contain the supplied source chunk/i);
  });
});

describe('AI Quiz Assistant routes', () => {
  test('always advertises the conversational API version in settings status', () => {
    const db = database.getDatabase();
    const teacher = db.prepare('SELECT id FROM users WHERE email = ?').get('teacher@example.com');
    const originalSettings = db.prepare('SELECT * FROM ai_user_settings WHERE userId = ?').get(teacher.id);
    const envKeys = [
      'AI_QUIZ_ENABLED',
      'AZURE_OPENAI_ENDPOINT',
      'AZURE_OPENAI_API_KEY',
      'AZURE_OPENAI_CHAT_DEPLOYMENT',
      'AZURE_OPENAI_EMBEDDING_DEPLOYMENT',
      'AZURE_OPENAI_API_VERSION'
    ];
    const originalEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
    const clearAzureEnvironment = () => {
      envKeys.slice(1).forEach(key => delete process.env[key]);
    };

    try {
      db.prepare('DELETE FROM ai_user_settings WHERE userId = ?').run(teacher.id);
      clearAzureEnvironment();

      process.env.AI_QUIZ_ENABLED = 'false';
      expect(aiQuizService.getSettingsStatus(teacher.id)).toMatchObject({
        conversationApiVersion: 1,
        enabled: false,
        configured: false
      });

      process.env.AI_QUIZ_ENABLED = 'true';
      expect(aiQuizService.getSettingsStatus(teacher.id)).toMatchObject({
        conversationApiVersion: 1,
        enabled: true,
        configured: false,
        source: 'none'
      });

      db.prepare(`
        INSERT INTO ai_user_settings (
          userId, endpoint, encryptedApiKey, keyIv, keyAuthTag,
          chatDeployment, embeddingDeployment, apiVersion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        teacher.id,
        'https://unreadable.openai.azure.com',
        'AA==',
        'AAAAAAAAAAAAAAAA',
        'AAAAAAAAAAAAAAAAAAAAAA==',
        'chat',
        '',
        '2024-10-21'
      );
      expect(aiQuizService.getSettingsStatus(teacher.id)).toMatchObject({
        conversationApiVersion: 1,
        enabled: true,
        configured: false,
        source: 'user'
      });

      db.prepare('DELETE FROM ai_user_settings WHERE userId = ?').run(teacher.id);
      process.env.AZURE_OPENAI_ENDPOINT = 'https://environment.openai.azure.com';
      process.env.AZURE_OPENAI_API_KEY = 'environment-placeholder-key';
      process.env.AZURE_OPENAI_CHAT_DEPLOYMENT = 'chat';
      process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT = 'embeddings';
      process.env.AZURE_OPENAI_API_VERSION = '2024-10-21';
      expect(aiQuizService.getSettingsStatus(teacher.id)).toMatchObject({
        conversationApiVersion: 1,
        enabled: true,
        configured: true,
        source: 'environment'
      });
    } finally {
      db.prepare('DELETE FROM ai_user_settings WHERE userId = ?').run(teacher.id);
      if (originalSettings) {
        db.prepare(`
          INSERT INTO ai_user_settings (
            userId, endpoint, encryptedApiKey, keyIv, keyAuthTag,
            chatDeployment, embeddingDeployment, apiVersion, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          originalSettings.userId,
          originalSettings.endpoint,
          originalSettings.encryptedApiKey,
          originalSettings.keyIv,
          originalSettings.keyAuthTag,
          originalSettings.chatDeployment,
          originalSettings.embeddingDeployment,
          originalSettings.apiVersion,
          originalSettings.createdAt,
          originalSettings.updatedAt
        );
      }
      envKeys.forEach(key => {
        if (originalEnv[key] === undefined) delete process.env[key];
        else process.env[key] = originalEnv[key];
      });
    }
  });

  test('reports missing credentials clearly and rejects student access', async () => {
    await request(app)
      .get('/api/ai/settings/status')
      .set('Cookie', teacherCookie)
      .expect(200)
      .expect(response => {
        expect(response.body.configured).toBe(false);
        expect(response.body.conversationApiVersion).toBe(1);
        expect(response.body.message).toMatch(/enter your own/i);
      });

    await request(app)
      .get('/api/ai/settings/status')
      .set('Cookie', studentCookie)
      .expect(403);

    await request(app)
      .post(`/api/courses/${courseId}/ai/generate-quiz`)
      .set('Cookie', teacherCookie)
      .send({ topic: 'Trees', difficulty: 'medium', questionCount: 2, questionType: 'mixed', language: 'English' })
      .expect(400)
      .expect(response => expect(response.body.message).toMatch(/enter your own Azure OpenAI API key/i));
  });

  test('saves encrypted settings and never returns the API key', async () => {
    const response = await request(app)
      .post('/api/ai/settings')
      .set('Cookie', teacherCookie)
      .send({
        endpoint: 'https://unit-test.openai.azure.com',
        apiKey: FAKE_KEY,
        chatDeployment: 'chat-demo',
        embeddingDeployment: 'embedding-demo',
        apiVersion: '2024-10-21'
      })
      .expect(200);

    expect(response.body.configured).toBe(true);
    expect(response.body.conversationApiVersion).toBe(1);
    expect(response.body.maskedApiKey).toBe('****1234');
    expect(JSON.stringify(response.body)).not.toContain(FAKE_KEY);

    const stored = database.getDatabase().prepare('SELECT * FROM ai_user_settings').get();
    expect(stored.encryptedApiKey).not.toContain(FAKE_KEY);
  });

  test('validates upload signatures before parsing or storing material', async () => {
    await request(app)
      .post(`/api/courses/${courseId}/ai/materials`)
      .set('Cookie', teacherCookie)
      .attach('file', Buffer.from('not really a pdf'), { filename: 'notes.pdf', contentType: 'application/pdf' })
      .expect(400)
      .expect(response => expect(response.body.message || response.body.error).toMatch(/valid PDF/i));

    expect(database.getDatabase().prepare('SELECT COUNT(*) AS count FROM ai_course_materials').get().count).toBe(0);

    await request(app)
      .post(`/api/courses/${courseId}/ai/materials`)
      .set('Cookie', teacherCookie)
      .attach('file', oversizedDocxArchive(), {
        filename: 'expanded-bomb.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      .expect(400)
      .expect(response => {
        expect(response.body.message || response.body.error).toMatch(/expands beyond the safe processing limit/i);
      });
  });

  test('saves valid model output as an AI draft and never publishes it automatically', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(quizResponse(2)) } }] })
    });

    const response = await request(app)
      .post(`/api/courses/${courseId}/ai/generate-quiz`)
      .set('Cookie', teacherCookie)
      .send({
        topic: 'Binary trees',
        difficulty: 'medium',
        questionCount: 2,
        questionType: 'multiple_choice',
        language: 'English',
        includeExplanations: true
      })
      .expect(201);

    expect(response.body.status).toBe('draft');
    expect(response.body.draft.questions).toHaveLength(2);
    expect(database.getDatabase().prepare('SELECT COUNT(*) AS count FROM ai_quiz_drafts WHERE status = ?').get('draft').count).toBe(1);
    expect(database.getDatabase().prepare('SELECT COUNT(*) AS count FROM quizzes WHERE title = ?').get('AI Review Draft').count).toBe(0);
    expect(JSON.stringify(response.body)).not.toContain(FAKE_KEY);

    const published = await request(app)
      .post(`/api/courses/${courseId}/ai/drafts/${response.body.id}/publish`)
      .set('Cookie', teacherCookie)
      .expect(201);
    expect(published.body.status).toBe('published');
    expect(published.body.questions).toHaveLength(2);
    expect(database.getDatabase().prepare('SELECT status FROM ai_quiz_drafts WHERE id = ?').get(response.body.id).status).toBe('published');
  });

  test('rejects malformed Azure output without creating a draft', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: 'definitely not json' } }] })
    });
    const before = database.getDatabase().prepare('SELECT COUNT(*) AS count FROM ai_quiz_drafts').get().count;

    await request(app)
      .post(`/api/courses/${courseId}/ai/generate-quiz`)
      .set('Cookie', teacherCookie)
      .send({ topic: 'Graphs', difficulty: 'easy', questionCount: 1, questionType: 'mixed', language: 'English' })
      .expect(400)
      .expect(response => expect(response.body.message).toMatch(/malformed JSON/i));

    expect(database.getDatabase().prepare('SELECT COUNT(*) AS count FROM ai_quiz_drafts').get().count).toBe(before);
  });
});
