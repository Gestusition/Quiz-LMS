const { getDatabase } = require('../database/db');
const { LIMITS } = require('../constants/limits');
const { parsePagination } = require('../utils/validation');

const PUBLIC_USER_COLUMNS = `
  u.id, u.name, u.username, u.email, u.role, u.status, u.mustChangeCredentials, u.createdAt,
  ap.displayName as displayName,
  ap.adminTitle as adminTitle,
  tp.department as department,
  tp.officeHours as officeHours,
  tp.academicTitle as academicTitle,
  tp.staffNumber as staffNumber,
  sp.studentNumber as studentNumber,
  sp.cohort as cohort,
  COALESCE(sp.facultyId, tp.facultyId, ap.facultyId) as facultyId,
  COALESCE(sp.departmentId, tp.departmentId, ap.departmentId) as departmentId,
  sp.classYearId as classYearId,
  sp.sectionId as sectionId,
  f.name as facultyName,
  f.code as facultyCode,
  d.name as departmentName,
  d.code as departmentCode,
  cy.name as classYearName,
  cy.yearNumber as yearNumber,
  sec.name as sectionName
`;

const AUTH_USER_COLUMNS = `
  u.*,
  ap.displayName as displayName,
  ap.adminTitle as adminTitle,
  tp.department as department,
  tp.officeHours as officeHours,
  tp.academicTitle as academicTitle,
  tp.staffNumber as staffNumber,
  sp.studentNumber as studentNumber,
  sp.cohort as cohort,
  COALESCE(sp.facultyId, tp.facultyId, ap.facultyId) as facultyId,
  COALESCE(sp.departmentId, tp.departmentId, ap.departmentId) as departmentId,
  sp.classYearId as classYearId,
  sp.sectionId as sectionId,
  f.name as facultyName,
  f.code as facultyCode,
  d.name as departmentName,
  d.code as departmentCode,
  cy.name as classYearName,
  cy.yearNumber as yearNumber,
  sec.name as sectionName
`;

const PROFILE_JOINS = `
  LEFT JOIN admin_profiles ap ON ap.userId = u.id
  LEFT JOIN teacher_profiles tp ON tp.userId = u.id
  LEFT JOIN student_profiles sp ON sp.userId = u.id
  LEFT JOIN faculties f ON f.id = COALESCE(sp.facultyId, tp.facultyId, ap.facultyId)
  LEFT JOIN departments d ON d.id = COALESCE(sp.departmentId, tp.departmentId, ap.departmentId)
  LEFT JOIN class_years cy ON cy.id = sp.classYearId
  LEFT JOIN sections sec ON sec.id = sp.sectionId
`;

