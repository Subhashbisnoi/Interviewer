"""
Razorpay Integration Service
Handles payment creation, verification, and subscription management
"""
import os
import razorpay
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

# Razorpay credentials (Individual Mode - no GST required)
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Pricing configuration (in INR)
PRICING = {
    "monthly": {
        "amount": 4900,  # ₹49 (amount in paise)
        "currency": "INR",
        "duration_days": 30,
        "name": "Premium Monthly",
        "description": "Unlimited AI interviews for 1 month"
    },
    "yearly": {
        "amount": 49900,  # ₹499 (amount in paise) - ~15% discount
        "currency": "INR",
        "duration_days": 365,
        "name": "Premium Yearly",
        "description": "Unlimited AI interviews for 1 year (Save ₹89)"
    }
}

def create_razorpay_order(plan_type: str, user_email: str, user_name: str) -> Dict[str, Any]:
    """
    Create a Razorpay order for payment
    
    Args:
        plan_type: "monthly" or "yearly"
        user_email: User's email
        user_name: User's full name
    
    Returns:
        Dictionary containing order details
    """
    if plan_type not in PRICING:
        raise ValueError(f"Invalid plan type: {plan_type}")
    
    plan = PRICING[plan_type]
    
    # Create order
    order_data = {
        "amount": plan["amount"],
        "currency": plan["currency"],
        "receipt": f"order_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "notes": {
            "plan_type": plan_type,
            "user_email": user_email,
            "user_name": user_name,
            "plan_name": plan["name"]
        }
    }
    
    try:
        order = razorpay_client.order.create(data=order_data)
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "plan_type": plan_type,
            "plan_name": plan["name"],
            "plan_description": plan["description"]
        }
    except Exception as e:
        print(f"Error creating Razorpay order: {e}")
        raise Exception(f"Failed to create payment order: {str(e)}")


def verify_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> bool:
    """
    Verify Razorpay payment signature for security
    
    Args:
        razorpay_order_id: Order ID from Razorpay
        razorpay_payment_id: Payment ID from Razorpay
        razorpay_signature: Signature from Razorpay
    
    Returns:
        Boolean indicating if signature is valid
    """
    try:
        # Create signature verification string
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        
        # Generate expected signature
        expected_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures
        return hmac.compare_digest(expected_signature, razorpay_signature)
    except Exception as e:
        print(f"Error verifying payment signature: {e}")
        return False


def fetch_payment_details(payment_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch payment details from Razorpay
    
    Args:
        payment_id: Razorpay payment ID
    
    Returns:
        Payment details dictionary or None
    """
    try:
        payment = razorpay_client.payment.fetch(payment_id)
        return {
            "id": payment["id"],
            "amount": payment["amount"],
            "currency": payment["currency"],
            "status": payment["status"],
            "method": payment.get("method"),
            "email": payment.get("email"),
            "contact": payment.get("contact"),
            "created_at": payment["created_at"]
        }
    except Exception as e:
        print(f"Error fetching payment details: {e}")
        return None


def create_razorpay_customer(email: str, name: str, contact: Optional[str] = None) -> Optional[str]:
    """
    Create a customer in Razorpay
    
    Args:
        email: Customer email
        name: Customer name
        contact: Customer phone number (optional)
    
    Returns:
        Razorpay customer ID or None
    """
    try:
        customer_data = {
            "email": email,
            "name": name,
            "fail_existing": 0  # Return existing customer if email already exists
        }
        
        if contact:
            customer_data["contact"] = contact
        
        customer = razorpay_client.customer.create(data=customer_data)
        return customer["id"]
    except Exception as e:
        print(f"Error creating Razorpay customer: {e}")
        return None


def calculate_subscription_expiry(plan_type: str, current_expiry: Optional[datetime] = None) -> datetime:
    """
    Calculate subscription expiry date
    
    Args:
        plan_type: "monthly" or "yearly"
        current_expiry: Current expiry date (for renewals)
    
    Returns:
        New expiry datetime
    """
    if plan_type not in PRICING:
        raise ValueError(f"Invalid plan type: {plan_type}")
    
    duration_days = PRICING[plan_type]["duration_days"]
    
    # If renewing before expiry, extend from current expiry
    if current_expiry and current_expiry > datetime.utcnow():
        return current_expiry + timedelta(days=duration_days)
    else:
        # New subscription or expired, start from now
        return datetime.utcnow() + timedelta(days=duration_days)


def get_plan_details(plan_type: str) -> Dict[str, Any]:
    """Get pricing details for a plan"""
    if plan_type not in PRICING:
        raise ValueError(f"Invalid plan type: {plan_type}")
    
    plan = PRICING[plan_type]
    return {
        "plan_type": plan_type,
        "name": plan["name"],
        "description": plan["description"],
        "amount": plan["amount"],
        "amount_inr": plan["amount"] / 100,  # Convert paise to rupees
        "currency": plan["currency"],
        "duration_days": plan["duration_days"]
    }


def get_all_plans() -> Dict[str, Dict[str, Any]]:
    """Get all available pricing plans"""
    return {
        plan_type: get_plan_details(plan_type)
        for plan_type in PRICING.keys()
    }


def initiate_refund(payment_id: str, amount: Optional[int] = None) -> Optional[Dict[str, Any]]:
    """
    Initiate a refund for a payment
    
    Args:
        payment_id: Razorpay payment ID
        amount: Amount to refund in paise (None for full refund)
    
    Returns:
        Refund details or None
    """
    try:
        refund_data = {"payment_id": payment_id}
        if amount:
            refund_data["amount"] = amount
        
        refund = razorpay_client.payment.refund(payment_id, refund_data)
        return {
            "refund_id": refund["id"],
            "payment_id": refund["payment_id"],
            "amount": refund["amount"],
            "status": refund["status"],
            "created_at": refund["created_at"]
        }
    except Exception as e:
        print(f"Error initiating refund: {e}")
        return None
