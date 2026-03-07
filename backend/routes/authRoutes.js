const express = require('express');
const bcrypt = require('bcryptjs');
const { statements } = require('../database/init');
const { authenticate, generateToken, rateLimit } = require('../middleware/auth');

const router = express.Router();

// Input validation helper
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Register new user
router.post('/register', rateLimit(5, 60 * 1000), async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, company } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = statements.getUserByUsername.get(username) ||
                        statements.getUserByEmail.get(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = statements.createUser.run(
      username,
      email,
      hashedPassword,
      'user', // default role
      firstName || null,
      lastName || null,
      company || null
    );

    // Generate token
    const token = generateToken(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: result.lastInsertRowid,
          username,
          email,
          role: 'user',
          firstName,
          lastName,
          company
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', rateLimit(10, 15 * 60 * 1000), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = statements.getUserByUsername.get(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Log activity
    statements.logActivity.run(
      user.id,
      'login',
      'User logged in',
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          company: user.company
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        company: req.user.company,
        createdAt: req.user.created_at
      }
    }
  });
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { firstName, lastName, company } = req.body;

    statements.updateUser.run(
      firstName || null,
      lastName || null,
      company || null,
      req.user.id
    );

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'profile_update',
      'User updated profile',
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

// Change password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Verify current password
    const user = statements.getUserById.get(req.user.id);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    statements.updateUserPassword.run(hashedPassword, req.user.id);

    // Log activity
    statements.logActivity.run(
      req.user.id,
      'password_change',
      'User changed password',
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
});

// Logout (client-side token removal, but we can log the activity)
router.post('/logout', authenticate, (req, res) => {
  // Log activity
  statements.logActivity.run(
    req.user.id,
    'logout',
    'User logged out',
    req.ip,
    req.get('User-Agent')
  );

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Verify token endpoint
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        mfa_enabled: !!req.user.mfa_enabled
      }
    }
  });
});

// MFA Setup — Generate secret
router.post('/mfa/setup', authenticate, (req, res) => {
  try {
    const crypto = require('crypto');
    const secret = crypto.randomBytes(20).toString('hex').substring(0, 16).toUpperCase();
    const { db: getDb, saveDatabase } = require('../database/init');
    const db = getDb();

    // Store secret temporarily
    db.run('UPDATE users SET mfa_secret = ? WHERE id = ?', [secret, req.user.id]);
    saveDatabase();

    // Generate otpauth URI for QR code
    const otpauthUrl = `otpauth://totp/CVEarity:${req.user.username}?secret=${secret}&issuer=CVEarity`;

    res.json({
      success: true,
      data: { secret, otpauthUrl, qrCode: null }
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ success: false, message: 'MFA setup failed' });
  }
});

// MFA Verify — Enable MFA after code verification
router.post('/mfa/verify', authenticate, (req, res) => {
  try {
    const { code } = req.body;
    if (!code || code.length !== 6) {
      return res.status(400).json({ success: false, message: 'A 6-digit code is required' });
    }

    const { db: getDb, saveDatabase, mapResultToObjects } = require('../database/init');
    const db = getDb();
    const result = db.exec('SELECT mfa_secret FROM users WHERE id = ?', [req.user.id]);
    const users = mapResultToObjects(result);

    if (!users.length || !users[0].mfa_secret) {
      return res.status(400).json({ success: false, message: 'MFA not set up. Call /mfa/setup first.' });
    }

    // Simple verification — accept any 6-digit code for now (production would use otplib)
    // For demo purposes, we enable MFA when the user provides any valid-format code
    db.run('UPDATE users SET mfa_enabled = 1 WHERE id = ?', [req.user.id]);
    saveDatabase();

    res.json({ success: true, message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('MFA verify error:', error);
    res.status(500).json({ success: false, message: 'MFA verification failed' });
  }
});

// MFA Disable
router.post('/mfa/disable', authenticate, (req, res) => {
  try {
    const { db: getDb, saveDatabase } = require('../database/init');
    const db = getDb();
    db.run('UPDATE users SET mfa_enabled = 0, mfa_secret = NULL WHERE id = ?', [req.user.id]);
    saveDatabase();
    res.json({ success: true, message: 'MFA disabled' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to disable MFA' });
  }
});

// Get profile endpoint
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        company: req.user.company,
        mfa_enabled: !!req.user.mfa_enabled
      }
    }
  });
});

module.exports = router;