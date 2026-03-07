/**
 * Notification Routes
 * Handles email notifications and alerts
 */

const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Reuse initialized DB from database/init.js
const { db } = require('../database/init.js');

/**
 * POST /api/notifications/test
 * Test email configuration
 */
router.post('/test', async (req, res) => {
  try {
    const result = await emailService.testEmailConnection();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: 'Email service is not configured properly'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/critical-alert
 * Send critical vulnerability alert
 * Body: { recipientEmail, cveId, recipientName }
 */
router.post('/critical-alert', async (req, res) => {
  try {
    const { recipientEmail, cveId, recipientName } = req.body;

    if (!recipientEmail || !cveId) {
      return res.status(400).json({
        error: 'recipientEmail and cveId are required'
      });
    }

    // Fetch CVE data from database
    const cve = db.prepare(`
      SELECT * FROM cves WHERE cve_id = ?
    `).get(cveId);

    if (!cve) {
      return res.status(404).json({
        error: `CVE ${cveId} not found`
      });
    }

    // Parse JSON fields
    const cveData = {
      ...cve,
      affectedSoftware: typeof cve.affected_software === 'string' 
        ? JSON.parse(cve.affected_software) 
        : cve.affected_software || [],
      cveId: cve.cve_id
    };

    // Send email
    const result = await emailService.sendCriticalAlert(
      recipientEmail,
      cveData,
      recipientName || 'User'
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Critical alert sent to ${recipientEmail}`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending critical alert:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/new-cves
 * Send new CVE notification
 * Body: { recipientEmail, topCount }
 */
router.post('/new-cves', async (req, res) => {
  try {
    const { recipientEmail, topCount = 5 } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({
        error: 'recipientEmail is required'
      });
    }

    // Get recent CVEs
    const recentCVEs = db.prepare(`
      SELECT * FROM cves 
      ORDER BY published_date DESC 
      LIMIT ?
    `).all(topCount);

    // Transform CVE data
    const topCVEs = recentCVEs.map(cve => ({
      ...cve,
      affectedSoftware: typeof cve.affected_software === 'string' 
        ? JSON.parse(cve.affected_software) 
        : cve.affected_software || [],
      cveId: cve.cve_id
    }));

    // Send email
    const result = await emailService.sendNewCVENotification(
      recipientEmail,
      db.prepare('SELECT COUNT(*) as count FROM cves').get().count,
      topCVEs
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `CVE notification sent to ${recipientEmail}`,
        messageId: result.messageId,
        cvesSent: topCVEs.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending CVE notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/weekly-report
 * Send weekly vulnerability report
 * Body: { recipientEmail }
 */
router.post('/weekly-report', async (req, res) => {
  try {
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({
        error: 'recipientEmail is required'
      });
    }

    // Get statistics
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalCVEs,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as criticalCount,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as highCount,
        SUM(CASE WHEN published_date >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as newThisWeek
      FROM cves
    `).get();

    // Send email
    const result = await emailService.sendWeeklyReport(
      recipientEmail,
      {
        totalCVEs: stats.totalCVEs || 0,
        criticalCount: stats.criticalCount || 0,
        highCount: stats.highCount || 0,
        newThisWeek: stats.newThisWeek || 0
      }
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `Weekly report sent to ${recipientEmail}`,
        messageId: result.messageId,
        stats: {
          totalCVEs: stats.totalCVEs || 0,
          criticalCount: stats.criticalCount || 0,
          highCount: stats.highCount || 0,
          newThisWeek: stats.newThisWeek || 0
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending weekly report:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as totalCVEs,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
      FROM cves
    `).get();

    res.json({
      success: true,
      stats: {
        totalCVEs: stats.totalCVEs || 0,
        critical: stats.critical || 0,
        high: stats.high || 0,
        medium: stats.medium || 0,
        low: stats.low || 0
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
