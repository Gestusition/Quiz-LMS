const { getDatabase } = require('../database/db');

function withTransaction(work) {
  const db = getDatabase();
  db.exec('BEGIN TRANSACTION');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function listFaculties() {
  return getDatabase().prepare(`
    SELECT f.*, COUNT(d.id) as departmentCount
    FROM faculties f
    LEFT JOIN departments d ON d.facultyId = f.id
    GROUP BY f.id
    ORDER BY f.name ASC
  `).all();
}

function findFacultyById(id) {
  return getDatabase().prepare('SELECT * FROM faculties WHERE id = ?').get(id) || null;
}

function findFacultyDuplicate(code, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare('SELECT id FROM faculties WHERE LOWER(code) = LOWER(?) AND id != ?').get(code, excludeId) || null;
  }
  return db.prepare('SELECT id FROM faculties WHERE LOWER(code) = LOWER(?)').get(code) || null;
}

function insertFaculty(payload) {
  return getDatabase().prepare('INSERT INTO faculties (name, code) VALUES (?, ?)')
    .run(payload.name, payload.code);
}

function updateFaculty(id, payload, updatedAt) {
  return getDatabase().prepare('UPDATE faculties SET name = ?, code = ?, updatedAt = ? WHERE id = ?')
    .run(payload.name, payload.code, updatedAt, id);
}

function deleteFaculty(id) {
  return getDatabase().prepare('DELETE FROM faculties WHERE id = ?').run(id);
}

function listDepartments(filters = {}) {
  const params = [];
  let query = `
    SELECT d.*, f.name as facultyName, f.code as facultyCode,
      COUNT(cy.id) as classYearCount,
      COUNT(c.id) as courseCount
    FROM departments d
    JOIN faculties f ON f.id = d.facultyId
    LEFT JOIN class_years cy ON cy.departmentId = d.id
    LEFT JOIN courses c ON c.departmentId = d.id
    WHERE 1=1
  `;
  if (filters.facultyId) {
    query += ' AND d.facultyId = ?';
    params.push(filters.facultyId);
  }
  query += ' GROUP BY d.id ORDER BY f.name ASC, d.name ASC';
  return getDatabase().prepare(query).all(...params);
}

function findDepartmentById(id) {
  return getDatabase().prepare(`
    SELECT d.*, f.name as facultyName, f.code as facultyCode
    FROM departments d
    JOIN faculties f ON f.id = d.facultyId
    WHERE d.id = ?
  `).get(id) || null;
}

function findDepartmentDuplicate(facultyId, code, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare(`
      SELECT id FROM departments
      WHERE facultyId = ? AND LOWER(code) = LOWER(?) AND id != ?
    `).get(facultyId, code, excludeId) || null;
  }
  return db.prepare(`
    SELECT id FROM departments
    WHERE facultyId = ? AND LOWER(code) = LOWER(?)
  `).get(facultyId, code) || null;
}

function insertDepartment(payload) {
  return getDatabase().prepare('INSERT INTO departments (facultyId, name, code) VALUES (?, ?, ?)')
    .run(payload.facultyId, payload.name, payload.code);
}

