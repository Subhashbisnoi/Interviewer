# Deployment Guide

This guide covers deploying the AI Interviewer application to production using Render (backend) and Vercel (frontend).

## Prerequisites

- GitHub repository with your code
- Render account (free tier available)
- Vercel account (free tier available)
- Google Cloud Console project (for Google OAuth)
- GitHub OAuth app (for GitHub authentication)
- OpenAI API key

## Backend Deployment (Render)

### 1. Prepare Environment Variables

Before deploying, make sure you have the following environment variables ready:

```env
SECRET_KEY=<generate-a-secure-random-key>
GOOGLE_CLIENT_ID=<your-google-client-id>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
OPENAI_API_KEY=<your-openai-api-key>
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ai-interviewer-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `./backend/build.sh`
   - **Start Command**: `cd backend && python main.py`
   - **Root Directory**: Leave empty

### 3. Add Environment Variables in Render

In the Render dashboard, go to your service settings and add these environment variables:

- `SECRET_KEY`: Generate a secure random key
- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GITHUB_CLIENT_ID`: Your GitHub OAuth client ID  
- `GITHUB_CLIENT_SECRET`: Your GitHub OAuth client secret
- `OPENAI_API_KEY`: Your OpenAI API key
- `ENVIRONMENT`: `production`
- `DEBUG`: `False`
- `ALLOWED_ORIGINS`: `https://your-app-name.vercel.app` (update after frontend deployment)

### 4. Set up PostgreSQL Database (Optional)

For production, it's recommended to use PostgreSQL:

1. In Render dashboard, create a PostgreSQL database
2. Link it to your web service
3. The `DATABASE_URL` will be automatically added as an environment variable

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2. Add Environment Variables in Vercel

In the Vercel dashboard, go to your project settings → Environment Variables and add:

- `REACT_APP_API_URL`: `https://your-backend-app-name.onrender.com`
- `REACT_APP_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `REACT_APP_GITHUB_CLIENT_ID`: Your GitHub OAuth client ID

### 3. Update Backend CORS Settings

After getting your Vercel URL, update the `ALLOWED_ORIGINS` environment variable in Render:

```
ALLOWED_ORIGINS=https://your-app-name.vercel.app
```

## OAuth Configuration Updates

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Update **Authorized JavaScript origins**:
   - Add: `https://your-app-name.vercel.app`
5. Update **Authorized redirect URIs**:
   - Add: `https://your-app-name.vercel.app`

### GitHub OAuth Setup

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Edit your OAuth application
3. Update:
   - **Homepage URL**: `https://your-app-name.vercel.app`
   - **Authorization callback URL**: `https://your-app-name.vercel.app`

## Deployment Steps Summary

1. **Push code to GitHub** (with all the changes made)
2. **Deploy backend to Render**
   - Connect GitHub repo
   - Configure build/start commands
   - Add environment variables
   - Deploy
3. **Deploy frontend to Vercel**
   - Connect GitHub repo
   - Configure build settings
   - Add environment variables (including backend URL)
   - Deploy
4. **Update OAuth settings** with production URLs
5. **Test the complete application**

## Environment Variables Checklist

### Backend (Render)
- [ ] `SECRET_KEY`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GITHUB_CLIENT_ID`
- [ ] `GITHUB_CLIENT_SECRET`
- [ ] `OPENAI_API_KEY`
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=False`
- [ ] `ALLOWED_ORIGINS`
- [ ] `DATABASE_URL` (if using PostgreSQL)

### Frontend (Vercel)
- [ ] `REACT_APP_API_URL`
- [ ] `REACT_APP_GOOGLE_CLIENT_ID`
- [ ] `REACT_APP_GITHUB_CLIENT_ID`

## Post-Deployment Testing

1. **Health Check**: Visit `https://your-backend.onrender.com/health`
2. **API Documentation**: Visit `https://your-backend.onrender.com/docs`
3. **Frontend**: Visit `https://your-app.vercel.app`
4. **Authentication**: Test Google and GitHub OAuth flows
5. **API Integration**: Test frontend-backend communication

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `ALLOWED_ORIGINS` includes your Vercel URL
2. **OAuth Redirect Errors**: Verify OAuth app settings match production URLs
3. **Database Connection**: Check `DATABASE_URL` format for PostgreSQL
4. **Build Failures**: Check logs in Render/Vercel dashboards
5. **Environment Variables**: Ensure all required vars are set correctly

### Logs and Monitoring

- **Render**: Check service logs in the dashboard
- **Vercel**: Check function logs and build logs
- **Browser**: Use developer tools to check console errors
