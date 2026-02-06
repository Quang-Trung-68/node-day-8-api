const authConfig = {
  jwtAccessTokenSecret: process.env.AUTH_ACCESS_TOKEN_JWT_SECRET,
  accessTokenTTL: +process.env.AUTH_ACCESS_TOKEN_TTL || 3600,

  jwtRefreshTokenSecret: process.env.AUTH_REFRESH_TOKEN_JWT_SECRET,
  refreshTokenTTL: +process.env.AUTH_REFRESH_TOKEN_TTL,

  jwtVerificationEmailTokenSecret:
    process.env.AUTH_VERIFICATION_EMAIL_TOKEN_JWT_SECRET,
  verificationEmailTokenTTL: +process.env.AUTH_VERIFICATION_EMAIL_TOKEN_TTL,

  saltRounds: +process.env.AUTH_SALT_ROUNDS || 10,
};

module.exports = authConfig;
