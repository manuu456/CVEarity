/**
 * Debug Activity Logs Endpoint
 */

const http = require('http');

function makeAuthRequest(method, path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function debug() {
  console.log('Debugging Activity Logs Endpoint\n' + '='.repeat(50));

  // 1. Login
  const loginRes = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({ username: 'admin', password: 'admin123' }));
    req.end();
  });

  console.log('Login Response:');
  console.log('- Status:', loginRes.success);
  const token = loginRes.data?.token;
  console.log('- Token:', token ? 'OK' : 'MISSING');

  if (!token) {
    console.log('\n❌ Cannot get token, aborting');
    process.exit(1);
  }

  // 2. Try /activity
  console.log('\n📍 Testing /api/admin/activity');
  const actRes = await makeAuthRequest('GET', '/api/admin/activity', token);
  console.log('- Status Code:', actRes.status);
  console.log('- Success:', actRes.data.success);
  console.log('- Logs Count:', Array.isArray(actRes.data.logs) ? actRes.data.logs.length : 'N/A');
  if (!actRes.data.success) {
    console.log('- Error:', actRes.data.message);
  }

  // 3. Try /activity-logs
  console.log('\n📍 Testing /api/admin/activity-logs');
  const logsRes = await makeAuthRequest('GET', '/api/admin/activity-logs', token);
  console.log('- Status Code:', logsRes.status);
  console.log('- Success:', logsRes.data.success);
  console.log('- Logs Count:', Array.isArray(logsRes.data.logs) ? logsRes.data.logs.length : 'N/A');
  if (!logsRes.data.success) {
    console.log('- Error:', logsRes.data.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Full Response:', JSON.stringify(logsRes.data, null, 2));
}

debug().catch(console.error);
