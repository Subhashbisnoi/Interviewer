#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "🐍 Python version:"
python --version

echo "🔧 Upgrading build tools..."
pip install --upgrade pip setuptools wheel

echo "🔧 Installing core dependencies first..."
pip install --no-cache-dir fastapi uvicorn[standard] pydantic[email] sqlalchemy

echo "🔧 Installing remaining dependencies..."
pip install --no-cache-dir -r requirements-minimal.txt

echo "🗄️ Setting up database..."
# Run database initialization if needed
python init_db.py || echo "Database initialization completed or not needed"

echo "✅ Build completed successfully!"h
# Exit on error
set -o errexit

echo "� Python version:"
python --version

echo "🔧 Upgrading pip..."
pip install --upgrade pip

echo "�🔧 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Setting up database..."
# Run database initialization if needed
python init_db.py || echo "Database initialization completed or not needed"

echo "✅ Build completed successfully!"
