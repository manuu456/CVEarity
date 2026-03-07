#!/usr/bin/env node

/**
 * CVE Database Population Script
 * Fetches CVEs from NVD API and populates the database
 * 
 * Usage:
 *   node populateDatabase.js [--count=100] [--search=keyword]
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const cveSync = require('./controllers/cveSync');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    count: 100,
    search: null
  };

  args.forEach(arg => {
    if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1]);
    }
    if (arg.startsWith('--search=')) {
      options.search = arg.split('=')[1];
    }
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  });

  return options;
};

const showHelp = () => {
  console.log(`
CVEarity Database Population Script
===================================

Usage: node populateDatabase.js [options]

Options:
  --count=N      Number of CVEs to fetch (default: 100, max: 2000)
  --search=KEYWORD  Search for specific CVEs (e.g., "Apache OR OpenSSL")
  --help         Show this help message

Examples:
  node populateDatabase.js                    # Fetch 100 recent CVEs
  node populateDatabase.js --count=500       # Fetch 500 CVEs
  node populateDatabase.js --search=Apache   # Search for Apache CVEs
  `);
};

const main = async () => {
  const options = parseArgs();

  console.log('🚀 CVEarity Database Population Script');
  console.log('=====================================\n');

  try {
    let result;

    if (options.search) {
      console.log(`🔍 Searching for CVEs containing: "${options.search}"`);
      console.log('Please wait...\n');
      result = await cveSync.searchAndSyncCVEs(options.search);
    } else {
      const count = Math.min(Math.max(options.count, 10), 2000);
      console.log(`📥 Fetching ${count} recent CVEs from NVD API...`);
      console.log('Please wait...\n');
      
      result = await cveSync.syncCVEsFromNVD({
        maxResults: count,
        resultsPerPage: Math.min(count, 100)
      });
    }

    // Display results
    if (result.success) {
      console.log('\n✅ SUCCESS\n');
      if (options.search) {
        console.log(`📊 Results for: "${options.search}"`);
        console.log(`   Total found: ${result.total}`);
        console.log(`   Newly synced: ${result.synced}`);
      } else {
        console.log(result.message);
        console.log(`   New CVEs: ${result.synced}`);
        console.log(`   Updated CVEs: ${result.updated}`);
        console.log(`   Skipped CVEs: ${result.skipped}`);
      }
    } else {
      console.log('\n❌ FAILED\n');
      console.log(`Error: ${result.error}`);
      process.exit(1);
    }

    // Show database stats
    const stats = cveSync.getSyncStats();
    if (stats.success) {
      console.log('\n📈 Database Statistics');
      console.log(`   Total CVEs: ${stats.stats.totalCVEs}`);
      console.log(`   Critical: ${stats.stats.bySeverity.critical}`);
      console.log(`   High: ${stats.stats.bySeverity.high}`);
      console.log(`   Medium: ${stats.stats.bySeverity.medium}`);
      console.log(`   Low: ${stats.stats.bySeverity.low}`);
      if (stats.stats.dateRange.oldest) {
        console.log(`   Date range: ${stats.stats.dateRange.oldest} to ${stats.stats.dateRange.newest}`);
      }
    }

    console.log('\n✨ Population complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
};

main();
