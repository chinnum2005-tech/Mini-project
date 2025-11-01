const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing quick login endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/auth/quick-login', {
      email: 'test@example.com'
    });
    
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', response.data.token);
      console.log('User:', response.data.user);
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response data:', error.response.data);
      console.log('Status:', error.response.status);
    }
  }
}

testLogin();