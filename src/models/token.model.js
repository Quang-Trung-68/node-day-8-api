const db = require("@root/database");

async function saveAccessToken(body) {
  const { userId, accessToken, expiresAt } = body;
  const query = `INSERT INTO access_tokens (user_id, token, expires_at) VALUES (?, ?, ?);`;
  const params = [userId, accessToken, expiresAt];

  const result = await db.query(query, params);
  return result;
}

async function saveRefreshToken(body) {
  const { userId, refreshToken, expiresAt } = body;
  const query = `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?);`;
  const params = [userId, refreshToken, expiresAt];

  const result = await db.query(query, params);
  return result;
}

async function revokeRefreshToken(body) {
  const { refreshToken } = body;
  const query = `UPDATE refresh_tokens SET is_revoked = ? WHERE token = ?;`;
  const params = [1, refreshToken];

  const result = await db.query(query, params);
  return result;
}

async function revokeAccessToken(body) {
  const { accessToken } = body;
  const query = `UPDATE access_tokens SET is_revoked = ? WHERE token = ?;`;
  const params = [1, accessToken];

  const result = await db.query(query, params);
  return result;
}

async function checkValidRefreshToken(body) {
  const { refreshToken } = body;
  const query = `SELECT COUNT(*) AS count FROM refresh_tokens WHERE token = ? AND is_revoked = 0 AND expires_at >= now()`;
  const params = [refreshToken];

  const [[{ count }]] = await db.query(query, params);
  return count > 0;
}

async function checkValidAccessToken(body) {
  const { accessToken } = body;
  const query = `SELECT COUNT(*) AS count FROM access_tokens WHERE token = ? AND is_revoked = 0`;
  const params = [accessToken];

  const [[{ count }]] = await db.query(query, params);
  return count > 0;
}

async function destroyAccessToken() {
  const query = `
    DELETE FROM access_tokens
    WHERE expires_at < NOW()`;

  const [{ affectedRows }] = await db.query(query);
  return affectedRows;
}

async function destroyRefreshToken() {
  const query = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW()`;

  const [{ affectedRows }] = await db.query(query);
  return affectedRows;
}

module.exports = {
  saveAccessToken,
  saveRefreshToken,
  checkValidRefreshToken,
  checkValidAccessToken,
  revokeRefreshToken,
  revokeAccessToken,
  destroyAccessToken,
  destroyRefreshToken,
};
