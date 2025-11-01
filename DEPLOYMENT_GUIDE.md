# BlockLearn Deployment Guide

This guide will help you deploy the BlockLearn platform for production use with video conferencing capabilities.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Video Conferencing Setup](#video-conferencing-setup)
6. [Domain and SSL Configuration](#domain-and-ssl-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deployment, ensure you have:

1. **Domain Names**: 
   - Frontend domain (e.g., `learn.yourcompany.com`)
   - Backend domain (e.g., `api.yourcompany.com`)

2. **Cloud Services Accounts**:
   - [Google Cloud Platform](https://console.cloud.google.com/) (for Google OAuth)
   - [Netlify](https://netlify.com/) or [Vercel](https://vercel.com/) (for frontend hosting)
   - [Render](https://render.com/) or [Heroku](https://heroku.com/) (for backend hosting)
   - [PostgreSQL Database](https://supabase.com/) or managed database service

3. **SSL Certificates**: Most hosting providers offer automatic SSL, but you can also use [Let's Encrypt](https://letsencrypt.org/)

## Backend Deployment

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
6. Add environment variables (see Environment Configuration section)
7. Click "Create Web Service"

### Option 2: Deploy to Heroku

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Deploy: `git push heroku main`
6. Set environment variables: `heroku config:set KEY=VALUE`

## Frontend Deployment

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

## Environment Configuration

### Backend Environment Variables

Create a `.env.production` file in the `backend` directory with the following variables:

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

### Frontend Environment Variables

Create a `.env.production` file in the `frontend` directory with the following variables:

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

## Video Conferencing Setup

### Google Meet Integration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Meet API
3. Create credentials (OAuth 2.0 Client ID)
4. Add your domain to authorized origins
5. Update environment variables with your credentials

### Zoom Integration

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Create a new app (JWT or OAuth)
3. Get your API Key and Secret
4. Update environment variables

### Microsoft Teams Integration

1. Go to [Azure Portal](https://portal.azure.com/)
2. Register a new application
3. Configure API permissions
4. Get your Client ID and Secret

### Skype Integration

1. Go to [Skype Developer Portal](https://developer.skype.com/)
2. Create a new application
3. Get your API credentials

## Domain and SSL Configuration

### Custom Domains

#### For Netlify:
1. Go to "Site settings" → "Domain management"
2. Add custom domain
3. Configure DNS records as instructed

#### For Render:
1. Go to your web service
2. Click "Settings" → "Custom domains"
3. Add your domain
4. Configure DNS records

### SSL Certificates

Most hosting providers offer automatic SSL certificate provisioning. If you need to manually configure SSL:

1. Obtain SSL certificate from [Let's Encrypt](https://letsencrypt.org/)
2. Upload certificate to your hosting provider
3. Configure your server to use HTTPS

## Monitoring and Maintenance

### Health Checks

The backend includes a health check endpoint at `/api/health` which you can use for monitoring.

### Logging

Configure logging services like:
- [Sentry](https://sentry.io/) for error tracking
- [LogRocket](https://logrocket.com/) for session replay
- [Papertrail](https://papertrailapp.com/) for log management

### Database Backups

Set up automated database backups:
- For Render: Use their built-in database backup feature
- For other providers: Use cron jobs or database-specific tools

### Performance Monitoring

Use tools like:
- [New Relic](https://newrelic.com/)
- [Datadog](https://datadoghq.com/)
- [Prometheus](https://prometheus.io/) + [Grafana](https://grafana.com/)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend domain
2. **Google OAuth Not Working**: Check authorized origins and redirect URIs in Google Cloud Console
3. **Database Connection Issues**: Verify database credentials and network access
4. **API Rate Limiting**: Adjust rate limiting settings in backend configuration

### Support

For additional help:
1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Contact the development team
3. Refer to the [Documentation](./README.md)

## Next Steps

After successful deployment:
1. Test all functionality including user registration, login, and session scheduling
2. Configure analytics and monitoring
3. Set up automated backups
4. Train your team on the platform
5. Announce the platform to your users

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0