function updateDepartment(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE departments
    SET facultyId = ?, name = ?, code = ?, updatedAt = ?
    WHERE id = ?
  `).run(payload.facultyId, payload.name, payload.code, updatedAt, id);
}

function deleteDepartment(id) {
  return getDatabase().prepare('DELETE FROM departments WHERE id = ?').run(id);
}

function listClassYears(filters = {}) {
  const params = [];
  let query = `
    SELECT cy.*, d.name as departmentName, d.code as departmentCode,
      f.name as facultyName, COUNT(sec.id) as sectionCount
    FROM class_years cy
    JOIN departments d ON d.id = cy.departmentId
    JOIN faculties f ON f.id = d.facultyId
    LEFT JOIN sections sec ON sec.classYearId = cy.id
    WHERE 1=1
  `;
  if (filters.departmentId) {
    query += ' AND cy.departmentId = ?';
    params.push(filters.departmentId);
  }
  query += ' GROUP BY cy.id ORDER BY d.name ASC, cy.yearNumber ASC';
  return getDatabase().prepare(query).all(...params);
}

function findClassYearById(id) {
  return getDatabase().prepare(`
    SELECT cy.*, d.name as departmentName, d.code as departmentCode, f.name as facultyName
    FROM class_years cy
    JOIN departments d ON d.id = cy.departmentId
    JOIN faculties f ON f.id = d.facultyId
    WHERE cy.id = ?
  `).get(id) || null;
}

function findClassYearDuplicate(departmentId, yearNumber, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare(`
      SELECT id FROM class_years
      WHERE departmentId = ? AND yearNumber = ? AND id != ?
    `).get(departmentId, yearNumber, excludeId) || null;
  }
  return db.prepare(`
    SELECT id FROM class_years
    WHERE departmentId = ? AND yearNumber = ?
  `).get(departmentId, yearNumber) || null;
}

function insertClassYear(payload) {
  return getDatabase().prepare(`
    INSERT INTO class_years (departmentId, yearNumber, name)
    VALUES (?, ?, ?)
  `).run(payload.departmentId, payload.yearNumber, payload.name);
}

function updateClassYear(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE class_years
    SET departmentId = ?, yearNumber = ?, name = ?, updatedAt = ?
    WHERE id = ?
  `).run(payload.departmentId, payload.yearNumber, payload.name, updatedAt, id);
}

function deleteClassYear(id) {
  return getDatabase().prepare('DELETE FROM class_years WHERE id = ?').run(id);
}

function listSections(filters = {}) {
  const params = [];
  let query = `
    SELECT sec.*, cy.name as classYearName, cy.yearNumber,
      d.name as departmentName, d.code as departmentCode
    FROM sections sec
    JOIN class_years cy ON cy.id = sec.classYearId
    JOIN departments d ON d.id = cy.departmentId
    WHERE 1=1
  `;
  if (filters.classYearId) {
    query += ' AND sec.classYearId = ?';
    params.push(filters.classYearId);
  }
  query += ' ORDER BY d.name ASC, cy.yearNumber ASC, sec.name ASC';
  return getDatabase().prepare(query).all(...params);
}

function findSectionById(id) {
  return getDatabase().prepare(`
    SELECT sec.*, cy.name as classYearName, cy.yearNumber, d.name as departmentName
    FROM sections sec
    JOIN class_years cy ON cy.id = sec.classYearId
    JOIN departments d ON d.id = cy.departmentId
    WHERE sec.id = ?
  `).get(id) || null;
}

function findSectionDuplicate(classYearId, name, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare(`
      SELECT id FROM sections
      WHERE classYearId = ? AND LOWER(name) = LOWER(?) AND id != ?
    `).get(classYearId, name, excludeId) || null;
  }
  return db.prepare(`
    SELECT id FROM sections
    WHERE classYearId = ? AND LOWER(name) = LOWER(?)
  `).get(classYearId, name) || null;
}

function insertSection(payload) {
  return getDatabase().prepare('INSERT INTO sections (classYearId, name) VALUES (?, ?)')
    .run(payload.classYearId, payload.name);
}

function updateSection(id, payload, updatedAt) {
  return getDatabase().prepare('UPDATE sections SET classYearId = ?, name = ?, updatedAt = ? WHERE id = ?')
    .run(payload.classYearId, payload.name, updatedAt, id);
}

function deleteSection(id) {
  return getDatabase().prepare('DELETE FROM sections WHERE id = ?').run(id);
}

function listTerms() {
  return getDatabase().prepare(`
    SELECT t.*,
      COUNT(DISTINCT co.id) as offeringCount,
      COUNT(DISTINCT a.id) as assignmentCount
    FROM academic_terms t
    LEFT JOIN course_offerings co ON co.termId = t.id
    LEFT JOIN assignments a ON a.termId = t.id
    GROUP BY t.id
    ORDER BY t.isActive DESC, t.startDate DESC, t.id DESC
  `).all();
}

function findTermById(id) {
  return getDatabase().prepare('SELECT * FROM academic_terms WHERE id = ?').get(id) || null;
}

