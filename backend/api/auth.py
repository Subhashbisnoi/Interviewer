from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional, Annotated
import secrets
import random
import string
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os
import sys
from dotenv import load_dotenv
# Google OAuth imports - optional for deployment
try:
    from google.auth.transport import requests
    from google.oauth2 import id_token
    GOOGLE_AUTH_AVAILABLE = True
except ImportError:
    GOOGLE_AUTH_AVAILABLE = False
    # Create dummy classes for when Google auth is not available
    class requests:
        pass
    class id_token:
        @staticmethod
        def verify_oauth2_token(*args, **kwargs):
            raise HTTPException(status_code=501, detail="Google OAuth not configured")
from pydantic import BaseModel
import httpx
import json

# Add the parent directory to sys.path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Import database and models
from database import get_db, SessionLocal
from models import User, InterviewSession, ChatMessage, OTP, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest, MessageResponse
from schemas.auth import UserCreate, UserInDB, Token, TokenData, UserResponse
# Email utilities - optional for deployment
try:
    from email_utils import send_otp_email, send_password_reset_confirmation_email
    EMAIL_UTILS_AVAILABLE = True
except ImportError:
    EMAIL_UTILS_AVAILABLE = False
    # Create dummy functions when email utils are not available
    def send_otp_email(*args, **kwargs):
        return {"status": "error", "message": "Email service not configured"}
    def send_password_reset_confirmation_email(*args, **kwargs):
        return {"status": "error", "message": "Email service not configured"}

