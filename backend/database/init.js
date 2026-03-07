const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let DB = null;
let db = null;

// Initialize database
const initDatabase = async () => {
  if (DB) return db;

  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'cvearity.db');

  // Load existing database or create new
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
  }

  DB = SQL;

  // Create tables
  createTables();

  // Save database to file
  saveDatabase();

  return db;
};

// Save database to file
const saveDatabase = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbPath = path.join(__dirname, 'cvearity.db');
    fs.writeFileSync(dbPath, buffer);
  }
};

// Create tables
const createTables = () => {
  if (!db) return;

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      first_name TEXT,
      last_name TEXT,
      company TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1
    )
  `);

  // Sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Activity logs
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Admin settings
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT,
      updated_by INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (updated_by) REFERENCES users (id)
    )
  `);

  // CVEs table
  db.run(`
    CREATE TABLE IF NOT EXISTS cves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cve_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL,
      severity_score REAL,
      affected_software TEXT,
      published_date TEXT NOT NULL,
      last_modified TEXT,
      reference_urls TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin user if not exists
  try {
    const adminResult = db.exec('SELECT id FROM users WHERE role = "admin"');
    if (!adminResult || adminResult.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);

      db.run(`
        INSERT INTO users (username, email, password, role, first_name, last_name, company)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['admin', 'admin@cvearity.com', hashedPassword, 'admin', 'System', 'Administrator', 'CVEarity']);
    }
  } catch (err) {
    // Admin user might already exist
  }

  // Insert default settings
  const settings = [
    ['site_name', 'CVEarity'],
    ['site_description', 'Advanced Vulnerability Intelligence Platform'],
    ['allow_registration', 'true'],
    ['max_login_attempts', '5'],
    ['session_timeout', '24'],
    ['email_notifications', 'true']
  ];

  settings.forEach(([key, value]) => {
    try {
      db.run(`
        INSERT OR IGNORE INTO admin_settings (setting_key, setting_value)
        VALUES (?, ?)
      `, [key, value]);
    } catch (err) {
      // Setting might already exist
    }
  });

  // Insert sample CVE data if table is empty
  try {
    const cveResult = db.exec('SELECT COUNT(*) as count FROM cves');
    const cveCount = cveResult && cveResult.length > 0 ? cveResult[0].values[0][0] : 0;

    if (cveCount === 0) {
      const sampleCVEs = [
        {
          cve_id: 'CVE-2026-001',
          title: 'Critical Remote Code Execution in Popular Web Framework',
          description: 'A critical vulnerability in a widely-used web framework allows remote code execution.',
          severity: 'critical',
          severity_score: 9.8,
          affected_software: JSON.stringify(['WebFramework 2.1.x', 'WebFramework 2.2.x']),
          published_date: '2026-01-15',
          last_modified: '2026-01-15',
          reference_urls: JSON.stringify(['https://example.com/cve-2026-001'])
        },
        {
          cve_id: 'CVE-2026-002',
          title: 'High Severity SQL Injection in Database Driver',
          description: 'SQL injection vulnerability in popular database driver allows unauthorized data access.',
          severity: 'high',
          severity_score: 8.5,
          affected_software: JSON.stringify(['DatabaseDriver 1.0.x', 'DatabaseDriver 1.1.x']),
          published_date: '2026-01-20',
          last_modified: '2026-01-20',
          reference_urls: JSON.stringify(['https://example.com/cve-2026-002'])
        },
        {
          cve_id: 'CVE-2026-003',
          title: 'Medium Severity Cross-Site Scripting in Admin Panel',
          description: 'Reflected XSS vulnerability in administrative interface.',
          severity: 'medium',
          severity_score: 6.1,
          affected_software: JSON.stringify(['AdminPanel 3.0.x', 'AdminPanel 3.1.x']),
          published_date: '2026-01-25',
          last_modified: '2026-01-25',
          reference_urls: JSON.stringify(['https://example.com/cve-2026-003'])
        },
        {
          cve_id: 'CVE-2026-004',
          title: 'Low Severity Information Disclosure in API',
          description: 'API endpoint leaks sensitive information in error responses.',
          severity: 'low',
          severity_score: 3.7,
          affected_software: JSON.stringify(['API Server 4.0.x', 'API Server 4.1.x']),
          published_date: '2026-02-01',
          last_modified: '2026-02-01',
          reference_urls: JSON.stringify(['https://example.com/cve-2026-004'])
        },
        {
          cve_id: 'CVE-2026-005',
          title: 'High Severity Privilege Escalation',
          description: 'Privilege escalation vulnerability allows regular users to gain admin access.',
          severity: 'high',
          severity_score: 8.2,
          affected_software: JSON.stringify(['UserManager 2.0.x', 'UserManager 2.1.x']),
          published_date: '2026-02-05',
          last_modified: '2026-02-05',
          reference_urls: JSON.stringify(['https://example.com/cve-2026-005'])
        },
        {
          cve_id: 'CVE-2026-006',
          title: 'Critical Buffer Overflow in Network Library',
          description: 'Buffer overflow in network library leads to remote code execution.',
          severity: 'critical',
          severity_score: 9.1,
          affected_software: JSON.stringify(['NetworkLib 1.5.x', 'NetworkLib 1.6.x']),
          published_date: '2026-02-10',
          last_modified: '2026-02-10',
          reference_urls: JSON.stringify(['https://example.com/cve-2026-006'])
        }
      ];

      sampleCVEs.forEach(cve => {
        db.run(`
          INSERT INTO cves (cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [cve.cve_id, cve.title, cve.description, cve.severity, cve.severity_score, cve.affected_software, cve.published_date, cve.last_modified, cve.reference_urls]);
      });
    }
  } catch (err) {
    console.error('Error with CVE data:', err);
  }
};

// Database utility functions
const mapResultToObjects = (execResult) => {
  if (!execResult || execResult.length === 0) return [];
  const colNames = execResult[0].columns;
  return execResult[0].values.map(row => {
    const obj = {};
    colNames.forEach((col, idx) => { obj[col] = row[idx]; });
    return obj;
  });
};

const dbUtils = {
  // User operations
  getUserById: (id) => {
    const result = db.exec('SELECT id, username, email, password, role, first_name, last_name, company, created_at, is_active FROM users WHERE id = ?', [id]);
    const objects = mapResultToObjects(result);
    return objects.length > 0 ? objects[0] : null;
  },
  
  getUserByUsername: (username) => {
    const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
    const objects = mapResultToObjects(result);
    return objects.length > 0 ? objects[0] : null;
  },

  getUserByEmail: (email) => {
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    const objects = mapResultToObjects(result);
    return objects.length > 0 ? objects[0] : null;
  },

  createUser: (username, email, password, role, first_name, last_name, company) => {
    db.run(`
      INSERT INTO users (username, email, password, role, first_name, last_name, company)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [username, email, password, role, first_name, last_name, company]);
    saveDatabase();
    const res = db.exec('SELECT last_insert_rowid() as id');
    return { lastInsertRowid: res[0].values[0][0] };
  },

  updateUser: (id, first_name, last_name, company) => {
    db.run(`
      UPDATE users SET first_name = ?, last_name = ?, company = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [first_name, last_name, company, id]);
    saveDatabase();
  },

  updateUserPassword: (id, password) => {
    db.run(`
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [password, id]);
    saveDatabase();
  },

  getAllUsers: () => {
    const result = db.exec('SELECT id, username, email, role, first_name, last_name, company, created_at, is_active FROM users ORDER BY created_at DESC');
    return mapResultToObjects(result);
  },

  // CVE operations
  getAllCVEs: () => {
    const result = db.exec('SELECT * FROM cves ORDER BY published_date DESC');
    return mapResultToObjects(result);
  },

  getCVEById: (cve_id) => {
    const result = db.exec('SELECT * FROM cves WHERE cve_id = ?', [cve_id]);
    const objects = mapResultToObjects(result);
    return objects.length > 0 ? objects[0] : null;
  },

  getCVEsBySeverity: (severity) => {
    const result = db.exec('SELECT * FROM cves WHERE severity = ? ORDER BY published_date DESC', [severity]);
    return mapResultToObjects(result);
  },

  searchCVEs: (query) => {
    const searchTerm = `%${query}%`;
    const result = db.exec('SELECT * FROM cves WHERE title LIKE ? OR description LIKE ? OR cve_id LIKE ? ORDER BY published_date DESC', [searchTerm, searchTerm, searchTerm]);
    return mapResultToObjects(result);
  },

  insertCVE: (cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls) => {
    db.run(`
      INSERT INTO cves (cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls]);
    saveDatabase();
  },

  // Settings operations
  getSetting: (key) => {
    const result = db.exec('SELECT setting_value FROM admin_settings WHERE setting_key = ?', [key]);
    const objects = mapResultToObjects(result);
    return objects.length > 0 ? objects[0].setting_value : null;
  },

  updateSetting: (key, value, updated_by) => {
    db.run('UPDATE admin_settings SET setting_value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?', [value, updated_by, key]);
    saveDatabase();
  }
};

// Create a statements object that mimics prepared statements interface
const statements = {
  getUserById: {
    get: (id) => dbUtils.getUserById(id)
  },
  getUserByUsername: {
    get: (username) => dbUtils.getUserByUsername(username)
  },
  getUserByEmail: {
    get: (email) => dbUtils.getUserByEmail(email)
  },
  createUser: {
    run: (username, email, password, role, first_name, last_name, company) => 
      dbUtils.createUser(username, email, password, role, first_name, last_name, company)
  },
  updateUser: {
    run: (first_name, last_name, company, id) => 
      dbUtils.updateUser(id, first_name, last_name, company)
  },
  updateUserPassword: {
    run: (password, id) => 
      dbUtils.updateUserPassword(id, password)
  },
  getAllUsers: {
    all: () => dbUtils.getAllUsers()
  },
  getAllCVEs: {
    all: () => dbUtils.getAllCVEs()
  },
  getCVEById: {
    get: (id) => dbUtils.getCVEById(id)
  },
  getCVEsBySeverity: {
    all: (severity) => dbUtils.getCVEsBySeverity(severity)
  },
  searchCVEs: {
    all: (query, query2, query3) => dbUtils.searchCVEs(query)
  },
  getCVEsCount: {
    get: () => {
      const result = db.exec('SELECT COUNT(*) as count FROM cves');
      const objects = mapResultToObjects(result);
      return objects.length > 0 ? objects[0] : { count: 0 };
    }
  },
  getCVEsBySeverityCount: {
    all: () => {
      const result = db.exec('SELECT severity, COUNT(*) as count FROM cves GROUP BY severity');
      return mapResultToObjects(result);
    }
  },
  getCVEsByYearCount: {
    all: () => {
      const result = db.exec('SELECT substr(published_date, 1, 4) as year, COUNT(*) as count FROM cves GROUP BY year ORDER BY year');
      return mapResultToObjects(result);
    }
  },
  getCVEsByYear: {
    all: (yearPattern) => {
      const result = db.exec('SELECT * FROM cves WHERE published_date LIKE ? ORDER BY published_date DESC', [yearPattern]);
      return mapResultToObjects(result);
    }
  },
  getRecentCriticalAlerts: {
    all: (severity, limit) => {
      const result = db.exec('SELECT cve_id, title, severity FROM cves WHERE severity = ? ORDER BY published_date DESC LIMIT ?', [severity, limit]);
      return mapResultToObjects(result);
    }
  },
  insertCVE: {
    run: (cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls) =>
      dbUtils.insertCVE(cve_id, title, description, severity, severity_score, affected_software, published_date, last_modified, reference_urls)
  },
  getAllSettings: {
    all: () => {
      const result = db.exec('SELECT * FROM admin_settings ORDER BY setting_key');
      return mapResultToObjects(result);
    }
  },
  updateSetting: {
    run: (value, updated_by, key) => 
      dbUtils.updateSetting(key, value, updated_by)
  },
  logActivity: {
    run: (user_id, action, details, ip_address, user_agent) => {
      if (db) {
        console.log('BINDINGS:', [user_id, action, details, ip_address || null, user_agent || null]);
        db.run(`
          INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?)
        `, [user_id, action, details, ip_address || null, user_agent || null]);
        saveDatabase();
      }
    }
  },
  updateUserWithRole: {
    run: (first_name, last_name, company, role, is_active, id) => {
      if (db) {
        db.run(`
          UPDATE users SET first_name = ?, last_name = ?, company = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [first_name, last_name, company, role, is_active, id]);
        saveDatabase();
      }
    }
  },
  deactivateUser: {
    run: (id) => {
      if (db) {
        db.run('UPDATE users SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        saveDatabase();
      }
    }
  },
  activateUser: {
    run: (id) => {
      if (db) {
        db.run('UPDATE users SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
        saveDatabase();
      }
    }
  },
  getAllActivityLogs: {
    all: () => {
      const result = db.exec('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 1000');
      return mapResultToObjects(result);
    }
  }
};

module.exports = {
  initDatabase,
  db: () => db,
  saveDatabase,
  statements,
  ...dbUtils
};