/**
 * API Testing Script
 * Tests all major endpoints of CVEarity backend
 */

const http = require('http');

// Utility function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test runner
async function runTests() {
  console.log('🚀 Starting API Tests for CVEarity Backend\n');
  console.log('='.repeat(60));

  let passCount = 0;
  let failCount = 0;

  // Test 1: Health Check
  try {
    console.log('\n📋 TEST 1: Health Check');
    const result = await makeRequest('GET', '/health');
    if (result.status === 200 && result.data.status === 'Server is running') {
      console.log('✅ PASS: Health check endpoint working');
      passCount++;
    } else {
      console.log('❌ FAIL: Unexpected response');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: Health check -', err.message);
    failCount++;
  }

  // Test 2: Register User
  try {
    console.log('\n📋 TEST 2: User Registration');
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      company: 'Test Company',
      password: 'password123'
    };
    const result = await makeRequest('POST', '/api/auth/register', registerData);
    if (result.status === 201 && result.data.success) {
      console.log('✅ PASS: User registration working');
      passCount++;
    } else {
      console.log('❌ FAIL:', result.data.message || 'Unknown error');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: Registration -', err.message);
    failCount++;
  }

  // Test 3: Login
  try {
    console.log('\n📋 TEST 3: User Login');
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    const result = await makeRequest('POST', '/api/auth/login', loginData);
    if (result.status === 200 && result.data.success && result.data.data && result.data.data.token) {
      console.log('✅ PASS: Login working, token generated');
      global.authToken = result.data.data.token;
      passCount++;
    } else {
      console.log('❌ FAIL:', result.data.message || 'Unknown error');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: Login -', err.message);
    failCount++;
  }

  // Test 4: Get CVE List
  try {
    console.log('\n📋 TEST 4: Get CVE List');
    const result = await makeRequest('GET', '/api/cves?page=1&limit=10');
    if (result.status === 200 && result.data.success && Array.isArray(result.data.cves)) {
      console.log(`✅ PASS: CVE list loaded (${result.data.cves.length} items)`);
      passCount++;
    } else {
      console.log('❌ FAIL: Could not retrieve CVE list');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: CVE list -', err.message);
    failCount++;
  }

  // Test 5: Filter CVEs by Severity
  try {
    console.log('\n📋 TEST 5: Filter CVEs by Severity');
    const result = await makeRequest('GET', '/api/cves?severity=CRITICAL&page=1&limit=10');
    if (result.status === 200 && result.data.success) {
      console.log(`✅ PASS: Severity filter working (found ${result.data.cves.length} critical CVEs)`);
      passCount++;
    } else {
      console.log('❌ FAIL: Could not filter by severity');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: Severity filter -', err.message);
    failCount++;
  }

  // Test 6: Search CVEs
  try {
    console.log('\n📋 TEST 6: Search CVEs');
    const result = await makeRequest('GET', '/api/cves?search=sql&page=1&limit=10');
    if (result.status === 200 && result.data.success) {
      console.log(`✅ PASS: CVE search working (found ${result.data.cves.length} results)`);
      passCount++;
    } else {
      console.log('❌ FAIL: Could not search CVEs');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: CVE search -', err.message);
    failCount++;
  }

  // Test 7: Get CVE Statistics
  try {
    console.log('\n📋 TEST 7: Get CVE Statistics');
    const result = await makeRequest('GET', '/api/cves/statistics');
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASS: CVE statistics endpoint working');
      console.log(`   Total CVEs: ${result.data.data.totalCVEs}`);
      passCount++;
    } else {
      console.log('❌ FAIL: Could not get statistics');
      failCount++;
    }
  } catch (err) {
    console.log('❌ FAIL: Statistics -', err.message);
    failCount++;
  }

  // Test 8: Get Admin Users (requires auth)
  if (global.authToken) {
    try {
      console.log('\n📋 TEST 8: Get Admin Users List');
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(data)
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                data: data
              });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });

      if (result.status === 200 && result.data.success && Array.isArray(result.data.users)) {
        console.log(`✅ PASS: Admin users endpoint working (${result.data.users.length} users)`);
        passCount++;
      } else {
        console.log('❌ FAIL: Could not get users list');
        failCount++;
      }
    } catch (err) {
      console.log('❌ FAIL: Admin users -', err.message);
      failCount++;
    }
  }

  // Test 9: Get Activity Logs (requires auth)
  if (global.authToken) {
    try {
      console.log('\n📋 TEST 9: Get Activity Logs');
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/activity-logs?page=1&limit=10',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.authToken}`,
          'Content-Type': 'application/json'
        }
      };

      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve({
                status: res.statusCode,
                data: JSON.parse(data)
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                data: data
              });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });

      if (result.status === 200 && result.data.success && Array.isArray(result.data.logs)) {
        console.log(`✅ PASS: Activity logs endpoint working (${result.data.logs.length} logs)`);
        passCount++;
      } else {
        console.log('❌ FAIL: Could not get activity logs');
        failCount++;
      }
    } catch (err) {
      console.log('❌ FAIL: Activity logs -', err.message);
      failCount++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 TEST SUMMARY`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%\n`);

  if (failCount === 0) {
    console.log('🎉 All tests passed! APIs are working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.\n');
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
