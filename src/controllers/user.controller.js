const userService = require("@root/src/services/user.service");
const catchAsync = require("@/utils/catchAsync");

const getUsersByEmail = catchAsync(async (req, res) => {
  const { q: email } = req.query;
  const userAuthId = req.currentUser.id;
  const resultData = await userService.getUsersByEmail(userAuthId, email);

  const result = {
    users: resultData[0],
  };

  return res.success(result);
});

module.exports = {
  getUsersByEmail,
};
