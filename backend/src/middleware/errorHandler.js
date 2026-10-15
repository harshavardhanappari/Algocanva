const HttpError = require('../utils/HttpError');

function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Internal server error';
  let details;

  if (err instanceof HttpError) {
    status = err.status; message = err.message; details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    status = 400; message = 'Request body contains invalid JSON';
  } else if (err.type === 'entity.too.large') {
    status = 413; message = 'Request body is too large';
  } else if (err.name === 'ValidationError') {
    status = 400; message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    status = 400; message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0];
    message = field ? `A record with this ${field} already exists` : 'Duplicate record';
  } else if (['MongoNetworkError', 'MongoServerSelectionError'].includes(err.name)) {
    status = 503; message = 'Database is unavailable';
  }

  if (status >= 500) console.error(err);
  const body = { success: false, error: { message } };
  if (details) body.error.details = details;
  if (status === 500 && process.env.NODE_ENV !== 'production') body.error.stack = err.stack;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };
