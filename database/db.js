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
      tokenType TEXT NOT NULL DEFAULT 'jwt',
      expiresAt TEXT NOT NULL,
      createdAt TEXT DEFAULT (datetime('now')),
      lastSeenAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users.system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
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
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      createdBy INTEGER,
      updatedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS learning.attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseOfferingId INTEGER NOT NULL,
      termId INTEGER NOT NULL,
      sessionDate TEXT NOT NULL,
      topic TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'closed')),
      openedAt TEXT DEFAULT (datetime('now')),
      closedAt TEXT DEFAULT '',
      expiresAt TEXT DEFAULT '',
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
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused', 'removed', 'invalidated')),
      note TEXT DEFAULT '',
      markedBy INTEGER,
      removedBy INTEGER,
      removedAt TEXT DEFAULT '',
      removalNote TEXT DEFAULT '',
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
      updatedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessment.question_user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      points REAL,
      gradingType TEXT DEFAULT '',
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(questionId, userId),
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
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
      startAt TEXT DEFAULT '',
      endAt TEXT DEFAULT '',
      durationMinutes INTEGER NOT NULL DEFAULT 30,
      maxAttempts INTEGER NOT NULL DEFAULT 1,
      shuffleOptions INTEGER NOT NULL DEFAULT 0,
      showResultPolicy TEXT NOT NULL DEFAULT 'immediately',
      gradingMode TEXT NOT NULL DEFAULT 'standard',
      penaltyEnabled INTEGER NOT NULL DEFAULT 0,
      penaltyPerWrong REAL NOT NULL DEFAULT 0,
      penaltyRatio REAL NOT NULL DEFAULT 0,
      requiresSeb INTEGER NOT NULL DEFAULT 0,
      sebConfigName TEXT DEFAULT '',
      sebConfigUrl TEXT DEFAULT '',
      manualResultReleasedAt TEXT DEFAULT '',
      templateName TEXT DEFAULT '',
      weight REAL DEFAULT 0,
      createdBy INTEGER,
      updatedBy INTEGER,
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
      type TEXT NOT NULL CHECK(type IN ('users', 'students', 'teachers', 'questions', 'courses', 'enrollments')),
      uploadedBy INTEGER,
      fileName TEXT NOT NULL,
      fileType TEXT DEFAULT '',
      mimeType TEXT DEFAULT '',
      fileSizeBytes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'completed_with_errors', 'failed')),
      totalRows INTEGER NOT NULL DEFAULT 0,
      successCount INTEGER NOT NULL DEFAULT 0,
      failedCount INTEGER NOT NULL DEFAULT 0,
      createdCount INTEGER NOT NULL DEFAULT 0,
      updatedCount INTEGER NOT NULL DEFAULT 0,
      skippedCount INTEGER NOT NULL DEFAULT 0,
      validationErrorCount INTEGER NOT NULL DEFAULT 0,
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

    CREATE TABLE IF NOT EXISTS users.resource_access_grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resourceType TEXT NOT NULL CHECK(resourceType IN ('question', 'category', 'quiz')),
      resourceId INTEGER NOT NULL,
      teacherUserId INTEGER NOT NULL,
      accessLevel TEXT NOT NULL CHECK(accessLevel IN ('read', 'write')),
      grantedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(resourceType, resourceId, teacherUserId)
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
  ensureColumn('users', 'users', 'passwordAlgorithm', 'passwordAlgorithm TEXT NOT NULL DEFAULT \'scrypt+salt+spice\'');
  ensureColumn('users', 'users', 'status', 'status TEXT NOT NULL DEFAULT \'active\'');
  ensureColumn('users', 'users', 'createdAt', 'createdAt TEXT DEFAULT \'\'');
  ensureColumn('users', 'users', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  const hadSessionTokenType = columnExists('users', 'sessions', 'tokenType');
  ensureColumn('users', 'sessions', 'tokenType', 'tokenType TEXT NOT NULL DEFAULT \'migrated\'');
  if (!hadSessionTokenType) {
    db.prepare('DELETE FROM users.sessions WHERE tokenType = ?').run('migrated');
  }
  ensureSystemSettings();
  ensureResourceAccessTables();
  ensureColumn('admin', 'admin_profiles', 'displayName', 'displayName TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'facultyId', 'facultyId INTEGER');
  ensureColumn('admin', 'admin_profiles', 'departmentId', 'departmentId INTEGER');
  ensureColumn('admin', 'admin_profiles', 'adminTitle', 'adminTitle TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'securityNotes', 'securityNotes TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'lastCredentialRotationAt', 'lastCredentialRotationAt TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'createdAt', 'createdAt TEXT DEFAULT \'\'');
  ensureColumn('admin', 'admin_profiles', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'displayName', 'displayName TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'department', 'department TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'facultyId', 'facultyId INTEGER');
  ensureColumn('teacher', 'teacher_profiles', 'departmentId', 'departmentId INTEGER');
  ensureColumn('teacher', 'teacher_profiles', 'academicTitle', 'academicTitle TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'staffNumber', 'staffNumber TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'officeHours', 'officeHours TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'createdAt', 'createdAt TEXT DEFAULT \'\'');
  ensureColumn('teacher', 'teacher_profiles', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'displayName', 'displayName TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'studentNumber', 'studentNumber TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'cohort', 'cohort TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'facultyId', 'facultyId INTEGER');
  ensureColumn('student', 'student_profiles', 'departmentId', 'departmentId INTEGER');
  ensureColumn('student', 'student_profiles', 'classYearId', 'classYearId INTEGER');
  ensureColumn('student', 'student_profiles', 'sectionId', 'sectionId INTEGER');
  ensureColumn('student', 'student_profiles', 'createdAt', 'createdAt TEXT DEFAULT \'\'');
  ensureColumn('student', 'student_profiles', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  migrateImportBatchConstraint();
  ensureImportBatchAuditColumns();
  ensureColumn('learning', 'courses', 'departmentId', 'departmentId INTEGER');
  ensureColumn('learning', 'courses', 'credits', 'credits INTEGER NOT NULL DEFAULT 3');
  ensureColumn('learning', 'categories', 'courseId', 'courseId INTEGER');
  ensureColumn('learning', 'categories', 'createdBy', 'createdBy INTEGER');
  ensureColumn('learning', 'categories', 'updatedBy', 'updatedBy INTEGER');
  ensureColumn('learning', 'categories', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  migrateCategoryUniqueness();
  ensureColumn('learning', 'attendance_sessions', 'status', 'status TEXT NOT NULL DEFAULT \'open\'');
  ensureColumn('learning', 'attendance_sessions', 'openedAt', 'openedAt TEXT DEFAULT \'\'');
  ensureColumn('learning', 'attendance_sessions', 'closedAt', 'closedAt TEXT DEFAULT \'\'');
  ensureColumn('learning', 'attendance_sessions', 'expiresAt', 'expiresAt TEXT DEFAULT \'\'');
  ensureColumn('learning', 'attendance_records', 'removedBy', 'removedBy INTEGER');
  ensureColumn('learning', 'attendance_records', 'removedAt', 'removedAt TEXT DEFAULT \'\'');
  ensureColumn('learning', 'attendance_records', 'removalNote', 'removalNote TEXT DEFAULT \'\'');
  migrateAttendanceRecordStatusConstraint();
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
  ensureColumn('assessment', 'questions', 'gradingType', 'gradingType TEXT NOT NULL DEFAULT \'standard\'');
  ensureColumn('assessment', 'questions', 'updatedBy', 'updatedBy INTEGER');
  ensureColumn('assessment', 'questions', 'updatedAt', 'updatedAt TEXT DEFAULT \'\'');
  ensureQuestionSettingsTable();

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
  ensureColumn('assessment', 'quizzes', 'weight', 'weight REAL DEFAULT 0');
  ensureColumn('assessment', 'quizzes', 'updatedBy', 'updatedBy INTEGER');

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
    CREATE UNIQUE INDEX IF NOT EXISTS learning.idx_categories_course_name_ci
    ON categories(COALESCE(courseId, 0), LOWER(name))
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS learning.idx_attendance_sessions_lookup
    ON attendance_sessions(courseOfferingId, status, sessionDate)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS learning.idx_attendance_records_lookup
    ON attendance_records(sessionId, studentId, status)
  `);

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

  database.exec(`
    CREATE INDEX IF NOT EXISTS users.idx_resource_access_lookup
    ON resource_access_grants(resourceType, resourceId, teacherUserId)
  `);

  database.exec(`
    CREATE INDEX IF NOT EXISTS assessment.idx_question_user_settings_lookup
    ON question_user_settings(questionId, userId)
  `);
}

function ensureResourceAccessTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users.resource_access_grants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resourceType TEXT NOT NULL CHECK(resourceType IN ('question', 'category', 'quiz')),
      resourceId INTEGER NOT NULL,
      teacherUserId INTEGER NOT NULL,
      accessLevel TEXT NOT NULL CHECK(accessLevel IN ('read', 'write')),
      grantedBy INTEGER,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(resourceType, resourceId, teacherUserId)
    )
  `);
}

function ensureQuestionSettingsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assessment.question_user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      points REAL,
      gradingType TEXT DEFAULT '',
      updatedAt TEXT DEFAULT (datetime('now')),
      UNIQUE(questionId, userId),
      FOREIGN KEY (questionId) REFERENCES questions(id) ON DELETE CASCADE
    )
  `);
}

function migrateCategoryUniqueness() {
  const database = getDatabase();
  const table = database.prepare(`
    SELECT sql
    FROM learning.sqlite_master
    WHERE type = 'table' AND name = 'categories'
  `).get();

  if (!table || !/name\s+TEXT\s+NOT\s+NULL\s+UNIQUE/i.test(String(table.sql || ''))) return;

  database.exec('PRAGMA foreign_keys = OFF');
  database.exec('BEGIN TRANSACTION');
  try {
    database.exec(`
      DROP TABLE IF EXISTS learning.categories_new;

      CREATE TABLE learning.categories_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        courseId INTEGER,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        createdBy INTEGER,
        updatedBy INTEGER,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL
      );

      INSERT INTO learning.categories_new (id, courseId, name, description, createdAt)
      SELECT id, courseId, name, description, createdAt
      FROM learning.categories;

      DROP TABLE learning.categories;
      ALTER TABLE learning.categories_new RENAME TO categories;
    `);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}

function migrateAttendanceRecordStatusConstraint() {
  const database = getDatabase();
  const table = database.prepare(`
    SELECT sql
    FROM learning.sqlite_master
    WHERE type = 'table' AND name = 'attendance_records'
  `).get();

  if (!table || String(table.sql || '').includes("'removed'")) return;

  database.exec('PRAGMA foreign_keys = OFF');
  database.exec('BEGIN TRANSACTION');
  try {
    database.exec(`
      DROP TABLE IF EXISTS learning.attendance_records_new;

      CREATE TABLE learning.attendance_records_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sessionId INTEGER NOT NULL,
        studentId INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused', 'removed', 'invalidated')),
        note TEXT DEFAULT '',
        markedBy INTEGER,
        removedBy INTEGER,
        removedAt TEXT DEFAULT '',
        removalNote TEXT DEFAULT '',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now')),
        UNIQUE(sessionId, studentId),
        FOREIGN KEY (sessionId) REFERENCES attendance_sessions(id) ON DELETE CASCADE
      );

      INSERT INTO learning.attendance_records_new (
        id, sessionId, studentId, status, note, markedBy, removedBy, removedAt, removalNote, createdAt, updatedAt
      )
      SELECT
        id, sessionId, studentId, status, note, markedBy, removedBy, removedAt, removalNote, createdAt, updatedAt
      FROM learning.attendance_records;

      DROP TABLE learning.attendance_records;
      ALTER TABLE learning.attendance_records_new RENAME TO attendance_records;
    `);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}

function migrateImportBatchConstraint() {
  const database = getDatabase();
  const table = database.prepare(`
    SELECT sql
    FROM users.sqlite_master
    WHERE type = 'table' AND name = 'import_batches'
  `).get();

  const sql = String((table && table.sql) || '');
  if (!table || (sql.includes("'courses'") && sql.includes("'completed_with_errors'"))) return;

  database.exec('PRAGMA foreign_keys = OFF');
  database.exec('BEGIN TRANSACTION');
  try {
    database.exec(`
      DROP TABLE IF EXISTS users.import_batches_new;

      CREATE TABLE users.import_batches_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('users', 'students', 'teachers', 'questions', 'courses', 'enrollments')),
        uploadedBy INTEGER,
        fileName TEXT NOT NULL,
        fileType TEXT DEFAULT '',
        mimeType TEXT DEFAULT '',
        fileSizeBytes INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'completed_with_errors', 'failed')),
        totalRows INTEGER NOT NULL DEFAULT 0,
        successCount INTEGER NOT NULL DEFAULT 0,
        failedCount INTEGER NOT NULL DEFAULT 0,
        createdCount INTEGER NOT NULL DEFAULT 0,
        updatedCount INTEGER NOT NULL DEFAULT 0,
        skippedCount INTEGER NOT NULL DEFAULT 0,
        validationErrorCount INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      INSERT INTO users.import_batches_new (
        id, type, uploadedBy, fileName, fileType, mimeType, fileSizeBytes, status,
        totalRows, successCount, failedCount, createdCount, updatedCount, skippedCount,
        validationErrorCount, createdAt
      )
      SELECT
        id,
        type,
        uploadedBy,
        fileName,
        '',
        '',
        0,
        CASE status
          WHEN 'processed' THEN 'completed'
          WHEN 'partially_failed' THEN 'completed_with_errors'
          ELSE status
        END,
        totalRows,
        successCount,
        failedCount,
        successCount,
        0,
        0,
        failedCount,
        createdAt
      FROM users.import_batches;

      DROP TABLE users.import_batches;
      ALTER TABLE users.import_batches_new RENAME TO import_batches;
    `);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}

function ensureImportBatchAuditColumns() {
  const hadCreatedCount = columnExists('users', 'import_batches', 'createdCount');
  ensureColumn('users', 'import_batches', 'fileType', 'fileType TEXT DEFAULT \'\'');
  ensureColumn('users', 'import_batches', 'mimeType', 'mimeType TEXT DEFAULT \'\'');
  ensureColumn('users', 'import_batches', 'fileSizeBytes', 'fileSizeBytes INTEGER NOT NULL DEFAULT 0');
  ensureColumn('users', 'import_batches', 'createdCount', 'createdCount INTEGER NOT NULL DEFAULT 0');
  ensureColumn('users', 'import_batches', 'updatedCount', 'updatedCount INTEGER NOT NULL DEFAULT 0');
  ensureColumn('users', 'import_batches', 'skippedCount', 'skippedCount INTEGER NOT NULL DEFAULT 0');
  ensureColumn('users', 'import_batches', 'validationErrorCount', 'validationErrorCount INTEGER NOT NULL DEFAULT 0');

  if (!hadCreatedCount) {
    db.prepare(`
      UPDATE users.import_batches
      SET createdCount = successCount,
          validationErrorCount = failedCount
    `).run();
  }
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

function ensureSystemSettings() {
  db.prepare(`
    INSERT OR IGNORE INTO users.system_settings (key, value)
    VALUES (?, ?)
  `).run('maintenance_mode', 'true');
}

function ensureColumn(schema, tableName, columnName, columnSql) {
  if (!columnExists(schema, tableName, columnName)) {
    db.exec(`ALTER TABLE ${schema}.${tableName} ADD COLUMN ${columnSql}`);
  }
}

function columnExists(schema, tableName, columnName) {
  const columns = db.prepare(`PRAGMA ${schema}.table_info(${tableName})`).all();
  return columns.some(column => column.name === columnName);
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

    const preferred = user.role === 'admin' && (String(user.email).toLowerCase() === 'admin@example.com' || user.email === '')
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
      AND (LOWER(email) = LOWER('admin@example.com') OR email = '')
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
  ensureAdvancedDemoSeed(database);
}

function seedUsers(database) {
  const insertUser = database.prepare(`
    INSERT INTO users (name, username, email, role, passwordHash, passwordSalt, passwordAlgorithm, mustChangeCredentials)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ['Admin User', 'admin', '', 'admin', 'Admin123!', 1],
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
    'INSERT INTO categories (courseId, name, description, createdBy) VALUES (?, ?, ?, ?)'
  );
  const insertQuestion = database.prepare(`
    INSERT INTO questions (categoryId, text, type, options, correctAnswer, difficulty, points, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  database.exec('BEGIN TRANSACTION');
  try {
    const categories = {
      javascript: Number(insertCategory.run(courseId, 'JavaScript', 'Questions about JavaScript programming language fundamentals', teacherId).lastInsertRowid),
      html: Number(insertCategory.run(courseId, 'HTML & CSS', 'Questions about web markup and styling', teacherId).lastInsertRowid),
      databases: Number(insertCategory.run(courseId, 'Databases', 'Questions about database concepts and SQL', teacherId).lastInsertRowid),
      general: Number(insertCategory.run(courseId, 'General Knowledge', 'General programming and computer science questions', teacherId).lastInsertRowid)
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
    const quizQuestionsToSeed = [
      { index: 0, points: 4.44 },
      { index: 1, points: 4.44 },
      { index: 2, points: 19.99 },
      { index: 3, points: 19.99 },
      { index: 4, points: 19.99 },
      { index: 5, points: 4.44 },
      { index: 6, points: 4.44 },
      { index: 7, points: 4.44 },
      { index: 8, points: 4.44 },
      { index: 9, points: 4.44 },
      { index: 10, points: 4.44 },
      { index: 13, points: 4.51 }
    ];

    quizQuestionsToSeed.forEach((q, i) => {
      addQuizQuestion.run(quizId, seededQuestionIds[q.index], q.points, i + 1);
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

function getQuestionSeedSignature(type, text) {
  return JSON.stringify([type, text]);
}

function ensureAdvancedDemoSeed(database) {
  const course = database.prepare('SELECT id FROM courses WHERE code = ?').get('WEB101');
  if (!course) return;

  const teacher = database.prepare('SELECT id FROM users WHERE role = ? LIMIT 1').get('teacher');
  const teacherId = teacher ? teacher.id : null;
  const categoryName = 'Advanced Demo';
  const quizTitle = 'Numerical Methods - Full Demo Exam';
  const quizDescription = 'A comprehensive demo exam showcasing all question types: Multiple Choice with LaTeX, True/False, Fill-in-the-Blank, Short Answer Numeric, Multiple Response, Ordering, Essay, Math Table, and Multi-Part problems.';
  const baseSeeds = getAdvancedDemoQuestionSeeds();
  const questionSeeds = [];
  for (let i = 0; i < 5; i++) {
    baseSeeds.forEach((seed, seedIndex) => {
      const newSeed = JSON.parse(JSON.stringify(seed));
      newSeed.key = seed.key + '_' + i;
      if (i === 0 && seedIndex === 2) {
        newSeed.points = 2.32;
        newSeed.quizPoints = 2.32;
      } else {
        newSeed.points = 2.22;
        newSeed.quizPoints = 2.22;
      }
      questionSeeds.push(newSeed);
    });
  }

  const selectCategory = database.prepare(`
    SELECT id
    FROM categories
    WHERE courseId = ? AND LOWER(name) = LOWER(?)
    LIMIT 1
  `);
  const insertCategory = database.prepare(`
    INSERT INTO categories (courseId, name, description, createdBy)
    VALUES (?, ?, ?, ?)
  `);
  const insertQuestion = database.prepare(`
    INSERT INTO questions (
      categoryId, text, type, options, correctAnswer, difficulty, points,
      richText, explanationText, hintText, mediaUrl, acceptedAnswers,
      caseSensitive, gradingType, createdBy
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const selectTableConfig = database.prepare(`
    SELECT id FROM question_table_config WHERE questionId = ? LIMIT 1
  `);
  const insertTableConfig = database.prepare(`
    INSERT INTO question_table_config (
      questionId, columnsJson, rowCount, prefillJson, correctDataJson, validationJson
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const countParts = database.prepare(`
    SELECT COUNT(*) as count FROM question_parts WHERE questionId = ?
  `);
  const insertPart = database.prepare(`
    INSERT INTO question_parts (
      questionId, partLabel, partText, answerType, correctAnswer,
      acceptedAnswers, placeholder, validationRule, position, points
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const selectQuiz = database.prepare(`
    SELECT id
    FROM quizzes
    WHERE courseId = ? AND LOWER(title) LIKE 'numerical methods%full demo exam'
    ORDER BY id ASC
    LIMIT 1
  `);
  const insertQuiz = database.prepare(`
    INSERT INTO quizzes (
      courseId, title, description, status, openAt, closeAt, timeLimitMinutes,
      attemptsAllowed, shuffleQuestions, showCorrectAnswers, createdBy, startAt,
      endAt, durationMinutes, maxAttempts, shuffleOptions, showResultPolicy,
      gradingMode, penaltyEnabled, penaltyPerWrong, penaltyRatio, requiresSeb,
      sebConfigName, sebConfigUrl, templateName
    )
    VALUES (?, ?, ?, 'published', '', '', 120, 99, 1, 1, ?, '', '', 120, 99, 0,
      'immediately', 'standard', 0, 0, 0, 0, '', '', '')
  `);
  const selectAdvancedQuizLinks = database.prepare(`
    SELECT qq.id, qq.questionId
    FROM quiz_questions qq
    JOIN questions q ON q.id = qq.questionId
    WHERE qq.quizId = ? AND q.categoryId = ?
    ORDER BY qq.position ASC, qq.id ASC
  `);
  const deleteAdvancedQuizLinks = database.prepare(`
    DELETE FROM quiz_questions
    WHERE quizId = ?
      AND questionId IN (
        SELECT id
        FROM questions
        WHERE categoryId = ?
      )
  `);
  const insertQuizQuestion = database.prepare(`
    INSERT INTO quiz_questions (quizId, questionId, points, position)
    VALUES (?, ?, ?, ?)
  `);

  database.exec('BEGIN TRANSACTION');
  try {
    let category = selectCategory.get(course.id, categoryName);
    if (!category) {
      category = {
        id: Number(insertCategory.run(
          course.id,
          categoryName,
          'Advanced demo questions covering every supported quiz question type.',
          teacherId
        ).lastInsertRowid)
      };
    }

    const questionIds = new Map();
    const existingQuestionsBySignature = new Map();
    database.prepare('SELECT id, type, text FROM questions WHERE categoryId = ? ORDER BY id ASC')
      .all(category.id)
      .forEach(question => {
        const signature = getQuestionSeedSignature(question.type, question.text);
        if (!existingQuestionsBySignature.has(signature)) {
          existingQuestionsBySignature.set(signature, []);
        }
        existingQuestionsBySignature.get(signature).push(Number(question.id));
      });

    questionSeeds.forEach(seed => {
      const matchingExistingQuestions = existingQuestionsBySignature.get(getQuestionSeedSignature(seed.type, seed.text)) || [];
      const existingQuestionId = matchingExistingQuestions.shift();
      const questionId = existingQuestionId
        ? existingQuestionId
        : Number(insertQuestion.run(
          category.id,
          seed.text,
          seed.type,
          JSON.stringify(seed.options || []),
          seed.correctAnswer || '',
          seed.difficulty || 'MEDIUM',
          seed.points || 1,
          seed.richText || '',
          seed.explanationText || '',
          seed.hintText || '',
          seed.mediaUrl || '',
          JSON.stringify(seed.acceptedAnswers || []),
          seed.caseSensitive ? 1 : 0,
          seed.gradingType || 'standard',
          teacherId
        ).lastInsertRowid);

      questionIds.set(seed.key, questionId);

      if (seed.type === 'MT' && seed.tableConfig && !selectTableConfig.get(questionId)) {
        insertTableConfig.run(
          questionId,
          JSON.stringify(seed.tableConfig.columns || []),
          seed.tableConfig.rowCount || 1,
          JSON.stringify(seed.tableConfig.prefill || {}),
          JSON.stringify(seed.tableConfig.correctData || {}),
          JSON.stringify(seed.tableConfig.validation || {})
        );
      }

      if (seed.type === 'MP' && Array.isArray(seed.parts) && countParts.get(questionId).count === 0) {
        seed.parts.forEach((part, index) => {
          insertPart.run(
            questionId,
            part.partLabel || '',
            part.partText || '',
            part.answerType || 'text',
            part.correctAnswer || '',
            JSON.stringify(part.acceptedAnswers || []),
            part.placeholder || '',
            part.validationRule || '',
            part.position !== undefined ? part.position : index,
            part.points || 1
          );
        });
      }
    });

    let quiz = selectQuiz.get(course.id);
    if (!quiz) {
      quiz = {
        id: Number(insertQuiz.run(course.id, quizTitle, quizDescription, teacherId).lastInsertRowid)
      };
    }

    const expectedQuestionIds = questionSeeds.map(seed => questionIds.get(seed.key));
    const existingAdvancedLinks = selectAdvancedQuizLinks.all(quiz.id, category.id);
    const existingQuestionIds = existingAdvancedLinks.map(link => Number(link.questionId));
    const expectedQuestionIdSet = new Set(expectedQuestionIds);
    const existingQuestionIdSet = new Set(existingQuestionIds);
    const alreadySynced = existingQuestionIds.length === expectedQuestionIds.length
      && existingQuestionIdSet.size === expectedQuestionIdSet.size
      && expectedQuestionIds.every(questionId => existingQuestionIdSet.has(questionId));

    if (!alreadySynced) {
      deleteAdvancedQuizLinks.run(quiz.id, category.id);
      questionSeeds.forEach((seed, index) => {
        insertQuizQuestion.run(quiz.id, questionIds.get(seed.key), seed.quizPoints || seed.points || 1, index + 1);
      });
    }

    database.exec('COMMIT');
  } catch (e) {
    database.exec('ROLLBACK');
    throw e;
  }
}

function getAdvancedDemoQuestionSeeds() {
  return [
    {
      key: 'taylor_mc',
      type: 'MC',
      text: 'Given the Taylor series expansion $e^x = \\sum_{n=0}^{\\infty} \\frac{x^n}{n!}$, what is the 3rd-degree Maclaurin polynomial $P_3(x)$?',
      options: [
        '$1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}$',
        '$1 + x + x^2 + x^3$',
        '$x + \\frac{x^2}{2} + \\frac{x^3}{3}$',
        '$1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3}$'
      ],
      correctAnswer: '0',
      difficulty: 'MEDIUM',
      points: 2,
      quizPoints: 2,
      explanationText: '$P_3(x) = \\frac{x^0}{0!} + \\frac{x^1}{1!} + \\frac{x^2}{2!} + \\frac{x^3}{3!} = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}$',
      hintText: 'A Maclaurin polynomial is a Taylor polynomial centered at zero. The n-th term is x^n / n!.'
    },
    {
      key: 'integral_tf',
      type: 'TF',
      text: 'The integral $\\int_0^1 x^2 \\, dx = \\frac{1}{3}$',
      options: [],
      correctAnswer: 'true',
      difficulty: 'EASY',
      points: 1,
      quizPoints: 1,
      richText: 'Evaluate the definite integral using the antiderivative $\\frac{x^3}{3}$.',
      explanationText: '$\\int_0^1 x^2 \\, dx = [\\frac{x^3}{3}]_0^1 = \\frac{1}{3} - 0 = \\frac{1}{3}$. The statement is true.',
      hintText: 'Find the antiderivative of x^2 and evaluate from 0 to 1.'
    },
    {
      key: 'discriminant_fb',
      type: 'FB',
      text: 'In the equation $ax^2 + bx + c = 0$, the discriminant formula is $\\Delta = b^2 - 4ac$. If $a=1, b=5, c=6$, what is $\\Delta$?',
      options: [],
      correctAnswer: '1',
      difficulty: 'MEDIUM',
      points: 2,
      quizPoints: 2,
      explanationText: '$\\Delta = 5^2 - 4(1)(6) = 25 - 24 = 1$',
      hintText: 'Substitute a=1, b=5, c=6 into the discriminant formula.'
    },
    {
      key: 'fixed_point_sa',
      type: 'SA',
      text: 'Using the Fixed-Point Iteration method with $g(x) = \\frac{x + \\frac{2}{x}}{2}$ and initial guess $p_0 = 1$, compute $p_1$ to 6 significant digits.',
      options: [],
      correctAnswer: '1.50000',
      acceptedAnswers: ['1.5', '1.5000', '1.50000'],
      difficulty: 'HARD',
      points: 3,
      quizPoints: 3,
      richText: 'The Fixed-Point Iteration formula is $p_n = g(p_{n-1})$.\\n\\nCompute: $p_1 = g(p_0) = g(1) = \\frac{1 + \\frac{2}{1}}{2}$',
      explanationText: '$p_1 = g(1) = \\frac{1 + 2}{2} = \\frac{3}{2} = 1.50000$',
      hintText: 'Substitute p_0 = 1 into g(x) and simplify.'
    },
    {
      key: 'root_methods_mr',
      type: 'MR',
      text: 'Which of the following are root-finding methods in Numerical Analysis? (Select all that apply)',
      options: [
        'Bisection Method',
        "Euler's Method",
        'Newton-Raphson Method',
        'Regula Falsi (False Position)',
        'Runge-Kutta Method',
        'Secant Method'
      ],
      correctAnswer: '0,2,3,5',
      difficulty: 'MEDIUM',
      points: 3,
      quizPoints: 3,
      explanationText: "Bisection, Newton-Raphson, Regula Falsi, and Secant are root-finding methods. Euler's and Runge-Kutta are ODE solvers.",
      hintText: 'Root-finding methods are used to solve f(x) = 0. Some methods listed here are for ODEs instead.'
    },
    {
      key: 'bisection_order_or',
      type: 'OR',
      text: 'Arrange the steps of the Bisection Method in the correct order:',
      options: [
        'Choose initial interval [a, b] where f(a)*f(b) < 0',
        'Compute midpoint c = (a + b) / 2',
        'Evaluate f(c)',
        'If f(a)*f(c) < 0, set b = c; else set a = c',
        'Check if |b - a| < tolerance or f(c) is close to 0',
        'Repeat until convergence'
      ],
      correctAnswer: '0,1,2,3,4,5',
      difficulty: 'MEDIUM',
      points: 3,
      quizPoints: 3,
      explanationText: 'The Bisection Method systematically halves the interval containing the root until the desired precision is achieved.',
      hintText: 'Start with interval selection, then iterate: midpoint, evaluate, narrow interval, check convergence.'
    },
    {
      key: 'convergence_es',
      type: 'ES',
      text: 'Explain the concept of convergence in iterative numerical methods. Discuss at least two conditions that guarantee convergence and provide an example.',
      options: [],
      correctAnswer: '',
      difficulty: 'HARD',
      points: 5,
      quizPoints: 5,
      richText: "Your answer should address:\\n\\n1. What convergence means in the context of iterative methods.\\n2. The role of the contraction mapping theorem.\\n3. How |g'(x)| < 1 supports convergence in Fixed-Point Iteration.\\n4. A concrete example with a function g(x).",
      explanationText: 'This question is manually graded. A complete answer discusses convergence as iterates approaching the true solution, contraction mapping, and the Fixed-Point condition.',
      hintText: 'Think about what happens to the error |p_n - p| as n approaches infinity.'
    },
    {
      key: 'regula_falsi_mt',
      type: 'MT',
      text: 'Complete the Regula Falsi (False Position) iteration table for $f(x) = x^3 - x - 2$ with initial bracket $[1, 2]$.',
      options: [],
      correctAnswer: '',
      difficulty: 'HARD',
      points: 6,
      quizPoints: 6,
      richText: 'Use the Regula Falsi formula:\\n\\n$$c_n = a_n - f(a_n) \\cdot \\frac{b_n - a_n}{f(b_n) - f(a_n)}$$\\n\\nFill in each cell. Round to 5 decimal places.',
      explanationText: 'Row 1: c_1 = 1 - (-2) * (2 - 1) / (4 - (-2)) = 1.33333. Then f(1.33333) = -0.96296, so the root is in [1.33333, 2].',
      hintText: 'Remember: f(1) = -2 and f(2) = 4. Use the formula to find c_1.',
      tableConfig: {
        columns: [
          { header: 'i', type: 'label' },
          { header: 'a', type: 'input' },
          { header: 'b', type: 'input' },
          { header: 'c', type: 'input' },
          { header: 'f(c)', type: 'input' }
        ],
        rowCount: 3,
        prefill: {},
        correctData: {
          r0_c1: '1',
          r0_c2: '2',
          r0_c3: '1.33333',
          r0_c4: '-0.96296',
          r1_c1: '1.33333',
          r1_c2: '2',
          r1_c3: '1.46269',
          r1_c4: '-0.33334',
          r2_c1: '1.46269',
          r2_c2: '2',
          r2_c3: '1.50402',
          r2_c4: '-0.10182'
        },
        validation: {}
      }
    },
    {
      key: 'bisection_mp',
      type: 'MP',
      text: 'Consider the function $f(x) = x^3 + 4x^2 - 10$ on the interval $[1, 2]$.',
      options: [],
      correctAnswer: '',
      difficulty: 'HARD',
      points: 8,
      quizPoints: 8,
      richText: 'This is a multi-part problem. Answer each sub-question independently.',
      explanationText: 'Each part builds toward understanding Fixed-Point Iteration convergence for this function.',
      hintText: 'For part (a), substitute directly. For part (b), rearrange x^3 + 4x^2 - 10 = 0 to isolate x.',
      parts: [
        {
          partLabel: '(a)',
          partText: 'Evaluate the sign of f(1).',
          answerType: 'sign',
          correctAnswer: '-',
          points: 1
        },
        {
          partLabel: '(b)',
          partText: 'Evaluate the sign of f(2).',
          answerType: 'sign',
          correctAnswer: '+',
          points: 1
        },
        {
          partLabel: '(c)',
          partText: 'Compute the first bisection midpoint.',
          answerType: 'numeric',
          correctAnswer: '1.5',
          acceptedAnswers: ['1.50', '1.500'],
          points: 2
        },
        {
          partLabel: '(d)',
          partText: 'Evaluate the sign of f(1.5).',
          answerType: 'sign',
          correctAnswer: '+',
          points: 1
        },
        {
          partLabel: '(e)',
          partText: 'Which subinterval contains the root after the first bisection step?',
          answerType: 'text',
          correctAnswer: '1,1.5',
          acceptedAnswers: ['[1,1.5]', '[1, 1.5]', '1 to 1.5'],
          points: 3
        }
      ]
    }
  ];
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
    ORDER BY CASE WHEN LOWER(c.name) = 'advanced demo' THEN 1 ELSE 0 END, q.id ASC
    LIMIT 12
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
    
    const quizQuestionsToSeed = [
      { points: 4.44 },
      { points: 4.44 },
      { points: 19.99 },
      { points: 19.99 },
      { points: 19.99 },
      { points: 4.44 },
      { points: 4.44 },
      { points: 4.44 },
      { points: 4.44 },
      { points: 4.44 },
      { points: 4.44 },
      { points: 4.51 }
    ];

    questions.forEach((question, index) => {
      const points = (index < quizQuestionsToSeed.length) ? quizQuestionsToSeed[index].points : 1;
      insert.run(quiz.lastInsertRowid, question.id, points, index + 1);
    });
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
