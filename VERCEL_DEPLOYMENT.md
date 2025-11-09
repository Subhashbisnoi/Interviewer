# Vercel Deployment Guide

## Quick Setup

### 1. Configure Vercel Project

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add the following variables:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_GOOGLE_CLIENT_ID=300902081457-9kfrv1j0o87gqvm9o7bdn05cp5f817ee.apps.googleusercontent.com
REACT_APP_GITHUB_CLIENT_ID=Ov23linVT3SJaDQZMprY
```

### 2. Root Directory Configuration

In Vercel project settings:
- **Framework Preset**: Create React App
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3. Deploy Backend First

Make sure your backend is deployed on Render or another platform first, then update the `REACT_APP_API_URL` in Vercel with the actual backend URL.

### 4. Configure OAuth Redirects

Update your OAuth app settings to include your Vercel domain:

**Google OAuth:**
- Authorized JavaScript origins: `https://your-vercel-domain.vercel.app`
- Authorized redirect URIs: `https://your-vercel-domain.vercel.app/auth/google/callback`

**GitHub OAuth:**
- Homepage URL: `https://your-vercel-domain.vercel.app`
- Authorization callback URL: `https://your-vercel-domain.vercel.app/auth/github/callback`

### 5. Deploy

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

Vercel will automatically deploy when you push to main.

## Alternative: Manual Deployment

If you want to use the Vercel CLI:

```bash
cd frontend
npm install -g vercel
vercel --prod
```

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `react-scripts` version is compatible
- Check build logs for specific errors

### API Calls Fail
- Verify `REACT_APP_API_URL` environment variable is set correctly in Vercel
- Check CORS settings in your backend
- Ensure backend is deployed and accessible

### OAuth Doesn't Work
- Verify redirect URLs in OAuth app settings match your Vercel domain
- Check that OAuth credentials are set in Vercel environment variables
- Ensure HTTPS is being used (required by OAuth)

## Important Notes

1. **Never commit `.env` files** with secrets - use Vercel environment variables
2. **Backend URL**: Must be HTTPS in production
3. **CORS**: Backend must allow requests from your Vercel domain
4. **Environment Variables**: Must start with `REACT_APP_` to be accessible in React
