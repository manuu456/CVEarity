const express = require('express');
const { db, saveDatabase } = require('../database/init');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const mapRows = (result) => {
  if (!result || result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  });
};

const parseModule = (m) => ({
  ...m,
  how_to_use: m.how_to_use ? JSON.parse(m.how_to_use) : [],
  tips: m.tips ? JSON.parse(m.tips) : [],
  key_terms: m.key_terms ? JSON.parse(m.key_terms) : [],
});

// GET /api/learn — public, all active modules ordered by sort_order
router.get('/', (req, res) => {
  try {
    const result = db().exec('SELECT * FROM learn_modules WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
    const modules = mapRows(result).map(parseModule);
    res.json({ success: true, data: modules });
  } catch (err) {
    console.error('Learn GET error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch modules' });
  }
});

// GET /api/learn/all — admin: all modules including inactive
router.get('/all', authenticate, requireAdmin, (req, res) => {
  try {
    const result = db().exec('SELECT * FROM learn_modules ORDER BY sort_order ASC, id ASC');
    const modules = mapRows(result).map(parseModule);
    res.json({ success: true, data: modules });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch modules' });
  }
});

// POST /api/learn — admin: create module
router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { module_key, icon, name, tagline, route, difficulty, time_to_learn, what_text, why_text, how_to_use, tips, key_terms, is_active, sort_order } = req.body;
    if (!module_key || !name) return res.status(400).json({ success: false, message: 'module_key and name are required' });

    db().run(
      `INSERT INTO learn_modules (module_key, icon, name, tagline, route, difficulty, time_to_learn, what_text, why_text, how_to_use, tips, key_terms, is_active, sort_order, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        module_key, icon || '📚', name, tagline || '', route || '',
        difficulty || 'Beginner', time_to_learn || '3 min',
        what_text || '', why_text || '',
        JSON.stringify(how_to_use || []),
        JSON.stringify(tips || []),
        JSON.stringify(key_terms || []),
        is_active !== false ? 1 : 0,
        sort_order || 0,
        req.user.id
      ]
    );
    saveDatabase();
    res.json({ success: true, message: 'Module created' });
  } catch (err) {
    console.error('Learn POST error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create module' });
  }
});

// PUT /api/learn/:id — admin: update module
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const { icon, name, tagline, route, difficulty, time_to_learn, what_text, why_text, how_to_use, tips, key_terms, is_active, sort_order } = req.body;
    db().run(
      `UPDATE learn_modules SET icon=?, name=?, tagline=?, route=?, difficulty=?, time_to_learn=?,
       what_text=?, why_text=?, how_to_use=?, tips=?, key_terms=?, is_active=?, sort_order=?,
       updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [
        icon, name, tagline, route, difficulty, time_to_learn,
        what_text, why_text,
        JSON.stringify(how_to_use || []),
        JSON.stringify(tips || []),
        JSON.stringify(key_terms || []),
        is_active ? 1 : 0,
        sort_order || 0,
        req.params.id
      ]
    );
    saveDatabase();
    res.json({ success: true, message: 'Module updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update module' });
  }
});

// DELETE /api/learn/:id — admin: delete module
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    db().run('DELETE FROM learn_modules WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ success: true, message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete module' });
  }
});

module.exports = router;
