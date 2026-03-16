const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { statements } = require('../database/init.js');

const login = (req, res) => {
  const { username, password } = req.body;

  try {
    const user = statements.getUserByUsername.get(username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      role: user.role
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Error during login', error: error.message });
  }
};

module.exports = {
  login
};