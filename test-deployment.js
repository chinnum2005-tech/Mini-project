#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🧪 BlockLearn Deployment Verification Script');
console.log('==========================================\n');

// Function to test an endpoint
function testEndpoint(url, expectedStatusCode = 200) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing: ${url}`);
    
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, (res) => {
      const statusCode = res.statusCode;
      const statusMessage = res.statusMessage;
      
      if (statusCode === expectedStatusCode) {
        console.log(`✅ Success: ${url} returned ${statusCode} ${statusMessage}\n`);
        resolve(true);
      } else {
        console.log(`❌ Error: ${url} returned ${statusCode} ${statusMessage} (expected ${expectedStatusCode})\n`);
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log(`❌ Connection Error: ${url} - ${error.message}\n`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`❌ Timeout Error: ${url} - Request timed out\n`);
      req.destroy();
      resolve(false);
    });
  });
}

// Main verification function
async function verifyDeployment() {
  console.log('This script will help you verify that your BlockLearn deployment is working correctly.\n');
  
  // Get the URLs from user
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  };
  
  const frontendUrl = await askQuestion('Enter your frontend URL (e.g., https://learn.yourdomain.com): ') || 'http://localhost:5173';
  const backendUrl = await askQuestion('Enter your backend URL (e.g., https://api.yourdomain.com): ') || 'http://localhost:5000';
  
  rl.close();
  
  console.log('\n🔄 Starting deployment verification...\n');
  
  // Test frontend
  console.log('🌐 Testing Frontend...\n');
  const frontendTests = [
    testEndpoint(`${frontendUrl}`, 200),
    testEndpoint(`${frontendUrl}/index.html`, 200)
  ];
  
  const frontendResults = await Promise.all(frontendTests);
  const frontendSuccess = frontendResults.every(result => result);
  
  // Test backend
  console.log('🔧 Testing Backend...\n');
  const backendTests = [
    testEndpoint(`${backendUrl}`, 200),
    testEndpoint(`${backendUrl}/api/health`, 200),
    testEndpoint(`${backendUrl}/api/auth/test`, 404) // This should return 404 as the test endpoint doesn't exist
  ];
  
  const backendResults = await Promise.all(backendTests);
  const backendSuccess = backendResults.slice(0, 2).every(result => result); // First two should succeed
  
  // Summary
  console.log('📋 Verification Summary:\n');
  
  if (frontendSuccess) {
    console.log('✅ Frontend: All tests passed');
  } else {
    console.log('❌ Frontend: Some tests failed');
  }
  
  if (backendSuccess) {
    console.log('✅ Backend: Core API tests passed');
  } else {
    console.log('❌ Backend: Core API tests failed');
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. If all tests passed, your deployment is working correctly');
  console.log('2. If some tests failed, check:');
  console.log('   - Network connectivity');
  console.log('   - Firewall settings');
  console.log('   - Environment variables');
  console.log('   - Application logs');
  console.log('3. Test the full application functionality in your browser');
  
  console.log('\n🚀 Happy learning with BlockLearn!');
}

// Run verification
verifyDeployment().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});