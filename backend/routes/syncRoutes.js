/**
 * CVE Sync Routes
 * API endpoints for syncing CVE data from NVD
 */

const express = require('express');
const router = express.Router();
const cveSync = require('../controllers/cveSync');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All sync routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * POST /api/sync/cves
 * Trigger CVE sync from NVD API
 * Query params: resultsPerPage, maxResults, updateExisting
 */
router.post('/cves', async (req, res) => {
  try {
    const resultsPerPage = parseInt(req.query.resultsPerPage) || 100;
    const maxResults = parseInt(req.query.maxResults) || 500;
    const updateExisting = req.query.updateExisting !== 'false';

    // Start sync (don't wait for completion for long-running operations)
    const result = await cveSync.syncCVEsFromNVD({
      resultsPerPage,
      maxResults,
      updateExisting
    });

    res.json(result);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/search
 * Search and sync CVEs by keyword
 * Body: { keyword, resultsPerPage }
 */
router.post('/search', async (req, res) => {
  try {
    const { keyword } = req.body;
    const resultsPerPage = req.body.resultsPerPage || 50;

    if (!keyword) {
      return res.status(400).json({
        error: 'keyword is required'
      });
    }

    const result = await cveSync.searchAndSyncCVEs(keyword, {
      resultsPerPage
    });

    res.json(result);
  } catch (error) {
    console.error('Search sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/sync/stats
 * Get CVE sync statistics
 */
router.get('/stats', (req, res) => {
  try {
    const result = cveSync.getSyncStats();
    res.json(result);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/sync/cleanup
 * Clean up old CVEs
 * Query params: retentionDays (default: 90)
 */
router.post('/cleanup', (req, res) => {
  try {
    const retentionDays = parseInt(req.query.retentionDays) || 90;

    const result = cveSync.cleanupOldCVEs(retentionDays);
    res.json(result);
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
