const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db: getDb, saveDatabase, mapResultToObjects } = require('../database/init');

const router = express.Router();
router.use(authenticate);

// GET /api/assets — List user's assets
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT * FROM user_assets WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const assets = mapResultToObjects(result);
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching assets' });
  }
});

// POST /api/assets — Add asset
router.post('/', (req, res) => {
  try {
    const { software_name, version, vendor, category, criticality } = req.body;
    if (!software_name) return res.status(400).json({ success: false, message: 'software_name is required' });
    const db = getDb();
    db.run(`INSERT INTO user_assets (user_id, software_name, version, vendor, category, criticality) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, software_name, version || null, vendor || null, category || 'general', criticality || 'medium']);
    saveDatabase();
    const idRes = db.exec('SELECT last_insert_rowid() as id');
    const id = idRes[0].values[0][0];

    // Auto-match CVEs
    const searchTerm = `%${software_name}%`;
    const matches = db.exec('SELECT cve_id FROM cves WHERE affected_software LIKE ? OR title LIKE ?', [searchTerm, searchTerm]);
    const matchedCves = mapResultToObjects(matches);
    matchedCves.forEach(cve => {
      db.run('INSERT OR IGNORE INTO asset_cve_matches (asset_id, cve_id) VALUES (?, ?)', [id, cve.cve_id]);
    });
    saveDatabase();

    res.status(201).json({ success: true, data: { id, software_name, version, vendor, category, criticality, matchedCVEs: matchedCves.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding asset' });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM user_assets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    db.run('DELETE FROM asset_cve_matches WHERE asset_id = ?', [req.params.id]);
    saveDatabase();
    res.json({ success: true, message: 'Asset removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing asset' });
  }
});

// GET /api/assets/matches — Get CVE matches for all user assets
router.get('/matches', (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(`
      SELECT ua.software_name, ua.version, ua.criticality, acm.cve_id, acm.match_confidence,
             c.title, c.severity, c.severity_score
      FROM user_assets ua
      JOIN asset_cve_matches acm ON ua.id = acm.asset_id
      JOIN cves c ON acm.cve_id = c.cve_id
      WHERE ua.user_id = ?
      ORDER BY c.severity_score DESC
    `, [req.user.id]);
    const matches = mapResultToObjects(result);
    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching matches' });
  }
});

module.exports = router;
