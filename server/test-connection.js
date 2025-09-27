require('dotenv').config();
const { testConnection, checkTablesExist, query } = require('./config/database');

async function testGarage360Database() {
  console.log('🔧 Testing Garage360 Database Connection...\n');
  
  console.log('📊 Configuration:');
  console.log(`   Database: ${process.env.DB_NAME || 'garage360'}`);
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || 5432}`);
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
  console.log('');
  
  try {
    // Test basic connection
    console.log('🔄 Testing connection...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n🔄 Checking database schema...');
      const tablesReady = await checkTablesExist();
      
      if (tablesReady) {
        console.log('\n🔄 Running database queries...');
        
        // Test some basic queries
        const userCount = await query('SELECT COUNT(*) as count FROM users');
        const serviceCount = await query('SELECT COUNT(*) as count FROM services');
        const vehicleCount = await query('SELECT COUNT(*) as count FROM vehicles');
        
        console.log(`👥 Users in database: ${userCount.rows[0].count}`);
        console.log(`🛠️  Services available: ${serviceCount.rows[0].count}`);
        console.log(`🚗 Vehicles registered: ${vehicleCount.rows[0].count}`);
        
        // Test admin user exists
        const adminCheck = await query("SELECT name, email FROM users WHERE role = 'admin' LIMIT 1");
        if (adminCheck.rows.length > 0) {
          console.log(`👑 Admin user: ${adminCheck.rows[0].name} (${adminCheck.rows[0].email})`);
        }
        
        console.log('\n✅ Database is fully configured and ready!');
        console.log('🚀 You can now start the server with: npm run dev');
        
      } else {
        console.log('\n⚠️  Database connected but tables are missing.');
        console.log('💡 Run the quick setup script in VS Code:');
        console.log('   1. Open garage360 database in PostgreSQL extension');
        console.log('   2. Run database/quick_setup.sql');
      }
    } else {
      console.log('\n❌ Database connection failed.');
      console.log('💡 Check your .env file configuration:');
      console.log('   - DB_PASSWORD should be your postgres user password');
      console.log('   - Make sure garage360 database exists');
    }
  } catch (error) {
    console.error('❌ Error testing database:', error.message);
    console.log('\n💡 Troubleshooting steps:');
    console.log('   1. Make sure PostgreSQL is running');
    console.log('   2. Verify garage360 database exists');
    console.log('   3. Check your .env file has correct password');
    console.log('   4. Run: database/quick_setup.sql in VS Code');
  }
  
  process.exit(0);
}

testGarage360Database();