#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BlockLearn Deployment Script');
console.log('==============================\n');

// Check if we're in the right directory
const projectRoot = process.cwd();
const frontendDir = path.join(projectRoot, 'frontend');
const backendDir = path.join(projectRoot, 'backend');

if (!fs.existsSync(frontendDir) || !fs.existsSync(backendDir)) {
  console.error('❌ Error: This script must be run from the project root directory');
  console.error('Please navigate to the Mini Project directory and try again.');
  process.exit(1);
}

// Function to execute commands
function runCommand(command, cwd = projectRoot) {
  try {
    console.log(`🔧 Executing: ${command}`);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    return false;
  }
}

// Function to check if required tools are installed
function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  try {
    execSync('node --version', { stdio: 'pipe' });
    console.log('✅ Node.js: Installed');
  } catch {
    console.error('❌ Node.js: Not found - Please install Node.js');
    return false;
  }
  
  try {
    execSync('npm --version', { stdio: 'pipe' });
    console.log('✅ npm: Installed');
  } catch {
    console.error('❌ npm: Not found - Please install npm');
    return false;
  }
  
  console.log('');
  return true;
}

// Function to install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...\n');
  
  // Install root dependencies
  if (!runCommand('npm install')) {
    return false;
  }
  
  // Install frontend dependencies
  if (!runCommand('npm install', frontendDir)) {
    return false;
  }
  
  // Install backend dependencies
  if (!runCommand('npm install', backendDir)) {
    return false;
  }
  
  console.log('✅ Dependencies installed successfully\n');
  return true;
}

// Function to build the frontend
function buildFrontend() {
  console.log('🏗️ Building frontend...\n');
  
  // Build frontend
  if (!runCommand('npm run build', frontendDir)) {
    return false;
  }
  
  console.log('✅ Frontend built successfully\n');
  return true;
}

// Function to start both services
function startServices() {
  console.log('🚀 Starting services...\n');
  
  console.log('Starting backend server...');
  runCommand('npm run server', backendDir);
  
  console.log('Starting frontend server...');
  runCommand('npm run client', frontendDir);
  
  return true;
}

// Main deployment function
async function deploy() {
  // Check prerequisites
  if (!checkPrerequisites()) {
    console.error('❌ Prerequisites check failed. Please install required tools.');
    process.exit(1);
  }
  
  // Install dependencies
  if (!installDependencies()) {
    console.error('❌ Failed to install dependencies.');
    process.exit(1);
  }
  
  // Build frontend
  if (!buildFrontend()) {
    console.error('❌ Failed to build frontend.');
    process.exit(1);
  }
  
  console.log('🎉 Deployment preparation completed!');
  console.log('\nTo start the application, run:');
  console.log('  npm run dev  (to start both frontend and backend)');
  console.log('  OR');
  console.log('  npm run server  (to start backend only)');
  console.log('  npm run client  (to start frontend only)');
  
  console.log('\n📝 Next steps:');
  console.log('1. Configure your environment variables in frontend/.env and backend/.env');
  console.log('2. Set up your database');
  console.log('3. Configure Google OAuth credentials');
  console.log('4. Run "npm run dev" to start the application');
}

// Run deployment
deploy().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});