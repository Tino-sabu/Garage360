const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');
  
  try {
    // Test 1: Register a new customer
    console.log('1. Testing customer registration...');
    const registerResponse = await axios.post(`${BASE_URL}/register`, {
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      phone: '+1234567895',
      password: 'test123',
      role: 'customer'
    });
    
    console.log('✅ Registration successful:', registerResponse.data);
    console.log('');
    
    // Test 2: Login with the new customer
    console.log('2. Testing customer login...');
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      email: 'testcustomer@example.com',
      password: 'test123'
    });
    
    console.log('✅ Login successful:', loginResponse.data);
    const token = loginResponse.data.data.token;
    console.log('');
    
    // Test 3: Get profile
    console.log('3. Testing profile retrieval...');
    const profileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile retrieved:', profileResponse.data);
    console.log('');
    
    // Test 4: Login with manager
    console.log('4. Testing manager login...');
    const managerLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'alpha@garage360.com',
      password: 'alpha01'
    });
    
    console.log('✅ Manager login successful:', managerLogin.data);
    console.log('');
    
    // Test 5: Login with mechanic
    console.log('5. Testing mechanic login...');
    const mechanicLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'mech1@garage360.com',
      password: 'mech01'
    });
    
    console.log('✅ Mechanic login successful:', mechanicLogin.data);
    console.log('');
    
    console.log('🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is running:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Server not responding. Please start the server first.');
    return false;
  }
}

async function runTests() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testAuth();
  }
}

runTests();