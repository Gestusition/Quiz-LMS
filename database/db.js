const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/security');

const DATABASE_CONTEXTS = {
  users: 'All users, password hashes, sessions, and reset requests',
  admin: 'Admin-only account profile data',
  teacher: 'Teacher-only account profile data',
  student: 'Student-only account profile data',
  learning: 'Courses, enrollments, and question categories',
  assessment: 'Questions, quizzes, attempts, and grades',
  content: 'Announcements and learning resources'
};

let db;
let activeFiles;

function initDatabase(dbPath) {
  activeFiles = resolveDatabaseFiles(dbPath);
  ensureDatabaseDirectory(activeFiles);

  db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');

  attachContextDatabases(activeFiles);
  createTables();
  migrateExistingTables();
  migrateLegacySingleDatabase(dbPath);

  return db;
}

function resolveDatabaseFiles(dbPath) {
  if (dbPath) {
    const dir = path.dirname(dbPath);
    const ext = path.extname(dbPath);
    const base = path.basename(dbPath, ext);
    return {
      users: path.join(dir, `${base}.users.sqlite`),
      admin: path.join(dir, `${base}.admin.sqlite`),
      teacher: path.join(dir, `${base}.teacher.sqlite`),
      student: path.join(dir, `${base}.student.sqlite`),
      learning: path.join(dir, `${base}.learning.sqlite`),
      assessment: path.join(dir, `${base}.assessment.sqlite`),
      content: path.join(dir, `${base}.content.sqlite`),
      legacyIdentity: path.join(dir, `${base}.identity.sqlite`),
      legacy: dbPath
    };
  }

  const dataDir = path.join(__dirname, '..', 'data');
  return {
    users: path.join(dataDir, 'quiz.users.sqlite'),
    admin: path.join(dataDir, 'quiz.admin.sqlite'),
    teacher: path.join(dataDir, 'quiz.teacher.sqlite'),
    student: path.join(dataDir, 'quiz.student.sqlite'),
    learning: path.join(dataDir, 'quiz.learning.sqlite'),
    assessment: path.join(dataDir, 'quiz.assessment.sqlite'),
    content: path.join(dataDir, 'quiz.content.sqlite'),
    legacyIdentity: path.join(dataDir, 'quiz.identity.sqlite'),
    legacy: path.join(__dirname, '..', 'quiz.db')
  };
}

function ensureDatabaseDirectory(files) {
  Object.entries(files)
    .filter(([name]) => !['legacy', 'legacyIdentity'].includes(name))
    .forEach(([, filePath]) => {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    });
}

