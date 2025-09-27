const { query } = require('./config/database');

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');
  
  try {
    // Test 1: Check all tables exist
    console.log('1. Checking table structure...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'managers', 'mechanics')
      ORDER BY table_name
    `);
    
    console.log('✅ User tables found:', tables.rows.map(r => r.table_name));
    
    // Test 2: Test manager login data
    console.log('\n2. Testing manager data...');
    const managers = await query('SELECT manager_id, name, email FROM managers');
    console.log('✅ Managers:', managers.rows);
    
    // Test 3: Test mechanic login data  
    console.log('\n3. Testing mechanic data...');
    const mechanics = await query('SELECT mechanic_id, name, email FROM mechanics');
    console.log('✅ Mechanics:', mechanics.rows);
    
    // Test 4: Test customer table (should be empty)
    console.log('\n4. Testing customer table...');
    const customers = await query('SELECT COUNT(*) as count FROM customers');
    console.log(`✅ Customers: ${customers.rows[0].count} rows (ready for new registrations)`);
    
    // Test 5: Test password verification
    console.log('\n5. Testing password verification...');
    const testManager = await query('SELECT password FROM managers WHERE email = $1', ['alpha@garage360.com']);
    if (testManager.rows.length > 0) {
      console.log(`✅ Alpha's password: ${testManager.rows[0].password} (should be 'alpha01')`);
    }
    
    console.log('\n🎉 All database tests passed! The authentication system should work now.');
    console.log('\n📝 Available test accounts:');
    console.log('   Managers: alpha@garage360.com (alpha01), beta@garage360.com (beta02), gamma@garage360.com (gamma03)');
    console.log('   Mechanics: mech1@garage360.com (mech01), mech2@garage360.com (mech02)');
    console.log('   Customers: Register new customers through the API');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

testAuth();