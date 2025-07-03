const fetch = require('node-fetch');

// Base URL for the API
const API_URL = 'http://localhost:3002/api/v1';

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

let token = '';

// Helper function to log responses
function logResponse(name, response, data) {
  console.log(`\n📝 ${name}:`);
  console.log(`  Status: ${response.status} ${response.statusText}`);
  console.log(`  Data: ${JSON.stringify(data, null, 2).substring(0, 300)}${JSON.stringify(data, null, 2).length > 300 ? '...' : ''}`);
}

// Test health check endpoint
async function testHealthCheck() {
  try {
    const response = await fetch(`${API_URL}/docs`);
    const data = await response.json();
    logResponse('API Health Check', response, data);
    return response.ok;
  } catch (error) {
    console.error('❌ API Health Check Error:', error.message);
    return false;
  }
}

// Test registration endpoint
async function testRegister() {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    const data = await response.json();
    logResponse('Register', response, data);
    
    if (response.ok && data.token) {
      token = data.token;
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Register Error:', error.message);
    return false;
  }
}

// Test login endpoint
async function testLogin() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const data = await response.json();
    logResponse('Login', response, data);
    
    if (response.ok && data.token) {
      token = data.token;
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    return false;
  }
}

// Test get current user endpoint
async function testGetMe() {
  if (!token) {
    console.log('⚠️ No token available for authentication');
    return false;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    logResponse('Get Current User', response, data);
    return response.ok;
  } catch (error) {
    console.error('❌ Get Current User Error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting API tests...');
  
  // Check if API is running
  const healthCheck = await testHealthCheck();
  if (!healthCheck) {
    console.log('\n❌ API server is not running or not responding. Aborting tests.');
    return;
  }
  
  // Test registration (this might fail if user already exists)
  console.log('\n--- Testing Registration ---');
  const registerSuccess = await testRegister();
  
  // Test login
  console.log('\n--- Testing Login ---');
  const loginSuccess = await testLogin();
  
  // If login failed but registration succeeded, we already have a token
  if (loginSuccess || registerSuccess) {
    // Test getting current user
    console.log('\n--- Testing Get Current User ---');
    await testGetMe();
  }
  
  console.log('\n✅ Tests completed!');
}

// Start tests
runTests(); 