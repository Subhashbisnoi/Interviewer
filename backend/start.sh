#!/usr/bin/env bash
# Start script for Render deployment

echo "🚀 Starting AI Interviewer Backend..."
echo "📁 Current directory: $(pwd)"
echo "🐍 Python version: $(python --version)"

# Change to backend directory if not already there
if [[ $(basename $(pwd)) != "backend" ]]; then
    cd backend
    echo "📁 Changed to backend directory: $(pwd)"
fi

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head
echo "✅ Migrations complete"

# Start the FastAPI server
exec python main.py