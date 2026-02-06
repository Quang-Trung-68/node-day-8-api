const isProduction = require("../utils/isProduction");

function exceptionHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const status = err.status || "error";

  if (isProduction()) {
    return res.status(statusCode).json({
      status: status,
      message: err.isOperational ? err.message : "Something went wrong!",
    });
  }

  res.status(statusCode).json({
    status: status,
    message: err.message,
    error: err,
  });
}

module.exports = exceptionHandler;
