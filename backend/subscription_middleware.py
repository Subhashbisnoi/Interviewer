"""
Subscription Middleware
Checks and enforces subscription limits
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models import User


def check_subscription_limit(user: User, db: Session) -> dict:
    """
    Check if user has reached their interview limit
    
    Returns:
        dict with 'allowed' (bool) and 'message' (str)
    """
    # Reset monthly counter if needed (new month)
    if user.last_interview_reset:
        days_since_reset = (datetime.utcnow() - user.last_interview_reset).days
        if days_since_reset >= 30:
            user.interviews_this_month = 0
            user.last_interview_reset = datetime.utcnow()
            db.commit()
    
    # Check if subscription expired
    if user.subscription_tier == "premium":
        if user.subscription_expires_at and user.subscription_expires_at < datetime.utcnow():
            # Subscription expired, downgrade to free
            user.subscription_tier = "free"
            user.subscription_status = "expired"
            user.interviews_this_month = 0
            user.last_interview_reset = datetime.utcnow()
            db.commit()
    
    # Premium users have unlimited interviews
    if user.subscription_tier == "premium" and user.subscription_status == "active":
        return {
            "allowed": True,
            "message": "Premium user - unlimited interviews",
            "tier": "premium",
            "remaining": "unlimited"
        }
    
    # Free tier limit check
    FREE_TIER_LIMIT = 3
    
    if user.interviews_this_month >= FREE_TIER_LIMIT:
        return {
            "allowed": False,
            "message": f"You've reached your free tier limit of {FREE_TIER_LIMIT} interviews this month. Upgrade to Premium for unlimited interviews!",
            "tier": "free",
            "remaining": 0,
            "limit": FREE_TIER_LIMIT
        }
    
    return {
        "allowed": True,
        "message": "Interview allowed",
        "tier": "free",
        "remaining": FREE_TIER_LIMIT - user.interviews_this_month,
        "limit": FREE_TIER_LIMIT
    }


def increment_interview_count(user: User, db: Session):
    """Increment user's interview count for the month"""
    user.interviews_this_month += 1
    db.commit()


def get_subscription_info(user: User) -> dict:
    """Get user's subscription information"""
    if user.subscription_tier == "premium":
        return {
            "tier": "premium",
            "status": user.subscription_status,
            "expires_at": user.subscription_expires_at.isoformat() if user.subscription_expires_at else None,
            "interviews_limit": "unlimited",
            "interviews_used": user.interviews_this_month
        }
    else:
        FREE_TIER_LIMIT = 3
        return {
            "tier": "free",
            "status": "active",
            "expires_at": None,
            "interviews_limit": FREE_TIER_LIMIT,
            "interviews_used": user.interviews_this_month,
            "interviews_remaining": max(0, FREE_TIER_LIMIT - user.interviews_this_month)
        }
