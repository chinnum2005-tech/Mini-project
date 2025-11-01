# BlockLearn - Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Generate JWT Secret (30 seconds)
```bash
cd backend
node generate-jwt-secret.js
```
Copy the generated secret.

### Step 2: Configure Environment (2 minutes)
```bash
# In backend directory
cp .env.example .env
```

Edit `.env` and update:
```env
JWT_SECRET=<paste_generated_secret_here>
DB_PASSWORD=<your_postgres_password>
EMAIL_USER=<your_gmail>
EMAIL_PASS=<your_gmail_app_password>
```

### Step 3: Setup Database (1 minute)
```bash
# Create database
psql -U postgres -c "CREATE DATABASE skill_swap_db;"

# Run schema
psql -U postgres -d skill_swap_db -f backend/models/schema_fixed.sql

# Add indexes
psql -U postgres -d skill_swap_db -f backend/models/add_indexes.sql
```

### Step 4: Install & Run (1 minute)
```bash
# From project root
npm install
npm run dev
```

### Step 5: Test It! (30 seconds)
1. Open http://localhost:5173
2. Click "Sign Up" or "Login"
3. **Option A - Google Login**: Click "Sign in with Google" (requires Google OAuth setup)
4. **Option B - OTP Login**: Enter your campus email, check email for OTP, enter OTP

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Health check works: http://localhost:5000/api/health
- [ ] Email test works: `node backend/testEmail.js`
- [ ] Can signup with OTP

## 🆘 Quick Troubleshooting

**Database error?**
```bash
# Check if PostgreSQL is running
# Make sure DB_PASSWORD in backend/.env matches your PostgreSQL password
```

**OTP not working?**
```bash
# Check if EMAIL_USER and EMAIL_PASS are correctly set in backend/.env
# For Gmail, make sure you're using an App Password, not your regular password
# Run the diagnostic script:
cd backend
node test-email-fixed.js
```

**Frontend not connecting to backend?**
```bash
# Check if FRONTEND_URL in backend/.env matches your frontend URL
# Make sure both servers are running
```

## 📖 Full Documentation

For detailed setup and troubleshooting, see:
- `SETUP_INSTRUCTIONS.md` - Complete setup guide
- `CHANGES_SUMMARY.md` - All changes made
- `GOOGLE_OAUTH_SETUP.md` - Google OAuth configuration guide

## 🎉 You're Ready!

Your BlockLearn platform is now running with:
- ✅ Secure authentication
- ✅ Google OAuth login (no OTP required!)
- ✅ OTP-based signup/login
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Database indexes

Happy coding! 🚀
