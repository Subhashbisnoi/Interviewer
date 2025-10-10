# 🔧 OAuth Environment Variables Setup

## Add these to Render Dashboard

1. Go to: https://dashboard.render.com
2. Select: `ai-interviewer-backend` 
3. Navigate: Environment Variables tab
4. Add these variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_console
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_console

# GitHub OAuth Configuration  
GITHUB_CLIENT_ID=your_github_client_id_from_app
GITHUB_CLIENT_SECRET=your_github_client_secret_from_app

# CORS Configuration (Optional - already set in code)
ALLOWED_ORIGINS=https://interviewer-tan.vercel.app,https://ai-interviewer-backend-mfp3.onrender.com
```

**💡 Use the actual OAuth credentials from your apps:**
- Google: From Google Cloud Console → APIs & Services → Credentials  
- GitHub: From GitHub Settings → Developer settings → OAuth Apps

## After Adding Variables:

1. **Save** the environment variables
2. **Redeploy** the service (Render will do this automatically)  
3. **Wait** for deployment to complete (~5-10 minutes)
4. **Test** OAuth endpoints:
   - Google: https://ai-interviewer-backend-mfp3.onrender.com/auth/google
   - GitHub: https://ai-interviewer-backend-mfp3.onrender.com/auth/github

## Verification:

The OAuth endpoints should stop returning "501 Not Configured" errors and start working properly.

---

**⚠️ Security Note**: These credentials are for your development/production app. Keep them secure and don't commit them to public repositories.