function findActiveTerm() {
  return getDatabase().prepare('SELECT * FROM academic_terms WHERE isActive = 1 ORDER BY id DESC LIMIT 1').get() || null;
}

function insertTerm(payload) {
  return getDatabase().prepare(`
    INSERT INTO academic_terms (name, academicYear, semesterType, startDate, endDate, isActive)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(payload.name, payload.academicYear, payload.semesterType, payload.startDate, payload.endDate, payload.isActive);
}

function updateTerm(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE academic_terms
    SET name = ?, academicYear = ?, semesterType = ?, startDate = ?, endDate = ?, isActive = ?, updatedAt = ?
    WHERE id = ?
  `).run(payload.name, payload.academicYear, payload.semesterType, payload.startDate, payload.endDate, payload.isActive, updatedAt, id);
}

function setActiveTerm(id, updatedAt) {
  const db = getDatabase();
  db.prepare('UPDATE academic_terms SET isActive = 0, updatedAt = ?').run(updatedAt);
  db.prepare('UPDATE academic_terms SET isActive = 1, updatedAt = ? WHERE id = ?').run(updatedAt, id);
}

function deleteTerm(id) {
  return getDatabase().prepare('DELETE FROM academic_terms WHERE id = ?').run(id);
}

function listCourseOfferings(user, filters = {}) {
  const params = [];
  let query = `
    SELECT co.*, c.code as courseCode, c.title as courseTitle, c.credits,
      t.name as termName, t.academicYear, t.semesterType, t.isActive as termIsActive,
      u.name as instructorName,
      d.name as departmentName, d.code as departmentCode,
      cy.name as classYearName, cy.yearNumber,
      sec.name as sectionName,
      COUNT(DISTINCT oe.studentId) as studentCount,
      COUNT(DISTINCT a.id) as assignmentCount,
      COUNT(DISTINCT att.id) as attendanceSessionCount
    FROM course_offerings co
    JOIN courses c ON c.id = co.courseId
    JOIN academic_terms t ON t.id = co.termId
    LEFT JOIN users u ON u.id = co.instructorId
    LEFT JOIN departments d ON d.id = co.departmentId
    LEFT JOIN class_years cy ON cy.id = co.classYearId
    LEFT JOIN sections sec ON sec.id = co.sectionId
    LEFT JOIN course_offering_enrollments oe ON oe.courseOfferingId = co.id AND oe.status = 'active'
    LEFT JOIN assignments a ON a.courseOfferingId = co.id
    LEFT JOIN attendance_sessions att ON att.courseOfferingId = co.id
    WHERE 1=1
  `;

  if (user.role === 'teacher') {
    query += ` AND (
      co.instructorId = ?
      OR co.courseId IN (
        SELECT courseId FROM enrollments
        WHERE userId = ? AND role = 'teacher' AND status = 'active'
      )
    )`;
    params.push(user.id, user.id);
  } else if (user.role === 'student') {
    query += ` AND co.id IN (
      SELECT courseOfferingId FROM course_offering_enrollments
      WHERE studentId = ? AND status = 'active'
    )`;
    params.push(user.id);
  }

  if (filters.termId) {
    query += ' AND co.termId = ?';
    params.push(filters.termId);
  }
  if (filters.courseId) {
    query += ' AND co.courseId = ?';
    params.push(filters.courseId);
  }
  if (filters.activeTerm) {
    query += ' AND t.isActive = 1';
  }

  query += ' GROUP BY co.id ORDER BY t.isActive DESC, t.startDate DESC, c.code ASC';
  return getDatabase().prepare(query).all(...params);
}

function findCourseOfferingById(id) {
  return getDatabase().prepare(`
    SELECT co.*, c.code as courseCode, c.title as courseTitle, c.credits,
      t.name as termName, t.academicYear, t.semesterType, t.isActive as termIsActive,
      u.name as instructorName,
      d.name as departmentName, d.code as departmentCode,
      cy.name as classYearName, cy.yearNumber,
      sec.name as sectionName
    FROM course_offerings co
    JOIN courses c ON c.id = co.courseId
    JOIN academic_terms t ON t.id = co.termId
    LEFT JOIN users u ON u.id = co.instructorId
    LEFT JOIN departments d ON d.id = co.departmentId
    LEFT JOIN class_years cy ON cy.id = co.classYearId
    LEFT JOIN sections sec ON sec.id = co.sectionId
    WHERE co.id = ?
  `).get(id) || null;
}

