const { internalServerError } = require("./errors");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors
    });
  }

  res.status(internalServerError.statusCode).json({
    message: internalServerError.message
  });
}

module.exports = errorHandler;