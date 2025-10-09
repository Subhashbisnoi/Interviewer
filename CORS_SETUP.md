# Temporary CORS fix for initial deployment
# Add this as ALLOWED_ORIGINS environment variable in Render:

https://localhost:3000,http://localhost:3000,https://127.0.0.1:3000,http://127.0.0.1:3000,https://*.vercel.app

# Or for initial testing, use: *
# (Remember to restrict this after getting your Vercel URL)