function attachContextDatabases(files) {
  Object.keys(DATABASE_CONTEXTS).forEach(schema => {
    db.exec(`ATTACH DATABASE '${escapeSqlPath(files[schema])}' AS ${schema}`);
    db.exec(`PRAGMA ${schema}.journal_mode = WAL`);
  });
}

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users.users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student')),
      passwordHash TEXT NOT NULL,
      passwordSalt TEXT NOT NULL,
      passwordAlgorithm TEXT NOT NULL DEFAULT 'scrypt+salt+spice',
      mustChangeCredentials INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'disabled')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users.sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      tokenHash TEXT NOT NULL UNIQUE,
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      lastSeenAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users.password_reset_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      requestedUsername TEXT NOT NULL,
      codeHash TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'requested' CHECK(status IN ('requested', 'issued', 'used', 'expired')),
      expiresAt TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      issuedAt TEXT DEFAULT '',
      usedAt TEXT DEFAULT '',
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin.admin_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      displayName TEXT DEFAULT '',
      facultyId INTEGER,
      departmentId INTEGER,
      adminTitle TEXT DEFAULT '',
      securityNotes TEXT DEFAULT '',
      lastCredentialRotationAt TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teacher.teacher_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      displayName TEXT DEFAULT '',
      department TEXT DEFAULT '',
      facultyId INTEGER,
      departmentId INTEGER,
      academicTitle TEXT DEFAULT '',
      staffNumber TEXT DEFAULT '',
      officeHours TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student.student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      displayName TEXT DEFAULT '',
      studentNumber TEXT DEFAULT '',
      cohort TEXT DEFAULT '',
      facultyId INTEGER,
      departmentId INTEGER,
      classYearId INTEGER,
      sectionId INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning.faculties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning.departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      facultyId INTEGER NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(facultyId, code),
      FOREIGN KEY (facultyId) REFERENCES faculties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.class_years (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      departmentId INTEGER NOT NULL,
      yearNumber INTEGER NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(departmentId, yearNumber),
      FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      classYearId INTEGER NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(classYearId, name),
      FOREIGN KEY (classYearId) REFERENCES class_years(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.academic_terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      academicYear TEXT NOT NULL,
      semesterType TEXT NOT NULL CHECK(semesterType IN ('fall', 'spring', 'summer', 'winter', 'full-year', 'other')),
      startDate TEXT DEFAULT '',
      endDate TEXT DEFAULT '',
      isActive INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning.courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      departmentId INTEGER,
      credits INTEGER NOT NULL DEFAULT 3,
      visibility TEXT NOT NULL DEFAULT 'private' CHECK(visibility IN ('private', 'published', 'archived')),
      startDate TEXT DEFAULT '',
      endDate TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS learning.course_offerings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      termId INTEGER NOT NULL,
      instructorId INTEGER,
      departmentId INTEGER,
      classYearId INTEGER,
      sectionId INTEGER,
      capacity INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'planned' CHECK(status IN ('planned', 'active', 'completed', 'cancelled')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY (termId) REFERENCES academic_terms(id) ON DELETE CASCADE,
      FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL,
      FOREIGN KEY (classYearId) REFERENCES class_years(id) ON DELETE SET NULL,
      FOREIGN KEY (sectionId) REFERENCES sections(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS learning.course_offering_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseOfferingId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'dropped', 'completed')),
      finalGrade TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(courseOfferingId, studentId),
      FOREIGN KEY (courseOfferingId) REFERENCES course_offerings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'suspended')),
      createdAt TEXT DEFAULT (datetime('now')),
      UNIQUE(courseId, userId, role),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER,
      name TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS learning.attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseOfferingId INTEGER NOT NULL,
      termId INTEGER NOT NULL,
      sessionDate TEXT NOT NULL,
      topic TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (courseOfferingId) REFERENCES course_offerings(id) ON DELETE CASCADE,
      FOREIGN KEY (termId) REFERENCES academic_terms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning.attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
      note TEXT DEFAULT '',
      markedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(sessionId, studentId),
      FOREIGN KEY (sessionId) REFERENCES attendance_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId INTEGER NOT NULL,
      text TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR', 'MR')),
      options TEXT DEFAULT '[]',
      correctAnswer TEXT NOT NULL DEFAULT '',
      difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
      points REAL NOT NULL DEFAULT 1,
      richText TEXT DEFAULT '',
      explanationText TEXT DEFAULT '',
      hintText TEXT DEFAULT '',
      mediaUrl TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.question_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId INTEGER NOT NULL,
      partLabel TEXT NOT NULL DEFAULT '',
      partText TEXT NOT NULL DEFAULT '',
      answerType TEXT NOT NULL DEFAULT 'text',
      correctAnswer TEXT NOT NULL DEFAULT '',
      acceptedAnswers TEXT DEFAULT '[]',
      placeholder TEXT DEFAULT '',
      validationRule TEXT DEFAULT '',
      position INTEGER NOT NULL DEFAULT 0,
      points REAL NOT NULL DEFAULT 1,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.question_table_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId INTEGER NOT NULL UNIQUE,
      columnsJson TEXT NOT NULL DEFAULT '[]',
      rowCount INTEGER NOT NULL DEFAULT 1,
      prefillJson TEXT DEFAULT '{}',
      correctDataJson TEXT DEFAULT '{}',
      validationJson TEXT DEFAULT '{}',
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'closed')),
      openAt TEXT DEFAULT '',
      closeAt TEXT DEFAULT '',
      timeLimitMinutes INTEGER NOT NULL DEFAULT 0,
      attemptsAllowed INTEGER NOT NULL DEFAULT 1,
      shuffleQuestions INTEGER NOT NULL DEFAULT 0,
      showCorrectAnswers INTEGER NOT NULL DEFAULT 1,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER NOT NULL,
      questionId INTEGER NOT NULL,
      points REAL NOT NULL DEFAULT 1,
      position INTEGER NOT NULL DEFAULT 0,
      UNIQUE(quizId, questionId),
      FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      attemptNumber INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'submitted')),
      startedAt TEXT DEFAULT (datetime('now')),
      submittedAt TEXT DEFAULT '',
      score REAL NOT NULL DEFAULT 0,
      maxScore REAL NOT NULL DEFAULT 0,
      percentage REAL NOT NULL DEFAULT 0,
      timeSpentSeconds INTEGER NOT NULL DEFAULT 0,
      UNIQUE(quizId, userId, attemptNumber),
      FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.attempt_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attemptId INTEGER NOT NULL,
      questionId INTEGER NOT NULL,
      answer TEXT DEFAULT '',
      isCorrect INTEGER NOT NULL DEFAULT 0,
      pointsAwarded REAL NOT NULL DEFAULT 0,
      UNIQUE(attemptId, questionId),
      FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseOfferingId INTEGER NOT NULL,
      termId INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      dueDate TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'closed')),
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.assignment_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignmentId INTEGER NOT NULL,
      studentId INTEGER NOT NULL,
      submissionText TEXT DEFAULT '',
      submissionUrl TEXT DEFAULT '',
      fileName TEXT DEFAULT '',
      fileSizeBytes INTEGER NOT NULL DEFAULT 0,
      mimeType TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'submitted' CHECK(status IN ('submitted', 'graded', 'returned')),
      submittedAt TEXT DEFAULT (datetime('now')),
      grade TEXT DEFAULT '',
      feedback TEXT DEFAULT '',
      gradedAt TEXT DEFAULT '',
      gradedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(assignmentId, studentId),
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content.announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content.resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'link' CHECK(type IN ('link', 'file')),
      url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      fileName TEXT DEFAULT '',
      fileSizeBytes INTEGER NOT NULL DEFAULT 0,
      mimeType TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.grade_schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'invalid', 'pending_review')),
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.grade_thresholds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gradeSchemeId INTEGER NOT NULL,
      letterGrade TEXT NOT NULL,
      minScore REAL NOT NULL,
      maxScore REAL NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (gradeSchemeId) REFERENCES grade_schemes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment.exam_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      defaultsJson TEXT NOT NULL DEFAULT '{}',
      isSystem INTEGER NOT NULL DEFAULT 0,
      courseId INTEGER,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users.user_restrictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      restrictionType TEXT NOT NULL CHECK(restrictionType IN (
        'account_suspended',
        'quiz_blocked',
        'assignment_blocked',
        'chat_muted',
        'course_access_blocked',
        'manual_review_required'
      )),
      scopeType TEXT NOT NULL DEFAULT 'global' CHECK(scopeType IN ('global', 'course', 'quiz', 'assignment')),
      scopeId INTEGER,
      reason TEXT DEFAULT '',
      startsAt TEXT DEFAULT (datetime('now')),
      endsAt TEXT DEFAULT '',
      createdBy INTEGER,
      isActive INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users.validation_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entityType TEXT NOT NULL,
      entityId INTEGER,
      severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'error', 'critical')),
      field TEXT DEFAULT '',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'resolved', 'ignored')),
      visibleToUser INTEGER NOT NULL DEFAULT 0,
      relatedCourseId INTEGER,
      relatedUserId INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      resolvedAt TEXT DEFAULT '',
      resolvedBy INTEGER
    );

    CREATE TABLE IF NOT EXISTS users.import_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('users', 'students', 'teachers', 'questions', 'enrollments')),
      uploadedBy INTEGER,
      fileName TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'processed' CHECK(status IN ('processed', 'partially_failed', 'failed', 'completed')),
      totalRows INTEGER NOT NULL DEFAULT 0,
      successCount INTEGER NOT NULL DEFAULT 0,
      failedCount INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users.import_errors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batchId INTEGER NOT NULL,
      rowNumber INTEGER NOT NULL,
      rawDataJson TEXT DEFAULT '',
      errorField TEXT DEFAULT '',
      errorMessage TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unresolved' CHECK(status IN ('unresolved', 'fixed', 'ignored')),
      fixedDataJson TEXT DEFAULT '',
      resolvedBy INTEGER,
      resolvedAt TEXT DEFAULT '',
      createdAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (batchId) REFERENCES import_batches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users.audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actorUserId INTEGER,
      action TEXT NOT NULL,
      entityType TEXT NOT NULL,
      entityId INTEGER,
      detailsJson TEXT DEFAULT '{}',
      createdAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning.course_weeks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      weekNumber INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      startsAt TEXT DEFAULT '',
      endsAt TEXT DEFAULT '',
      visible INTEGER NOT NULL DEFAULT 1,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(courseId, weekNumber),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS content.week_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      weekId INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'link' CHECK(type IN ('link', 'file')),
      content TEXT DEFAULT '',
      fileName TEXT DEFAULT '',
      fileSizeBytes INTEGER NOT NULL DEFAULT 0,
      mimeType TEXT DEFAULT '',
      visibleFrom TEXT DEFAULT '',
      visibleUntil TEXT DEFAULT '',
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content.course_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      createdBy INTEGER,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'locked', 'archived')),
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS content.course_thread_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      threadId INTEGER NOT NULL,
      body TEXT NOT NULL,
      createdBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (threadId) REFERENCES course_threads(id) ON DELETE CASCADE
    );
  `);
}

function migrateExistingTables() {
  ensureColumn('users', 'users', 'username', 'username TEXT');
  ensureColumn('users', 'users', 'mustChangeCredentials', 'mustChangeCredentials INTEGER NOT NULL DEFAULT 0');
  ensureColumn('admin', 'admin_profiles', 'displayName', 'displayName TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'facultyId', 'facultyId INTEGER');
  ensureColumn('admin', 'admin_profiles', 'departmentId', 'departmentId INTEGER');
  ensureColumn('admin', 'admin_profiles', 'adminTitle', 'adminTitle TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'securityNotes', 'securityNotes TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'lastCredentialRotationAt', 'lastCredentialRotationAt TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'displayName', 'displayName TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'department', 'department TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'facultyId', 'facultyId INTEGER');
  ensureColumn('teacher', 'teacher_profiles', 'departmentId', 'departmentId INTEGER');
  ensureColumn('teacher', 'teacher_profiles', 'academicTitle', 'academicTitle TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'staffNumber', 'staffNumber TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'officeHours', 'officeHours TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'displayName', 'displayName TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'studentNumber', 'studentNumber TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'cohort', 'cohort TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'facultyId', 'facultyId INTEGER');
  ensureColumn('student', 'student_profiles', 'departmentId', 'departmentId INTEGER');
  ensureColumn('student', 'student_profiles', 'classYearId', 'classYearId INTEGER');
  ensureColumn('student', 'student_profiles', 'sectionId', 'sectionId INTEGER');
  ensureColumn('learning', 'courses', 'departmentId', 'departmentId INTEGER');
  ensureColumn('learning', 'courses', 'credits', 'credits INTEGER NOT NULL DEFAULT 3');
  ensureColumn('learning', 'categories', 'courseId', 'courseId INTEGER');
  ensureColumn('assessment', 'questions', 'points', 'points REAL NOT NULL DEFAULT 1');
  ensureColumn('assessment', 'questions', 'createdBy', 'createdBy INTEGER');
  ensureColumn('assessment', 'questions', 'status', 'status TEXT NOT NULL DEFAULT \'valid\'');
  ensureColumn('assessment', 'questions', 'validationMessage', 'validationMessage TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'questions', 'acceptedAnswers', 'acceptedAnswers TEXT DEFAULT \'[]\'');
  ensureColumn('assessment', 'questions', 'caseSensitive', 'caseSensitive INTEGER NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'questions', 'richText', 'richText TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'questions', 'explanationText', 'explanationText TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'questions', 'hintText', 'hintText TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'questions', 'mediaUrl', 'mediaUrl TEXT DEFAULT \'\'');

  ensureColumn('assessment', 'attempt_answers', 'answerJson', 'answerJson TEXT DEFAULT \'{}\'');

  ensureColumn('assessment', 'exam_templates', 'courseId', 'courseId INTEGER');
  ensureColumn('assessment', 'exam_templates', 'createdBy', 'createdBy INTEGER');

  ensureColumn('assessment', 'quizzes', 'startAt', 'startAt TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quizzes', 'endAt', 'endAt TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quizzes', 'durationMinutes', 'durationMinutes INTEGER NOT NULL DEFAULT 30');
  ensureColumn('assessment', 'quizzes', 'maxAttempts', 'maxAttempts INTEGER NOT NULL DEFAULT 1');
  ensureColumn('assessment', 'quizzes', 'shuffleOptions', 'shuffleOptions INTEGER NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'quizzes', 'showResultPolicy', 'showResultPolicy TEXT NOT NULL DEFAULT \'immediately\'');
  ensureColumn('assessment', 'quizzes', 'gradingMode', 'gradingMode TEXT NOT NULL DEFAULT \'standard\'');
  ensureColumn('assessment', 'quizzes', 'penaltyEnabled', 'penaltyEnabled INTEGER NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'quizzes', 'penaltyPerWrong', 'penaltyPerWrong REAL NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'quizzes', 'penaltyRatio', 'penaltyRatio REAL NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'quizzes', 'requiresSeb', 'requiresSeb INTEGER NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'quizzes', 'sebConfigName', 'sebConfigName TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quizzes', 'sebConfigUrl', 'sebConfigUrl TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quizzes', 'manualResultReleasedAt', 'manualResultReleasedAt TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quizzes', 'templateName', 'templateName TEXT DEFAULT \'\'');

  ensureColumn('assessment', 'quiz_attempts', 'expiresAt', 'expiresAt TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quiz_attempts', 'lifecycleStatus', 'lifecycleStatus TEXT NOT NULL DEFAULT \'in_progress\'');
  ensureColumn('assessment', 'quiz_attempts', 'letterGrade', 'letterGrade TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'quiz_attempts', 'gradeStatus', 'gradeStatus TEXT NOT NULL DEFAULT \'ready\'');
  ensureColumn('assessment', 'quiz_attempts', 'gradeMessage', 'gradeMessage TEXT DEFAULT \'\'');

  ensureColumn('assessment', 'attempt_answers', 'selectedOptionIndex', 'selectedOptionIndex INTEGER');
  ensureColumn('assessment', 'attempt_answers', 'gradedAt', 'gradedAt TEXT DEFAULT \'\'');

  ensureColumn('assessment', 'assignment_submissions', 'late', 'late INTEGER NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'assignment_submissions', 'fileName', 'fileName TEXT DEFAULT \'\'');
  ensureColumn('assessment', 'assignment_submissions', 'fileSizeBytes', 'fileSizeBytes INTEGER NOT NULL DEFAULT 0');
  ensureColumn('assessment', 'assignment_submissions', 'mimeType', 'mimeType TEXT DEFAULT \'\'');

  ensureColumn('content', 'announcements', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  ensureColumn('content', 'resources', 'weekId', 'weekId INTEGER');
  ensureColumn('content', 'resources', 'visibleFrom', 'visibleFrom TEXT DEFAULT \'\'');
  ensureColumn('content', 'resources', 'visibleUntil', 'visibleUntil TEXT DEFAULT \'\'');
  ensureColumn('content', 'resources', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  ensureColumn('content', 'resources', 'fileName', 'fileName TEXT DEFAULT \'\'');
  ensureColumn('content', 'resources', 'fileSizeBytes', 'fileSizeBytes INTEGER NOT NULL DEFAULT 0');
  ensureColumn('content', 'resources', 'mimeType', 'mimeType TEXT DEFAULT \'\'');
  ensureColumn('content', 'week_resources', 'fileName', 'fileName TEXT DEFAULT \'\'');
  ensureColumn('content', 'week_resources', 'fileSizeBytes', 'fileSizeBytes INTEGER NOT NULL DEFAULT 0');
  ensureColumn('content', 'week_resources', 'mimeType', 'mimeType TEXT DEFAULT \'\'');

  normalizeUserIdentityState();
  normalizeAcademicProfileState();
  ensureAdvancedIndexes();
  backfillQuizAdvancedColumns();
  migrateQuestionTypeConstraint();
  seedExamTemplates();
  migrateLegacyIdentityDatabase();
}

function ensureAdvancedIndexes() {
  const database = getDatabase();
  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS student.idx_student_profiles_student_number_ci
    ON student_profiles(LOWER(studentNumber))
    WHERE TRIM(studentNumber) != ''
  `);

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS teacher.idx_teacher_profiles_staff_number_ci
    ON teacher_profiles(LOWER(staffNumber))
    WHERE TRIM(staffNumber) != ''
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS users.idx_users_email_ci
    ON users(LOWER(email))
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS users.idx_users_status_role
    ON users(status, role)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS users.idx_user_restrictions_lookup
    ON user_restrictions(userId, restrictionType, scopeType, scopeId, isActive)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS users.idx_validation_issues_lookup
    ON validation_issues(entityType, entityId, status, severity)
  `);
}

function migrateQuestionTypeConstraint() {
  const database = getDatabase();
  const table = database.prepare(`
    SELECT sql
    FROM assessment.sqlite_master
    WHERE type = 'table' AND name = 'questions'
  `).get();

  if (!table || String(table.sql || '').includes("'MR'")) return;

  database.exec('PRAGMA foreign_keys = OFF');
  database.exec('BEGIN TRANSACTION');
  try {
    database.exec(`
      DROP TABLE IF EXISTS assessment.questions_new;

      CREATE TABLE assessment.questions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER NOT NULL,
        text TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('MC', 'TF', 'FB', 'MT', 'MP', 'SA', 'ES', 'OR', 'MR')),
        options TEXT DEFAULT '[]',
        correctAnswer TEXT NOT NULL DEFAULT '',
        difficulty TEXT NOT NULL DEFAULT 'MEDIUM' CHECK(difficulty IN ('EASY', 'MEDIUM', 'HARD')),
        points REAL NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'valid',
        validationMessage TEXT DEFAULT '',
        acceptedAnswers TEXT DEFAULT '[]',
        caseSensitive INTEGER NOT NULL DEFAULT 0,
        richText TEXT DEFAULT '',
        explanationText TEXT DEFAULT '',
        hintText TEXT DEFAULT '',
        mediaUrl TEXT DEFAULT '',
        createdBy INTEGER,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      INSERT INTO assessment.questions_new (
        id, categoryId, text, type, options, correctAnswer, difficulty, points,
        status, validationMessage, acceptedAnswers, caseSensitive,
        richText, explanationText, hintText, mediaUrl, createdBy, createdAt
      )
      SELECT
        id, categoryId, text, type, options, correctAnswer, difficulty, points,
        status, validationMessage, acceptedAnswers, caseSensitive,
        richText, explanationText, hintText, mediaUrl, createdBy, createdAt
      FROM assessment.questions;

      DROP TABLE assessment.questions;
      ALTER TABLE assessment.questions_new RENAME TO questions;
    `);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}

function backfillQuizAdvancedColumns() {
  const database = getDatabase();
  database.exec(`
    UPDATE quizzes
    SET startAt = COALESCE(NULLIF(startAt, ''), openAt),
      endAt = COALESCE(NULLIF(endAt, ''), closeAt),
      durationMinutes = CASE
        WHEN durationMinutes IS NULL OR durationMinutes < 1 THEN
          CASE WHEN timeLimitMinutes IS NOT NULL AND timeLimitMinutes > 0 THEN timeLimitMinutes ELSE 30 END
        ELSE durationMinutes
      END,
      maxAttempts = CASE
        WHEN maxAttempts IS NULL OR maxAttempts < 1 THEN
          CASE WHEN attemptsAllowed IS NOT NULL AND attemptsAllowed > 0 THEN attemptsAllowed ELSE 1 END
        ELSE maxAttempts
      END
  `);

  database.exec(`
    UPDATE quiz_attempts
    SET expiresAt = CASE
      WHEN TRIM(COALESCE(expiresAt, '')) = '' AND TRIM(COALESCE(startedAt, '')) != ''
      THEN datetime(startedAt, '+' || COALESCE((SELECT durationMinutes FROM quizzes q WHERE q.id = quiz_attempts.quizId), 0) || ' minutes')
      ELSE expiresAt
    END
  `);
}

function seedExamTemplates() {
  const database = getDatabase();
  const existing = database.prepare('SELECT COUNT(*) as count FROM exam_templates WHERE isSystem = 1').get();
  if (existing.count > 0) return;
  const insertTemplate = database.prepare(`
    INSERT INTO exam_templates (name, description, defaultsJson, isSystem, courseId, createdBy)
    VALUES (?, ?, ?, 1, NULL, NULL)
  `);

  insertTemplate.run('Practice Quiz', 'Low-stakes practice settings.', JSON.stringify({
    status: 'published',
    durationMinutes: 30,
    maxAttempts: 3,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultPolicy: 'immediately',
    gradingMode: 'standard',
    requiresSeb: false
  }));
  insertTemplate.run('Midterm Exam', 'Default midterm settings.', JSON.stringify({
    status: 'draft',
    durationMinutes: 90,
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultPolicy: 'after_close',
    gradingMode: 'standard',
    requiresSeb: false
  }));
  insertTemplate.run('Final Exam', 'Default final exam settings.', JSON.stringify({
    status: 'draft',
    durationMinutes: 120,
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultPolicy: 'after_manual_release',
    gradingMode: 'manual_review',
    requiresSeb: true
  }));
  insertTemplate.run('Homework Quiz', 'Reusable homework quiz settings.', JSON.stringify({
    status: 'published',
    durationMinutes: 45,
    maxAttempts: 2,
    shuffleQuestions: true,
    shuffleOptions: false,
    showResultPolicy: 'after_close',
    gradingMode: 'standard',
    requiresSeb: false
  }));
  insertTemplate.run('SEB Required Exam', 'Exam defaults that require SEB compatible mode.', JSON.stringify({
    status: 'draft',
    durationMinutes: 90,
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResultPolicy: 'after_manual_release',
    gradingMode: 'standard',
    requiresSeb: true
  }));
}

function ensureColumn(schema, tableName, columnName, columnSql) {
  const columns = db.prepare(`PRAGMA ${schema}.table_info(${tableName})`).all();
  if (!columns.some(column => column.name === columnName)) {
    db.exec(`ALTER TABLE ${schema}.${tableName} ADD COLUMN ${columnSql}`);
  }
}

function migrateLegacySingleDatabase(dbPath) {
  const legacyPath = activeFiles.legacy;
  if (!legacyPath || !fs.existsSync(legacyPath)) return;

  const splitFiles = Object.keys(DATABASE_CONTEXTS).map(schema => path.resolve(activeFiles[schema]));
  if (splitFiles.includes(path.resolve(legacyPath))) return;

  db.exec(`ATTACH DATABASE '${escapeSqlPath(legacyPath)}' AS legacy`);
  try {
    const legacyHasAnyTable = [
      'users', 'courses', 'categories', 'questions', 'quizzes'
    ].some(tableName => tableExists('legacy', tableName));

    if (!legacyHasAnyTable) return;

    copyLegacyTable('users', 'users');
    copyLegacyTable('users', 'sessions');
    copyLegacyTable('learning', 'courses');
    copyLegacyTable('learning', 'enrollments');
    copyLegacyTable('learning', 'categories');
    copyLegacyTable('assessment', 'questions');
    copyLegacyTable('assessment', 'quizzes');
    copyLegacyTable('assessment', 'quiz_questions');
    copyLegacyTable('assessment', 'quiz_attempts');
    copyLegacyTable('assessment', 'attempt_answers');
    copyLegacyTable('content', 'announcements');
    copyLegacyTable('content', 'resources');
    normalizeUserIdentityState();
    normalizeAcademicProfileState();
  } finally {
    db.exec('DETACH DATABASE legacy');
  }
}

function migrateLegacyIdentityDatabase() {
  const legacyIdentityPath = activeFiles.legacyIdentity;
  if (!legacyIdentityPath || !fs.existsSync(legacyIdentityPath)) return;
  if (path.resolve(legacyIdentityPath) === path.resolve(activeFiles.users)) return;

  db.exec(`ATTACH DATABASE '${escapeSqlPath(legacyIdentityPath)}' AS legacy_identity`);
  try {
    copyTable('legacy_identity', 'users', 'users');
    copyTable('legacy_identity', 'users', 'sessions');
    normalizeUserIdentityState();
    normalizeAcademicProfileState();
  } finally {
    db.exec('DETACH DATABASE legacy_identity');
  }
}

function normalizeUserIdentityState() {
  const users = db.prepare('SELECT id, name, email, username, role FROM users ORDER BY id ASC').all();
  const used = new Set(users.map(user => String(user.username || '').toLowerCase()).filter(Boolean));
  const updateUsername = db.prepare('UPDATE users SET username = ?, updatedAt = datetime(\'now\') WHERE id = ?');

  users.forEach(user => {
    if (user.username) return;

    const preferred = user.role === 'admin' && String(user.email).toLowerCase() === 'admin@example.com'
      ? 'admin'
      : usernameFromUser(user);
    const username = uniqueUsername(preferred, used);
    used.add(username.toLowerCase());
    updateUsername.run(username, user.id);
  });

  db.prepare(`
    UPDATE users
    SET mustChangeCredentials = 1
    WHERE role = 'admin'
      AND LOWER(email) = LOWER('admin@example.com')
      AND LOWER(username) = LOWER('admin')
  `).run();
}

function normalizeAcademicProfileState(database = db) {
  const students = database.prepare(`
    SELECT u.id, u.name, sp.id as profileId, sp.studentNumber
    FROM users u
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    WHERE u.role = 'student'
    ORDER BY u.id ASC
  `).all();
  const usedStudentNumbers = new Set();
  const insertStudent = database.prepare(`
    INSERT INTO student_profiles (userId, displayName, studentNumber, cohort)
    VALUES (?, ?, ?, '')
  `);
  const updateStudentNumber = database.prepare(`
    UPDATE student_profiles
    SET studentNumber = ?, updatedAt = datetime('now')
    WHERE userId = ?
  `);

  students.forEach(student => {
    const existing = String(student.studentNumber || '').trim();
    const normalizedKey = existing.toLowerCase();
    const valid = /^[A-Za-z0-9._-]{3,32}$/.test(existing);
    const duplicate = normalizedKey && usedStudentNumbers.has(normalizedKey);
    const studentNumber = valid && !duplicate
      ? existing
      : uniqueStudentNumber(student.id, usedStudentNumbers);

    usedStudentNumbers.add(studentNumber.toLowerCase());
    if (!student.profileId) {
      insertStudent.run(student.id, student.name, studentNumber);
    } else if (studentNumber !== existing) {
      updateStudentNumber.run(studentNumber, student.id);
    }
  });

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS student.idx_student_profiles_student_number_ci
    ON student_profiles(LOWER(studentNumber))
    WHERE TRIM(studentNumber) != ''
  `);
}

