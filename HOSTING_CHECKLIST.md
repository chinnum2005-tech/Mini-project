# BlockLearn Hosting Checklist

This checklist will guide you through the process of hosting your BlockLearn platform for production use.

## Prerequisites

Before deployment, ensure you have:

1. **Domain Names**:
   - Frontend domain (e.g., `learn.yourdomain.com`)
   - Backend domain (e.g., `api.yourdomain.com`)

2. **Cloud Services Accounts**:
   - [Google Cloud Platform](https://console.cloud.google.com/) (for Google OAuth)
   - [Netlify](https://netlify.com/) or [Vercel](https://vercel.com/) (for frontend hosting)
   - [Render](https://render.com/) or [Heroku](https://heroku.com/) (for backend hosting)
   - [PostgreSQL Database](https://supabase.com/) or managed database service

## Step 1: Configure Environment Variables

### Backend Environment Variables (.env file)

Update your [backend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/backend/.env) file with production values:

```env
# Database Configuration (use either DATABASE_URL or individual parameters)
DATABASE_URL=postgresql://username:password@hostname:port/database_name
# OR
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_secure_database_password

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_random_secret_key_here_at_least_32_characters

# Email Configuration
EMAIL_USER=your_production_email@domain.com
EMAIL_PASS=your_app_password_here
EMAIL_SERVICE=gmail

# Campus Email Domains (comma-separated)
CAMPUS_EMAIL_DOMAINS=yourcampus.edu,anothercampus.edu

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here

# Video Conferencing Integration (optional)
ZOOM_API_KEY=
ZOOM_API_SECRET=
GOOGLE_MEET_API_KEY=

# Blockchain Configuration (if using)
BLOCKCHAIN_NETWORK=mainnet_or_testnet
BLOCKCHAIN_PROVIDER_URL=https://your-blockchain-provider-url
CONTRACT_ADDRESS=your_deployed_contract_address
```

### Frontend Environment Variables (.env file)

Update your [frontend/.env](file:///c%3A/Users/Admin/OneDrive/Desktop/Mini%20Project/frontend/.env) file with production values:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com

# API Configuration
VITE_API_URL=https://your-backend-domain.com/api

# Application Settings
VITE_APP_NAME=BlockLearn
VITE_APP_DESCRIPTION=Peer-to-Peer Learning Platform
VITE_APP_URL=https://your-frontend-domain.com

# Feature Flags
VITE_ENABLE_VIDEO_CONFERENCING=true
VITE_ENABLE_BLOCKCHAIN_INTEGRATION=true
VITE_ENABLE_CHAT_FEATURES=true

# Supported Video Platforms
VITE_SUPPORTED_VIDEO_PLATFORMS=google,zoom,skype,teams,custom
```

## Step 2: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google People API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Add your domain to "Authorized JavaScript origins":
   - `http://localhost:5173` (for development)
   - `https://your-frontend-domain.com` (for production)
7. Add your domain to "Authorized redirect URIs":
   - `http://localhost:5173` (for development)
   - `https://your-frontend-domain.com` (for production)
8. Copy the Client ID and Client Secret to your environment variables

## Step 3: Database Setup

You can either:
1. Use a managed PostgreSQL service (recommended):
   - [Supabase](https://supabase.com/)
   - [Render PostgreSQL](https://render.com/docs/databases)
   - [Heroku Postgres](https://www.heroku.com/postgres)
2. Or set up your own PostgreSQL server

Initialize the database schema by running:
```bash
npm run setup-db
```

## Step 4: Deploy Backend

### Option 1: Deploy to Render (Recommended)

1. Fork the repository to your GitHub account
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New+" → "Web Service"
4. Connect your GitHub repository
5. Configure settings:
   - **Name**: `blocklearn-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add environment variables (see Backend Environment Variables section)
7. Click "Create Web Service"

### Option 2: Deploy to Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Deploy: `git push heroku main`
6. Set environment variables: `heroku config:set KEY=VALUE`

## Step 5: Deploy Frontend

### Option 1: Deploy to Netlify (Recommended)

1. Fork the repository to your GitHub account
2. Go to [Netlify Dashboard](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure deploy settings:
   - **Branch to deploy**: `main`
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Add environment variables in "Site settings" → "Build & deploy" → "Environment"
7. Deploy site

### Option 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables
6. Deploy

## Step 6: Configure Custom Domains

### For Netlify:
1. Go to "Site settings" → "Domain management"
2. Add custom domain
3. Configure DNS records as instructed

### For Render:
1. Go to your web service
2. Click "Settings" → "Custom domains"
3. Add your domain
4. Configure DNS records

## Step 7: Test Your Deployment

After deployment, test the following:

1. Access your frontend domain
2. Try to register/login with Google OAuth
3. Test the voice-enabled chatbot functionality
4. Verify video conferencing features
5. Check blockchain integration (if enabled)
6. Test all API endpoints

## Step 8: Monitor and Maintain

1. Set up logging and error tracking
2. Configure automated database backups
3. Monitor performance and uptime
4. Keep dependencies updated
5. Regular security audits

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend domain
2. **Google OAuth Not Working**: Check authorized origins and redirect URIs in Google Cloud Console
3. **Database Connection Issues**: Verify database credentials and network access
4. **API Rate Limiting**: Adjust rate limiting settings in backend configuration

## Support

For additional help:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Contact the development team
3. Refer to the [Documentation](./README.md)

---
**Last Updated**: 2025-10-29
**Version**: 1.0.0