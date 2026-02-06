function responseFormat(req, res, next) {
  res.success = (data, pagination, status = 200) => {
    res.status(status).json({
      status: "success",
      data,
      pagination,
    });
  };

  res.error = (status, message, error = null) => {
    res.status(status).json({
      status: "error",
      error,
      message,
    });
  };

  next();
}

module.exports = responseFormat;