function uniqueStudentNumber(userId, used) {
  let suffix = 0;
  let candidate = `STU-${String(userId).padStart(4, '0')}`;
  while (used.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `STU-${String(userId).padStart(4, '0')}-${suffix}`;
  }
  return candidate;
}

function usernameFromUser(user) {
  const emailPrefix = String(user.email || '').split('@')[0];
  const source = emailPrefix || user.name || `user${user.id}`;
  const username = source.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 32);
  return username.length >= 3 ? username : `user${user.id}`;
}

function uniqueUsername(preferred, used) {
  const base = preferred || 'user';
  let candidate = base;
  let suffix = 1;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base.slice(0, 28)}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function tableExists(schema, tableName) {
  const row = db.prepare(`
    SELECT name FROM ${schema}.sqlite_master
    WHERE type = 'table' AND name = ?
  `).get(tableName);
  return !!row;
}

function copyLegacyTable(targetSchema, tableName) {
  copyTable('legacy', targetSchema, tableName);
}

function copyTable(sourceSchema, targetSchema, tableName) {
  if (!tableExists(sourceSchema, tableName)) return;

  const targetColumns = db.prepare(`PRAGMA ${targetSchema}.table_info(${tableName})`).all()
    .map(column => column.name);
  const sourceColumns = db.prepare(`PRAGMA ${sourceSchema}.table_info(${tableName})`).all()
    .map(column => column.name);
  const columns = targetColumns.filter(column => sourceColumns.includes(column));
  if (columns.length === 0) return;

  const columnList = columns.join(', ');
  db.exec(`
    INSERT OR IGNORE INTO ${targetSchema}.${tableName} (${columnList})
    SELECT ${columnList} FROM ${sourceSchema}.${tableName}
  `);
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function getDatabaseFiles() {
  return activeFiles ? { ...activeFiles } : resolveDatabaseFiles();
}

function closeDatabase() {
  if (db) {
    db.close();
    db = undefined;
    activeFiles = undefined;
  }
}

function seedDatabase() {
  const database = getDatabase();

  const userCount = database.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    seedUsers(database);
  }
  ensureRoleProfiles(database);
  normalizeAcademicProfileState(database);

  const courseCount = database.prepare('SELECT COUNT(*) as count FROM courses').get().count;
  if (courseCount === 0) {
    seedLmsData(database);
  }
  ensureAcademicSeed(database);

  const categoryCount = database.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
    seedQuestionBank(database);
  } else {
    attachLegacyDataToDemoCourse(database);
  }

  ensureDemoQuiz(database);
  repairMissingQuizQuestionLinks(database);
}

