const db = require("@root/database");

async function getUsersById(data) {
  const { id } = data;
  const result = db.query(
    "SELECT id,email,created_at,updated_at FROM users WHERE id = ? ORDER BY created_at DESC;",
    [id],
  );
  return result;
}

async function getUsersByEmail(data) {
  const { email } = data;
  const param = `%${email}%`;
  const result = db.query(
    "SELECT id,email,created_at,updated_at FROM users WHERE email LIKE ? ORDER BY created_at DESC;",
    [param],
  );
  return result;
}

module.exports = { getUsersById, getUsersByEmail };
