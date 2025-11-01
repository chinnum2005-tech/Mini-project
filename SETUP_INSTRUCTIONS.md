# BlockLearn Platform - Setup Instructions

## 🔒 Security Notice

**IMPORTANT:** This project has been updated with critical security fixes. Please follow these steps carefully.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

## 1. Initial Setup

### Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## 2. Database Setup

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE skill_swap_db;

# Exit psql
\q
```

### Run Schema

```bash
# From the backend directory
psql -U postgres -d skill_swap_db -f models/schema_fixed.sql

# Add indexes for performance
psql -U postgres -d skill_swap_db -f models/add_indexes.sql
```

## 3. Environment Configuration

### Backend Environment

1. **Copy the example file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Generate a secure JWT secret:**
   ```bash
   node generate-jwt-secret.js
   ```

3. **Update `.env` file with your values:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=skill_swap_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password

   # JWT Secret (use the generated one from step 2)
   JWT_SECRET=your_generated_secret_here

   # Email Configuration (Gmail example)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password_here

   # Campus Email Domains
   CAMPUS_EMAIL_DOMAINS=saividya.ac.in,saividhya.ac.in

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

### Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password
   - Use this password in `EMAIL_PASS`

## 4. Running the Application

### Development Mode (Both servers)

```bash
# From the root directory
npm run dev
```

This will start:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

### Individual Servers

```bash
# Backend only
npm run server

# Frontend only
npm run client
```

## 5. Testing Email Configuration

```bash
cd backend
node testEmail.js
```

## 6. Database Maintenance

### Cleanup Expired OTPs (Optional)

Run periodically to clean up old OTP records:

```bash
psql -U postgres -d skill_swap_db -f models/cleanup_expired_otps.sql
```

## 7. Verify Installation

1. **Backend Health Check:**
   - Visit: http://localhost:5000/api/health
   - Should return: `{"message": "BlockLearn API is running!"}`

2. **Email Configuration Check:**
   - Visit: http://localhost:5000/api/auth/email-health
   - Should show SMTP configuration status

3. **Frontend:**
   - Visit: http://localhost:5173
   - Should see the BlockLearn landing page

## 🔐 Security Checklist

- [x] `.env` file is in `.gitignore`
- [x] Strong JWT secret generated
- [x] Database password changed from default
- [x] Email app password configured
- [x] CORS restricted to frontend URL
- [x] Rate limiting enabled on auth endpoints
- [x] Input validation added

## 📝 Important Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use `.env.example`** as a template for new environments
3. **Rotate secrets regularly** in production
4. **Enable SSL/TLS** in production (update `NODE_ENV=production`)
5. **Use environment variables** in production (not `.env` files)

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use managed database with SSL
3. Set strong, unique JWT secret
4. Configure proper CORS origins
5. Use environment variables (not `.env` files)
6. Enable HTTPS
7. Set up monitoring and logging
8. Configure database backups
9. Set up OTP cleanup cron job

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Check database exists
psql -U postgres -l | grep skill_swap_db
```

### Email Not Sending

- Verify Gmail app password is correct
- Check firewall settings
- Test with `node testEmail.js`
- Check backend logs for SMTP errors

### Frontend Can't Connect to Backend

- Verify backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify `API_URL` in `frontend/src/config.js`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `GET /api/auth/me` - Get current user (requires token)
- `GET /api/auth/allowed-domains` - Get allowed email domains
- `GET /api/auth/email-health` - Check email configuration

### Health Check

- `GET /api/health` - API health status

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review backend logs
3. Verify all environment variables are set
4. Ensure database is properly configured

## 📧 Email Configuration (Gmail)

For Gmail to work properly with this application, you need to set up an App Password:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### Step 2: Generate an App Password
1. In your Google Account, go to Security → 2-Step Verification → App passwords
2. Select "Mail" as the app and "Other" as the device
3. Give it a name like "BlockLearn OTP"
4. Copy the generated 16-character password

### Step 3: Update Your Environment Variables
In `backend/.env`, use the App Password (not your regular Gmail password):
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=the-16-character-app-password
```

### Testing Email Configuration
After updating your credentials:
```bash
cd backend
node test-email-fixed.js
```

If you continue to have issues, you can also try using a custom SMTP configuration:
```env
# Comment out EMAIL_SERVICE
# EMAIL_SERVICE=gmail

# Use custom SMTP settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

