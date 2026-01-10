"""
Cache warming utility to pre-load user data on login.
This ensures dashboard and other frequently accessed data is available instantly.
"""
import asyncio
from typing import Optional
from sqlalchemy.orm import Session
from models import User, InterviewSession, ChatMessage
from cache import cache
from database import SessionLocal


def warm_user_cache(user_id: int, db: Optional[Session] = None):
    """
    Pre-load all frequently accessed data for a user into cache.
    This runs synchronously to ensure cache is warm before login response.
    
    Args:
        user_id: The user's ID
        db: Optional database session (will create one if not provided)
    """
    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True
    
    try:
        # 1. Warm sessions cache
        _warm_sessions_cache(user_id, db)
        
        # 2. Warm analytics cache
        _warm_analytics_cache(user_id, db)
        
        # 3. Warm pinned sessions cache
        _warm_pinned_cache(user_id, db)
        
        print(f"CACHE WARM: Pre-loaded all data for user {user_id}")
        
    except Exception as e:
        print(f"CACHE WARM ERROR: Failed to warm cache for user {user_id}: {e}")
    finally:
        if should_close_db:
            db.close()


def _warm_sessions_cache(user_id: int, db: Session):
    """Pre-load sessions list into cache."""
    cache_key = f"sessions:user:{user_id}"
    
    # Skip if already cached
    if cache.get(cache_key) is not None:
        return
    
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).order_by(InterviewSession.created_at.desc()).all()
    
    if not sessions:
        cache.set(cache_key, {"sessions": []}, ttl=60)
        return
    
    # Batch query for feedback
    session_ids = [s.id for s in sessions]
    sessions_with_feedback = set(
        row[0] for row in db.query(ChatMessage.session_id).filter(
            ChatMessage.session_id.in_(session_ids),
            ChatMessage.message_type == "feedback"
        ).distinct().all()
    )
    
    formatted_sessions = []
    for session in sessions:
        has_feedback = session.id in sessions_with_feedback
        session_data = {
            "thread_id": session.thread_id,
            "session_id": session.thread_id,
            "created_at": session.created_at.isoformat(),
            "status": "completed" if has_feedback else "in_progress",
            "score": session.average_score if session.average_score > 0 else None,
            "company": session.company,
            "role": session.role,
            "has_results": has_feedback,
            "is_pinned": session.is_pinned
        }
        formatted_sessions.append(session_data)
    
    cache.set(cache_key, {"sessions": formatted_sessions}, ttl=60)


def _warm_analytics_cache(user_id: int, db: Session):
    """Pre-load analytics into cache."""
    cache_key = f"analytics:user:{user_id}"
    
    # Skip if already cached
    if cache.get(cache_key) is not None:
        return
    
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id
    ).all()
    
    total_interviews = len(sessions)
    
    if not sessions:
        result = {
            "total_interviews": 0,
            "completed_interviews": 0,
            "average_score": 0,
            "best_score": 0,
            "companies": [],
            "roles": []
        }
        cache.set(cache_key, result, ttl=300)
        return
    
    # Batch query for feedback
    session_ids = [s.id for s in sessions]
    sessions_with_feedback = set(
        row[0] for row in db.query(ChatMessage.session_id).filter(
            ChatMessage.session_id.in_(session_ids),
            ChatMessage.message_type == "feedback"
        ).distinct().all()
    )
    
    completed_sessions = []
    companies = set()
    roles = set()
    
    for session in sessions:
        companies.add(session.company)
        roles.add(session.role)
        if session.id in sessions_with_feedback:
            completed_sessions.append(session)
    
    scores = [s.average_score for s in completed_sessions if s.average_score > 0]
    average_score = sum(scores) / len(scores) if scores else 0
    best_score = max(scores) if scores else 0
    
    result = {
        "total_interviews": total_interviews,
        "completed_interviews": len(completed_sessions),
        "average_score": round(average_score, 1),
        "best_score": round(best_score, 1),
        "companies": list(companies),
        "roles": list(roles)
    }
    cache.set(cache_key, result, ttl=300)


def _warm_pinned_cache(user_id: int, db: Session):
    """Pre-load pinned sessions into cache."""
    cache_key = f"pinned:user:{user_id}"
    
    # Skip if already cached
    if cache.get(cache_key) is not None:
        return
    
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user_id,
        InterviewSession.is_pinned == True
    ).order_by(InterviewSession.updated_at.desc()).all()
    
    if not sessions:
        cache.set(cache_key, {"pinned_sessions": []}, ttl=60)
        return
    
    # Batch query for messages
    session_ids = [s.id for s in sessions]
    all_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id.in_(session_ids),
        ChatMessage.message_type.in_(["feedback", "roadmap"])
    ).all()
    
    # Group messages by session_id
    messages_by_session = {}
    for msg in all_messages:
        if msg.session_id not in messages_by_session:
            messages_by_session[msg.session_id] = []
        messages_by_session[msg.session_id].append(msg)
    
    sessions_data = []
    for session in sessions:
        session_messages = messages_by_session.get(session.id, [])
        feedback_msg = next((m for m in session_messages if m.message_type == "feedback"), None)
        roadmap_msg = next((m for m in session_messages if m.message_type == "roadmap"), None)
        
        session_data = {
            "thread_id": session.thread_id,
            "session_id": session.id,
            "role": session.role,
            "company": session.company,
            "status": session.status,
            "total_score": session.total_score,
            "average_score": session.average_score,
            "is_pinned": session.is_pinned,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "completed_at": session.completed_at.isoformat() if session.completed_at else None,
            "feedback": feedback_msg.content if feedback_msg else None,
            "roadmap": roadmap_msg.content if roadmap_msg else None
        }
        sessions_data.append(session_data)
    
    cache.set(cache_key, {"pinned_sessions": sessions_data}, ttl=60)


async def warm_user_cache_async(user_id: int):
    """
    Async version that runs cache warming in background.
    Use this when you don't want to block the response.
    """
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, warm_user_cache, user_id, None)
