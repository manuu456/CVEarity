const express = require('express');
const cors = require('cors');
const cveRoutes = require('./routes/cveRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const syncRoutes = require('./routes/syncRoutes.js');
const jobScheduler = require('./services/jobScheduler.js');
const { initDatabase } = require('./database/init.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or same-origin on Vercel)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }

    // Allow Vercel deployment URLs
    if (origin.match(/\.vercel\.app$/)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Initialize database asynchronously for serverless environments (like Vercel)
app.use(async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (error) {
    console.error('Failed to initialize database middleware:', error);
    res.status(500).json({ success: false, message: 'Database initialization failed' });
  }
});

const watchlistRoutes = require('./routes/watchlistRoutes.js');
const assetRoutes = require('./routes/assetRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const apiKeyRoutes = require('./routes/apiKeyRoutes.js');
const liveFeedRoutes = require('./routes/liveFeedRoutes.js');
const newsRoutes = require('./routes/newsRoutes.js');
const learnRoutes = require('./routes/learnRoutes.js');

// Routes
app.use('/api/cves', cveRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/developer', apiKeyRoutes);
app.use('/api/live', liveFeedRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/learn', learnRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CVEarity backend running on http://localhost:${PORT}`);
    console.log(`Database initialized and ready`);

    // Start scheduled jobs
    jobScheduler.startAll();
  });
}

// Export the Express API for Vercel serverless functions
module.exports = app;
