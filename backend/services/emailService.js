/**
 * Email Notification Service
 * Sends email alerts for critical vulnerabilities and events
 */

const nodemailer = require('nodemailer');

// Email configuration (can be customized via environment variables)
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Email templates
 */
const emailTemplates = {
  criticalAlert: (cve, recipientName) => ({
    subject: `🚨 CRITICAL: ${cve.cveId} - ${cve.title}`,
    html: `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 4px; }
            .alert { background: #fee; border-left: 4px solid #f44; padding: 15px; margin: 15px 0; }
            .badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .critical { background: #f44; color: white; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; width: 120px; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 Critical Vulnerability Alert</h2>
              <p>A critical vulnerability has been detected in your environment</p>
            </div>
            
            <div class="alert">
              <h3>${cve.cveId}</h3>
              <p>${cve.title}</p>
              <span class="badge critical">CRITICAL</span>
            </div>
            
            <div class="details">
              <h3>Vulnerability Details</h3>
              <div class="detail-row">
                <span class="label">CVE ID:</span>
                <span>${cve.cveId}</span>
              </div>
              <div class="detail-row">
                <span class="label">Severity:</span>
                <span>${cve.severity.toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="label">CVSS Score:</span>
                <span>${cve.severityScore || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Published:</span>
                <span>${cve.publishedDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Description:</span>
                <span>${cve.description.substring(0, 200)}...</span>
              </div>
              <div class="detail-row">
                <span class="label">Affected Software:</span>
                <span>${cve.affectedSoftware.join(', ')}</span>
              </div>
            </div>
            
            <a href="${process.env.APP_URL || 'http://localhost:3003'}/cve/${cve.cveId}" class="button">View Full Details</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              You received this email because you're subscribed to critical vulnerability alerts.
              <br><a href="#">Manage preferences</a>
            </p>
          </div>
        </body>
      </html>
    `
  }),

  newCVENotification: (cveCount, topCVEs) => ({
    subject: `📊 CVEarity Update: ${cveCount} New Vulnerabilities`,
    html: `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #00d2d3 0%, #0084b4 100%); color: white; padding: 20px; border-radius: 4px; }
            .cve-item { background: #f9f9f9; border-left: 4px solid #00d2d3; padding: 15px; margin: 10px 0; border-radius: 4px; }
            .badge { display: inline-block; padding: 3px 10px; border-radius: 15px; font-size: 11px; font-weight: bold; margin-right: 8px; }
            .critical { background: #f44; color: white; }
            .high { background: #ff9800; color: white; }
            .medium { background: #ffc107; color: #333; }
            .button { display: inline-block; padding: 10px 20px; background: #00d2d3; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📊 CVEarity Daily Update</h2>
              <p>${cveCount} new vulnerabilities detected</p>
            </div>
            
            <h3>Top Vulnerabilities</h3>
            ${topCVEs.map(cve => `
              <div class="cve-item">
                <h4>${cve.cveId}</h4>
                <p>${cve.title}</p>
                <div>
                  <span class="badge ${cve.severity === 'critical' ? 'critical' : cve.severity === 'high' ? 'high' : 'medium'}">
                    ${cve.severity.toUpperCase()}
                  </span>
                  <span>CVSS: ${cve.severityScore || 'N/A'}</span>
                </div>
              </div>
            `).join('')}
            
            <a href="${process.env.APP_URL || 'http://localhost:3003'}/dashboard" class="button">View All CVEs</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated update from CVEarity. <a href="#">Unsubscribe</a>
            </p>
          </div>
        </body>
      </html>
    `
  }),

  weeklyReport: (stats) => ({
    subject: '📈 CVEarity Weekly Vulnerability Report',
    html: `
      <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 4px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-box { background: #f0f0f0; padding: 15px; border-radius: 4px; text-align: center; }
            .stat-number { font-size: 28px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📈 Weekly Vulnerability Report</h2>
              <p>Your security posture summary</p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-number">${stats.totalCVEs}</div>
                <div class="stat-label">Total CVEs</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${stats.newThisWeek}</div>
                <div class="stat-label">New This Week</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${stats.criticalCount}</div>
                <div class="stat-label">Critical Issues</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${stats.highCount}</div>
                <div class="stat-label">High Risk</div>
              </div>
            </div>
            
            <h3>Action Items</h3>
            <ul style="line-height: 1.8;">
              <li>Review and prioritize the ${stats.criticalCount} critical vulnerabilities</li>
              <li>Plan remediation for ${stats.highCount} high-risk vulnerabilities</li>
              <li>Update your security policies</li>
              <li>Share report with stakeholders</li>
            </ul>
            
            <a href="${process.env.APP_URL || 'http://localhost:3003'}/admin/reports" class="button">View Full Report</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              © 2026 CVEarity. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `
  })
};

/**
 * Send critical vulnerability alert
 */
const sendCriticalAlert = async (recipientEmail, cveData, recipientName = 'User') => {
  try {
    const template = emailTemplates.criticalAlert(cveData, recipientName);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@cvearity.com',
      to: recipientEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Critical alert sent to ${recipientEmail}:`, info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send critical alert:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send new CVE notification
 */
const sendNewCVENotification = async (recipientEmail, cveCount, topCVEs) => {
  try {
    const template = emailTemplates.newCVENotification(cveCount, topCVEs);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@cvearity.com',
      to: recipientEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`CVE notification sent to ${recipientEmail}:`, info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send CVE notification:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send weekly report
 */
const sendWeeklyReport = async (recipientEmail, stats) => {
  try {
    const template = emailTemplates.weeklyReport(stats);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@cvearity.com',
      to: recipientEmail,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Weekly report sent to ${recipientEmail}:`, info.response);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send weekly report:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test email configuration
 */
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service connected successfully');
    return { success: true, message: 'Email service is working' };
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendCriticalAlert,
  sendNewCVENotification,
  sendWeeklyReport,
  testEmailConnection,
  transporter
};
