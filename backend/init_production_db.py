"""
Initialize production database with correct schema.
This script drops all tables and recreates them to ensure schema consistency.
"""
import os
import sys

# Add the current directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from database import Base, engine, SessionLocal
from models import User, InterviewSession, ChatMessage, OTP

def init_database():
    """Initialize the database by creating all tables."""
    print("🔄 Initializing database...")
    
    try:
        # Drop all existing tables (only in production setup, not in runtime)
        print("⚠️  Dropping existing tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables with current schema
        print("✅ Creating tables with current schema...")
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        db = SessionLocal()
        try:
            # Test query
            db.execute("SELECT 1 FROM users LIMIT 1")
            print("✅ Database initialized successfully!")
            print(f"📊 Tables created: {', '.join(Base.metadata.tables.keys())}")
        except Exception as e:
            print(f"⚠️  Warning during verification: {e}")
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()
