#!/usr/bin/env node

/**
 * Mock CVE Data Population Script
 * Inserts mock CVE data for testing (when NVD API is unavailable/rate limited)
 * 
 * Usage:
 *   node populateMockData.js
 */

// Reuse initialized DB from database/init.js
const { db } = require('./database/init.js');

// Mock CVE data
const mockCVEs = [
  {
    cve_id: 'CVE-2024-1234',
    title: 'Apache OpenSSL Vulnerability - Critical Security Issue',
    description: 'A critical vulnerability in Apache OpenSSL versions before 1.1.1x allows remote attackers to execute arbitrary code.',
    severity: 'critical',
    severity_score: 9.8,
    affected_software: JSON.stringify(['apache/openssl', 'nginx/openssl']),
    published_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-1234'])
  },
  {
    cve_id: 'CVE-2024-5678',
    title: 'Windows Kernel Privilege Escalation',
    description: 'A privilege escalation vulnerability in Windows Kernel allows local attackers to gain SYSTEM privileges.',
    severity: 'critical',
    severity_score: 8.8,
    affected_software: JSON.stringify(['microsoft/windows', 'microsoft/windows_server']),
    published_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-5678'])
  },
  {
    cve_id: 'CVE-2024-9012',
    title: 'Linux Kernel Memory Leak',
    description: 'A memory leak vulnerability in Linux Kernel before 6.4 allows privilege escalation.',
    severity: 'high',
    severity_score: 7.8,
    affected_software: JSON.stringify(['linux/linux_kernel']),
    published_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-9012'])
  },
  {
    cve_id: 'CVE-2024-3456',
    title: 'PHP Remote Code Execution',
    description: 'Remote code execution vulnerability in PHP 8.1 and 8.2 before patched versions.',
    severity: 'critical',
    severity_score: 9.1,
    affected_software: JSON.stringify(['php/php']),
    published_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-3456'])
  },
  {
    cve_id: 'CVE-2024-7890',
    title: 'PostgreSQL SQL Injection',
    description: 'SQL injection vulnerability in PostgreSQL allows authenticated users to execute arbitrary SQL.',
    severity: 'high',
    severity_score: 7.2,
    affected_software: JSON.stringify(['postgresql/postgresql']),
    published_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-7890'])
  },
  {
    cve_id: 'CVE-2024-2468',
    title: 'Node.js Denial of Service',
    description: 'Denial of service vulnerability in Node.js HTTP server implementation.',
    severity: 'high',
    severity_score: 7.5,
    affected_software: JSON.stringify(['nodejs/node.js']),
    published_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-2468'])
  },
  {
    cve_id: 'CVE-2024-1357',
    title: 'Docker Container Escape',
    description: 'Container escape vulnerability in Docker allows breakout from container isolation.',
    severity: 'critical',
    severity_score: 9.3,
    affected_software: JSON.stringify(['docker/docker']),
    published_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-1357'])
  },
  {
    cve_id: 'CVE-2024-0246',
    title: 'MongoDB Authentication Bypass',
    description: 'Authentication bypass in MongoDB allows unauthorized access to databases.',
    severity: 'critical',
    severity_score: 8.6,
    affected_software: JSON.stringify(['mongodb/mongodb']),
    published_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-0246'])
  },
  {
    cve_id: 'CVE-2024-5555',
    title: 'Redis Buffer Overflow',
    description: 'Buffer overflow in Redis command parsing allows remote code execution.',
    severity: 'high',
    severity_score: 8.1,
    affected_software: JSON.stringify(['redis/redis']),
    published_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-5555'])
  },
  {
    cve_id: 'CVE-2024-9999',
    title: 'Java Reflection Security Vulnerability',
    description: 'Insecure reflection usage in Java libraries allows privilege escalation.',
    severity: 'medium',
    severity_score: 6.5,
    affected_software: JSON.stringify(['java/java', 'spring/spring-framework']),
    published_date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-9999'])
  },
  {
    cve_id: 'CVE-2024-8888',
    title: 'Kubernetes RBAC Bypass',
    description: 'RBAC bypass in Kubernetes allows users to escalate permissions.',
    severity: 'high',
    severity_score: 7.6,
    affected_software: JSON.stringify(['kubernetes/kubernetes']),
    published_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-8888'])
  },
  {
    cve_id: 'CVE-2024-7777',
    title: 'Elasticsearch XPath Injection',
    description: 'XPath injection vulnerability in Elasticsearch query parser.',
    severity: 'high',
    severity_score: 7.3,
    affected_software: JSON.stringify(['elastic/elasticsearch']),
    published_date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-7777'])
  },
  {
    cve_id: 'CVE-2024-6666',
    title: 'AWS Lambda Timing Attack',
    description: 'Timing attack vulnerability in AWS Lambda execution environment.',
    severity: 'medium',
    severity_score: 5.9,
    affected_software: JSON.stringify(['amazon/aws-lambda']),
    published_date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-6666'])
  },
  {
    cve_id: 'CVE-2024-4444',
    title: 'Ruby on Rails Information Disclosure',
    description: 'Information disclosure vulnerability in Ruby on Rails cookie handling.',
    severity: 'medium',
    severity_score: 6.1,
    affected_software: JSON.stringify(['rubyonrails/rails']),
    published_date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-4444'])
  },
  {
    cve_id: 'CVE-2024-3333',
    title: 'Django CSRF Token Bypass',
    description: 'CSRF token bypass vulnerability in Django framework.',
    severity: 'high',
    severity_score: 7.4,
    affected_software: JSON.stringify(['django/django']),
    published_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-3333'])
  },
  {
    cve_id: 'CVE-2024-2222',
    title: 'GIT Arbitrary File Read',
    description: 'Arbitrary file read vulnerability in Git command execution.',
    severity: 'high',
    severity_score: 7.8,
    affected_software: JSON.stringify(['git/git']),
    published_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-2222'])
  },
  {
    cve_id: 'CVE-2024-1111',
    title: 'OpenSSL Cryptographic Weakness',
    description: 'Weak cryptographic implementation in OpenSSL allows algorithm downgrade.',
    severity: 'medium',
    severity_score: 5.3,
    affected_software: JSON.stringify(['openssl/openssl']),
    published_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    last_modified: new Date().toISOString(),
    reference_urls: JSON.stringify(['https://nvd.nist.gov/vuln/detail/CVE-2024-1111'])
  }
];