function seedUsers(database) {
  const insertUser = database.prepare(`
    INSERT INTO users (name, username, email, role, passwordHash, passwordSalt, passwordAlgorithm, mustChangeCredentials)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ['Admin User', 'admin', 'admin@example.com', 'admin', 'Admin123!', 1],
    ['Teacher User', 'teacher', 'teacher@example.com', 'teacher', 'Teacher123!', 0],
    ['Student User', 'student', 'student@example.com', 'student', 'Student123!', 0]
  ].forEach(([name, username, email, role, password, mustChangeCredentials]) => {
    const hashed = hashPassword(password);
    insertUser.run(
      name,
      username,
      email,
      role,
      hashed.passwordHash,
      hashed.passwordSalt,
      hashed.passwordAlgorithm,
      mustChangeCredentials
    );
  });

  ensureRoleProfiles(database);
}

function ensureRoleProfiles(database) {
  const users = database.prepare('SELECT id, name, username, role FROM users').all();
  const statements = {
    admin: database.prepare(`
      INSERT OR IGNORE INTO admin_profiles (userId, displayName, securityNotes)
      VALUES (?, ?, ?)
    `),
    teacher: database.prepare(`
      INSERT OR IGNORE INTO teacher_profiles (userId, displayName, department)
      VALUES (?, ?, ?)
    `),
    student: database.prepare(`
      INSERT OR IGNORE INTO student_profiles (userId, displayName, studentNumber)
      VALUES (?, ?, ?)
    `)
  };

  users.forEach(user => {
    if (user.role === 'admin') {
      statements.admin.run(user.id, user.name, 'Default admin must rotate username and password on first login.');
    } else if (user.role === 'teacher') {
      statements.teacher.run(user.id, user.name, 'General');
    } else if (user.role === 'student') {
      statements.student.run(user.id, user.name, `STU-${String(user.id).padStart(4, '0')}`);
    }
  });
}

function seedLmsData(database) {
  const admin = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('admin');
  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  const student = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('student');

  const course = database.prepare(`
    INSERT INTO courses (code, title, description, visibility, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'WEB101',
    'Web Programming Fundamentals',
    'Demo course with quiz, resources, announcements, and a gradebook.',
    'published',
    admin ? admin.id : null
  );

  const courseId = Number(course.lastInsertRowid);
  if (teacher) {
    database.prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
      .run(courseId, teacher.id, 'teacher');
  }
  if (student) {
    database.prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
      .run(courseId, student.id, 'student');
  }

  if (teacher) {
    database.prepare(`
      INSERT INTO announcements (courseId, title, body, createdBy)
      VALUES (?, ?, ?, ?)
    `).run(courseId, 'Welcome to WEB101', 'Read the resources and complete the first quiz.', teacher.id);

    database.prepare(`
      INSERT INTO resources (courseId, title, type, url, description, createdBy)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(courseId, 'Course syllabus', 'link', 'https://example.com/course-syllabus', 'Weekly topics, assessment policy, and quiz rules.', teacher.id);
  }
}

function ensureAcademicSeed(database) {
  database.prepare(`
    INSERT OR IGNORE INTO faculties (name, code)
    VALUES (?, ?)
  `).run('Faculty of Engineering', 'ENG');

  const faculty = database.prepare('SELECT id FROM faculties WHERE code = ?').get('ENG');
  if (!faculty) return;

  database.prepare(`
    INSERT OR IGNORE INTO departments (facultyId, name, code)
    VALUES (?, ?, ?)
  `).run(faculty.id, 'Computer Engineering', 'CENG');

  const department = database.prepare(`
    SELECT id FROM departments WHERE facultyId = ? AND code = ?
  `).get(faculty.id, 'CENG');
  if (!department) return;

  database.prepare(`
    INSERT OR IGNORE INTO class_years (departmentId, yearNumber, name)
    VALUES (?, ?, ?)
  `).run(department.id, 1, 'First Year');

  const classYear = database.prepare(`
    SELECT id FROM class_years WHERE departmentId = ? AND yearNumber = ?
  `).get(department.id, 1);

  if (classYear) {
    database.prepare(`
      INSERT OR IGNORE INTO sections (classYearId, name)
      VALUES (?, ?)
    `).run(classYear.id, 'A');
  }

  const section = classYear
    ? database.prepare('SELECT id FROM sections WHERE classYearId = ? AND name = ?').get(classYear.id, 'A')
    : null;

  let activeTerm = database.prepare('SELECT id FROM academic_terms WHERE isActive = 1 ORDER BY id DESC LIMIT 1').get();
  if (!activeTerm) {
    const termCount = database.prepare('SELECT COUNT(*) as count FROM academic_terms').get().count;
    if (termCount === 0) {
      database.prepare(`
        INSERT INTO academic_terms (name, academicYear, semesterType, startDate, endDate, isActive)
        VALUES (?, ?, ?, ?, ?, 1)
      `).run('2025-2026 Spring', '2025-2026', 'spring', '2026-02-02', '2026-06-12');
    } else {
      database.prepare('UPDATE academic_terms SET isActive = 1 WHERE id = (SELECT id FROM academic_terms ORDER BY id DESC LIMIT 1)').run();
    }
    activeTerm = database.prepare('SELECT id FROM academic_terms WHERE isActive = 1 ORDER BY id DESC LIMIT 1').get();
  }

  database.prepare(`
    UPDATE courses
    SET departmentId = COALESCE(departmentId, ?),
      credits = CASE WHEN credits IS NULL OR credits < 1 THEN 3 ELSE credits END
    WHERE departmentId IS NULL OR credits IS NULL OR credits < 1
  `).run(department.id);

  database.prepare(`
    UPDATE teacher_profiles
    SET facultyId = COALESCE(facultyId, ?),
      departmentId = COALESCE(departmentId, ?),
      academicTitle = CASE WHEN TRIM(COALESCE(academicTitle, '')) = '' THEN 'Instructor' ELSE academicTitle END,
      department = CASE WHEN TRIM(COALESCE(department, '')) = '' OR department = 'General' THEN 'Computer Engineering' ELSE department END,
      updatedAt = datetime('now')
    WHERE facultyId IS NULL OR departmentId IS NULL OR TRIM(COALESCE(academicTitle, '')) = ''
  `).run(faculty.id, department.id);

  database.prepare(`
    UPDATE student_profiles
    SET facultyId = COALESCE(facultyId, ?),
      departmentId = COALESCE(departmentId, ?),
      classYearId = COALESCE(classYearId, ?),
      sectionId = COALESCE(sectionId, ?),
      cohort = CASE WHEN TRIM(COALESCE(cohort, '')) = '' THEN '2025' ELSE cohort END,
      updatedAt = datetime('now')
    WHERE facultyId IS NULL OR departmentId IS NULL OR classYearId IS NULL OR sectionId IS NULL
  `).run(faculty.id, department.id, classYear ? classYear.id : null, section ? section.id : null);

  database.prepare(`
    UPDATE admin_profiles
    SET adminTitle = CASE WHEN TRIM(COALESCE(adminTitle, '')) = '' THEN 'System Administrator' ELSE adminTitle END,
      updatedAt = datetime('now')
    WHERE TRIM(COALESCE(adminTitle, '')) = ''
  `).run();

  if (!activeTerm) return;

  const defaultTeacher = database.prepare(`
    SELECT u.id
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.userId = u.id
    WHERE u.role = 'teacher' AND u.status = 'active'
    ORDER BY CASE WHEN tp.departmentId = ? THEN 0 ELSE 1 END, u.id ASC
    LIMIT 1
  `).get(department.id);

  const courses = database.prepare('SELECT id, departmentId FROM courses ORDER BY id ASC').all();
  const existingOffering = database.prepare(`
    SELECT id FROM course_offerings WHERE courseId = ? AND termId = ? LIMIT 1
  `);
  const insertOffering = database.prepare(`
    INSERT INTO course_offerings (
      courseId, termId, instructorId, departmentId, classYearId, sectionId, capacity, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  courses.forEach(course => {
    const offering = existingOffering.get(course.id, activeTerm.id);
    if (offering) return;
    insertOffering.run(
      course.id,
      activeTerm.id,
      defaultTeacher ? defaultTeacher.id : null,
      course.departmentId || department.id,
      classYear ? classYear.id : null,
      section ? section.id : null,
      40,
      'active'
    );
  });

  const activeOfferings = database.prepare(`
    SELECT co.id, co.courseId
    FROM course_offerings co
    WHERE co.termId = ?
  `).all(activeTerm.id);
  const insertOfferingEnrollment = database.prepare(`
    INSERT OR IGNORE INTO course_offering_enrollments (courseOfferingId, studentId, status)
    VALUES (?, ?, 'active')
  `);

  activeOfferings.forEach(offering => {
    const students = database.prepare(`
      SELECT userId
      FROM enrollments
      WHERE courseId = ? AND role = 'student' AND status = 'active'
    `).all(offering.courseId);
    students.forEach(student => insertOfferingEnrollment.run(offering.id, student.userId));
  });
}

function seedQuestionBank(database) {
  const demoCourse = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  const courseId = demoCourse ? demoCourse.id : null;
  const teacherId = teacher ? teacher.id : null;

  const insertCategory = database.prepare(
    'INSERT INTO categories (courseId, name, description) VALUES (?, ?, ?)'
  );
  const insertQuestion = database.prepare(`
    INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.exec('BEGIN TRANSACTION');
  try {
    const categories = {
      javascript: Number(insertCategory.run(courseId, 'JavaScript', 'Questions about JavaScript programming language fundamentals').lastInsertRowid),
      html: Number(insertCategory.run(courseId, 'HTML & CSS', 'Questions about web markup and styling').lastInsertRowid),
      databases: Number(insertCategory.run(courseId, 'Databases', 'Questions about database concepts and SQL').lastInsertRowid),
      general: Number(insertCategory.run(courseId, 'General Knowledge', 'General programming and computer science questions').lastInsertRowid)
    };

    const seededQuestionIds = [];
    const addQuestion = (...args) => {
      const result = insertQuestion.run(...args);
      seededQuestionIds.push(Number(result.lastInsertRowid));
    };

    addQuestion(categories.javascript, 'Which keyword is used to declare a constant in JavaScript?', 'MC',
      JSON.stringify(['var', 'let', 'const', 'define']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.javascript, 'JavaScript is a statically typed language.', 'TF',
      '[]', 'false', 'EASY', 1, teacherId);
    addQuestion(categories.javascript, 'The method used to parse a JSON string in JavaScript is JSON._____.', 'FB',
      '[]', 'parse', 'MEDIUM', 1, teacherId);
    addQuestion(categories.javascript, 'What does the "===" operator check in JavaScript?', 'MC',
      JSON.stringify(['Value only', 'Type only', 'Value and type', 'Reference']), '2', 'MEDIUM', 1, teacherId);
    addQuestion(categories.javascript, 'Which array method creates a new array with elements that pass a test?', 'MC',
      JSON.stringify(['map', 'filter', 'reduce', 'forEach']), '1', 'MEDIUM', 1, teacherId);
    addQuestion(categories.html, 'HTML stands for HyperText Markup Language.', 'TF',
      '[]', 'true', 'EASY', 1, teacherId);
    addQuestion(categories.html, 'Which CSS property is used to change the background color?', 'MC',
      JSON.stringify(['color', 'bgcolor', 'background-color', 'background']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.html, 'The CSS property used to make text bold is font-_____.', 'FB',
      '[]', 'weight', 'EASY', 1, teacherId);
    addQuestion(categories.html, 'Which HTML element is used for the largest heading?', 'MC',
      JSON.stringify(['h6', 'heading', 'h1', 'head']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.databases, 'SQL stands for Structured _____ Language.', 'FB',
      '[]', 'Query', 'EASY', 1, teacherId);
    addQuestion(categories.databases, 'Which SQL command is used to retrieve data from a database?', 'MC',
      JSON.stringify(['GET', 'FETCH', 'SELECT', 'RETRIEVE']), '2', 'EASY', 1, teacherId);
    addQuestion(categories.databases, 'A primary key can contain NULL values.', 'TF',
      '[]', 'false', 'MEDIUM', 1, teacherId);
    addQuestion(categories.databases, 'Which SQL clause is used to filter results?', 'MC',
      JSON.stringify(['FILTER', 'WHERE', 'HAVING', 'CONDITION']), '1', 'MEDIUM', 1, teacherId);
    addQuestion(categories.general, 'What does API stand for?', 'MC',
      JSON.stringify(['Application Programming Interface', 'Applied Programming Integration', 'Application Process Integration', 'Automated Programming Interface']),
      '0', 'EASY', 1, teacherId);
    addQuestion(categories.general, 'Git is a version control system.', 'TF',
      '[]', 'true', 'EASY', 1, teacherId);
    addQuestion(categories.general, 'The design pattern where a class has only one instance is called _____.', 'FB',
      '[]', 'Singleton', 'HARD', 1, teacherId);

    const quiz = database.prepare(`
      INSERT INTO quizzes (courseId, title, description, status, attemptsAllowed, shuffleQuestions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(courseId, 'Programming Basics Quiz', 'A short quiz generated from the seed question bank.', 'published', 3, 1, teacherId);
    const quizId = Number(quiz.lastInsertRowid);
    const addQuizQuestion = database.prepare(
      'INSERT INTO quiz_questions (quizId, questionId, points, position) VALUES (?, ?, ?, ?)'
    );
    [0, 1, 3, 6, 10].forEach((questionIndex, index) => {
      addQuizQuestion.run(quizId, seededQuestionIds[questionIndex], 1, index + 1);
    });

    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
}

function attachLegacyDataToDemoCourse(database) {
  const course = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  if (!course) return;

  database.prepare('UPDATE categories SET courseId = ? WHERE courseId IS NULL').run(course.id);
}

function ensureDemoQuiz(database) {
  const quizCount = database.prepare('SELECT COUNT(*) as count FROM quizzes').get().count;
  if (quizCount > 0) return;

  const course = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  if (!course) return;

  const questions = database.prepare(`
    SELECT q.id
    FROM questions q
    JOIN categories c ON c.id = q.categoryId
    WHERE c.courseId = ?
    ORDER BY q.id ASC
    LIMIT 5
  `).all(course.id);
  if (questions.length === 0) return;

  database.exec('BEGIN TRANSACTION');
  try {
    const quiz = database.prepare(`
      INSERT INTO quizzes (courseId, title, description, status, attemptsAllowed, shuffleQuestions, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      course.id,
      'Programming Basics Quiz',
      'A short quiz generated from the course question bank.',
      'published',
      3,
      1,
      teacher ? teacher.id : null
    );

    const insert = database.prepare(`
      INSERT INTO quiz_questions (quizId, questionId, points, position)
      VALUES (?, ?, ?, ?)
    `);
    questions.forEach((question, index) => insert.run(quiz.lastInsertRowid, question.id, 1, index + 1));
    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
}

function repairMissingQuizQuestionLinks(database) {
  const linkCount = database.prepare('SELECT COUNT(*) as count FROM quiz_questions').get().count;
  if (linkCount > 0) return;

  const quizzes = database.prepare(`
    SELECT id, courseId, title, description
    FROM quizzes
    WHERE status = 'published'
    ORDER BY id ASC
  `).all();
  if (quizzes.length === 0) return;

  const insert = database.prepare(`
    INSERT OR IGNORE INTO quiz_questions (quizId, questionId, points, position)
    VALUES (?, ?, ?, ?)
  `);

  database.exec('BEGIN TRANSACTION');
  try {
    quizzes.forEach(quiz => {
      const questions = selectBackfillQuestions(database, quiz);
      questions.forEach((question, index) => {
        insert.run(quiz.id, question.id, question.points || 1, index + 1);
      });
    });
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function selectBackfillQuestions(database, quiz) {
  const title = `${quiz.title || ''} ${quiz.description || ''}`;
  if (/full demo|all question types/i.test(title)) {
    const rows = database.prepare(`
      SELECT q.id, q.type, q.points
      FROM questions q
      JOIN categories c ON c.id = q.categoryId
      WHERE c.courseId = ?
      ORDER BY CASE WHEN LOWER(c.name) = 'advanced demo' THEN 0 ELSE 1 END, q.id DESC
    `).all(quiz.courseId);
    const byType = new Map();
    rows.forEach(question => {
      if (!byType.has(question.type)) byType.set(question.type, question);
    });
    const typeOrder = ['MC', 'TF', 'FB', 'SA', 'MR', 'OR', 'ES', 'MT', 'MP'];
    const selected = typeOrder.map(type => byType.get(type)).filter(Boolean);
    if (selected.length > 0) return selected;
  }

  return database.prepare(`
    SELECT q.id, q.points
    FROM questions q
    JOIN categories c ON c.id = q.categoryId
    WHERE c.courseId = ?
    ORDER BY CASE WHEN LOWER(c.name) = 'advanced demo' THEN 1 ELSE 0 END, q.id ASC
    LIMIT 5
  `).all(quiz.courseId);
}

function escapeSqlPath(filePath) {
  return filePath.replace(/'/g, "''");
}

module.exports = {
  DATABASE_CONTEXTS,
  closeDatabase,
  getDatabase,
  getDatabaseFiles,
  initDatabase,
  resolveDatabaseFiles,
  seedDatabase
};
