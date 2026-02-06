const db = require("@root/database");
const bcrypt = require("bcrypt");
const authConfig = require("../configs/auth.config");
const { revokeAccessToken, revokeRefreshToken } = require("./token.model");

async function register(body) {
  const email = body.email;
  const password = await bcrypt.hash(body.password, authConfig.saltRounds);

  const [{ insertId }] = await db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, password],
  );

  return insertId;
}

async function login(body) {
  const { email } = body;

  const [users] = await db.query(
    "SELECT id,password FROM users WHERE email = ?",
    [email],
  );
  const user = users[0];

  return user;
}

async function logout(body) {
  const accessToken = body.access_token;
  const refreshToken = body.refresh_token;
  const resultRevokeAccessToken = await revokeAccessToken({ accessToken });
  const resultRevokeRefreshToken = await revokeRefreshToken({ refreshToken });
  const result = { resultRevokeAccessToken, resultRevokeRefreshToken };
  return result;
}

async function getUserForChangingPassword(body) {
  const { id } = body;

  const [users] = await db.query("SELECT password FROM users WHERE id = ?", [
    id,
  ]);
  const user = users[0];

  return user;
}

async function changePassword(body) {
  const { id, newHashedPassword } = body;

  const result = await db.query("UPDATE users SET password = ? WHERE id = ?", [
    newHashedPassword,
    id,
  ]);

  return result;
}

async function verifyEmail(body) {
  const { userId } = body;
  const query = `SELECT COUNT(*) AS countUserVerified FROM users WHERE id = ? AND email_verified_at IS NOT NULL;`;
  const [[{ countUserVerified }]] = await db.query(query, [userId]);
  if (countUserVerified > 0) {
    return [false, "User already verified."];
  }

  const queryFindUser = `SELECT COUNT(*) AS countUser FROM users WHERE id = ?;`;
  const [[{ countUser }]] = await db.query(queryFindUser, [userId]);
  if (countUser === 0) {
    return [false, "User not found."];
  }

  const result = await db.query(
    "UPDATE users SET email_verified_at = now() WHERE id = ?",
    [userId],
  );
  return [true, result];
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  getUserForChangingPassword,
  changePassword,
};
