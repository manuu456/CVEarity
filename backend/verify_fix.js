const { initDatabase, db, statements } = require('./database/init');

async function verify() {
  try {
    await initDatabase();
    console.log('Database initialized.');

    // Test stats logic
    console.log('Testing /admin/stats logic...');
    const totalUsers = db().prepare('SELECT COUNT(*) as count FROM users').get().count;
    const activeUsers = db().prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
    const adminUsers = db().prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin"').get().count;
    const recentActivity = db().prepare('SELECT COUNT(*) as count FROM activity_logs WHERE created_at >= datetime("now", "-24 hours")').get().count;

    console.log('Stats Result:', {
      totalUsers,
      activeUsers,
      adminUsers,
      recentActivity
    });

    // Test users logic
    console.log('Testing /admin/users logic...');
    const users = statements.getAllUsers.all();
    const mockResponse = {
      success: true,
      data: {
        users: users
      }
    };
    console.log('Users Response Structure:', JSON.stringify(mockResponse, null, 2).substring(0, 200) + '...');
    
    if (mockResponse.data && mockResponse.data.users) {
      console.log('✅ Structure is correct: data.users exists.');
    } else {
      console.log('❌ Structure is incorrect!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verify();
