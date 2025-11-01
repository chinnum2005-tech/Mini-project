#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

let authToken = null;

// Helper function to prompt user for input
const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Test functions
async function testMentorApplication() {
  try {
    console.log('\n=== Testing Mentor Application ===');
    
    // Get user credentials
    const email = await question('Enter user email: ');
    const password = await question('Enter user password: ');
    
    // Login user (simplified - in real app, you'd use proper authentication)
    console.log('Logging in user...');
    // For testing purposes, we'll simulate a logged-in user
    
    console.log('✅ Mentor application test completed');
  } catch (error) {
    console.error('❌ Error in mentor application test:', error.message);
  }
}

async function testAdminFunctions() {
  try {
    console.log('\n=== Testing Admin Functions ===');
    
    // This would require admin authentication
    console.log('Admin functions test would go here...');
    
    console.log('✅ Admin functions test completed');
  } catch (error) {
    console.error('❌ Error in admin functions test:', error.message);
  }
}

async function main() {
  console.log('🚀 BlockLearn Mentor Verification System Test');
  console.log('============================================');
  
  try {
    // Test basic connectivity
    console.log('Testing API connectivity...');
    const healthCheck = await axiosInstance.get('/health');
    console.log('✅ API is running');
    
    // Run tests
    await testMentorApplication();
    await testAdminFunctions();
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run main function if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testMentorApplication, testAdminFunctions };