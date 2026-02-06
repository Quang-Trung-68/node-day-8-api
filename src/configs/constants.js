const constants = {
  httpCodes: {
    success: 200,
    created: 201,
    noContent: 204,
    badRequest: 400,
    unauthorized: 401,
    unprocessableContent: 422,
    notFound: 404,
    conflict: 409,
    internalServerError: 500,
  },

  errorCodes: {
    conflict: "ER_DUP_ENTRY",
  },

  taskStatus: {
    pending: "pending",
    inprogress: "inprogress",
    completed: "completed",
    failed: "failed",
  },
};

module.exports = constants;
