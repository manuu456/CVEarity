const express = require('express');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { db: getDb, saveDatabase, mapResultToObjects } = require('../database/init');

const router = express.Router();
router.use(authenticate);

// GET /api/developer/keys — List user's API keys
router.get('/keys', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(
      'SELECT id, key_name, SUBSTR(api_key, 1, 8) || "..." as api_key_preview, permissions, rate_limit, is_active, last_used, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const keys = mapResultToObjects(result);
    res.json({ success: true, data: keys });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching API keys' });
  }
});

// POST /api/developer/keys — Generate new API key
router.post('/keys', (req, res) => {
  try {
    const { key_name, permissions } = req.body;
    if (!key_name) return res.status(400).json({ success: false, message: 'key_name is required' });

    const apiKey = 'cvea_' + crypto.randomBytes(32).toString('hex');
    const db = getDb();
    db.run(
      'INSERT INTO api_keys (user_id, key_name, api_key, permissions) VALUES (?, ?, ?, ?)',
      [req.user.id, key_name, apiKey, permissions || 'read']
    );
    saveDatabase();

    res.status(201).json({
      success: true,
      data: { key_name, api_key: apiKey, permissions: permissions || 'read' },
      message: 'Save this key now — it will not be shown again'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating API key' });
  }
});

// DELETE /api/developer/keys/:id — Revoke API key
router.delete('/keys/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM api_keys WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    saveDatabase();
    res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error revoking API key' });
  }
});

module.exports = router;
