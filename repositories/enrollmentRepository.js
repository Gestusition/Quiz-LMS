const { getDatabase } = require('../database/db');

function canManageCourse(user, courseId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;

  const enrollment = getDatabase().prepare(`
    SELECT id FROM enrollments
    WHERE courseId = ? AND userId = ? AND role = 'teacher' AND status = 'active'
  `).get(courseId, user.id);

  return !!enrollment;
}

function canAccessCourse(user, courseId) {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const enrollment = getDatabase().prepare(`
    SELECT id FROM enrollments
    WHERE courseId = ? AND userId = ? AND status = 'active'
  `).get(courseId, user.id);

  return !!enrollment;
}

function findCourseIdByEnrollmentId(enrollmentId) {
  const enrollment = getDatabase().prepare('SELECT courseId FROM enrollments WHERE id = ?').get(enrollmentId);
  return enrollment ? enrollment.courseId : null;
}

function getParticipants(courseId) {
  return getDatabase().prepare(`
    SELECT e.id as enrollmentId, e.role as courseRole, e.status as enrollmentStatus,
      e.createdAt as enrolledAt, u.id, u.name, u.email, u.role, u.status,
      sp.studentNumber, sp.cohort, tp.department
    FROM enrollments e
    JOIN users u ON u.id = e.userId
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    LEFT JOIN teacher_profiles tp ON tp.userId = u.id
    WHERE e.courseId = ?
    ORDER BY e.role DESC, u.name ASC
  `).all(courseId);
}

function findByCourseUserRole(courseId, userId, role) {
  return getDatabase().prepare(`
    SELECT id FROM enrollments WHERE courseId = ? AND userId = ? AND role = ?
  `).get(courseId, userId, role) || null;
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM enrollments WHERE id = ?').get(id) || null;
}

function insert(courseId, userId, role) {
  return getDatabase().prepare(`
    INSERT INTO enrollments (courseId, userId, role)
    VALUES (?, ?, ?)
  `).run(courseId, userId, role);
}

function updateStatus(id, status) {
  return getDatabase().prepare('UPDATE enrollments SET status = ? WHERE id = ?').run(status, id);
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM enrollments WHERE id = ?').run(id);
}

function deleteByUserId(userId) {
  return getDatabase().prepare('DELETE FROM enrollments WHERE userId = ?').run(userId);
}

function insertCourseTeacher(courseId, userId) {
  return getDatabase().prepare('INSERT INTO enrollments (courseId, userId, role) VALUES (?, ?, ?)')
    .run(courseId, userId, 'teacher');
}

module.exports = {
  canAccessCourse,
  canManageCourse,
  deleteById,
  deleteByUserId,
  findByCourseUserRole,
  findById,
  findCourseIdByEnrollmentId,
  getParticipants,
  insert,
  insertCourseTeacher,
  updateStatus
};