# Security
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_hex(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

# Password hashing - use default bcrypt configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class GoogleCredential(BaseModel):
    credential: str

class GitHubCredential(BaseModel):
    code: str

router = APIRouter()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Debug: print password info
    print(f"Hashing password: '{password}', length: {len(password)}, bytes: {len(password.encode('utf-8'))}")
    
    try:
        # Simple password hashing without truncation
        result = pwd_context.hash(password)
        print(f"Successfully hashed password")
        return result
    except Exception as e:
        print(f"Error hashing password: {e}")
        # If bcrypt fails due to length, try a simple workaround
        if "72 bytes" in str(e) and len(password) <= 72:
            # This shouldn't happen, but if it does, try with explicit encoding
            try:
                result = pwd_context.hash(password.encode('utf-8').decode('utf-8'))
                print(f"Successfully hashed password with encoding workaround")
                return result
            except Exception as e2:
                print(f"Encoding workaround also failed: {e2}")
        raise

def get_user(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_data: UserCreate) -> User:
    """Create a new user in the database."""
    # Check if user already exists
    db_user = get_user(db, email=user_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        print(f"Database error creating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get the current user's profile
    """
    return current_user

@router.post("/signup", response_model=Token)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user account
    """
    try:
        # Validate password length
        if len(user_data.password.encode('utf-8')) > 72:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is too long. Please use a shorter password."
            )
            
        # Create new user using the helper function
        db_user = create_user(db, user_data)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": db_user.id,
                "email": db_user.email,
                "full_name": db_user.full_name,
                "is_active": db_user.is_active
            }
        }
    except HTTPException:
        # Re-raise HTTP exceptions (like duplicate email)
        raise
    except Exception as e:
        # Handle any other unexpected errors
        print(f"Signup error: {str(e)}")  # Add logging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during signup: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password to get access token
    """
    try:
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active
            }
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle any other unexpected errors
        print(f"Login error: {str(e)}")  # Add logging
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during login: {str(e)}"
        )

def verify_google_token(credential: str) -> dict:
    """Verify Google ID token and return user info"""
    if not GOOGLE_AUTH_AVAILABLE:
        raise HTTPException(
            status_code=501, 
            detail="Google OAuth libraries are not installed"
        )
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501, 
            detail="Google OAuth is not configured - GOOGLE_CLIENT_ID environment variable is missing"
        )
        
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            credential, requests.Request(), GOOGLE_CLIENT_ID
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
            
        return idinfo
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Google token: {str(e)}"
        )

async def verify_github_token(code: str) -> dict:
    """Exchange GitHub authorization code for user info"""
    try:
        # Exchange code for access token
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": GITHUB_CLIENT_ID,
            "client_secret": GITHUB_CLIENT_SECRET,
            "code": code
        }
        token_headers = {"Accept": "application/json"}
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data, headers=token_headers)
            token_response.raise_for_status()
            token_json = token_response.json()
        
        if "access_token" not in token_json:
            raise ValueError("No access token received from GitHub")
        
        access_token = token_json["access_token"]
        
        # Get user info using access token
        user_url = "https://api.github.com/user"
        user_headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        async with httpx.AsyncClient() as client:
            user_response = await client.get(user_url, headers=user_headers)
            user_response.raise_for_status()
            user_data = user_response.json()
        
        # Get user email (GitHub email might be private)
        email_url = "https://api.github.com/user/emails"
        async with httpx.AsyncClient() as client:
            email_response = await client.get(email_url, headers=user_headers)
            email_response.raise_for_status()
            emails = email_response.json()
        
        # Find primary email
        primary_email = None
        for email_obj in emails:
            if email_obj.get("primary", False):
                primary_email = email_obj["email"]
                break
        
        if not primary_email and emails:
            primary_email = emails[0]["email"]
        
        if not primary_email:
            raise ValueError("No email found in GitHub account")
        
        return {
            "email": primary_email,
            "name": user_data.get("name") or user_data.get("login", ""),
            "avatar_url": user_data.get("avatar_url"),
            "github_id": user_data.get("id")
        }
        
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub API error: {str(e)}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GitHub response: {str(e)}"
        )

@router.post("/google", response_model=Token)
async def google_auth(
    google_data: GoogleCredential,
    db: Session = Depends(get_db)
):
    """
    Authenticate with Google OAuth
    """
    if not GOOGLE_AUTH_AVAILABLE:
        raise HTTPException(
            status_code=501, 
            detail="Google OAuth libraries are not installed"
        )
    
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501, 
            detail="Google OAuth is not configured - GOOGLE_CLIENT_ID environment variable is missing"
        )
        
    try:
        # Verify the Google token
        user_info = verify_google_token(google_data.credential)
        
        email = user_info.get('email')
        full_name = user_info.get('name', '')
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )
        
        # Check if user exists
        user = get_user(db, email)
        
        if not user:
            # Create new user for Google OAuth
            hashed_password = get_password_hash(secrets.token_hex(32))  # Random password for OAuth users
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=hashed_password,
                is_active=True
            )
            
            try:
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active
            }
        }
    except HTTPException:
        raise
@router.post("/github", response_model=Token)
async def github_auth(
    github_data: GitHubCredential,
    db: Session = Depends(get_db)
):
    """
    Authenticate with GitHub OAuth
    """
    try:
        # Verify the GitHub code and get user info
        user_info = await verify_github_token(github_data.code)
        
        email = user_info.get('email')
        full_name = user_info.get('name', '')
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by GitHub"
            )
        
        # Check if user exists
        user = get_user(db, email)
        
        if not user:
            # Create new user for GitHub OAuth
            hashed_password = get_password_hash(secrets.token_hex(32))  # Random password for OAuth users
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=hashed_password,
                is_active=True
            )
            
            try:
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create user"
                )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during GitHub authentication"
        )
def generate_otp() -> str:
    """Generate a 6-digit OTP code"""
    return ''.join(random.choices(string.digits, k=6))

def create_otp(db: Session, email: str, purpose: str = "password_reset") -> Optional[OTP]:
    """Create a new OTP for the given email"""
    # Find user by email
    user = get_user(db, email)
    if not user:
        return None
    
    # Invalidate any existing OTPs for this user and purpose
    db.query(OTP).filter(
        OTP.user_id == user.id,
        OTP.purpose == purpose,
        OTP.is_used == False
    ).update({"is_used": True})
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)  # OTP expires in 10 minutes
    
    # Create OTP record
    otp = OTP(
        user_id=user.id,
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at
    )
    
    try:
        db.add(otp)
        db.commit()
        db.refresh(otp)
        return otp
    except Exception as e:
        db.rollback()
        return None

def verify_otp(db: Session, email: str, otp_code: str, purpose: str = "password_reset") -> bool:
    """Verify OTP code for the given email"""
    # Find the OTP
    otp = db.query(OTP).filter(
        OTP.email == email,
        OTP.otp_code == otp_code,
        OTP.purpose == purpose,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).first()
    
    return otp is not None

def mark_otp_used(db: Session, email: str, otp_code: str, purpose: str = "password_reset"):
    """Mark OTP as used"""
    db.query(OTP).filter(
        OTP.email == email,
        OTP.otp_code == otp_code,
        OTP.purpose == purpose,
        OTP.is_used == False
    ).update({"is_used": True})
    db.commit()

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Send OTP to user's email for password reset
    """
    try:
        # Check if user exists
        user = get_user(db, request.email)
        if not user:
            # For security, we don't reveal if email exists or not
            return {"message": "If the email exists, an OTP has been sent to reset your password."}
        
        # Create OTP
        otp = create_otp(db, request.email, "password_reset")
        if not otp:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate OTP"
            )
        
        # Send OTP email
        email_sent = send_otp_email(request.email, otp.otp_code, user.full_name)
        
        if not email_sent:
            # If email fails, remove the OTP
            db.delete(otp)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send OTP email"
            )
        
        return {"message": "OTP has been sent to your email address."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

@router.post("/verify-otp", response_model=MessageResponse)
async def verify_otp_code(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db)
):
    """
    Verify OTP code
    """
    try:
        # Verify OTP
        is_valid = verify_otp(db, request.email, request.otp_code, "password_reset")
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code"
            )
        
        return {"message": "OTP verified successfully. You can now reset your password."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying OTP"
        )

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset password using OTP
    """
    try:
        # Verify OTP again for security
        is_valid = verify_otp(db, request.email, request.otp_code, "password_reset")
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP code"
            )
        
        # Find user
        user = get_user(db, request.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update password
        hashed_password = get_password_hash(request.new_password)
        user.hashed_password = hashed_password
        
        # Mark OTP as used
        mark_otp_used(db, request.email, request.otp_code, "password_reset")
        
        # Commit changes
        db.commit()
        
        # Send confirmation email
        send_password_reset_confirmation_email(request.email, user.full_name)
        
        return {"message": "Password has been reset successfully."}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting password"
        )