function insertCourseOffering(payload) {
  return getDatabase().prepare(`
    INSERT INTO course_offerings (
      courseId, termId, instructorId, departmentId, classYearId, sectionId, capacity, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.courseId,
    payload.termId,
    payload.instructorId,
    payload.departmentId,
    payload.classYearId,
    payload.sectionId,
    payload.capacity,
    payload.status
  );
}

function updateCourseOffering(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE course_offerings
    SET courseId = ?, termId = ?, instructorId = ?, departmentId = ?, classYearId = ?,
      sectionId = ?, capacity = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    payload.courseId,
    payload.termId,
    payload.instructorId,
    payload.departmentId,
    payload.classYearId,
    payload.sectionId,
    payload.capacity,
    payload.status,
    updatedAt,
    id
  );
}

function deleteCourseOffering(id) {
  return getDatabase().prepare('DELETE FROM course_offerings WHERE id = ?').run(id);
}

function listOfferingEnrollments(courseOfferingId) {
  return getDatabase().prepare(`
    SELECT oe.*, u.name as studentName, u.email as studentEmail,
      sp.studentNumber, sp.cohort,
      d.name as departmentName, cy.name as classYearName, sec.name as sectionName
    FROM course_offering_enrollments oe
    JOIN users u ON u.id = oe.studentId
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    LEFT JOIN departments d ON d.id = sp.departmentId
    LEFT JOIN class_years cy ON cy.id = sp.classYearId
    LEFT JOIN sections sec ON sec.id = sp.sectionId
    WHERE oe.courseOfferingId = ?
    ORDER BY u.name ASC
  `).all(courseOfferingId);
}

function findOfferingEnrollment(id) {
  return getDatabase().prepare('SELECT * FROM course_offering_enrollments WHERE id = ?').get(id) || null;
}

function findOfferingEnrollmentByStudent(courseOfferingId, studentId) {
  return getDatabase().prepare(`
    SELECT * FROM course_offering_enrollments
    WHERE courseOfferingId = ? AND studentId = ?
  `).get(courseOfferingId, studentId) || null;
}

function countActiveOfferingEnrollments(courseOfferingId, excludeEnrollmentId = null) {
  const params = [courseOfferingId];
  let query = `
    SELECT COUNT(*) as count
    FROM course_offering_enrollments
    WHERE courseOfferingId = ? AND status = 'active'
  `;
  if (excludeEnrollmentId) {
    query += ' AND id != ?';
    params.push(excludeEnrollmentId);
  }
  return getDatabase().prepare(query).get(...params).count;
}

function insertOfferingEnrollment(payload) {
  return getDatabase().prepare(`
    INSERT INTO course_offering_enrollments (courseOfferingId, studentId, status, finalGrade)
    VALUES (?, ?, ?, ?)
  `).run(payload.courseOfferingId, payload.studentId, payload.status, payload.finalGrade);
}

function updateOfferingEnrollment(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE course_offering_enrollments
    SET status = ?, finalGrade = ?, updatedAt = ?
    WHERE id = ?
  `).run(payload.status, payload.finalGrade, updatedAt, id);
}

function deleteOfferingEnrollment(id) {
  return getDatabase().prepare('DELETE FROM course_offering_enrollments WHERE id = ?').run(id);
}

function deleteOfferingEnrollmentsByStudent(studentId) {
  return getDatabase().prepare('DELETE FROM course_offering_enrollments WHERE studentId = ?').run(studentId);
}

function ensureCourseEnrollment(courseId, studentId) {
  return getDatabase().prepare(`
    INSERT OR IGNORE INTO enrollments (courseId, userId, role, status)
    VALUES (?, ?, 'student', 'active')
  `).run(courseId, studentId);
}

