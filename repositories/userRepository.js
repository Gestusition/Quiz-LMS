const { getDatabase } = require('../database/db');

const PUBLIC_USER_COLUMNS = `
  u.id, u.name, u.username, u.email, u.role, u.status, u.mustChangeCredentials, u.createdAt,
  ap.displayName as displayName,
  tp.department as department,
  tp.officeHours as officeHours,
  sp.studentNumber as studentNumber,
  sp.cohort as cohort
`;

const PROFILE_JOINS = `
  LEFT JOIN admin_profiles ap ON ap.userId = u.id
  LEFT JOIN teacher_profiles tp ON tp.userId = u.id
  LEFT JOIN student_profiles sp ON sp.userId = u.id
`;

function list(filters = {}, validRoles = []) {
  const db = getDatabase();
  let query = `
    SELECT ${PUBLIC_USER_COLUMNS}
    FROM users u
    ${PROFILE_JOINS}
    WHERE 1=1
  `;
  const params = [];

  if (filters.role && validRoles.includes(filters.role)) {
    query += ' AND u.role = ?';
    params.push(filters.role);
  }
  if (filters.search) {
    query += ` AND (
      u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ?
      OR sp.studentNumber LIKE ? OR sp.cohort LIKE ? OR tp.department LIKE ?
    )`;
    params.push(
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`,
      `%${filters.search}%`
    );
  }

  query += ' ORDER BY u.role ASC, u.name ASC';
  return db.prepare(query).all(...params);
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
    SELECT u.*,
      ap.displayName as displayName,
      tp.department as department,
      tp.officeHours as officeHours,
      sp.studentNumber as studentNumber,
      sp.cohort as cohort
    FROM users u
    ${PROFILE_JOINS}
    WHERE LOWER(u.email) = LOWER(?)
      OR LOWER(u.username) = LOWER(?)
      OR (u.role = 'student' AND LOWER(sp.studentNumber) = LOWER(?))
  `).get(value, value, value) || null;
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
    WHERE LOWER(u.username) = LOWER(?)
      OR LOWER(u.email) = LOWER(?)
      OR (u.role = 'student' AND LOWER(sp.studentNumber) = LOWER(?))
  `).get(value, value, value) || null;
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