function buildListWhere(filters = {}, validRoles = []) {
  let where = ' WHERE 1=1';
  const params = [];

  if (filters.role && validRoles.includes(filters.role)) {
    where += ' AND u.role = ?';
    params.push(filters.role);
  }
  if (filters.status) {
    where += ' AND u.status = ?';
    params.push(filters.status);
  }
  if (filters.departmentId) {
    where += ' AND COALESCE(sp.departmentId, tp.departmentId, ap.departmentId) = ?';
    params.push(Number(filters.departmentId));
  }
  if (filters.classYearId) {
    where += ' AND sp.classYearId = ?';
    params.push(Number(filters.classYearId));
  }
  if (filters.sectionId) {
    where += ' AND sp.sectionId = ?';
    params.push(Number(filters.sectionId));
  }
  if (filters.search) {
    where += ` AND (
      u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?
      OR sp.studentNumber LIKE ? OR sp.cohort LIKE ? OR tp.department LIKE ?
      OR tp.staffNumber LIKE ? OR f.name LIKE ? OR d.name LIKE ? OR cy.name LIKE ? OR sec.name LIKE ?
    )`;
    params.push(
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`
    );
  }

  return { where, params };
}

function list(filters = {}, validRoles = []) {
  const db = getDatabase();
  const paging = parsePagination(filters);
  const { where, params } = buildListWhere(filters, validRoles);

  const total = db.prepare(`
    SELECT COUNT(DISTINCT u.id) as count
    FROM users u
    ${PROFILE_JOINS}
    ${where}
  `).get(...params).count;

  const query = `
    SELECT ${PUBLIC_USER_COLUMNS}
    FROM users u
    ${PROFILE_JOINS}
    ${where}
    ORDER BY u.role ASC, u.name ASC
    LIMIT ? OFFSET ?
  `;
  const items = db.prepare(query).all(...params, paging.limit, paging.offset);

  return {
    items,
    pagination: {
      page: paging.page,
      limit: paging.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / paging.limit))
    }
  };
}

function findById(id) {
  return getDatabase().prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
}

function findPublicById(id) {
  return getDatabase().prepare(`
    SELECT ${PUBLIC_USER_COLUMNS}
    FROM users u
    ${PROFILE_JOINS}
    WHERE u.id = ?
  `).get(id) || null;
}

function findByIdentifier(identifier) {
  const value = String(identifier || '').trim();
  return getDatabase().prepare(`
    SELECT ${AUTH_USER_COLUMNS}
    FROM users u
    ${PROFILE_JOINS}
    WHERE LOWER(u.email) = LOWER(?)
      OR (u.role = 'student' AND LOWER(sp.studentNumber) = LOWER(?))
      OR (u.role = 'admin' AND LOWER(u.username) = LOWER(?))
  `).get(value, value, value) || null;
}

function findLoginCandidates(identifier) {
  const value = String(identifier || '').trim();
  if (!value) return [];

  return getDatabase().prepare(`
    SELECT * FROM (
      SELECT ${AUTH_USER_COLUMNS}, 'email' as matchType
      FROM users u
      ${PROFILE_JOINS}
      WHERE LOWER(u.email) = LOWER(?)

      UNION ALL

      SELECT ${AUTH_USER_COLUMNS}, 'student_number' as matchType
      FROM users u
      ${PROFILE_JOINS}
      WHERE u.role = 'student' AND LOWER(sp.studentNumber) = LOWER(?)

      UNION ALL

      SELECT ${AUTH_USER_COLUMNS}, 'employee_number' as matchType
      FROM users u
      ${PROFILE_JOINS}
      WHERE u.role = 'teacher' AND LOWER(tp.staffNumber) = LOWER(?)

      UNION ALL

      SELECT ${AUTH_USER_COLUMNS}, 'username' as matchType
      FROM users u
      ${PROFILE_JOINS}
      WHERE u.role = 'admin' AND LOWER(u.username) = LOWER(?)
    ) matches
    ORDER BY CASE matchType
      WHEN 'email' THEN 1
      WHEN 'student_number' THEN 2
      WHEN 'employee_number' THEN 3
      WHEN 'username' THEN 4
      ELSE 10 END
  `).all(value, value, value, value);
}

function findByUsername(username) {
  return getDatabase().prepare(`
    SELECT *
    FROM users
    WHERE LOWER(username) = LOWER(?)
  `).get(String(username || '').trim()) || null;
}

function findResettableByIdentifier(identifier) {
  const value = String(identifier || '').trim().toLowerCase();
  return getDatabase().prepare(`
    SELECT u.id, u.username, u.email, u.role, u.status
    FROM users u
    LEFT JOIN student_profiles sp ON sp.userId = u.id
    LEFT JOIN teacher_profiles tp ON tp.userId = u.id
    WHERE LOWER(u.username) = LOWER(?)
      OR LOWER(u.email) = LOWER(?)
      OR (u.role = 'student' AND LOWER(sp.studentNumber) = LOWER(?))
      OR (u.role = 'teacher' AND LOWER(tp.staffNumber) = LOWER(?))
  `).get(value, value, value, value) || null;
}

function findResettableById(userId) {
  return getDatabase().prepare(`
    SELECT id, name, username, email, role, status
    FROM users
    WHERE id = ?
  `).get(userId) || null;
}

function findDuplicateEmail(email, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?').get(email, excludeId) || null;
  }
  return db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email) || null;
}

function findDuplicateUsername(username, excludeId) {
  const db = getDatabase();
  if (excludeId) {
    return db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?').get(username, excludeId) || null;
  }
  return db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(username) || null;
}

function insert(payload, hashed) {
  return getDatabase().prepare(`
    INSERT INTO users (name, username, email, role, passwordHash, passwordSalt, passwordAlgorithm, status, mustChangeCredentials)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    payload.name,
    payload.username,
    payload.email,
    payload.role,
    hashed.passwordHash,
    hashed.passwordSalt,
    hashed.passwordAlgorithm,
    payload.status,
    payload.mustChangeCredentials ? 1 : 0
  );
}

function update(id, payload, updatedAt) {
  return getDatabase().prepare(`
    UPDATE users
    SET name = ?, username = ?, email = ?, role = ?, status = ?, mustChangeCredentials = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    payload.name,
    payload.username,
    payload.email,
    payload.role,
    payload.status,
    payload.mustChangeCredentials ? 1 : 0,
    updatedAt,
    id
  );
}

function updatePassword(id, hashed, updatedAt) {
  return getDatabase().prepare(`
    UPDATE users
    SET passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?, updatedAt = ?
    WHERE id = ?
  `).run(hashed.passwordHash, hashed.passwordSalt, hashed.passwordAlgorithm, updatedAt, id);
}

function updateOwnCredentials(userId, username, hashed, updatedAt) {
  return getDatabase().prepare(`
    UPDATE users
    SET username = ?, passwordHash = ?, passwordSalt = ?, passwordAlgorithm = ?,
      mustChangeCredentials = 0, updatedAt = ?
    WHERE id = ?
  `).run(username, hashed.passwordHash, hashed.passwordSalt, hashed.passwordAlgorithm, updatedAt, userId);
}

function deleteById(id) {
  return getDatabase().prepare('DELETE FROM users WHERE id = ?').run(id);
}

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

module.exports = {
  deleteById,
  findById,
  findByIdentifier,
  findLoginCandidates,
  findByUsername,
  findDuplicateEmail,
  findDuplicateUsername,
  findPublicById,
  findResettableById,
  findResettableByIdentifier,
  insert,
  list,
  update,
  updateOwnCredentials,
  updatePassword,
  withTransaction
};
