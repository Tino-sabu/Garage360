const { testConnection, checkTablesExist } = require('../config/database');

async function testDatabase() {
  console.log('🔄 Testing Garage360 Database Connection...\n');
  
  try {
    // Test basic connection
    const connected = await testConnection();
    
    if (connected) {
      console.log('\n🔄 Checking database schema...');
      const tablesReady = await checkTablesExist();
      
      if (tablesReady) {
        console.log('✅ Database is fully configured and ready!');
        console.log('\n🚀 You can now start the server with: npm run dev');
      } else {
        console.log('\n⚠️  Database connected but tables are missing.');
        console.log('💡 Run the schema setup:');
        console.log('   psql -U garage360_app -d garage360 -f database/schema.sql');
      }
    } else {
      console.log('\n❌ Database connection failed.');
      console.log('💡 Make sure:');
      console.log('   1. PostgreSQL is running');
      console.log('   2. garage360 database exists');
      console.log('   3. garage360_app user has access');
      console.log('   4. .env file is configured correctly');
    }
  } catch (error) {
    console.error('❌ Error testing database:', error.message);
  }
  
  process.exit(0);
}

testDatabase();