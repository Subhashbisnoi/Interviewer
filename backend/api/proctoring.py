from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from database import get_db
from models import ProctoringEvent, InterviewSession
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/proctoring", tags=["proctoring"])

class ProctoringLogRequest(BaseModel):
    type: str  # TAB_SWITCH, WINDOW_BLUR, COPY_PASTE_ATTEMPT, etc.
    count: Optional[int] = None
    timestamp: str
    sessionId: str
    key: Optional[str] = None  # For COPY_PASTE_ATTEMPT
    metadata: Optional[Dict[str, Any]] = None

@router.post("/log")
async def log_proctoring_event(event: ProctoringLogRequest, db: Session = Depends(get_db)):
    """Log suspicious activity during interview"""
    
    try:
        # Determine severity
        severity = get_severity_level(event.type, event.count)
        
        # Store in database
        proctoring_event = ProctoringEvent(
            session_id=event.sessionId,
            event_type=event.type,
            event_count=event.count,
            timestamp=datetime.fromisoformat(event.timestamp.replace('Z', '+00:00')),
            metadata=event.metadata or {},
            severity=severity
        )
        
        db.add(proctoring_event)
        
        # Update interview session proctoring score
        session = db.query(InterviewSession).filter(
            InterviewSession.thread_id == event.sessionId
        ).first()
        
        if session:
            # Deduct points based on event type
            deduction = get_score_deduction(event.type, event.count)
            session.proctoring_score = max(0, (session.proctoring_score or 100.0) - deduction)
            
            # Auto-terminate if threshold exceeded
            if event.type == "TAB_SWITCH" and event.count and event.count >= 5:
                session.termination_reason = f"Excessive tab switching ({event.count} times)"
                session.status = "terminated"
                logger.warning(f"Interview {event.sessionId} auto-terminated for excessive tab switching")
        
        db.commit()
        
        return {
            "status": "logged",
            "severity": severity,
            "warning_level": get_warning_level(event),
            "proctoring_score": session.proctoring_score if session else None
        }
    
    except Exception as e:
        logger.error(f"Error logging proctoring event: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def get_severity_level(event_type: str, count: Optional[int] = None) -> str:
    """Determine severity of proctoring event"""
    if event_type == "TAB_SWITCH":
        if count and count >= 3:
            return "CRITICAL"
        elif count and count >= 2:
            return "HIGH"
        elif count and count >= 1:
            return "MEDIUM"
    elif event_type == "COPY_PASTE_ATTEMPT":
        return "HIGH"
    elif event_type == "WINDOW_BLUR":
        return "LOW"
    
    return "LOW"

def get_warning_level(event: ProctoringLogRequest) -> str:
    """Get user-facing warning level"""
    if event.type == "TAB_SWITCH":
        if event.count and event.count >= 5:
            return "CRITICAL"
        elif event.count and event.count >= 3:
            return "HIGH"
        else:
            return "MEDIUM"
    elif event.type == "COPY_PASTE_ATTEMPT":
        return "HIGH"
    
    return "LOW"

def get_score_deduction(event_type: str, count: Optional[int] = None) -> float:
    """Calculate score deduction for proctoring violation"""
    if event_type == "TAB_SWITCH":
        # Progressive deduction
        if count == 1:
            return 2.0
        elif count == 2:
            return 3.0
        elif count == 3:
            return 5.0
        elif count and count >= 4:
            return 10.0
    elif event_type == "COPY_PASTE_ATTEMPT":
        return 5.0
    elif event_type == "WINDOW_BLUR":
        return 1.0
    
    return 0.0
