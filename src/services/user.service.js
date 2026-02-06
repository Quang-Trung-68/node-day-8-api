const userModel = require("@/models/user.model");
const { httpCodes } = require("@/configs/constants");

class UserService {
  async getUsersByEmail(userAuthId, email) {
    try {
      const data = { email };
      if (!email) {
        const error = new Error("Email is required.");
        error.statusCode = httpCodes.badRequest || 400;
        throw error;
      }
      const resultData = await userModel.getUsersByEmail(data);
      const filteredData = resultData[0].filter(
        (user) => user.id !== userAuthId,
      );
      resultData[0] = filteredData;

      return resultData;
    } catch (error) {
      throw error;
    }
  }

  async getUsersById(id) {
    try {
      const data = { id };
      if (!id) {
        const error = new Error("ID is required.");
        error.statusCode = httpCodes.badRequest || 400;
        throw error;
      }
      const resultData = await userModel.getUsersById(data);
      return resultData;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
