/**
 * CVEarity API Test - Fixed Routes
 */

const http = require('http');

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

async function runTests() {
  console.log('\n🚀 API Tests - CVEarity Backend\n' + '='.repeat(50));
  
  let pass = 0, fail = 0;

  // 1. Health Check
  try {
    const res = await makeRequest('GET', '/health');
    if (res.status === 200) {
      console.log('✅ Health Check');
      pass++;
    } else {
      console.log('❌ Health Check');
      fail++;
    }
  } catch (e) {
    console.log('❌ Health Check -', e.message);
    fail++;
  }

  // 2. Register
  try {
    const res = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      company: 'Test Corp'
    });
    if (res.status === 201 && res.data.success) {
      console.log('✅ User Registration');
      pass++;
    } else {
      console.log('❌ User Registration -', res.data?.message);
      fail++;
    }
  } catch (e) {
    console.log('❌ User Registration -', e.message);
    fail++;
  }

  // 3. Login - Get Token
  let authToken = null;
  try {
    const res = await makeRequest('POST', '/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    if (res.status === 200 && res.data.success) {
      authToken = res.data.data?.token;
      console.log('✅ Admin Login');
      pass++;
    } else {
      console.log('❌ Admin Login -', res.data?.message);
      fail++;
    }
  } catch (e) {
    console.log('❌ Admin Login -', e.message);
    fail++;
  }

  // 4. Get CVE List
  try {
    const res = await makeRequest('GET', '/api/cves');
    if (res.status === 200 && res.data.success && Array.isArray(res.data.cves)) {
      console.log(`✅ CVE List (${res.data.cves.length} CVEs)`);
      pass++;
    } else {
      console.log('❌ CVE List');
      fail++;
    }
  } catch (e) {
    console.log('❌ CVE List -', e.message);
    fail++;
  }

  // 5. Filter by Severity
  try {
    const res = await makeRequest('GET', '/api/cves?severity=CRITICAL');
    if (res.status === 200 && res.data.success && Array.isArray(res.data.cves)) {
      console.log(`✅ CVE Severity Filter (${res.data.cves.length} CRITICAL)`);
      pass++;
    } else {
      console.log('❌ CVE Severity Filter');
      fail++;
    }
  } catch (e) {
    console.log('❌ CVE Severity Filter -', e.message);
    fail++;
  }

  // 6. Search CVEs
  try {
    const res = await makeRequest('GET', '/api/cves?search=sql');
    if (res.status === 200 && res.data.success && Array.isArray(res.data.cves)) {
      console.log(`✅ CVE Search (${res.data.cves.length} matches)`);
      pass++;
    } else {
      console.log('❌ CVE Search');
      fail++;
    }
  } catch (e) {
    console.log('❌ CVE Search -', e.message);
    fail++;
  }

  // 7. Get CVE Statistics
  try {
    const res = await makeRequest('GET', '/api/cves/statistics');
    if (res.status === 200 && res.data.success) {
      console.log('✅ CVE Statistics');
      pass++;
    } else {
      console.log('❌ CVE Statistics');
      fail++;
    }
  } catch (e) {
    console.log('❌ CVE Statistics -', e.message);
    fail++;
  }

  // 8. Get Admin Users (with auth)
  if (authToken) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/users',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
      const res = await new Promise((resolve, reject) => {
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
              resolve({ status: res.statusCode, data });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
      if (res.status === 200 && res.data.success && Array.isArray(res.data.users)) {
        console.log(`✅ Admin Users (${res.data.users.length} users)`);
        pass++;
      } else {
        console.log('❌ Admin Users');
        fail++;
      }
    } catch (e) {
      console.log('❌ Admin Users -', e.message);
      fail++;
    }
  }

  // 9. Get Activity Logs (with auth)
  if (authToken) {
    try {
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/admin/activity-logs',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      };
      const res = await new Promise((resolve, reject) => {
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
              resolve({ status: res.statusCode, data });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });
      if (res.status === 200 && res.data.success && Array.isArray(res.data.logs)) {
        console.log(`✅ Activity Logs (${res.data.logs.length} logs)`);
        pass++;
      } else {
        console.log('❌ Activity Logs');
        fail++;
      }
    } catch (e) {
      console.log('❌ Activity Logs -', e.message);
      fail++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${pass}`);
  console.log(`❌ Failed: ${fail}`);
  const total = pass + fail;
  const rate = ((pass / total) * 100).toFixed(1);
  console.log(`📊 Success Rate: ${rate}%\n`);
}

runTests().catch(console.error);
