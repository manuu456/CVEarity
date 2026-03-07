/**
 * Job Scheduler
 * Schedules automated tasks like CVE syncing and email reports
 */

const cron = require('node-cron');
const cveSync = require('../controllers/cveSync');
const emailService = require('../services/emailService');

// Reuse initialized DB from database/init.js
const { db } = require('../database/init.js');

class JobScheduler {
  constructor() {
    this.jobs = [];
    this.enabled = process.env.ENABLE_SCHEDULED_JOBS !== 'false';
  }

  /**
   * Start all scheduled jobs
   */
  startAll() {
    if (!this.enabled) {
      console.log('⏸️  Scheduled jobs are disabled');
      return;
    }

    console.log('🕐 Starting job scheduler...\n');

    this
      .scheduleCVESync()
      .scheduleWeeklyReport()
      .scheduleDatabaseCleanup();

    console.log(`✅ ${this.jobs.length} scheduled jobs started\n`);
  }

  /**
   * Schedule CVE sync every 6 hours
   * Syncs latest CVEs from NVD API
   */
  scheduleCVESync() {
    const job = cron.schedule('0 */6 * * *', async () => {
      console.log('\n⏰ [CVE SYNC JOB] Starting CVE sync...');
      try {
        const result = await cveSync.syncCVEsFromNVD({
          maxResults: 100,
          resultsPerPage: 100,
          updateExisting: true
        });

        if (result.success) {
          console.log(`✅ [CVE SYNC JOB] ${result.message}`);

          // Send alert if critical CVEs found
          const criticalCVEs = db.prepare(`
            SELECT * FROM cves WHERE severity = 'critical' 
            ORDER BY published_date DESC LIMIT 5
          `).all();

          if (criticalCVEs.length > 0) {
            // Notify admins about critical CVEs
            await this.notifyAdminsAboutCritical(criticalCVEs);
          }
        } else {
          console.error(`❌ [CVE SYNC JOB] Failed:`, result.error);
        }
      } catch (error) {
        console.error(`❌ [CVE SYNC JOB] Error:`, error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 CVE Sync scheduled: Every 6 hours');
    return this;
  }

  /**
   * Schedule weekly vulnerability report
   * Sends every Monday at 9 AM
   */
  scheduleWeeklyReport() {
    const job = cron.schedule('0 9 * * 1', async () => {
      console.log('\n⏰ [WEEKLY REPORT JOB] Generating weekly reports...');
      try {
        // Get all admin users
        const admins = db.prepare(`
          SELECT * FROM users WHERE role = 'admin'
        `).all();

        for (const admin of admins) {
          const stats = db.prepare(`
            SELECT 
              COUNT(*) as totalCVEs,
              SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as criticalCount,
              SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as highCount,
              SUM(CASE WHEN published_date >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as newThisWeek
            FROM cves
          `).get();

          if (admin.email) {
            const result = await emailService.sendWeeklyReport(admin.email, {
              totalCVEs: stats.totalCVEs || 0,
              criticalCount: stats.criticalCount || 0,
              highCount: stats.highCount || 0,
              newThisWeek: stats.newThisWeek || 0
            });

            if (result.success) {
              console.log(`✅ [WEEKLY REPORT JOB] Report sent to ${admin.email}`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ [WEEKLY REPORT JOB] Error:`, error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 Weekly Report scheduled: Every Monday at 9 AM');
    return this;
  }

  /**
   * Schedule database cleanup
   * Removes CVEs older than 180 days
   */
  scheduleDatabaseCleanup() {
    const job = cron.schedule('0 2 * * *', () => {
      console.log('\n⏰ [CLEANUP JOB] Starting database cleanup...');
      try {
        const result = cveSync.cleanupOldCVEs(180);
        if (result.success) {
          console.log(`✅ [CLEANUP JOB] ${result.message}`);
        }
      } catch (error) {
        console.error(`❌ [CLEANUP JOB] Error:`, error.message);
      }
    });

    this.jobs.push(job);
    console.log('📅 Database Cleanup scheduled: Daily at 2 AM');
    return this;
  }

  /**
   * Notify admins about critical CVEs
   */
  async notifyAdminsAboutCritical(criticalCVEs) {
    try {
      const admins = db.prepare(`
        SELECT * FROM users WHERE role = 'admin'
      `).all();

      for (const admin of admins) {
        if (admin.email) {
          for (const cve of criticalCVEs.slice(0, 3)) {
            const cveData = {
              ...cve,
              cveId: cve.cve_id,
              affectedSoftware: typeof cve.affected_software === 'string'
                ? JSON.parse(cve.affected_software)
                : cve.affected_software || []
            };

            await emailService.sendCriticalAlert(admin.email, cveData, admin.first_name || 'Admin');
          }
        }
      }
    } catch (error) {
      console.error('Error notifying admins:', error.message);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAll() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('⏹️  All scheduled jobs stopped');
  }

  /**
   * Get list of scheduled jobs
   */
  getJobs() {
    return {
      count: this.jobs.length,
      enabled: this.enabled,
      jobs: [
        'CVE Sync (every 6 hours)',
        'Weekly Report (every Monday 9 AM)',
        'Database Cleanup (daily 2 AM)'
      ]
    };
  }
}

module.exports = new JobScheduler();
