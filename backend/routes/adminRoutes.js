const express = require('express');
const { statements, db } = require('../database/init');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Get all users
router.get('/users', (req, res) => {
  try {
    const users = statements.getAllUsers.all();
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get user by ID
router.get('/users/:id', (req, res) => {
  try {
    const user = statements.getUserById.get(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

// Update user
router.put('/users/:id', (req, res) => {
  try {
    const { firstName, lastName, company, role, isActive } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = statements.getUserById.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user
    const updateData = {
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      company: company || user.company,
      role: role || user.role,
      is_active: isActive !== undefined ? isActive : user.is_active
    };

    statements.updateUserWithRole.run(
      updateData.first_name,
      updateData.last_name,
      updateData.company,
      updateData.role,
      updateData.is_active,
      userId
    );

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'admin_user_update',
      `Updated user ${user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Deactivate user
router.post('/users/:id/deactivate', (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = statements.getUserById.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    statements.deactivateUser.run(userId);

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'admin_user_deactivate',
      `Deactivated user ${user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user'
    });
  }
});

// Activate user
router.post('/users/:id/activate', (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = statements.getUserById.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    statements.activateUser.run(userId);

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'admin_user_activate',
      `Activated user ${user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User activated successfully'
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user'
    });
  }
});

// Get admin settings
router.get('/settings', (req, res) => {
  try {
    const settings = statements.getAllSettings.all();
    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Update admin setting
router.put('/settings/:key', (req, res) => {
  try {
    const { value } = req.body;
    const key = req.params.key;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Setting value is required'
      });
    }

    statements.updateSetting.run(value, req.user.id, key);

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'admin_setting_update',
      `Updated setting ${key} to ${value}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Setting updated successfully'
    });

  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting'
    });
  }
});

// Get user activity logs
router.get('/activity', (req, res) => {
  try {
    const logs = statements.getAllActivityLogs.all();

    res.json({
      success: true,
      logs: logs || [],
      total: logs ? logs.length : 0
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

// Alias route for activity logs
router.get('/activity-logs', (req, res) => {
  try {
    const logs = statements.getAllActivityLogs.all();

    res.json({
      success: true,
      logs: logs || [],
      total: logs ? logs.length : 0
    });

  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

// Get system statistics
router.get('/stats', (req, res) => {
  try {
    const totalUsers = statements.db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const activeUsers = statements.db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
    const adminUsers = statements.db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin"').get().count;
    const recentActivity = statements.db.prepare('SELECT COUNT(*) as count FROM activity_logs WHERE created_at >= datetime("now", "-24 hours")').get().count;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;