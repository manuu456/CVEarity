/**
 * Initialize Default Admin User
 */

const bcrypt = require('bcryptjs');
const { statements } = require('./database/init');

async function initializeAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = statements.getUserByUsername.get('admin');
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = statements.createUser.run(
      'admin',
      'admin@cvearity.com',
      hashedPassword,
      'admin',
      'Admin',
      'User',
      'CVEarity'
    );

    console.log('✅ Admin user created successfully!');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@cvearity.com');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

initializeAdminUser();
