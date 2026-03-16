const express = require('express');
const { authenticate } = require('../middleware/auth');
const { db: getDb, mapResultToObjects } = require('../database/init');

const router = express.Router();
router.use(authenticate);

// GET /api/reports/csv — Export CVEs as CSV
router.get('/csv', (req, res) => {
  try {
    const db = getDb();
    const { severity, dateFrom, dateTo } = req.query;
    let query = 'SELECT * FROM cves WHERE 1=1';
    const params = [];

    if (severity) { query += ' AND severity = ?'; params.push(severity); }
    if (dateFrom) { query += ' AND published_date >= ?'; params.push(dateFrom); }
    if (dateTo) { query += ' AND published_date <= ?'; params.push(dateTo); }
    query += ' ORDER BY published_date DESC';

    const result = db.exec(query, params);
    const cves = mapResultToObjects(result);

    const headers = ['CVE ID', 'Title', 'Severity', 'Score', 'Published Date', 'Affected Software', 'Description'];
    const csvRows = [headers.join(',')];

    // Sanitize cell value to prevent CSV formula injection
    const sanitizeCSV = (val) => {
      let s = String(val || '');
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };

    cves.forEach(cve => {
      csvRows.push([
        sanitizeCSV(cve.cve_id),
        sanitizeCSV(cve.title),
        sanitizeCSV(cve.severity),
        cve.severity_score,
        sanitizeCSV(cve.published_date),
        sanitizeCSV(cve.affected_software),
        sanitizeCSV((cve.description || '').substring(0, 200))
      ].join(','));
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=cvearity-report-${new Date().toISOString().slice(0,10)}.csv`);
    res.send(csvRows.join('\n'));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating CSV' });
  }
});

// GET /api/reports/json — Export CVEs as JSON report
router.get('/json', (req, res) => {
  try {
    const db = getDb();
    const { severity } = req.query;
    let query = 'SELECT * FROM cves';
    const params = [];
    if (severity) { query += ' WHERE severity = ?'; params.push(severity); }
    query += ' ORDER BY published_date DESC';

    const result = db.exec(query, params);
    const cves = mapResultToObjects(result);

    const report = {
      generated: new Date().toISOString(),
      platform: 'CVEarity',
      totalCVEs: cves.length,
      bySeverity: {
        critical: cves.filter(c => c.severity === 'critical').length,
        high: cves.filter(c => c.severity === 'high').length,
        medium: cves.filter(c => c.severity === 'medium').length,
        low: cves.filter(c => c.severity === 'low').length
      },
      cves
    };

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
});

module.exports = router;
