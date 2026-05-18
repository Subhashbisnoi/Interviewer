import os
import sys
import uuid
from datetime import datetime
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the current directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

# Initialize database before importing routers
from database import Base, engine
from sqlalchemy import text

# Run ADD COLUMN IF NOT EXISTS on every startup to ensure production DB is up to date
def _patch_db():
    _cols = [
        ("user_profiles", "headline",                "VARCHAR"),
        ("user_profiles", "bio",                     "TEXT"),
        ("user_profiles", "location",                "VARCHAR"),
        ("user_profiles", "avatar_url",              "VARCHAR"),
        ("user_profiles", "target_roles",            "JSON"),
        ("user_profiles", "experience_years",        "FLOAT DEFAULT 0"),
        ("user_profiles", "skills",                  "JSON"),
        ("user_profiles", "work_experience",         "JSON"),
        ("user_profiles", "education",               "JSON"),
        ("user_profiles", "projects",                "JSON"),
        ("user_profiles", "linkedin_url",            "VARCHAR"),
        ("user_profiles", "github_url",              "VARCHAR"),
        ("user_profiles", "portfolio_url",           "VARCHAR"),
        ("user_profiles", "resume_text",             "TEXT"),
        ("user_profiles", "is_visible_to_recruiters","BOOLEAN DEFAULT true"),
        ("user_profiles", "resume_score",            "FLOAT"),
        ("user_profiles", "linkedin_score",          "FLOAT"),
        ("user_profiles", "github_score",            "FLOAT"),
        ("user_profiles", "profile_score",           "FLOAT"),
        ("user_profiles", "profile_completion",      "FLOAT DEFAULT 0"),
        ("user_profiles", "resume_filename",         "VARCHAR"),
        ("user_profiles", "resume_uploaded_at",      "TIMESTAMP"),
        ("user_profiles", "streak_days",             "INTEGER DEFAULT 0"),
        ("user_profiles", "last_active_date",        "DATE"),
        ("user_profiles", "daily_activity",          "JSON"),
        ("user_profiles", "resume_score_breakdown",  "JSON"),
        ("user_profiles", "github_score_breakdown",  "JSON"),
        ("user_profiles", "linkedin_score_breakdown","JSON"),
        ("user_profiles", "resume_feedback",         "TEXT"),
        ("user_profiles", "github_feedback",         "TEXT"),
        ("user_profiles", "linkedin_feedback",       "TEXT"),
        ("user_profiles", "created_at",              "TIMESTAMP DEFAULT now()"),
        ("user_profiles", "updated_at",              "TIMESTAMP DEFAULT now()"),
        ("users",         "credits",                 "INTEGER DEFAULT 20"),
        ("interview_sessions", "plan_type",              "VARCHAR DEFAULT 'normal'"),
        ("interview_sessions", "credits_used",           "INTEGER DEFAULT 0"),
        ("interview_sessions", "score_technical",        "FLOAT"),
        ("interview_sessions", "score_communication",    "FLOAT"),
        ("interview_sessions", "score_leadership",       "FLOAT"),
        ("interview_sessions", "score_critical_thinking","FLOAT"),
        ("interview_sessions", "score_decision_making",  "FLOAT"),
        ("interview_sessions", "score_project_knowledge","FLOAT"),
    ]
    try:
        with engine.connect() as conn:
            for table, col, col_type in _cols:
                conn.execute(text(
                    f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_type}"
                ))
            conn.commit()
        print("✅ DB patch applied")
    except Exception as e:
        print(f"⚠️  DB patch warning: {e}")

_patch_db()

# Import the routers after database initialization
from api.interview import router as interview_router
from api.auth import router as auth_router
from api.payment import router as payment_router
from api.credits import router as credits_router
from api.profile import router as profile_router
from api.company import router as company_router
from api.admin import router as admin_router

# Legacy routers — imported conditionally so missing deps don't break startup
try:
    from api.interview_v2 import router as interview_v2_router
    _has_v2 = True
except Exception:
    _has_v2 = False

try:
    from api.tts import router as tts_router
    _has_tts = True
except Exception:
    _has_tts = False

try:
    from api.voice import router as voice_router
    _has_voice = True
except Exception:
    _has_voice = False

app = FastAPI(
    title="AI Interviewer API",
    version="1.0.0",
    description="AI-powered interview system"
)

# Configure CORS for production
origins = []
if os.getenv("ALLOWED_ORIGINS"):
    origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS").split(",")]
else:
    # Default origins for development and production
    origins = [
        "http://localhost:3000",
        "http://localhost:3015",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3015",
        "https://interviewer-tan.vercel.app",
        "https://interviewer-tan.vercel.app/",  # With trailing slash
        "https://interviewer.vercel.app",
        "https://interviewforge.live"  # Alternative domain if you change it
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use specific origins for security
    allow_credentials=True,  # Enable credentials for OAuth
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Add security headers that won't interfere with OAuth
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Don't add COOP/COEP headers that might break OAuth
    # These can interfere with OAuth popups and redirects
    
    return response

# Handle preflight OPTIONS requests
@app.options("/{full_path:path}")
async def options_handler(request: Request, response: Response):
    return Response(status_code=200)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(payment_router)
app.include_router(credits_router)
app.include_router(profile_router)
app.include_router(company_router)
app.include_router(interview_router)
app.include_router(admin_router)

if _has_v2:
    app.include_router(interview_v2_router)
if _has_tts:
    app.include_router(tts_router)
if _has_voice:
    app.include_router(voice_router)

# Basic routes
@app.get("/")
async def root():
    return {"message": "AI Interviewer API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy", 
        "message": "AI Interviewer API is running",
        "version": "1.0.0"
    }

@app.get("/debug/db")
async def debug_database():
    """Debug database connectivity."""
    try:
        from database import get_db
        from models import User
        from sqlalchemy.orm import Session
        
        # Test database connection
        db_gen = get_db()
        db: Session = next(db_gen)
        
        # Try to query users table (should work even if empty)
        user_count = db.query(User).count()
        
        return {
            "status": "success",
            "message": "Database connected successfully",
            "user_count": user_count
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Database connection failed: {str(e)}",
            "error_type": type(e).__name__
        }

# Temporary basic routes for testing
@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify API is working."""
    return {
        "status": "success",
        "message": "API is working correctly",
        "timestamp": str(datetime.now())
    }

@app.post("/api/interview/start")
async def start_interview_placeholder():
    """Placeholder endpoint for interview start."""
    return {
        "status": "success",
        "message": "Interview functionality will be available after full deployment",
        "session_id": str(uuid.uuid4())
    }

@app.get("/api/features")
async def available_features():
    """Show what features are currently available."""
    return {
        "status": "success",
        "available_features": [
            "Authentication",
            "User Management", 
            "Health Checks",
            "API Documentation"
        ],
        "disabled_features": [
            "AI Interviews (temporarily disabled)",
            "Text-to-Speech (temporarily disabled)", 
            "Voice Processing (temporarily disabled)"
        ],
        "message": "Core API is running. Additional features will be enabled after successful deployment."
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    print(f"🚀 Starting server on port {port}")
    print(f"🔧 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🔄 Reload enabled: {reload}")
    
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=reload,
        log_level="info"
    )

