import AppError
  from '../errors/app-error.js';

export function notFound(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A record with the supplied unique value already exists.',
      code: 'DUPLICATE_RECORD'
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : error.message,
    code: error.code || 'INTERNAL_ERROR',
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
  });
}