function listAssignments(user, filters = {}) {
  const params = [];
  let query = `
    SELECT a.*, co.courseId, c.code as courseCode, c.title as courseTitle,
      t.name as termName, t.isActive as termIsActive,
      u.name as instructorName,
      COUNT(DISTINCT s.id) as submissionCount
      ${user.role === 'student' ? ', own.id as ownSubmissionId, own.status as ownSubmissionStatus, own.grade as ownGrade, own.feedback as ownFeedback, own.submittedAt as ownSubmittedAt, own.late as ownLate' : ''}
    FROM assignments a
    JOIN course_offerings co ON co.id = a.courseOfferingId
    JOIN courses c ON c.id = co.courseId
    JOIN academic_terms t ON t.id = a.termId
    LEFT JOIN users u ON u.id = co.instructorId
    LEFT JOIN assignment_submissions s ON s.assignmentId = a.id
    ${user.role === 'student' ? 'LEFT JOIN assignment_submissions own ON own.assignmentId = a.id AND own.studentId = ?' : ''}
    WHERE 1=1
  `;
  if (user.role === 'student') params.push(user.id);

  if (user.role === 'teacher') {
    query += ` AND (
      co.instructorId = ?
      OR co.courseId IN (
        SELECT courseId FROM enrollments
        WHERE userId = ? AND role = 'teacher' AND status = 'active'
      )
    )`;
    params.push(user.id, user.id);
  } else if (user.role === 'student') {
    query += ` AND a.status IN ('published', 'closed')
      AND a.courseOfferingId IN (
        SELECT courseOfferingId FROM course_offering_enrollments
        WHERE studentId = ? AND status = 'active'
      )`;
    params.push(user.id);
  }

  if (filters.courseOfferingId) {
    query += ' AND a.courseOfferingId = ?';
    params.push(filters.courseOfferingId);
  }
  if (filters.termId) {
    query += ' AND a.termId = ?';
    params.push(filters.termId);
  }

  query += ' GROUP BY a.id ORDER BY a.dueDate ASC, a.createdAt DESC';
  return getDatabase().prepare(query).all(...params);
}

function findAssignmentById(id) {
  return getDatabase().prepare(`
    SELECT a.*, co.courseId, co.instructorId, c.code as courseCode, c.title as courseTitle,
      t.name as termName, t.isActive as termIsActive
    FROM assignments a
    JOIN course_offerings co ON co.id = a.courseOfferingId
    JOIN courses c ON c.id = co.courseId
    JOIN academic_terms t ON t.id = a.termId
    WHERE a.id = ?
  `).get(id) || null;
}

function insertAssignment(payload, termId, createdBy) {
  return getDatabase().prepare(`
    INSERT INTO assignments (courseOfferingId, termId, title, description, dueDate, status, createdBy)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.courseOfferingId,
    termId,
    payload.title,
    payload.description,
    payload.dueDate,
    payload.status,
    createdBy
  );
}

function updateAssignment(id, payload, termId, updatedAt) {
  return getDatabase().prepare(`
    UPDATE assignments
    SET courseOfferingId = ?, termId = ?, title = ?, description = ?, dueDate = ?, status = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    payload.courseOfferingId,
    termId,
    payload.title,
    payload.description,
    payload.dueDate,
    payload.status,
    updatedAt,
    id
  );
}

function deleteAssignment(id) {
  return getDatabase().prepare('DELETE FROM assignments WHERE id = ?').run(id);
}

function listSubmissions(assignmentId) {
  return getDatabase().prepare(`
    SELECT s.*, u.name as studentName, u.email as studentEmail,
      sp.studentNumber, sp.cohort
    FROM assignment_submissions s
    JOIN users u ON u.id = s.studentId
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    WHERE s.assignmentId = ?
    ORDER BY s.submittedAt DESC
  `).all(assignmentId);
}

function findSubmission(id) {
  return getDatabase().prepare(`
    SELECT s.*, a.courseOfferingId, a.termId, co.courseId, co.instructorId
    FROM assignment_submissions s
    JOIN assignments a ON a.id = s.assignmentId
    JOIN course_offerings co ON co.id = a.courseOfferingId
    WHERE s.id = ?
  `).get(id) || null;
}

function findSubmissionByAssignmentStudent(assignmentId, studentId) {
  return getDatabase().prepare(`
    SELECT * FROM assignment_submissions
    WHERE assignmentId = ? AND studentId = ?
  `).get(assignmentId, studentId) || null;
}

function deleteSubmissionsByStudent(studentId) {
  return getDatabase().prepare('DELETE FROM assignment_submissions WHERE studentId = ?').run(studentId);
}

function deleteAttendanceRecordsByStudent(studentId) {
  return getDatabase().prepare('DELETE FROM attendance_records WHERE studentId = ?').run(studentId);
}

function clearUserReferences(userId) {
  const db = getDatabase();
  db.prepare('UPDATE course_offerings SET instructorId = NULL WHERE instructorId = ?').run(userId);
  db.prepare('UPDATE assignments SET createdBy = NULL WHERE createdBy = ?').run(userId);
  db.prepare('UPDATE attendance_sessions SET createdBy = NULL WHERE createdBy = ?').run(userId);
  db.prepare('UPDATE attendance_records SET markedBy = NULL WHERE markedBy = ?').run(userId);
  db.prepare('UPDATE assignment_submissions SET gradedBy = NULL WHERE gradedBy = ?').run(userId);
}

function upsertSubmission(assignmentId, studentId, payload, submittedAt, late = false) {
  const existing = findSubmissionByAssignmentStudent(assignmentId, studentId);
  if (existing) {
    getDatabase().prepare(`
      UPDATE assignment_submissions
      SET submissionText = ?, submissionUrl = ?, status = 'submitted', submittedAt = ?,
        late = ?, grade = '', feedback = '', gradedAt = '', gradedBy = NULL, updatedAt = ?
      WHERE id = ?
    `).run(payload.submissionText, payload.submissionUrl, submittedAt, late ? 1 : 0, submittedAt, existing.id);
    return { lastInsertRowid: existing.id };
  }
  return getDatabase().prepare(`
    INSERT INTO assignment_submissions (
      assignmentId, studentId, submissionText, submissionUrl, status, submittedAt, late
    )
    VALUES (?, ?, ?, ?, 'submitted', ?, ?)
  `).run(assignmentId, studentId, payload.submissionText, payload.submissionUrl, submittedAt, late ? 1 : 0);
}

function gradeSubmission(id, payload, gradedAt, gradedBy) {
  return getDatabase().prepare(`
    UPDATE assignment_submissions
    SET grade = ?, feedback = ?, status = ?, gradedAt = ?, gradedBy = ?, updatedAt = ?
    WHERE id = ?
  `).run(payload.grade, payload.feedback, payload.status, gradedAt, gradedBy, gradedAt, id);
}

function listAttendanceSessions(user, filters = {}) {
  const params = [];
  let query = `
    SELECT ats.*, co.courseId, c.code as courseCode, c.title as courseTitle,
      t.name as termName, COUNT(ar.id) as recordCount
    FROM attendance_sessions ats
    JOIN course_offerings co ON co.id = ats.courseOfferingId
    JOIN courses c ON c.id = co.courseId
    JOIN academic_terms t ON t.id = ats.termId
    LEFT JOIN attendance_records ar ON ar.sessionId = ats.id
    WHERE 1=1
  `;

  if (user.role === 'teacher') {
    query += ` AND (
      co.instructorId = ?
      OR co.courseId IN (
        SELECT courseId FROM enrollments
        WHERE userId = ? AND role = 'teacher' AND status = 'active'
      )
    )`;
    params.push(user.id, user.id);
  } else if (user.role === 'student') {
    query += ` AND ats.courseOfferingId IN (
      SELECT courseOfferingId FROM course_offering_enrollments
      WHERE studentId = ? AND status = 'active'
    )`;
    params.push(user.id);
  }

  if (filters.courseOfferingId) {
    query += ' AND ats.courseOfferingId = ?';
    params.push(filters.courseOfferingId);
  }

  query += ' GROUP BY ats.id ORDER BY ats.sessionDate DESC, ats.id DESC';
  return getDatabase().prepare(query).all(...params);
}

