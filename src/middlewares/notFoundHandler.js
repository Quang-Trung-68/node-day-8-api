const { httpCodes } = require("../configs/constants");

function notFoundHandler(req, res, next) {
  res.error(httpCodes.notFound, "Resource not found");
}

module.exports = notFoundHandler;
