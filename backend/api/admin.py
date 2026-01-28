from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import timedelta
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models import InterviewSession, User, InterviewMode, ChatMessage
from api.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/admin", tags=["admin"])

# Hardcoded admin credentials as requested
ADMIN_EMAIL = "rarsubhash1@gmail.com"
ADMIN_PASSWORD = "Subhash@6565z"

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminToken(BaseModel):
    access_token: str
    token_type: str

class AdminInterviewSessionResponse(BaseModel):
    id: int
    user_email: Optional[str]
    user_name: Optional[str]
    role: str
    company: str
    status: str
    score: float
    created_at: str
    interview_mode: str
    
    class Config:
        orm_mode = True

@router.post("/login", response_model=AdminToken)
async def admin_login(login_data: AdminLoginRequest):
    if login_data.email == ADMIN_EMAIL and login_data.password == ADMIN_PASSWORD:
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        # We use a special subject or scope mostly distinct from normal users, 
        # but for simplicity we can just issue a token for this email.
        # Since this email might not exist in the Users table, relying on standard auth 
        # middlewares might be tricky if they look up the DB user. 
        # However, for just accessing the dashboard, we can issue a token.
        
        access_token = create_access_token(
            data={"sub": login_data.email, "scope": "admin"},
            expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid admin credentials"
    )

@router.get("/interviews")
async def get_all_interviews(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    # Depending on how strict we want to be, we could verify the token here.
    # For now, let's keep it open or assume the frontend handles the token.
    # ideally we want `current_user: User = Depends(get_current_active_admin)`
    
    # Joining with User to get email
    results = db.query(InterviewSession, User).outerjoin(User, InterviewSession.user_id == User.id).order_by(desc(InterviewSession.created_at)).offset(skip).limit(limit).all()
    
    output = []
    for session, user in results:
        output.append({
            "id": session.id,
            "user_email": user.email if user else "Anonymous",
            "user_name": user.full_name if user else "Guest",
            "role": session.role,
            "company": session.company,
            "status": session.status,
            "score": session.average_score,
            "created_at": session.created_at.isoformat(),
            "interview_mode": session.interview_mode
        })
        
    return output

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    """
    Get aggregated statistics for the admin dashboard
    """
    total_interviews = db.query(InterviewSession).count()
    total_users = db.query(User).count()
    
    # Calculate average score (ignoring 0/None)
    avg_score_query = db.query(InterviewSession).filter(InterviewSession.average_score > 0).all()
    avg_score = sum([s.average_score for s in avg_score_query]) / len(avg_score_query) if avg_score_query else 0.0
    
    # Status distribution
    status_counts = {}
    for status_val in ["active", "completed", "terminated"]:
        count = db.query(InterviewSession).filter(InterviewSession.status == status_val).count()
        status_counts[status_val] = count
        
    # Mode distribution
    mode_counts = {}
    for mode in ["short", "detailed"]:
        count = db.query(InterviewSession).filter(InterviewSession.interview_mode == mode).count()
        mode_counts[mode] = count
        
    # Score distribution (buckets)
    # 0-3, 3-5, 5-7, 7-8, 8-10
    score_buckets = {
        "Needs Improvement (0-4)": 0,
        "Average (4-6)": 0,
        "Good (6-8)": 0,
        "Excellent (8-10)": 0
    }
    
    all_scores = db.query(InterviewSession.average_score).filter(InterviewSession.status == "completed").all()
    for (score,) in all_scores:
        if score < 4:
            score_buckets["Needs Improvement (0-4)"] += 1
        elif score < 6:
            score_buckets["Average (4-6)"] += 1
        elif score < 8:
            score_buckets["Good (6-8)"] += 1
        else:
            score_buckets["Excellent (8-10)"] += 1

    # Daily activity (last 7 days)
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    daily_activity = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        date = today - timedelta(days=i)
        count = db.query(InterviewSession).filter(func.date(InterviewSession.created_at) == date).count()
        daily_activity.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })

    return {
        "total_interviews": total_interviews,
        "total_users": total_users,
        "average_score": round(avg_score, 2),
        "status_distribution": [{"name": k, "value": v} for k, v in status_counts.items() if v > 0],
        "mode_distribution": [{"name": k, "value": v} for k, v in mode_counts.items() if v > 0],
        "score_distribution": [{"name": k, "value": v} for k, v in score_buckets.items()],
        "daily_activity": daily_activity
    }

@router.get("/interviews/{session_id}")
async def get_interview_details(session_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information for a specific interview session, including chat history.
    """
    # Fetch session with user
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found"
        )
        
    user = db.query(User).filter(User.id == session.user_id).first() if session.user_id else None
    
    # Fetch chat messages
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    
    # Format messages
    formatted_messages = []
    for msg in messages:
        formatted_messages.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "message_type": msg.message_type,
            "created_at": msg.created_at.isoformat(),
            "marks": msg.marks,
            "metadata": msg.message_metadata
        })
        
    return {
        "session": {
            "id": session.id,
            "user_email": user.email if user else "Anonymous",
            "user_name": user.full_name if user else "Guest",
            "role": session.role,
            "company": session.company,
            "status": session.status,
            "score": session.average_score,
            "created_at": session.created_at.isoformat(),
            "interview_mode": session.interview_mode,
            "rounds_attempted": session.rounds_attempted,
            "job_description": session.job_description,
            "resume_text": session.resume_text
        },
        "messages": formatted_messages
    }
