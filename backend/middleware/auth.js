/**
 * Authentication and authorization middleware.
 *
 * Provides JWT token generation, request authentication, role-based
 * authorization, and a simple in-memory rate limiter.
 *
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');
const { statements } = require('../database/init');

const DEFAULT_JWT_SECRET = 'cvearity-secret-key-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure default — set JWT_SECRET in your .env file before deploying to production.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a signed JWT for the given user.
 *
 * @param {number} userId - The database ID of the user.
 * @returns {string} A signed JWT string.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Express middleware that verifies the JWT provided in the `Authorization`
 * header (or as a cookie fallback) and attaches the corresponding user
 * object to `req.user`.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token; // Fallback if using cookies
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = statements.getUserById.get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, user no longer exists' 
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, account deactivated' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired, please login again' 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token failed' 
    });
  }
};

/**
 * Create middleware that restricts access to the specified roles.
 *
 * @param {...string} roles - One or more role names (e.g. `'admin'`).
 * @returns {import('express').RequestHandler} Express middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden, insufficient permissions' 
      });
    }
    next();
  };
};

/**
 * Create a simple in-memory rate-limiting middleware.
 *
 * Tracks request counts per IP address within a sliding time window and
 * responds with HTTP 429 when the limit is exceeded.
 *
 * @param {number} maxRequests - Maximum number of requests allowed per window.
 * @param {number} windowMs - Time window duration in milliseconds.
 * @returns {import('express').RequestHandler} Express middleware.
 */
const rateLimit = (maxRequests, windowMs) => {
  const ipRequests = new Map();
  
  // Cleanup interval
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
      if (now > data.resetTime) {
        ipRequests.delete(ip);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const data = ipRequests.get(ip);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }
    
    if (data.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    data.count++;
    next();
  };
};

const requireAdmin = authorize('admin');

module.exports = {
  generateToken,
  authenticate,
  authorize,
  requireAdmin,
  rateLimit
};
