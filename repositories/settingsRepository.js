const { getDatabase } = require('../database/db');

function findByKey(key) {
  return getDatabase().prepare(`
    SELECT key, value, updatedBy, createdAt, updatedAt
    FROM users.system_settings
    WHERE key = ?
  `).get(key) || null;
}

function upsert(key, value, updatedBy = null) {
  return getDatabase().prepare(`
    INSERT INTO users.system_settings (key, value, updatedBy, updatedAt)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updatedBy = excluded.updatedBy,
      updatedAt = datetime('now')
  `).run(key, value, updatedBy);
}

module.exports = {
  findByKey,
  upsert
};
