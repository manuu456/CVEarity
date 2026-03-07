const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db: getDb, saveDatabase, mapResultToObjects } = require('../database/init');
const { fetchRecentCVEs } = require('../services/nvdService');

const router = express.Router();

// Track last sync time in memory
let lastSyncTime = null;
let lastSyncCount = 0;
let isSyncing = false;

// GET /api/live/recent — Latest 20 CVEs from local DB sorted by date
router.get('/recent', async (req, res) => {
  try {
    const db = getDb();
    const limit = parseInt(req.query.limit) || 20;
    const result = db.exec(
      'SELECT * FROM cves ORDER BY published_date DESC, created_at DESC LIMIT ?',
      [limit]
    );
    const cves = mapResultToObjects(result);
    res.json({
      success: true,
      data: { cves, lastSyncTime, isSyncing }
    });
  } catch (error) {
    console.error('Live feed error:', error);
    res.status(500).json({ success: false, message: 'Error fetching live feed' });
  }
});

// GET /api/live/sync-status — Sync metadata
router.get('/sync-status', (req, res) => {
  try {
    const db = getDb();
    const countResult = db.exec('SELECT COUNT(*) as total FROM cves');
    const total = mapResultToObjects(countResult)[0]?.total || 0;
    res.json({
      success: true,
      data: {
        lastSyncTime,
        lastSyncCount,
        isSyncing,
        totalCVEs: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sync status' });
  }
});

// POST /api/live/sync-now — Admin-triggered sync from NVD
router.post('/sync-now', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  if (isSyncing) {
    return res.json({ success: false, message: 'Sync already in progress' });
  }

  // Respond immediately; sync runs in background
  res.json({ success: true, message: 'Sync started in background' });

  isSyncing = true;
  try {
    const recentCVEs = await fetchRecentCVEs();
    const db = getDb();
    let synced = 0;

    recentCVEs.forEach(cve => {
      try {
        const existing = db.exec('SELECT id FROM cves WHERE cve_id = ?', [cve.cveId]);
        if (!mapResultToObjects(existing).length) {
          db.run(
            `INSERT INTO cves (cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cve.cveId,
              (cve.title || '').substring(0, 500),
              (cve.description || '').substring(0, 2000),
              cve.severity || 'unknown',
              cve.severityScore || 0,
              JSON.stringify(cve.affectedSoftware || []),
              cve.publishedDate || new Date().toISOString(),
              cve.lastModified || new Date().toISOString(),
              JSON.stringify(cve.referenceUrls || [])
            ]
          );
          synced++;
        }
      } catch (e) { /* skip duplicates */ }
    });

    if (synced > 0) saveDatabase();
    lastSyncTime = new Date().toISOString();
    lastSyncCount = synced;
    console.log(`Live sync done: ${synced} new CVEs added`);
  } catch (err) {
    console.error('Sync error:', err.message);
  } finally {
    isSyncing = false;
  }
});

// GET /api/live/autocomplete?q=xxx — Fast autocomplete for search
router.get('/autocomplete', (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (q.length < 2) return res.json({ success: true, data: [] });

    const db = getDb();
    const searchTerm = `%${q}%`;
    const result = db.exec(
      `SELECT cve_id, title, severity, severity_score FROM cves
       WHERE cve_id LIKE ? OR title LIKE ?
       ORDER BY severity_score DESC LIMIT 8`,
      [searchTerm, searchTerm]
    );
    const results = mapResultToObjects(result);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Autocomplete error' });
  }
});

module.exports = router;
