#!/bin/bash

echo "🚀 Preparing AI Interviewer for deployment..."

# Make backend build script executable
chmod +x backend/build.sh

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a git repository. Please initialize git first:"
    echo "   git init"
    echo "   git remote add origin <your-repo-url>"
    exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "📝 Found uncommitted changes. Preparing to commit..."
    
    # Show what will be committed
    echo ""
    echo "Files to be committed:"
    git status --short
    echo ""
    
    # Ask for commit message
    echo "Enter a commit message for these deployment changes:"
    read -p "Commit message: " commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Deploy: Prepare for Render and Vercel deployment"
    fi
    
    # Add all changes
    git add .
    
    # Commit changes
    git commit -m "$commit_message"
    
    echo "✅ Changes committed successfully!"
else
    echo "✅ No uncommitted changes found."
fi

# Push to main branch
echo ""
echo "🔄 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed to GitHub successfully!"
    echo ""
    echo "🎯 Next Steps:"
    echo ""
    echo "1. Backend Deployment (Render):"
    echo "   • Go to https://dashboard.render.com/"
    echo "   • Create new Web Service from your GitHub repository"
    echo "   • Use these settings:"
    echo "     - Build Command: ./backend/build.sh"
    echo "     - Start Command: cd backend && python main.py"
    echo "     - Environment: Python 3"
    echo ""
    echo "2. Frontend Deployment (Vercel):"
    echo "   • Go to https://vercel.com/dashboard"
    echo "   • Import your GitHub repository"
    echo "   • Set Root Directory to: frontend"
    echo "   • Framework will auto-detect as Create React App"
    echo ""
    echo "3. Environment Variables:"
    echo "   • See DEPLOYMENT.md for complete environment variable setup"
    echo "   • Update OAuth settings with production URLs"
    echo ""
    echo "📚 For detailed instructions, see: DEPLOYMENT.md"
else
    echo "❌ Failed to push to GitHub. Please check your git configuration."
    echo "Make sure you have:"
    echo "• Remote origin set up correctly"
    echo "• Proper authentication (SSH key or PAT)"
    echo "• Permission to push to the repository"
fi
