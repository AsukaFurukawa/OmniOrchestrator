const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let error = {
    success: false,
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.error = 'Validation Error';
    error.details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error.error = 'Invalid ID format';
    return res.status(400).json(error);
  }

  if (err.code === 11000) {
    error.error = 'Duplicate field value';
    error.details = 'Resource already exists';
    return res.status(400).json(error);
  }

  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token expired';
    return res.status(401).json(error);
  }

  // OpenAI API errors
  if (err.response && err.response.status === 429) {
    error.error = 'API rate limit exceeded';
    error.details = 'Too many requests to AI service';
    return res.status(429).json(error);
  }

  if (err.response && err.response.status === 401) {
    error.error = 'API authentication failed';
    error.details = 'Invalid API key or credentials';
    return res.status(500).json(error);
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error.error = 'Service unavailable';
    error.details = 'External service connection failed';
    return res.status(503).json(error);
  }

  // Default 500 error
  if (process.env.NODE_ENV === 'development') {
    error.details = err.message;
    error.stack = err.stack;
  }

  return res.status(500).json(error);
};

module.exports = errorHandler; 