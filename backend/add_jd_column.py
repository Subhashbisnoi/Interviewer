"""
Database migration script to add job_description column to interview_sessions table.

Run this script to add the new column for JD feature.
Usage: python add_jd_column.py
"""

import os
import sys
from sqlalchemy import text

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal

def migrate():
    """Add job_description column to interview_sessions table."""
    
    print("Starting migration: Adding job_description column...")
    
    db = SessionLocal()
    try:
        # Check if column already exists
        check_query = text("""
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = 'interview_sessions' 
            AND column_name = 'job_description'
        """)
        
        result = db.execute(check_query).scalar()
        
        if result > 0:
            print("✓ Column 'job_description' already exists. Skipping migration.")
            return
        
        # Add the column
        alter_query = text("""
            ALTER TABLE interview_sessions 
            ADD COLUMN job_description TEXT
        """)
        
        db.execute(alter_query)
        db.commit()
        
        print("✓ Successfully added 'job_description' column to interview_sessions table.")
        print("✓ Migration complete!")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Migration failed: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
