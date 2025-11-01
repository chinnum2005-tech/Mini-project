# 🚀 BlockLearn Deployment Guide

This guide explains how to deploy your BlockLearn platform for production use.

## 📋 Prerequisites

Before starting the deployment process, ensure you have:

1. **Node.js** (version 16 or higher) installed on your system
2. **npm** (comes with Node.js) installed
3. **Git** installed (for version control)
4. Accounts with deployment platforms:
   - [Netlify](https://netlify.com/) or [Vercel](https://vercel.com/) for frontend hosting
   - [Render](https://render.com/) or [Heroku](https://heroku.com/) for backend hosting
   - [Google Cloud Platform](https://console.cloud.google.com/) for Google OAuth

## 🛠️ Deployment Preparation

We've provided several tools to help you prepare your project for deployment:

### Option 1: Automated Preparation (Recommended)

Run the automated deployment preparation script:

**On Windows:**
```cmd
prepare-deployment.bat
```

**On macOS/Linux:**
```bash
node prepare-deployment.js
```

This script will:
1. Check prerequisites
2. Install all dependencies
3. Build the project
4. Guide you through configuring environment variables
5. Generate deployment instructions

### Option 2: Manual Preparation

If you prefer to do things manually:

1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

2. Build the frontend:
   ```bash
   cd frontend && npm run build && cd ..
   ```

3. Configure environment variables in:
   - [frontend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/frontend/.env)
   - [backend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/backend/.env)

## ☁️ Deployment Options

### Frontend Deployment

#### Netlify (Recommended)
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure deploy settings:
   - **Branch to deploy**: `main`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables in "Site settings" → "Build & deploy" → "Environment"

#### Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables

### Backend Deployment

#### Render (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Configure settings:
   - **Name**: `blocklearn-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables
6. Click "Create Web Service"

#### Heroku
1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Deploy: `git push heroku main`
6. Set environment variables: `heroku config:set KEY=VALUE`

## 🔧 Environment Configuration

After deployment, make sure to configure all environment variables in your hosting platform:

### Backend Variables
- `DATABASE_URL` or individual DB connection variables
- `JWT_SECRET` (should be a secure random string)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- `FRONTEND_URL` (your frontend domain)
- `EMAIL_USER` and `EMAIL_PASS` (if using email features)

### Frontend Variables
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_API_URL` (your backend API URL)
- `VITE_APP_URL` (your frontend domain)

## 🧪 Testing Your Deployment

After deployment, thoroughly test:

1. User registration and login with Google OAuth
2. Voice-enabled chatbot functionality
3. Video conferencing features
4. Blockchain integration (if enabled)
5. All API endpoints
6. Mobile responsiveness

## 🆘 Troubleshooting

Common issues and solutions:

1. **CORS Errors**: Ensure `FRONTEND_URL` in backend matches your frontend domain
2. **Google OAuth Issues**: Check authorized origins and redirect URIs in Google Cloud Console
3. **Database Connection Failures**: Verify database credentials and network access
4. **API Rate Limiting**: Adjust rate limiting settings in backend configuration

## 📚 Additional Resources

- [Hosting Checklist](HOSTING_CHECKLIST.md) - Detailed deployment checklist
- [Deployment Instructions](DEPLOYMENT_INSTRUCTIONS.md) - Generated after running preparation script
- [Full Deployment Guide](DEPLOYMENT_GUIDE.md) - Comprehensive deployment documentation

## 📞 Support

If you encounter any issues during deployment:

1. Check the error logs in your hosting platform
2. Verify all environment variables are correctly set
3. Ensure your database is accessible and properly configured
4. Confirm Google OAuth credentials are correct
5. Refer to the troubleshooting section above

For additional help, consult the documentation or reach out to the development team.

---

**Happy Deploying!** 🎉