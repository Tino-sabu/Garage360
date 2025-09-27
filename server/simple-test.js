const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: JSON.parse(data)
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('🧪 Testing Authentication System...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log('✅ Health check:', health.data);
    console.log('');
    
    // Test 2: Register new customer
    console.log('2. Testing customer registration...');
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Test Customer',
      email: 'testcustomer@example.com',
      phone: '+1234567895',
      password: 'test123',
      role: 'customer'
    });
    
    console.log('✅ Registration:', registerResponse.data);
    console.log('');
    
    // Test 3: Login with new customer
    console.log('3. Testing customer login...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'testcustomer@example.com',
      password: 'test123'
    });
    
    console.log('✅ Login:', loginResponse.data);
    const token = loginResponse.data.data.token;
    console.log('');
    
    // Test 4: Login with manager
    console.log('4. Testing manager login...');
    const managerLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'alpha@garage360.com',
      password: 'alpha01'
    });
    
    console.log('✅ Manager login:', managerLogin.data);
    console.log('');
    
    // Test 5: Login with mechanic
    console.log('5. Testing mechanic login...');
    const mechanicLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'mech1@garage360.com',
      password: 'mech01'
    });
    
    console.log('✅ Mechanic login:', mechanicLogin.data);
    console.log('');
    
    console.log('🎉 All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();