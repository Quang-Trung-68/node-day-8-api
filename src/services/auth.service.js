const jwt = require("jsonwebtoken");
const authConfig = require("@/configs/auth.config");
const tokenModel = require("@/models/token.model");
const authModel = require("@/models/auth.model");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("../configs/constants");
const appConfig = require("@/configs/app.config");
const bcrypt = require("bcrypt");
const queueService = require("./queue.service");

class AuthService {
  async signAccessToken(user) {
    try {
      const ttl = authConfig.accessTokenTTL;

      const accessToken = await jwt.sign(
        {
          sub: user.id,
          exp: Date.now() / 1000 + ttl,
        },
        authConfig.jwtAccessTokenSecret,
      );

      await tokenModel.saveAccessToken({
        userId: user.id,
        accessToken,
        expiresAt: new Date(Date.now() + ttl * 1000),
      });

      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  async signRefreshToken(user) {
    try {
      const ttl = authConfig.refreshTokenTTL;

      const refreshToken = await jwt.sign(
        {
          sub: user.id,
          exp: Date.now() / 1000 + ttl * 24 * 60 * 60,
        },
        authConfig.jwtRefreshTokenSecret,
      );

      await tokenModel.saveRefreshToken({
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + ttl * 24 * 60 * 60 * 1000),
      });

      return refreshToken;
    } catch (error) {
      throw error;
    }
  }

  async verifyAccessToken(accessToken) {
    try {
      const payload = await jwt.verify(
        accessToken,
        authConfig.jwtAccessTokenSecret,
      );
      return payload;
    } catch (error) {
      throw error;
    }
  }

  async verifyRefreshToken(refreshToken) {
    try {
      const payload = await jwt.verify(
        refreshToken,
        authConfig.jwtRefreshTokenSecret,
      );
      return payload;
    } catch (error) {
      throw error;
    }
  }

  async checkCredentials(credentials) {
    try {
      const { email, password } = credentials;
      if (!email) {
        throw new AppError(httpCodes.badRequest || 400, "Email is required.");
      }
      if (!password) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Password is required.",
        );
      }
      if (password.length < 8) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Password must be at least 8 characteristics.",
        );
      }
      return credentials;
    } catch (error) {
      throw error;
    }
  }

  async checkValidRefreshToken(refreshToken) {
    try {
      const body = { refreshToken };
      const isValid = await tokenModel.checkValidRefreshToken(body);
      if (!isValid) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Token invalid or expired.",
        );
      }
      return isValid;
    } catch (error) {
      throw new AppError(
        httpCodes.badRequest || 400,
        "Token invalid or expired.",
      );
    }
  }

  async checkValidAccessToken(accessToken) {
    try {
      const body = { accessToken };
      const isValid = await tokenModel.checkValidAccessToken(body);
      if (!isValid) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Token invalid or expired.",
        );
      }
      return isValid;
    } catch (error) {
      throw new AppError(
        httpCodes.badRequest || 400,
        "Token invalid or expired.",
      );
    }
  }

  async revokeRefreshToken(refreshToken) {
    try {
      const body = { refreshToken };
      const isValid = await tokenModel.revokeRefreshToken(body);
      if (!isValid) {
        throw new AppError(
          httpCodes.badRequest || 400,
          "Token invalid or expired.",
        );
      }
      return isValid;
    } catch (error) {
      throw new AppError(httpCodes.badRequest || 400, "Token invalid.");
    }
  }

  async cleanupExpiredTokens() {
    try {
      const expiredAccessTokens = await tokenModel.destroyAccessToken();
      const expiredRefreshTokens = await tokenModel.destroyRefreshToken();
      const totalExpiredTokens = expiredAccessTokens + expiredRefreshTokens;
      return totalExpiredTokens;
    } catch (error) {
      throw new AppError(
        httpCodes.internalServerError || 500,
        "Internal server error.",
      );
    }
  }

  async login(credentials) {
    try {
      const user = await authModel.login(credentials);
      if (!user) {
        throw new AppError(
          httpCodes.unauthorized || 401,
          "Email or password is incorrect.",
        );
      }
      return user;
    } catch (error) {
      throw new AppError(
        httpCodes.unauthorized || 401,
        "Email or password is incorrect.",
      );
    }
  }

  async register(credentials) {
    try {
      const id = await authModel.register(credentials);
      return id;
    } catch (error) {
      throw new AppError(httpCodes.conflict || 409, "Email already exists.");
    }
  }

  async logout(credentials) {
    try {
      const { access_token, refresh_token } = credentials;
      const isValidAccessToken = await tokenModel.checkValidAccessToken({
        accessToken: access_token,
      });
      const isValidRefreshToken = await tokenModel.checkValidRefreshToken({
        refreshToken: refresh_token,
      });
      if (!isValidAccessToken || !isValidRefreshToken) {
        throw new AppError(
          httpCodes.unauthorized || 401,
          "Token invalid or expired.",
        );
      }
      await authModel.logout(credentials);

      return null;
    } catch (error) {
      throw new AppError(
        httpCodes.unauthorized || 401,
        "Token invalid or expired.",
      );
    }
  }

  async changePassword(credentials) {
    const { id, email, password, newPassword, newPasswordConfirmation } =
      credentials;
    try {
      if (!password || !newPassword || !newPasswordConfirmation) {
        throw new AppError(
          httpCodes.badRequest,
          "Password, new password, and new password confirmation are required.",
        );
      }

      const userFromDb = await authModel.getUserForChangingPassword({ id });
      if (!userFromDb) {
        throw new AppError(httpCodes.notFound, "User not found.");
      }

      const isValidOldPassword = await bcrypt.compare(
        password,
        userFromDb.password,
      );
      if (!isValidOldPassword) {
        throw new AppError(httpCodes.badRequest, "Old password incorrect.");
      }

      if (newPassword !== newPasswordConfirmation) {
        throw new AppError(
          httpCodes.badRequest,
          "New password and new password confirmation must be the same.",
        );
      }
      if (newPassword.length < 8) {
        throw new AppError(
          httpCodes.badRequest,
          "New password must be at least 8 characters.",
        );
      }

      const isEqualWithOldPassword = await bcrypt.compare(
        newPassword,
        userFromDb.password,
      );
      if (isEqualWithOldPassword) {
        throw new AppError(
          httpCodes.badRequest,
          "New password must be different from the old password.",
        );
      }

      const newHashedPassword = await bcrypt.hash(
        newPassword,
        authConfig.saltRounds,
      );

      await authModel.changePassword({ id, newHashedPassword });

      await queueService.push("sendPasswordChangeEmail", { email });
      return null;
    } catch (error) {
      throw error;
    }
  }

  generateVerificationLink(user) {
    const payload = {
      sub: user.id,
      exp: Date.now() / 1000 + authConfig.verificationEmailTokenTTL,
    };
    const token = jwt.sign(payload, authConfig.jwtVerificationEmailTokenSecret);
    const verificationLink = `${appConfig.url}/verify-email?token=${token}`;
    return verificationLink;
  }

  async verifyEmail(token) {
    if (!token) {
      throw new AppError(
        httpCodes.unauthorized || 400,
        "Verify email token is required.",
      );
    }

    const payload = jwt.verify(
      token,
      authConfig.jwtVerificationEmailTokenSecret,
    );

    try {
      if (payload.exp < Date.now() / 1000) {
        throw new AppError(
          httpCodes.unauthorized || 401,
          "Verify email token invalid or expired.",
        );
      }

      const userId = payload.sub;

      const [isSuccess, message] = await authModel.verifyEmail({ userId });

      if (!isSuccess) {
        throw new AppError(httpCodes.unprocessableContent || 422, message);
      }

      return null;
    } catch (error) {
      throw new AppError(
        httpCodes.unauthorized || 401,
        "Token invalid or expired.",
      );
    }
  }
}

module.exports = new AuthService();
