"""
Credits API
Manage user credits: view balance, purchase packages, view transaction history.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime

import os
import razorpay
import hmac
import hashlib

from database import get_db
from models import User, CreditTransaction, Payment
from api.auth import get_current_user

_rz_key = os.getenv("RAZORPAY_KEY_ID")
_rz_secret = os.getenv("RAZORPAY_KEY_SECRET")
_rz_client = razorpay.Client(auth=(_rz_key, _rz_secret)) if _rz_key else None


def _create_order(amount_paise: int, notes: dict) -> dict:
    if not _rz_client:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")
    import time
    order = _rz_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"credits_{int(time.time())}",
        "notes": notes,
    })
    return order


def _verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    if not _rz_secret:
        return False
    expected = hmac.new(
        _rz_secret.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

router = APIRouter(prefix="/credits", tags=["credits"])

# Credit packages (price in INR, credits granted)
CREDIT_PACKAGES = {
    "credits_50": {
        "name": "Starter Pack",
        "credits": 50,
        "price_inr": 99,
        "price_paise": 9900,
        "description": "50 credits – good for 3-4 Normal interviews",
    },
    "credits_100": {
        "name": "Value Pack",
        "credits": 100,
        "price_inr": 149,
        "price_paise": 14900,
        "description": "100 credits – best value for regular practice",
        "tag": "Popular",
    },
    "credits_200": {
        "name": "Power Pack",
        "credits": 200,
        "price_inr": 199,
        "price_paise": 19900,
        "description": "200 credits – serious prep for job seekers",
        "tag": "Best Value",
    },
}


@router.get("/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    return {
        "credits": current_user.credits,
        "user_id": current_user.id,
    }


@router.get("/packages")
async def get_packages():
    return {"packages": CREDIT_PACKAGES}


@router.post("/create-order")
async def create_credit_order(
    data: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    package_type = data.get("package_type")
    if package_type not in CREDIT_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package type")

    pkg = CREDIT_PACKAGES[package_type]
    try:
        order = _create_order(
            amount_paise=pkg["price_paise"],
            notes={"package_type": package_type, "user_id": str(current_user.id)},
        )
        return {
            "order_id": order["id"],
            "amount": pkg["price_paise"],
            "currency": "INR",
            "package": pkg,
            "package_type": package_type,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-payment")
async def verify_credit_payment(
    data: Dict[str, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    razorpay_order_id = data.get("razorpay_order_id")
    razorpay_payment_id = data.get("razorpay_payment_id")
    razorpay_signature = data.get("razorpay_signature")
    package_type = data.get("package_type")

    if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature, package_type]):
        raise HTTPException(status_code=400, detail="Missing payment details")

    if package_type not in CREDIT_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package type")

    is_valid = _verify_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Payment verification failed")

    pkg = CREDIT_PACKAGES[package_type]
    credits_to_add = pkg["credits"]

    # Save payment record
    payment = Payment(
        user_id=current_user.id,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
        amount=pkg["price_inr"],
        currency="INR",
        status="paid",
        package_type=package_type,
        credits_granted=credits_to_add,
    )
    db.add(payment)
    db.flush()  # get payment.id

    # Add credits to user
    current_user.credits = (current_user.credits or 0) + credits_to_add
    new_balance = current_user.credits

    txn = CreditTransaction(
        user_id=current_user.id,
        amount=credits_to_add,
        balance_after=new_balance,
        transaction_type="purchase",
        description=f"Purchased {pkg['name']} ({credits_to_add} credits)",
        payment_id=payment.id,
    )
    db.add(txn)
    db.commit()

    return {
        "success": True,
        "credits_added": credits_to_add,
        "new_balance": new_balance,
        "message": f"Successfully added {credits_to_add} credits to your account!",
    }


@router.get("/transactions")
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txns = (
        db.query(CreditTransaction)
        .filter(CreditTransaction.user_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(50)
        .all()
    )
    return {
        "transactions": [
            {
                "id": t.id,
                "amount": t.amount,
                "balance_after": t.balance_after,
                "type": t.transaction_type,
                "description": t.description,
                "created_at": t.created_at.isoformat(),
            }
            for t in txns
        ]
    }