const insertMockData = () => {
  console.log('🚀 Mock CVE Data Population\n');
  console.log('📥 Inserting mock CVE data...\n');

  let inserted = 0;
  let skipped = 0;

  for (const cve of mockCVEs) {
    try {
      const existing = db.prepare('SELECT id FROM cves WHERE cve_id = ?').get(cve.cve_id);
      
      if (!existing) {
        db.prepare(`
          INSERT INTO cves (
            cve_id, title, description, severity, severity_score,
            affected_software, published_date, last_modified, reference_urls
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          cve.cve_id,
          cve.title,
          cve.description,
          cve.severity,
          cve.severity_score,
          cve.affected_software,
          cve.published_date,
          cve.last_modified,
          cve.reference_urls
        );
        inserted++;
        console.log(`✅ Inserted ${cve.cve_id}`);
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error inserting ${cve.cve_id}:`, error.message);
    }
  }

  // Get stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
    FROM cves
  `).get();

  console.log('\n✅ Insertion Complete\n');
  console.log(`📊 Results:`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`\n📈 Database Statistics`);
  console.log(`   Total CVEs: ${stats.total}`);
  console.log(`   🔴 Critical: ${stats.critical}`);
  console.log(`   🟠 High: ${stats.high}`);
  console.log(`   🟡 Medium: ${stats.medium}`);
  console.log(`   🟢 Low: ${stats.low}`);

  console.log('\n✨ Done!');
};

insertMockData();
