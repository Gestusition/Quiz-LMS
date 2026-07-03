const { getDatabase } = require('../database/db');

function getByUserId(userId) {
  return getDatabase().prepare('SELECT * FROM ai_user_settings WHERE userId = ?').get(userId) || null;
}

function upsert(userId, config) {
  getDatabase().prepare(`
    INSERT INTO ai_user_settings (
      userId, endpoint, encryptedApiKey, keyIv, keyAuthTag,
      chatDeployment, embeddingDeployment, apiVersion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      endpoint = excluded.endpoint,
      encryptedApiKey = excluded.encryptedApiKey,
      keyIv = excluded.keyIv,
      keyAuthTag = excluded.keyAuthTag,
      chatDeployment = excluded.chatDeployment,
      embeddingDeployment = excluded.embeddingDeployment,
      apiVersion = excluded.apiVersion,
      updatedAt = datetime('now')
  `).run(
    userId,
    config.endpoint,
    config.encryptedApiKey,
    config.keyIv,
    config.keyAuthTag,
    config.chatDeployment,
    config.embeddingDeployment || '',
    config.apiVersion
  );
  return getByUserId(userId);
}

function remove(userId) {
  return getDatabase().prepare('DELETE FROM ai_user_settings WHERE userId = ?').run(userId);
}

module.exports = { getByUserId, remove, upsert };
