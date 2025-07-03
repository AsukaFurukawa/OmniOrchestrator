const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Development mode bypass - if no JWT_SECRET or MongoDB issues
    if (process.env.NODE_ENV === 'development' && (!process.env.JWT_SECRET || !token || token.startsWith('dev-token-'))) {
      console.log('🔧 Development mode: Bypassing authentication');
      req.user = {
        id: 'dev-user-123',
        userId: 'dev-user-123',
        name: 'Marketing Maverick',
        email: 'dev@omniorchestrator.com',
        company: 'Demo Company',
        plan: 'Pro'
      };
      return next();
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please log in again.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please log in again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Token verification failed.'
    });
  }
};

module.exports = authMiddleware; 