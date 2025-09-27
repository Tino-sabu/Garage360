const fetch = require('node-fetch');

async function testAuth() {
  try {
    // Test registration
    console.log('Testing user registration...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '1234567890',
        password: 'test123'
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('Registration result:', registerResult);
    
    // Test login
    console.log('\nTesting user login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'test123'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testAuth();