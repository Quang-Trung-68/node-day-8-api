require("module-alias/register");

const authService = require("@/services/auth.service");

async function cleanupExpiredTokens() {
  const result = await authService.cleanupExpiredTokens();
  console.log(`Deleted ${result} records of access_tokens and refresh_tokens.`);
}

module.exports = cleanupExpiredTokens;
