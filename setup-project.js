#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 BlockLearn Project Setup');
console.log('==========================\n');

// Function to prompt user for input
function prompt(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to generate a secure JWT secret
function generateJWTSecret() {
  return require('crypto').randomBytes(32).toString('hex');
}

// Function to update environment files
function updateEnvFiles() {
  const projectRoot = process.cwd();
  const frontendEnvPath = path.join(projectRoot, 'frontend', '.env');
  const backendEnvPath = path.join(projectRoot, 'backend', '.env');
  
  console.log('📝 Updating environment files...\n');
  
  // Update frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Replace placeholder values
    frontendEnv = frontendEnv.replace(
      'your_google_client_id_here.apps.googleusercontent.com',
      'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    );
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Frontend .env updated');
  }
  
  // Update backend .env
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Replace placeholder values
    backendEnv = backendEnv.replace('your_password_here', 'blocklearn123');
    backendEnv = backendEnv.replace(
      'your_secure_random_secret_key_here_at_least_32_characters',
      generateJWTSecret()
    );
    backendEnv = backendEnv.replace(
      'your_google_client_id_here.apps.googleusercontent.com',
      'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    );
    backendEnv = backendEnv.replace(
      'your_google_client_secret_here',
      'YOUR_GOOGLE_CLIENT_SECRET'
    );
    
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Backend .env updated');
  }
  
  console.log('');
}

// Function to check if Node.js and npm are installed
function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...\n');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Node.js: ${nodeVersion}`);
  } catch {
    console.error('❌ Node.js: Not found');
    console.error('Please install Node.js from https://nodejs.org/');
    return false;
  }
  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm: ${npmVersion}\n`);
  } catch {
    console.error('❌ npm: Not found');
    console.error('Please install npm (comes with Node.js)');
    return false;
  }
  
  return true;
}

// Function to install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...\n');
  
  try {
    // Install root dependencies
    console.log('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    // Install frontend dependencies
    console.log('\nInstalling frontend dependencies...');
    execSync('cd frontend && npm install', { stdio: 'inherit' });
    
    // Install backend dependencies
    console.log('\nInstalling backend dependencies...');
    execSync('cd backend && npm install', { stdio: 'inherit' });
    
    console.log('\n✅ All dependencies installed successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    return false;
  }
}

// Function to build the project
function buildProject() {
  console.log('🏗️ Building the project...\n');
  
  try {
    console.log('Building frontend...');
    execSync('cd frontend && npm run build', { stdio: 'inherit' });
    console.log('\n✅ Project built successfully\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to build project:', error.message);
    return false;
  }
}

// Main setup function
async function setup() {
  console.log('Welcome to BlockLearn project setup!\n');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    console.error('\n❌ Setup failed: Prerequisites not met');
    process.exit(1);
  }
  
  // Update environment files
  updateEnvFiles();
  
  // Install dependencies
  if (!installDependencies()) {
    console.error('❌ Setup failed: Could not install dependencies');
    process.exit(1);
  }
  
  // Build project
  if (!buildProject()) {
    console.error('❌ Setup failed: Could not build project');
    process.exit(1);
  }
  
  console.log('🎉 Setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Configure your actual Google OAuth credentials in the .env files');
  console.log('2. Set up your database (PostgreSQL recommended)');
  console.log('3. Update database credentials in backend/.env');
  console.log('4. Run "npm run dev" to start the development servers');
  console.log('5. Visit http://localhost:5173 to access the application');
  
  console.log('\n🔐 Important: Replace the placeholder values in the .env files with your actual credentials!');
}

// Run setup
setup().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});