function findAttendanceSessionById(id) {
  return getDatabase().prepare(`
    SELECT ats.*, co.courseId, co.instructorId, c.code as courseCode, c.title as courseTitle
    FROM attendance_sessions ats
    JOIN course_offerings co ON co.id = ats.courseOfferingId
    JOIN courses c ON c.id = co.courseId
    WHERE ats.id = ?
  `).get(id) || null;
}

function insertAttendanceSession(payload, termId, createdBy) {
  return getDatabase().prepare(`
    INSERT INTO attendance_sessions (courseOfferingId, termId, sessionDate, topic, createdBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(payload.courseOfferingId, termId, payload.sessionDate, payload.topic, createdBy);
}

function upsertAttendanceRecord(sessionId, record, markedBy, updatedAt) {
  const existing = getDatabase().prepare(`
    SELECT id FROM attendance_records
    WHERE sessionId = ? AND studentId = ?
  `).get(sessionId, record.studentId);

  if (existing) {
    return getDatabase().prepare(`
      UPDATE attendance_records
      SET status = ?, note = ?, markedBy = ?, updatedAt = ?
      WHERE id = ?
    `).run(record.status, record.note, markedBy, updatedAt, existing.id);
  }

  return getDatabase().prepare(`
    INSERT INTO attendance_records (sessionId, studentId, status, note, markedBy)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, record.studentId, record.status, record.note, markedBy);
}

function listAttendanceRecords(sessionId) {
  return getDatabase().prepare(`
    SELECT ar.*, u.name as studentName, u.email as studentEmail, sp.studentNumber
    FROM attendance_records ar
    JOIN users u ON u.id = ar.studentId
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    WHERE ar.sessionId = ?
    ORDER BY u.name ASC
  `).all(sessionId);
}

function listAttendanceForStudent(studentId) {
  return getDatabase().prepare(`
    SELECT ar.*, ats.sessionDate, ats.topic, co.courseId, c.code as courseCode, c.title as courseTitle,
      t.name as termName
    FROM attendance_records ar
    JOIN attendance_sessions ats ON ats.id = ar.sessionId
    JOIN course_offerings co ON co.id = ats.courseOfferingId
    JOIN courses c ON c.id = co.courseId
    JOIN academic_terms t ON t.id = ats.termId
    WHERE ar.studentId = ?
    ORDER BY ats.sessionDate DESC
  `).all(studentId);
}

function attendanceSummary(courseOfferingId) {
  return getDatabase().prepare(`
    SELECT ar.status, COUNT(*) as count
    FROM attendance_records ar
    JOIN attendance_sessions ats ON ats.id = ar.sessionId
    WHERE ats.courseOfferingId = ?
    GROUP BY ar.status
  `).all(courseOfferingId);
}

