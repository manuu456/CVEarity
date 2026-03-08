const jwt = require('jsonwebtoken');
const { statements } = require('../database/init');

const DEFAULT_JWT_SECRET = 'cvearity-secret-key-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure default — set JWT_SECRET in your .env file before deploying to production.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

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

// Simple memory-based rate limiter since we just need something minimal based on usage
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
