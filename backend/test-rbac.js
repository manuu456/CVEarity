/**
 * Role-Based Access Control Testing
 * Verifies that non-admin users cannot access admin routes
 */

const http = require('http');

function makeRequest(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: url,
      method: method,
      headers: headers
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

async function testRBAC() {
  console.log('\n🔐 ROLE-BASED ACCESS CONTROL TESTING\n' + '='.repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

  // Step 1: Create a regular (non-admin) user
  let regularUserToken = null;
  try {
    console.log('\n📋 SETUP: Create Regular User');
    const registerData = {
      firstName: 'Regular',
      lastName: 'User',
      username: 'regularuser' + Date.now(),
      email: 'regular' + Date.now() + '@example.com',
      company: 'Regular Co',
      password: 'UserPass123'
    };
    
    const result = await makeRequest('POST', '/api/auth/register', registerData);
    if (result.status === 201 && result.data.success) {
      console.log('✅ Regular user created');
      
      // Login as regular user
      const loginResult = await makeRequest('POST', '/api/auth/login', {
        username: registerData.username,
        password: registerData.password
      });
      
      if (loginResult.status === 200 && loginResult.data.data.token) {
        regularUserToken = loginResult.data.data.token;
        console.log(`   - Username: ${registerData.username}`);
        console.log(`   - Role: ${loginResult.data.data.user.role}`);
      }
    }
  } catch (err) {
    console.log('⚠️  Setup error:', err.message);
  }

  // Get admin token for comparison
  let adminToken = null;
  try {
    console.log('\n📋 SETUP: Login as Admin');
    const result = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (result.status === 200 && result.data.data.token) {
      adminToken = result.data.data.token;
      console.log('✅ Admin user logged in');
      console.log(`   - Role: ${result.data.data.user.role}`);
    }
  } catch (err) {
    console.log('⚠️  Admin login error:', err.message);
  }

  console.log('\n' + '-'.repeat(60));
  console.log('RBAC Tests');
  console.log('-'.repeat(60));

  // Test 1: Regular user accessing /api/admin/users (should fail)
  try {
    console.log('\n📋 TEST 1: Regular User → /api/admin/users');
    if (regularUserToken) {
      const result = await makeRequest('GET', '/api/admin/users', null, regularUserToken);
      if (result.status === 403 || result.status === 401) {
        console.log('✅ PASS: Access DENIED (status: ' + result.status + ')');
        console.log(`   - Message: ${result.data.message || 'Forbidden'}`);
        testsPassed++;
      } else if (result.status === 200) {
        console.log('❌ FAIL: Access ALLOWED (should be denied!)');
        testsFailed++;
      } else {
        console.log('⚠️  SKIP: Unexpected status', result.status);
      }
    } else {
      console.log('⚠️  SKIP: No regular user token');
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Test 2: Admin user accessing /api/admin/users (should succeed)
  try {
    console.log('\n📋 TEST 2: Admin User → /api/admin/users');
    if (adminToken) {
      const result = await makeRequest('GET', '/api/admin/users', null, adminToken);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: Access ALLOWED (status: 200)');
        console.log(`   - Users retrieved: ${result.data.users.length}`);
        testsPassed++;
      } else {
        console.log('❌ FAIL: Access DENIED (should be allowed!)');
        console.log(`   - Status: ${result.status}`);
        testsFailed++;
      }
    } else {
      console.log('⚠️  SKIP: No admin token');
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Test 3: Regular user accessing /api/admin/activity-logs (should fail)
  try {
    console.log('\n📋 TEST 3: Regular User → /api/admin/activity-logs');
    if (regularUserToken) {
      const result = await makeRequest('GET', '/api/admin/activity-logs', null, regularUserToken);
      if (result.status === 403 || result.status === 401) {
        console.log('✅ PASS: Access DENIED (status: ' + result.status + ')');
        testsPassed++;
      } else if (result.status === 200) {
        console.log('❌ FAIL: Access ALLOWED (should be denied!)');
        testsFailed++;
      }
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Test 4: Admin user accessing /api/admin/activity-logs (should succeed)
  try {
    console.log('\n📋 TEST 4: Admin User → /api/admin/activity-logs');
    if (adminToken) {
      const result = await makeRequest('GET', '/api/admin/activity-logs', null, adminToken);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: Access ALLOWED');
        console.log(`   - Logs retrieved: ${result.data.logs?.length || 0}`);
        testsPassed++;
      } else {
        console.log('❌ FAIL: Access DENIED (should be allowed!)');
        testsFailed++;
      }
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Test 5: Regular user accessing /api/auth/profile (should succeed)
  try {
    console.log('\n📋 TEST 5: Regular User → /api/auth/profile (owns profile)');
    if (regularUserToken) {
      const result = await makeRequest('GET', '/api/auth/profile', null, regularUserToken);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: Own profile accessible');
        console.log(`   - User: ${result.data.data.user.username}`);
        testsPassed++;
      } else {
        console.log('❌ FAIL: Could not access own profile');
        testsFailed++;
      }
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Test 6: Unauthenticated access to protected route (should fail)
  try {
    console.log('\n📋 TEST 6: No Token → /api/admin/users');
    const result = await makeRequest('GET', '/api/admin/users', null, null);
    if (result.status === 401 || result.status === 403) {
      console.log('✅ PASS: Access DENIED (status: ' + result.status + ')');
      console.log(`   - Message: ${result.data.message || 'Unauthorized'}`);
      testsPassed++;
    } else if (result.status === 200) {
      console.log('❌ FAIL: Access ALLOWED without token (security issue!)');
      testsFailed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Test 7: CVE endpoints accessible to all users
  try {
    console.log('\n📋 TEST 7: Regular User → /api/cves (public endpoint)');
    if (regularUserToken) {
      const result = await makeRequest('GET', '/api/cves', null, regularUserToken);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: CVE endpoint accessible to regular users');
        testsPassed++;
      } else {
        console.log('❌ FAIL: CVE endpoint not accessible');
        testsFailed++;
      }
    }
  } catch (err) {
    console.log('❌ FAIL: Error -', err.message);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n🔒 RBAC TEST SUMMARY');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  const total = testsPassed + testsFailed;
  if (total > 0) {
    console.log(`📈 Success Rate: ${((testsPassed / total) * 100).toFixed(1)}%\n`);
  }

  return {
    passed: testsPassed,
    failed: testsFailed,
    total: total
  };
}

testRBAC().catch(console.error);
