/**
 * CVE Sync Controller
 * Syncs CVE data from NVD API to local database
 */

const nvdService = require('../services/nvdService');

// Reuse initialized DB from database/init.js
const { db } = require('../database/init.js');

/**
 * Sync CVEs from NVD API
 * Fetches CVEs and stores them in the database
 */
const syncCVEsFromNVD = async (options = {}) => {
  try {
    const {
      resultsPerPage = 100,
      maxResults = 500,
      updateExisting = true
    } = options;

    console.log(`🔄 Starting CVE sync from NVD API...`);
    let synced = 0;
    let updated = 0;
    let skipped = 0;

    // Fetch CVEs in batches
    for (let startIndex = 0; synced < maxResults; startIndex += resultsPerPage) {
      console.log(`📥 Fetching CVEs from index ${startIndex}...`);

      const cves = await nvdService.fetchCVEsFromNVD(startIndex, resultsPerPage);

      if (!cves || cves.length === 0) {
        console.log('✅ No more CVEs available from NVD');
        break;
      }

      // Process each CVE
      for (const cve of cves) {
        try {
          // Check if CVE already exists
          const existing = db.prepare(
            'SELECT id FROM cves WHERE cve_id = ?'
          ).get(cve.cveId);

          if (existing) {
            if (updateExisting) {
              // Update existing CVE
              db.prepare(`
                UPDATE cves SET
                  title = ?,
                  description = ?,
                  severity = ?,
                  severity_score = ?,
                  affected_software = ?,
                  published_date = ?,
                  last_modified = ?,
                  reference_urls = ?
                WHERE cve_id = ?
              `).run(
                cve.title,
                cve.description,
                cve.severity,
                cve.severityScore,
                JSON.stringify(cve.affectedSoftware || []),
                cve.publishedDate,
                cve.lastModified,
                JSON.stringify(cve.referenceUrls || []),
                cve.cveId
              );
              updated++;
            } else {
              skipped++;
            }
          } else {
            // Insert new CVE
            db.prepare(`
              INSERT INTO cves (
                cve_id, title, description, severity, severity_score,
                affected_software, published_date, last_modified, reference_urls
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              cve.cveId,
              cve.title,
              cve.description,
              cve.severity,
              cve.severityScore,
              JSON.stringify(cve.affectedSoftware || []),
              cve.publishedDate,
              cve.lastModified,
              JSON.stringify(cve.referenceUrls || [])
            );
            synced++;
          }
        } catch (error) {
          console.error(`❌ Error processing ${cve.cveId}:`, error.message);
        }
      }

      // Check if we've reached the max results
      if (synced >= maxResults || cves.length < resultsPerPage) {
        break;
      }

      // Rate limiting (be nice to NVD API)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const result = {
      success: true,
      synced,
      updated,
      skipped,
      total: synced + updated + skipped,
      message: `✅ CVE sync completed: ${synced} new, ${updated} updated, ${skipped} skipped`
    };

    console.log(result.message);
    return result;

  } catch (error) {
    console.error('❌ CVE sync failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Search and sync CVEs by keyword
 */
const searchAndSyncCVEs = async (keyword, options = {}) => {
  try {
    const { resultsPerPage = 50 } = options;

    console.log(`🔍 Searching CVEs for keyword: "${keyword}"...`);

    const cves = await nvdService.searchCVEsByKeyword(keyword);

    if (!cves || cves.length === 0) {
      return {
        success: true,
        synced: 0,
        message: `No CVEs found for keyword: "${keyword}"`
      };
    }

    let synced = 0;

    // Store in database
    for (const cve of cves) {
      try {
        const existing = db.prepare(
          'SELECT id FROM cves WHERE cve_id = ?'
        ).get(cve.cveId);

        if (!existing) {
          db.prepare(`
            INSERT INTO cves (
              cve_id, title, description, severity, severity_score,
              affected_software, published_date, last_modified, reference_urls
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            cve.cveId,
            cve.title,
            cve.description,
            cve.severity,
            cve.severityScore,
            JSON.stringify(cve.affectedSoftware || []),
            cve.publishedDate,
            cve.lastModified,
            JSON.stringify(cve.referenceUrls || [])
          );
          synced++;
        }
      } catch (error) {
        console.error(`Error storing ${cve.cveId}:`, error.message);
      }
    }

    return {
      success: true,
      synced,
      total: cves.length,
      message: `✅ Found and synced ${synced} new CVEs for "${keyword}"`
    };

  } catch (error) {
    console.error('❌ CVE search failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get sync statistics
 */
const getSyncStats = () => {
  try {
    const cveStats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low,
        MIN(published_date) as oldest,
        MAX(published_date) as newest,
        MAX(updated_at) as lastSync
      FROM cves
    `).get();

    return {
      success: true,
      stats: {
        totalCVEs: cveStats.total || 0,
        bySeverity: {
          critical: cveStats.critical || 0,
          high: cveStats.high || 0,
          medium: cveStats.medium || 0,
          low: cveStats.low || 0
        },
        dateRange: {
          oldest: cveStats.oldest,
          newest: cveStats.newest
        },
        lastSync: cveStats.lastSync
      }
    };
  } catch (error) {
    console.error('Error getting sync stats:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Clean up old CVEs (optional database maintenance)
 */
const cleanupOldCVEs = (retentionDays = 90) => {
  try {
    const result = db.prepare(`
      DELETE FROM cves 
      WHERE published_date < datetime('now', ? || ' days')
    `).run(-retentionDays);

    return {
      success: true,
      deleted: result.changes,
      message: `Deleted ${result.changes} CVEs older than ${retentionDays} days`
    };
  } catch (error) {
    console.error('Error cleaning up CVEs:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  syncCVEsFromNVD,
  searchAndSyncCVEs,
  getSyncStats,
  cleanupOldCVEs
};
