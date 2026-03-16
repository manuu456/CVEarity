const express = require('express');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { db: getDb, saveDatabase, mapResultToObjects } = require('../database/init');

const router = express.Router();
router.use(authenticate);

const DEFAULT_RATE_LIMIT = 100;

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
    const { key_name, permissions, rate_limit } = req.body;
    if (!key_name) return res.status(400).json({ success: false, message: 'key_name is required' });

    const resolvedRateLimit = Number.isInteger(Number(rate_limit)) && Number(rate_limit) > 0
      ? Number(rate_limit)
      : DEFAULT_RATE_LIMIT;

    const apiKey = 'cvea_' + crypto.randomBytes(32).toString('hex');
    const db = getDb();
    db.run(
      'INSERT INTO api_keys (user_id, key_name, api_key, permissions, rate_limit) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, key_name, apiKey, permissions || 'read', resolvedRateLimit]
    );
    saveDatabase();

    res.status(201).json({
      success: true,
      data: { key_name, api_key: apiKey, permissions: permissions || 'read', rate_limit: resolvedRateLimit },
      message: 'Save this key now — it will not be shown again'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating API key' });
  }
});

// PATCH /api/developer/keys/:id/rate-limit — Update rate limit for an API key
router.patch('/keys/:id/rate-limit', (req, res) => {
  try {
    const { rate_limit } = req.body;
    if (!Number.isInteger(Number(rate_limit)) || Number(rate_limit) <= 0) {
      return res.status(400).json({ success: false, message: 'rate_limit must be a positive integer' });
    }
    const db = getDb();
    db.run(
      'UPDATE api_keys SET rate_limit = ? WHERE id = ? AND user_id = ?',
      [Number(rate_limit), req.params.id, req.user.id]
    );
    saveDatabase();
    res.json({ success: true, message: 'Rate limit updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating rate limit' });
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
