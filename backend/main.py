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

# Create tables
Base.metadata.create_all(bind=engine)

# Import the routers after database initialization
# Temporarily disable AI features for deployment
# from api.interview import router as interview_router
# from api.interview_v2 import router as interview_v2_router
# from api.tts import router as tts_router
# from api.voice import router as voice_router
from api.auth import router as auth_router

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
        "https://*.vercel.app",  # Allow all Vercel subdomains
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],  # Allow all if no specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handle preflight OPTIONS requests
@app.options("/{full_path:path}")
async def options_handler(request: Request, response: Response):
    return Response(status_code=200)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
# Temporarily disable AI and audio features for deployment
# app.include_router(interview_router)
# app.include_router(interview_v2_router)
# app.include_router(tts_router)
# app.include_router(voice_router)

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

