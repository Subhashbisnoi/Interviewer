"""
Payment API - Credit package purchases via Razorpay.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from database import get_db
from models import User, Payment
from api.auth import get_current_user
from api.credits import CREDIT_PACKAGES

router = APIRouter(prefix="/payment", tags=["payment"])


@router.get("/plans")
async def get_pricing_plans():
    """Return interview plans and credit packages."""
    return {
        "success": True,
        "interview_plans": {
            "normal": {
                "name": "Normal",
                "model": "GPT-4o",
                "credit_range": "13–17 credits per interview",
                "description": "Great for regular practice with a powerful model",
                "color": "blue",
            },
            "thunder": {
                "name": "Thunder",
                "model": "Claude Sonnet 4.5",
                "credit_range": "33–39 credits per interview",
                "description": "Deep, nuanced interviews with Anthropic's Sonnet",
                "color": "purple",
                "tag": "Popular",
            },
            "max": {
                "name": "Max",
                "model": "Claude Opus 4.7",
                "credit_range": "55–60 credits per interview",
                "description": "Most realistic, senior-level interview simulation",
                "color": "gold",
                "tag": "Best",
            },
        },
        "credit_packages": CREDIT_PACKAGES,
    }


@router.get("/history")
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payments = (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .limit(20)
        .all()
    )
    return {
        "payments": [
            {
                "id": p.id,
                "amount": p.amount,
                "currency": p.currency,
                "status": p.status,
                "package_type": p.package_type,
                "credits_granted": p.credits_granted,
                "created_at": p.created_at.isoformat(),
            }
            for p in payments
        ]
    }
