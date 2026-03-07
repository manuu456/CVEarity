/**
 * Frontend UI Testing Script
 * Simulates user interactions with the application
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

async function testFrontendUI() {
  console.log('\n🧪 FRONTEND UI TESTING\n' + '='.repeat(60));

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Registration Form Submission
  try {
    console.log('\n📋 TEST 1: User Registration');
    const registerData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe' + Date.now(),
      email: 'john' + Date.now() + '@example.com',
      company: 'Tech Corp',
      password: 'SecurePass123'
    };
    
    const result = await makeRequest('POST', '/api/auth/register', registerData);
    if (result.status === 201 && result.data.success) {
      console.log('✅ PASS: New user registered successfully');
      console.log(`   - Username: ${registerData.username}`);
      console.log(`   - Email: ${registerData.email}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Registration failed');
      testsFailed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Registration error -', err.message);
    testsFailed++;
  }

  // Test 2: Login with Registered User
  let userToken = null;
  try {
    console.log('\n📋 TEST 2: User Login');
    const loginData = {
      username: 'admin',
      password: 'admin123'
    };
    
    const result = await makeRequest('POST', '/api/auth/login', loginData);
    if (result.status === 200 && result.data.success && result.data.data.token) {
      console.log('✅ PASS: User logged in successfully');
      console.log(`   - Role: ${result.data.data.user.role}`);
      userToken = result.data.data.token;
      testsPassed++;
    } else {
      console.log('❌ FAIL: Login failed -', result.data.message);
      testsFailed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Login error -', err.message);
    testsFailed++;
  }

  // Test 3: Access Dashboard (View CVEs)
  try {
    console.log('\n📋 TEST 3: Access CVE Dashboard');
    const result = await makeRequest('GET', '/api/cves');
    if (result.status === 200 && result.data.success && Array.isArray(result.data.cves)) {
      console.log('✅ PASS: Dashboard loaded with CVEs');
      console.log(`   - Total CVEs: ${result.data.cves.length}`);
      console.log(`   - Sample CVE: ${result.data.cves[0]?.cveId || 'N/A'}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Could not load CVE dashboard');
      testsFailed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Dashboard error -', err.message);
    testsFailed++;
  }

  // Test 4: CVE Filtering
  try {
    console.log('\n📋 TEST 4: Filter CVEs by Severity');
    const result = await makeRequest('GET', '/api/cves?severity=HIGH');
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASS: CVE filtering working');
      console.log(`   - Found ${result.data.cves.length} HIGH severity CVEs`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Filtering failed');
      testsFailed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Filter error -', err.message);
    testsFailed++;
  }

  // Test 5: CVE Search
  try {
    console.log('\n📋 TEST 5: Search CVEs');
    const result = await makeRequest('GET', '/api/cves?search=injection');
    if (result.status === 200 && result.data.success) {
      console.log('✅ PASS: CVE search working');
      console.log(`   - Found ${result.data.cves.length} results for "injection"`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Search failed');
      testsFailed++;
    }
  } catch (err) {
    console.log('❌ FAIL: Search error -', err.message);
    testsFailed++;
  }

  // Test 6: View CVE Details
  try {
    console.log('\n📋 TEST 6: View CVE Details');
    // First get a CVE ID
    const listResult = await makeRequest('GET', '/api/cves');
    if (listResult.data.cves && listResult.data.cves.length > 0) {
      const cveId = listResult.data.cves[0].cveId;
      const result = await makeRequest('GET', `/api/cves/${cveId}`);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: CVE details loaded');
        console.log(`   - CVE: ${cveId}`);
        console.log(`   - Severity: ${result.data.data.severity}`);
        testsPassed++;
      } else {
        console.log('❌ FAIL: Could not load details');
        testsFailed++;
      }
    }
  } catch (err) {
    console.log('❌ FAIL: Details error -', err.message);
    testsFailed++;
  }

  // Test 7: Admin Dashboard Access (with admin token)
  try {
    console.log('\n📋 TEST 7: Access Admin Dashboard');
    if (userToken) {
      const result = await makeRequest('GET', '/api/admin/users', null, userToken);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: Admin dashboard accessible');
        console.log(`   - Total users: ${result.data.users.length}`);
        testsPassed++;
      } else {
        console.log('❌ FAIL: Admin access denied -', result.data.message);
        testsFailed++;
      }
    } else {
      console.log('⚠️  SKIP: No admin token available');
    }
  } catch (err) {
    console.log('❌ FAIL: Admin dashboard error -', err.message);
    testsFailed++;
  }

  // Test 8: User Profile Retrieval
  try {
    console.log('\n📋 TEST 8: Get User Profile');
    if (userToken) {
      const result = await makeRequest('GET', '/api/auth/profile', null, userToken);
      if (result.status === 200 && result.data.success) {
        console.log('✅ PASS: User profile retrieved');
        console.log(`   - User: ${result.data.data.user.username}`);
        console.log(`   - Email: ${result.data.data.user.email}`);
        testsPassed++;
      } else {
        console.log('❌ FAIL: Could not retrieve profile');
        testsFailed++;
      }
    }
  } catch (err) {
    console.log('❌ FAIL: Profile error -', err.message);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FRONTEND UI TEST SUMMARY');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  const total = testsPassed + testsFailed;
  console.log(`📈 Success Rate: ${((testsPassed / total) * 100).toFixed(1)}%\n`);

  return {
    passed: testsPassed,
    failed: testsFailed,
    total: total
  };
}

testFrontendUI().catch(console.error);
