#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 BlockLearn Deployment Preparation Script');
console.log('===========================================\n');

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

// Function to update environment files with production-ready values
async function updateProductionEnvFiles() {
  const projectRoot = process.cwd();
  const frontendEnvPath = path.join(projectRoot, 'frontend', '.env');
  const backendEnvPath = path.join(projectRoot, 'backend', '.env');
  
  console.log('📝 Setting up production environment files...\n');
  
  // Ask for frontend configuration
  console.log('🌐 Frontend Configuration:');
  const frontendUrl = await prompt('Enter your frontend domain (e.g., https://learn.yourdomain.com): ') || 'https://learn.yourdomain.com';
  const apiUrl = await prompt('Enter your backend API URL (e.g., https://api.yourdomain.com): ') || 'https://api.yourdomain.com';
  const googleClientId = await prompt('Enter your Google OAuth Client ID (from Google Cloud Console): ') || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
  
  // Update frontend .env
  if (fs.existsSync(frontendEnvPath)) {
    let frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Replace placeholder values with user inputs
    frontendEnv = frontendEnv.replace(
      'your_google_client_id_here.apps.googleusercontent.com',
      googleClientId
    );
    
    frontendEnv = frontendEnv.replace(
      'http://localhost:5000/api',
      apiUrl
    );
    
    frontendEnv = frontendEnv.replace(
      'http://localhost:5173',
      frontendUrl
    );
    
    fs.writeFileSync(frontendEnvPath, frontendEnv);
    console.log('✅ Frontend .env updated with production values\n');
  }
  
  // Ask for backend configuration
  console.log('🔧 Backend Configuration:');
  const backendUrl = await prompt('Enter your backend domain (same as API URL above): ') || 'https://api.yourdomain.com';
  const dbHost = await prompt('Enter your database host: ') || 'localhost';
  const dbPort = await prompt('Enter your database port (5432 for PostgreSQL): ') || '5432';
  const dbName = await prompt('Enter your database name: ') || 'blocklearn_db';
  const dbUser = await prompt('Enter your database username: ') || 'postgres';
  const dbPassword = await prompt('Enter your database password: ') || 'your_secure_password';
  const googleClientSecret = await prompt('Enter your Google OAuth Client Secret (from Google Cloud Console): ') || 'YOUR_GOOGLE_CLIENT_SECRET';
  
  // Update backend .env
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Replace placeholder values with user inputs
    backendEnv = backendEnv.replace('localhost', dbHost);
    backendEnv = backendEnv.replace('5432', dbPort);
    backendEnv = backendEnv.replace('blocklearn_db', dbName);
    backendEnv = backendEnv.replace('postgres', dbUser);
    backendEnv = backendEnv.replace('your_password_here', dbPassword);
    backendEnv = backendEnv.replace(
      'your_secure_random_secret_key_here_at_least_32_characters',
      generateJWTSecret()
    );
    backendEnv = backendEnv.replace(
      'your_google_client_id_here.apps.googleusercontent.com',
      googleClientId
    );
    backendEnv = backendEnv.replace(
      'your_google_client_secret_here',
      googleClientSecret
    );
    backendEnv = backendEnv.replace(
      'http://localhost:5173',
      frontendUrl
    );
    
    // Set NODE_ENV to production
    backendEnv = backendEnv.replace('NODE_ENV=development', 'NODE_ENV=production');
    
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Backend .env updated with production values\n');
  }
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

// Function to create deployment instructions
function createDeploymentInstructions() {
  const instructions = `
# 🚀 BlockLearn Deployment Instructions

Your project has been prepared for deployment! Here's what to do next:

## 1. Verify Environment Configuration

Check that your environment files are properly configured:

- Frontend: frontend/.env
- Backend: backend/.env

## 2. Database Setup

Set up your PostgreSQL database and run the initialization script:

\`\`\`bash
# If using psql directly
psql -U your_username -d your_database -f backend/models/schema.sql

# Or use the provided script
npm run setup-db
\`\`\`

## 3. Hosting Options

### Frontend Deployment Options:

1. **Netlify** (Recommended):
   - Go to https://netlify.com/
   - Connect your GitHub repository
   - Set build command: \`npm run build\`
   - Set publish directory: \`frontend/dist\`
   - Add environment variables in Netlify dashboard

2. **Vercel**:
   - Go to https://vercel.com/
   - Import your GitHub repository
   - Set framework preset to Vite
   - Add environment variables

### Backend Deployment Options:

1. **Render** (Recommended):
   - Go to https://render.com/
   - Create a new Web Service
   - Connect your GitHub repository
   - Set root directory to \`backend\`
   - Set build command: \`npm install\`
   - Set start command: \`node server.js\`
   - Add environment variables

2. **Heroku**:
   - Install Heroku CLI
   - Login: \`heroku login\`
   - Create app: \`heroku create your-app-name\`
   - Set buildpack: \`heroku buildpacks:set heroku/nodejs\`
   - Deploy: \`git push heroku main\`

## 4. Environment Variables for Production

### Backend Variables:
- DATABASE_URL or DB_* variables
- JWT_SECRET (automatically generated)
- EMAIL_USER and EMAIL_PASS (if using email features)
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- FRONTEND_URL (your frontend domain)

### Frontend Variables:
- VITE_GOOGLE_CLIENT_ID
- VITE_API_URL (your backend API URL)
- VITE_APP_URL (your frontend domain)

## 5. Testing Your Deployment

After deployment:

1. Visit your frontend URL
2. Test Google OAuth login
3. Verify API connectivity
4. Test voice-enabled chatbot
5. Check video conferencing features

## 6. Need Help?

Refer to HOSTING_CHECKLIST.md for detailed instructions or contact support.

Happy deploying! 🎉
`;
  
  fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', instructions);
  console.log('✅ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md\n');
}

// Main preparation function
async function prepareDeployment() {
  console.log('Welcome to BlockLearn deployment preparation!\n');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    console.error('\n❌ Setup failed: Prerequisites not met');
    process.exit(1);
  }
  
  // Update environment files with production values
  await updateProductionEnvFiles();
  
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
  
  // Create deployment instructions
  createDeploymentInstructions();
  
  console.log('🎉 Deployment preparation completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Review DEPLOYMENT_INSTRUCTIONS.md for detailed deployment steps');
  console.log('2. Set up your database (PostgreSQL recommended)');
  console.log('3. Deploy frontend to Netlify/Vercel');
  console.log('4. Deploy backend to Render/Heroku');
  console.log('5. Configure custom domains and SSL certificates');
  console.log('6. Test your deployed application');
  
  console.log('\n🔐 Important Security Notes:');
  console.log('- Never commit your .env files to version control');
  console.log('- Use strong passwords for your database');
  console.log('- Keep your JWT secret secure');
  console.log('- Regularly update your dependencies');
}

// Run preparation
prepareDeployment().catch(error => {
  console.error('❌ Deployment preparation failed:', error);
  process.exit(1);
});