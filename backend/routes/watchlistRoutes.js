const express = require('express');
const { authenticate } = require('../middleware/auth');
const { statements, db: getDb, saveDatabase, mapResultToObjects } = require('../database/init');

const router = express.Router();

// All watchlist routes require authentication
router.use(authenticate);

// GET /api/watchlist — Get user's watchlist
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM watchlist WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const items = mapResultToObjects(result);
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ success: false, message: 'Error fetching watchlist' });
  }
});

// POST /api/watchlist — Add item to watchlist
router.post('/', (req, res) => {
  try {
    const { software_name, vendor, severity_threshold } = req.body;
    if (!software_name) {
      return res.status(400).json({ success: false, message: 'software_name is required' });
    }
    const db = getDb();
    db.run(`
      INSERT INTO watchlist (user_id, software_name, vendor, severity_threshold)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, software_name, vendor || null, severity_threshold || 'all']);
    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const id = idResult[0].values[0][0];

    // Check for existing CVE matches and create alerts
    const searchTerm = `%${software_name}%`;
    const matches = db.exec(
      'SELECT cve_id, title, severity FROM cves WHERE affected_software LIKE ? OR title LIKE ?',
      [searchTerm, searchTerm]
    );
    const matchedCves = mapResultToObjects(matches);

    matchedCves.forEach(cve => {
      if (severity_threshold === 'all' || cve.severity === severity_threshold || severity_threshold === 'high' && ['critical', 'high'].includes(cve.severity)) {
        db.run(`
          INSERT INTO alerts (user_id, cve_id, watchlist_id, message)
          VALUES (?, ?, ?, ?)
        `, [req.user.id, cve.cve_id, id, `CVE ${cve.cve_id} affects ${software_name}: ${cve.title}`]);
      }
    });
    saveDatabase();

    res.status(201).json({
      success: true,
      message: 'Watchlist item added',
      data: { id, software_name, vendor, severity_threshold, matchedAlerts: matchedCves.length }
    });
  } catch (error) {
    console.error('Error adding watchlist item:', error);
    res.status(500).json({ success: false, message: 'Error adding watchlist item' });
  }
});

// DELETE /api/watchlist/:id — Remove watchlist item
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    // Verify ownership
    const result = db.exec('SELECT * FROM watchlist WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    const items = mapResultToObjects(result);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Watchlist item not found' });
    }
    db.run('DELETE FROM watchlist WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    db.run('DELETE FROM alerts WHERE watchlist_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    saveDatabase();
    res.json({ success: true, message: 'Watchlist item removed' });
  } catch (error) {
    console.error('Error removing watchlist item:', error);
    res.status(500).json({ success: false, message: 'Error removing watchlist item' });
  }
});

// GET /api/watchlist/alerts — Get user's alerts
router.get('/alerts', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(
      'SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const alerts = mapResultToObjects(result);
    const unreadCount = alerts.filter(a => !a.is_read).length;
    res.json({ success: true, data: { alerts, unreadCount } });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, message: 'Error fetching alerts' });
  }
});

// PUT /api/watchlist/alerts/:id/read — Mark alert as read
router.put('/alerts/:id/read', (req, res) => {
  try {
    const db = getDb();
    db.run('UPDATE alerts SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    saveDatabase();
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (error) {
    console.error('Error marking alert:', error);
    res.status(500).json({ success: false, message: 'Error updating alert' });
  }
});

// PUT /api/watchlist/alerts/read-all — Mark all alerts as read
router.put('/alerts/read-all', (req, res) => {
  try {
    const db = getDb();
    db.run('UPDATE alerts SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    saveDatabase();
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Error marking alerts:', error);
    res.status(500).json({ success: false, message: 'Error updating alerts' });
  }
});

module.exports = router;
