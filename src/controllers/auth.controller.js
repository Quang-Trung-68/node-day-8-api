const bcrypt = require("bcrypt");
const { httpCodes } = require("../configs/constants");
const authService = require("../services/auth.service");
const catchAsync = require("@/utils/catchAsync");
const userService = require("../services/user.service");
const queueService = require("../services/queue.service");

const register = catchAsync(async (req, res) => {
  const credentials = await authService.checkCredentials(req.body);
  const { email } = credentials;
  const id = await authService.register(credentials);
  const user = { id, email };

  await queueService.push("sendVerificationEmail", user);

  const accessToken = await authService.signAccessToken(user);
  const refreshToken = await authService.signRefreshToken(user);

  const credentialsResult = {
    user,
    access_token: accessToken,
    refresh_token: refreshToken,
  };

  return res.success(credentialsResult, null, httpCodes.created);
});

const login = catchAsync(async (req, res) => {
  const credentials = await authService.checkCredentials(req.body);
  const { email, password } = credentials;
  const user = await authService.login(credentials);

  if (!user) {
    return res.error(httpCodes.unauthorized, "Email or password is incorrect.");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.error(httpCodes.unauthorized, "Email or password is incorrect.");
  }

  const accessToken = await authService.signAccessToken(user);
  const refreshToken = await authService.signRefreshToken(user);

  const credentialsResult = {
    user: {
      id: user.id,
      email,
    },
    access_token: accessToken,
    refresh_token: refreshToken,
  };
  return res.success(credentialsResult);
});

const logout = catchAsync(async (req, res) => {
  const { refresh_token } = req.body;
  const { access_token } = req.currentUser;
  const credentials = { refresh_token, access_token };
  await authService.logout(credentials);
  return res.success(null, null, httpCodes.noContent);
});

const generateToken = catchAsync(async (req, res) => {
  const { refresh_token: oldRefreshToken } = req.body;

  const payload = await authService.verifyRefreshToken(oldRefreshToken);

  const { sub: userId } = payload;
  const [users] = await userService.getUsersById(userId);
  const user = users[0];

  await authService.checkValidRefreshToken(oldRefreshToken);
  await authService.revokeRefreshToken(oldRefreshToken);

  const accessToken = await authService.signAccessToken(user);
  const refreshToken = await authService.signRefreshToken(user);

  const credentialsResult = {
    user,
    access_token: accessToken,
    refresh_token: refreshToken,
  };
  return res.success(credentialsResult);
});

const getCurrentUser = catchAsync(async (req, res) => {
  const data = {
    user: req.currentUser,
  };
  return res.success(data);
});

const changePassword = catchAsync(async (req, res) => {
  const { email } = req.currentUser;
  const {
    password,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  } = req.body;
  const credentials = {
    id: req.currentUser.id,
    email,
    password,
    newPassword,
    newPasswordConfirmation,
  };

  await authService.changePassword(credentials);

  return res.success({ message: "Password changed successfully." });
});

const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;
  await authService.verifyEmail(token);
  return res.success(null, null, httpCodes.noContent);
});

module.exports = {
  register,
  login,
  logout,
  generateToken,
  getCurrentUser,
  changePassword,
  verifyEmail,
};
