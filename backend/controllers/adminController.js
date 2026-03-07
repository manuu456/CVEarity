const bcrypt = require('bcryptjs');
const { statements } = require('../database/init');

// Get all users (admin only)
const getAllUsers = (req, res) => {
  try {
    const users = statements.getAllUsers.all();
    
    // Transform sensitive data
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      company: user.company,
      isActive: user.is_active,
      createdAt: user.created_at
    }));

    res.json({
      success: true,
      data: transformedUsers,
      total: transformedUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Get user by ID
const getUserById = (req, res) => {
  try {
    const { userId } = req.params;
    const user = statements.getUserById.get(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        isActive: user.is_active,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

// Update user role and status
const updateUser = (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, company, role, isActive } = req.body;

    // Validate data
    if (!firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and role are required'
      });
    }

    const user = statements.getUserById.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    statements.updateUserWithRole.run(
      firstName,
      lastName,
      company || null,
      role,
      isActive ? 1 : 0,
      userId
    );

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'user_updated',
      `Updated user ${user.username} to role ${role}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// Deactivate user
const deactivateUser = (req, res) => {
  try {
    const { userId } = req.params;

    const user = statements.getUserById.get(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating yourself
    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    statements.deactivateUser.run(userId);

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'user_deactivated',
      `Deactivated user ${user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user'
    });
  }
};

// Activate user
const activateUser = (req, res) => {
  try {
    const { userId } = req.params;

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
      'user_activated',
      `Activated user ${user.username}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating user'
    });
  }
};

// Get activity logs
const getActivityLogs = (req, res) => {
  try {
    const { userId, limit = 50, offset = 0 } = req.query;

    let logs;
    if (userId) {
      logs = statements.getActivityLogsByUser.all(userId);
    } else {
      logs = statements.getAllActivityLogs.all();
    }

    // Apply pagination
    const paginatedLogs = logs.slice(offset, offset + limit);

    res.json({
      success: true,
      data: paginatedLogs,
      total: logs.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity logs'
    });
  }
};

// Get admin settings
const getSettings = (req, res) => {
  try {
    const settings = statements.getAllSettings.all();

    const settingsObject = {};
    settings.forEach(setting => {
      settingsObject[setting.setting_key] = setting.setting_value;
    });

    res.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings'
    });
  }
};

// Update admin setting
const updateSetting = (req, res) => {
  try {
    const { settingKey, settingValue } = req.body;

    if (!settingKey || settingValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Setting key and value are required'
      });
    }

    statements.updateSetting.run(
      settingValue,
      req.user.id,
      settingKey
    );

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'setting_updated',
      `Updated setting ${settingKey}`,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Setting updated successfully'
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating setting'
    });
  }
};

// Get dashboard stats
const getDashboardStats = (req, res) => {
  try {
    const totalUsersResult = statements.getAllUsers.all();
    const totalUsers = totalUsersResult.length;
    
    const activeCVEsResult = statements.getCVEsCount.get();
    const totalCVEs = activeCVEsResult?.count || 0;

    const recentLogsResult = statements.getAllActivityLogs.all();
    const recentLogs = recentLogsResult.slice(-10);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCVEs,
        recentActivityCount: recentLogs.length,
        stats: {
          users: totalUsers,
          cves: totalCVEs,
          activeNow: 0 // This would require real-time tracking
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  getActivityLogs,
  getSettings,
  updateSetting,
  getDashboardStats
};
