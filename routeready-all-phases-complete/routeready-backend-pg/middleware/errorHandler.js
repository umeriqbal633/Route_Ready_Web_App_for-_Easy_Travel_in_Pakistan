/**
 * Global Error Handler Middleware
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  }

  // Prisma errors
  if (err.code === 'P2002') {
    statusCode = 400;
    const field = err.meta?.target?.[0] || 'field';
    message = `${field} already exists`;
  }
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired - please log in again';
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
