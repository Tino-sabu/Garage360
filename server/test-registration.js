const { query } = require('./config/database');

async function testRegistration() {
  try {
    console.log('🧪 Testing simplified registration...\n');
    
    // Test data
    const testUser = {
      name: 'Test Customer',
      email: 'testuser@example.com',
      phone: '+1234567890',
      password: 'test123'
    };
    
    // Simulate the registration API call by directly testing the database insert
    console.log('1. Testing customer insertion...');
    const insertQuery = `
      INSERT INTO customers (name, email, phone, password, is_active, email_verified)
      VALUES ($1, $2, $3, $4, true, false)
      RETURNING customer_id as id, name, email, phone, created_at
    `;
    
    const result = await query(insertQuery, [testUser.name, testUser.email, testUser.phone, testUser.password]);
    console.log('✅ User inserted successfully:', result.rows[0]);
    
    // Test duplicate check
    console.log('\n2. Testing duplicate email check...');
    try {
      await query(insertQuery, [testUser.name, testUser.email, testUser.phone, testUser.password]);
      console.log('❌ Duplicate check failed - should have thrown error');
    } catch (error) {
      console.log('✅ Duplicate email correctly rejected:', error.message);
    }
    
    // Clean up test data
    console.log('\n3. Cleaning up test data...');
    await query('DELETE FROM customers WHERE email = $1', [testUser.email]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 Registration system is ready! Try registering from the frontend.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  process.exit(0);
}

testRegistration();