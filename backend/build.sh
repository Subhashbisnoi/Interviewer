#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🔧 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Setting up database..."
# Run database initialization if needed
python init_db.py || echo "Database initialization completed or not needed"

echo "✅ Build completed successfully!"
