"""
Payment API Routes
Handles subscription payments and tier management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any

from database import get_db
from models import User, Payment
from api.auth import get_current_user
from razorpay_service import (
    create_razorpay_order,
    verify_payment_signature,
    fetch_payment_details,
    create_razorpay_customer,
    calculate_subscription_expiry,
    get_all_plans,
    get_plan_details
)
from cache import cache

router = APIRouter(prefix="/payment", tags=["payment"])


@router.get("/plans")
async def get_pricing_plans():
    """Get all available pricing plans"""
    try:
        plans = get_all_plans()
        return {
            "success": True,
            "plans": plans,
            "features": {
                "free": {
                    "interviews_per_month": 3,
                    "features": [
                        "3 AI interviews per month",
                        "Basic feedback",
                        "Learning roadmap",
                        "Interview history"
                    ]
                },
                "premium": {
                    "interviews_per_month": "unlimited",
                    "features": [
                        "Unlimited AI interviews",
                        "Detailed feedback with scores",
                        "Personalized learning roadmap",
                        "Interview history & analytics",
                        "Priority support",
                        "Advanced proctoring insights",
                        "Pin unlimited results",
                        "Download results as PDF"
                    ]
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-order")
async def create_payment_order(
    plan_data: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Razorpay order for subscription payment
    
    Request body:
    {
        "plan_type": "monthly" or "yearly"
    }
    """
    try:
        plan_type = plan_data.get("plan_type")
        
        if not plan_type or plan_type not in ["monthly", "yearly"]:
            raise HTTPException(status_code=400, detail="Invalid plan type")
        
        # Create Razorpay customer if not exists
        if not current_user.razorpay_customer_id:
            customer_id = create_razorpay_customer(
                email=current_user.email,
                name=current_user.full_name or "User"
            )
            if customer_id:
                current_user.razorpay_customer_id = customer_id
                db.commit()
        
        # Create Razorpay order
        order = create_razorpay_order(
            plan_type=plan_type,
            user_email=current_user.email,
            user_name=current_user.full_name or "User"
        )
        
        # Save payment record in database
        payment = Payment(
            user_id=current_user.id,
            razorpay_order_id=order["order_id"],
            amount=order["amount"] / 100,  # Convert paise to rupees
            currency=order["currency"],
            plan_type=plan_type,
            status="created"
        )
        db.add(payment)
        db.commit()
        
        return {
            "success": True,
            "order": order,
            "key_id": get_razorpay_key_id()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error creating payment order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")


@router.post("/verify")
async def verify_payment(
    payment_data: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment and activate subscription
    
    Request body:
    {
        "razorpay_order_id": "order_xxx",
        "razorpay_payment_id": "pay_xxx",
        "razorpay_signature": "signature_xxx"
    }
    """
    try:
        order_id = payment_data.get("razorpay_order_id")
        payment_id = payment_data.get("razorpay_payment_id")
        signature = payment_data.get("razorpay_signature")
        
        if not all([order_id, payment_id, signature]):
            raise HTTPException(status_code=400, detail="Missing payment details")
        
        # Find payment record
        payment = db.query(Payment).filter(
            Payment.razorpay_order_id == order_id,
            Payment.user_id == current_user.id
        ).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        
        # Verify signature
        is_valid = verify_payment_signature(order_id, payment_id, signature)
        
        if not is_valid:
            payment.status = "failed"
            db.commit()
            raise HTTPException(status_code=400, detail="Invalid payment signature")
        
        # Fetch payment details from Razorpay
        payment_details = fetch_payment_details(payment_id)
        
        if not payment_details or payment_details["status"] != "captured":
            payment.status = "failed"
            db.commit()
            raise HTTPException(status_code=400, detail="Payment not successful")
        
        # Update payment record
        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = "paid"
        payment.payment_method = payment_details.get("method")
        
        # Activate subscription
        expiry_date = calculate_subscription_expiry(
            payment.plan_type,
            current_user.subscription_expires_at
        )
        
        current_user.subscription_tier = "premium"
        current_user.subscription_status = "active"
        current_user.subscription_expires_at = expiry_date
        current_user.interviews_this_month = 0  # Reset usage counter
        
        db.commit()
        
        # Clear analytics cache
        cache.delete(f"analytics:user:{current_user.id}")
        
        return {
            "success": True,
            "message": "Payment successful! Your premium subscription is now active.",
            "subscription": {
                "tier": current_user.subscription_tier,
                "status": current_user.subscription_status,
                "expires_at": current_user.subscription_expires_at.isoformat()
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error verifying payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify payment")


@router.get("/subscription")
async def get_subscription_status(
    current_user: User = Depends(get_current_user)
):
    """Get current user's subscription status"""
    return {
        "success": True,
        "subscription": {
            "tier": current_user.subscription_tier,
            "status": current_user.subscription_status,
            "expires_at": current_user.subscription_expires_at.isoformat() if current_user.subscription_expires_at else None,
            "interviews_this_month": current_user.interviews_this_month,
            "interviews_limit": 3 if current_user.subscription_tier == "free" else "unlimited"
        }
    }


@router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel premium subscription (will remain active until expiry)"""
    try:
        if current_user.subscription_tier != "premium":
            raise HTTPException(status_code=400, detail="No active premium subscription")
        
        current_user.subscription_status = "cancelled"
        db.commit()
        
        # Clear cache
        cache.delete(f"analytics:user:{current_user.id}")
        
        return {
            "success": True,
            "message": "Subscription cancelled. You can continue using premium features until expiry.",
            "expires_at": current_user.subscription_expires_at.isoformat() if current_user.subscription_expires_at else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to cancel subscription")


@router.get("/history")
async def get_payment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's payment history"""
    try:
        payments = db.query(Payment).filter(
            Payment.user_id == current_user.id
        ).order_by(Payment.created_at.desc()).all()
        
        payment_list = []
        for payment in payments:
            payment_list.append({
                "id": payment.id,
                "order_id": payment.razorpay_order_id,
                "payment_id": payment.razorpay_payment_id,
                "amount": payment.amount,
                "currency": payment.currency,
                "status": payment.status,
                "plan_type": payment.plan_type,
                "payment_method": payment.payment_method,
                "created_at": payment.created_at.isoformat()
            })
        
        return {
            "success": True,
            "payments": payment_list
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch payment history")


def get_razorpay_key_id():
    """Get Razorpay key ID for frontend"""
    import os
    return os.getenv("RAZORPAY_KEY_ID")
