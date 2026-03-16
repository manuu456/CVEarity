/**
 * CVE controller.
 *
 * Provides route handlers for listing, filtering, searching CVEs, fetching
 * individual CVE details, retrieving dashboard statistics, and user login.
 *
 * @module controllers/cveController
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { statements } = require('../database/init.js');

/**
 * Retrieve all CVEs with optional filtering by severity, software, year, or
 * free-text search.
 *
 * @param {import('express').Request} req - Query params: `severity`, `software`, `year`, `search`.
 * @param {import('express').Response} res
 */
const getAllCVEs = (req, res) => {
  try {
    const filters = {
      severity: req.query.severity,
      software: req.query.software,
      year: req.query.year,
      search: req.query.search
    };

    let cves;

    // Apply filters
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      cves = statements.searchCVEs.all(searchTerm, searchTerm, searchTerm);
    } else if (filters.severity) {
      cves = statements.getCVEsBySeverity.all(filters.severity);
    } else if (filters.year) {
      const yearPattern = `${filters.year}%`;
      cves = statements.getCVEsByYear.all(yearPattern);
    } else {
      cves = statements.getAllCVEs.all();
    }

    // Additional filtering for software if specified
    if (filters.software && !filters.search) {
      const softwareFilter = filters.software.toLowerCase();
      cves = cves.filter(cve => {
        const affectedSoftware = JSON.parse(cve.affected_software || '[]');
        return affectedSoftware.some(software =>
          software.toLowerCase().includes(softwareFilter)
        );
      });
    }

    // Transform data for frontend
    const transformedCVEs = cves.map(cve => ({
      id: cve.id,
      cveId: cve.cve_id,
      title: cve.title,
      description: cve.description,
      severity: cve.severity,
      severityScore: cve.severity_score,
      affectedSoftware: JSON.parse(cve.affected_software || '[]'),
      publishedDate: cve.published_date,
      lastModified: cve.last_modified,
      references: JSON.parse(cve.reference_urls || '[]')
    }));

    res.json({
      success: true,
      cves: transformedCVEs,
      total: transformedCVEs.length
    });
  } catch (error) {
    console.error('Error fetching CVEs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CVEs',
      error: error.message
    });
  }
};

/**
 * Retrieve a single CVE by its ID.
 *
 * @param {import('express').Request} req - Route param: `id`.
 * @param {import('express').Response} res
 */
const getCVE = (req, res) => {
  try {
    const { id } = req.params;
    const cve = statements.getCVEById.get(id);

    if (!cve) {
      return res.status(404).json({
        success: false,
        message: `CVE ${id} not found`
      });
    }

    // Transform data for frontend
    const transformedCVE = {
      id: cve.id,
      cveId: cve.cve_id,
      title: cve.title,
      description: cve.description,
      severity: cve.severity,
      severityScore: cve.severity_score,
      affectedSoftware: JSON.parse(cve.affected_software || '[]'),
      publishedDate: cve.published_date,
      lastModified: cve.last_modified,
      references: JSON.parse(cve.reference_urls || '[]')
    };

    res.json({
      success: true,
      data: transformedCVE
    });
  } catch (error) {
    console.error('Error fetching CVE:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching CVE',
      error: error.message
    });
  }
};

/**
 * Return aggregate dashboard statistics including totals by severity, by year,
 * and recent critical alerts.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getStatistics = (req, res) => {
  try {
    // Get total count
    const totalResult = statements.getCVEsCount.get();
    const totalCVEs = totalResult.count;

    // Get severity counts
    const severityCounts = statements.getCVEsBySeverityCount.all();
    const bySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    severityCounts.forEach(row => {
      bySeverity[row.severity] = row.count;
    });

    // Get year counts
    const yearCounts = statements.getCVEsByYearCount.all();
    const byYear = {};
    yearCounts.forEach(row => {
      byYear[row.year] = row.count;
    });

    // Get recent critical alerts
    const recentAlerts = statements.getRecentCriticalAlerts.all('critical', 5);
    const transformedAlerts = recentAlerts.map(alert => ({
      cveId: alert.cve_id,
      title: alert.title,
      severity: alert.severity
    }));

    const stats = {
      totalCVEs,
      bySeverity,
      byYear,
      recentAlerts: transformedAlerts
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

/**
 * Authenticate a user and return a JWT.
 *
 * @param {import('express').Request} req - Must contain `username` and `password` in the body.
 * @param {import('express').Response} res
 */
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
  getAllCVEs,
  getCVE,
  getStatistics,
  login
};