function adminAnalytics() {
  const db = getDatabase();
  const one = (sql, params = []) => db.prepare(sql).get(...params);
  const all = sql => db.prepare(sql).all();

  return {
    totals: {
      users: one('SELECT COUNT(*) as count FROM users').count,
      students: one("SELECT COUNT(*) as count FROM users WHERE role = 'student'").count,
      instructors: one("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").count,
      admins: one("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").count,
      faculties: one('SELECT COUNT(*) as count FROM faculties').count,
      departments: one('SELECT COUNT(*) as count FROM departments').count,
      classYears: one('SELECT COUNT(*) as count FROM class_years').count,
      sections: one('SELECT COUNT(*) as count FROM sections').count,
      courses: one('SELECT COUNT(*) as count FROM courses').count,
      activeCourses: one("SELECT COUNT(*) as count FROM courses WHERE visibility = 'published'").count,
      courseOfferings: one('SELECT COUNT(*) as count FROM course_offerings').count,
      terms: one('SELECT COUNT(*) as count FROM academic_terms').count,
      enrollments: one('SELECT COUNT(*) as count FROM course_offering_enrollments').count,
      assignments: one('SELECT COUNT(*) as count FROM assignments').count,
      submissions: one('SELECT COUNT(*) as count FROM assignment_submissions').count,
      attendanceSessions: one('SELECT COUNT(*) as count FROM attendance_sessions').count,
      attendanceRecords: one('SELECT COUNT(*) as count FROM attendance_records').count
    },
    activeTerm: findActiveTerm(),
    attendanceSummary: all(`
      SELECT ar.status, COUNT(*) as count
      FROM attendance_records ar
      GROUP BY ar.status
      ORDER BY ar.status ASC
    `),
    courseEnrollmentSummary: all(`
      SELECT co.id as courseOfferingId, c.code as courseCode, c.title as courseTitle,
        t.name as termName, COUNT(oe.id) as enrollmentCount
      FROM course_offerings co
      JOIN courses c ON c.id = co.courseId
      JOIN academic_terms t ON t.id = co.termId
      LEFT JOIN course_offering_enrollments oe ON oe.courseOfferingId = co.id AND oe.status = 'active'
      GROUP BY co.id
      ORDER BY enrollmentCount DESC, c.code ASC
      LIMIT 10
    `),
    departmentSummary: all(`
      SELECT d.id, d.name, d.code, f.name as facultyName,
        COUNT(DISTINCT sp.userId) as studentCount,
        COUNT(DISTINCT tp.userId) as instructorCount,
        COUNT(DISTINCT c.id) as courseCount,
        COUNT(DISTINCT co.id) as offeringCount
      FROM departments d
      JOIN faculties f ON f.id = d.facultyId
      LEFT JOIN student_profiles sp ON sp.departmentId = d.id
      LEFT JOIN teacher_profiles tp ON tp.departmentId = d.id
      LEFT JOIN courses c ON c.departmentId = d.id
      LEFT JOIN course_offerings co ON co.departmentId = d.id
      GROUP BY d.id
      ORDER BY d.name ASC
    `),
    recentActivity: all(`
      SELECT 'assignment' as type, title as label, createdAt
      FROM assignments
      UNION ALL
      SELECT 'attendance' as type, topic as label, createdAt
      FROM attendance_sessions
      UNION ALL
      SELECT 'submission' as type, 'Assignment submission' as label, submittedAt as createdAt
      FROM assignment_submissions
      ORDER BY createdAt DESC
      LIMIT 10
    `)
  };
}

module.exports = {
  adminAnalytics,
  attendanceSummary,
  clearUserReferences,
  countActiveOfferingEnrollments,
  deleteAttendanceRecordsByStudent,
  deleteClassYear,
  deleteCourseOffering,
  deleteDepartment,
  deleteFaculty,
  deleteOfferingEnrollment,
  deleteOfferingEnrollmentsByStudent,
  deleteSection,
  deleteTerm,
  deleteAssignment,
  deleteSubmissionsByStudent,
  ensureCourseEnrollment,
  findActiveTerm,
  findAssignmentById,
  findAttendanceSessionById,
  findClassYearById,
  findClassYearDuplicate,
  findCourseOfferingById,
  findDepartmentById,
  findDepartmentDuplicate,
  findFacultyById,
  findFacultyDuplicate,
  findOfferingEnrollment,
  findOfferingEnrollmentByStudent,
  findSectionById,
  findSectionDuplicate,
  findSubmission,
  findSubmissionByAssignmentStudent,
  findTermById,
  gradeSubmission,
  insertAssignment,
  insertAttendanceSession,
  insertClassYear,
  insertCourseOffering,
  insertDepartment,
  insertFaculty,
  insertOfferingEnrollment,
  insertSection,
  insertTerm,
  listAssignments,
  listAttendanceForStudent,
  listAttendanceRecords,
  listAttendanceSessions,
  listClassYears,
  listCourseOfferings,
  listDepartments,
  listFaculties,
  listOfferingEnrollments,
  listSections,
  listSubmissions,
  listTerms,
  setActiveTerm,
  updateAssignment,
  updateAttendanceRecord: upsertAttendanceRecord,
  updateClassYear,
  updateCourseOffering,
  updateDepartment,
  updateFaculty,
  updateOfferingEnrollment,
  updateSection,
  updateTerm,
  upsertAttendanceRecord,
  upsertSubmission,
  withTransaction
};
