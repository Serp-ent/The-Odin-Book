class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors; // Array of error details
    this.isOperational = true; // Distinguishes operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

const validationError = (errors) => new AppError('Validation Error', 400, errors);
const unauthorizedError = new AppError('Unauthorized', 401);
const notFoundError = new AppError('Not Found', 404);
const internalServerError = new AppError('Internal Server Error', 500);

module.exports = {
  validationError,
  unauthorizedError,
  notFoundError,
  internalServerError,
};