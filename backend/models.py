from typing import List, Optional, Dict, Any, TypedDict
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, Date, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from database import Base


class InterviewMode(str, Enum):
    SHORT = "short"
    DETAILED = "detailed"


class RoundType(str, Enum):
    SCREENING = "screening"
    CORE_SKILLS = "core_skills"
    ADVANCED = "advanced"
    BAR_RAISER = "bar_raiser"


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class InterviewPlan(str, Enum):
    NORMAL = "normal"      # GPT-4o via OpenRouter
    THUNDER = "thunder"    # Claude Sonnet 4.5
    MAX = "max"            # Claude Opus 4.7


# SQLAlchemy Models

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Credit system
    credits = Column(Integer, default=20)  # New users get 20 free credits

    # Legacy subscription fields (kept for migration compatibility)
    subscription_tier = Column(String, default="free")
    subscription_status = Column(String, default="active")
    subscription_expires_at = Column(DateTime, nullable=True)
    razorpay_customer_id = Column(String, nullable=True)
    razorpay_subscription_id = Column(String, nullable=True)
    interviews_this_month = Column(Integer, default=0)
    last_interview_reset = Column(DateTime, default=datetime.utcnow)

    # Relationships
    interviews = relationship("InterviewSession", back_populates="user")
    otps = relationship("OTP", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    credit_transactions = relationship("CreditTransaction", back_populates="user")


class UserProfile(Base):
    """LinkedIn-style candidate profile."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)

    # Basic info
    headline = Column(String, nullable=True)           # e.g. "Full Stack Engineer | 3 YoE"
    bio = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    # Target roles (list of strings stored as JSON)
    target_roles = Column(JSON, default=list)          # e.g. ["Backend Engineer", "SDE-2"]
    experience_years = Column(Float, default=0.0)

    # Skills stored as JSON list
    skills = Column(JSON, default=list)

    # Work experience: list of {company, role, start, end, description}
    work_experience = Column(JSON, default=list)

    # Education: list of {institution, degree, field, start, end}
    education = Column(JSON, default=list)

    # Projects: list of {name, description, tech_stack, url}
    projects = Column(JSON, default=list)

    # Social links
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)

    # Resume
    resume_text = Column(Text, nullable=True)

    # Visibility: whether recruiters can find them
    is_visible_to_recruiters = Column(Boolean, default=True)

    # Profile scoring / gamification
    resume_score = Column(Float, nullable=True)
    linkedin_score = Column(Float, nullable=True)
    github_score = Column(Float, nullable=True)
    profile_score = Column(Float, nullable=True)
    profile_completion = Column(Float, default=0.0)
    resume_filename = Column(String, nullable=True)
    resume_uploaded_at = Column(DateTime, nullable=True)
    streak_days = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    daily_activity = Column(JSON, default=dict)

    resume_score_breakdown = Column(JSON, nullable=True)
    github_score_breakdown = Column(JSON, nullable=True)
    linkedin_score_breakdown = Column(JSON, nullable=True)
    resume_feedback = Column(Text, nullable=True)
    github_feedback = Column(Text, nullable=True)
    linkedin_feedback = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Company(Base):
    """Recruiter / Company account (manually approved by admin)."""
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    # Contact person
    contact_name = Column(String, nullable=False)
    contact_email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Admin approval (no self-registration to prevent scams)
    is_approved = Column(Boolean, default=False)
    approved_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    job_postings = relationship("JobPosting", back_populates="company")


class JobPosting(Base):
    """A role a company is hiring for (used for candidate search)."""
    __tablename__ = "job_postings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    required_skills = Column(JSON, default=list)
    experience_min = Column(Float, default=0.0)
    experience_max = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    is_remote = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="job_postings")


class CreditTransaction(Base):
    """Tracks every credit credit/debit event for a user."""
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    # positive = credit added, negative = credits spent
    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    transaction_type = Column(String, nullable=False)  # signup_bonus, purchase, interview_cost
    description = Column(String, nullable=True)

    # Payment reference for purchases
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="credit_transactions")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    purpose = Column(String, default="password_reset")
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="otps")


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    thread_id = Column(String, unique=True, index=True)

    role = Column(String)
    # company field removed from required — interviews now role-based only
    resume_text = Column(Text)
    job_description = Column(Text, nullable=True)
    status = Column(String, default="active")
    total_score = Column(Float, default=0.0)
    average_score = Column(Float, default=0.0)
    is_pinned = Column(Boolean, default=False)
    proctoring_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Interview plan & credits
    plan_type = Column(String, default="normal")   # normal, thunder, max
    credits_used = Column(Integer, default=0)

    # Multi-dimensional scores (adaptive interview)
    score_technical = Column(Float, nullable=True)
    score_communication = Column(Float, nullable=True)
    score_leadership = Column(Float, nullable=True)
    score_critical_thinking = Column(Float, nullable=True)
    score_decision_making = Column(Float, nullable=True)
    score_project_knowledge = Column(Float, nullable=True)

    # Legacy round tracking
    interview_mode = Column(String, default="adaptive")
    current_round = Column(Integer, default=1)
    rounds_attempted = Column(Integer, default=0)
    round_results = Column(JSON, nullable=True)
    termination_reason = Column(String, nullable=True)
    current_difficulty = Column(String, default="medium")

    user = relationship("User", back_populates="interviews")
    messages = relationship("ChatMessage", back_populates="session")
    best_answers = relationship("BestAnswer", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), index=True)
    thread_id = Column(String, index=True)
    message_type = Column(String)  # question, answer, follow_up, feedback, roadmap, system
    role = Column(String)          # user, assistant, system
    content = Column(Text)
    question_number = Column(Integer, nullable=True)
    marks = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    message_metadata = Column("metadata", JSON)

    session = relationship("InterviewSession", back_populates="messages")


class BestAnswer(Base):
    __tablename__ = "best_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"), index=True)
    question_number = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    best_answer_text = Column(Text, nullable=False)
    credits_used = Column(Integer, default=2)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    session = relationship("InterviewSession", back_populates="best_answers")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    razorpay_order_id = Column(String, unique=True, index=True, nullable=False)
    razorpay_payment_id = Column(String, unique=True, index=True, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    amount = Column(Float, nullable=False)          # Amount in INR
    currency = Column(String, default="INR")
    status = Column(String, default="created")     # created, paid, failed
    payment_method = Column(String, nullable=True)

    # Credit package
    package_type = Column(String, nullable=True)   # credits_50, credits_100, credits_200
    credits_granted = Column(Integer, default=0)

    # Legacy
    plan_type = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="payments")


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class FeedbackItem(BaseModel):
    feedback: str = Field(..., description="Constructive feedback.")
    marks: int = Field(..., ge=0, le=10)


class InterviewQuestions(BaseModel):
    questions: List[str] = Field(..., description="A list of interview questions.")


class DimensionScores(BaseModel):
    """Multi-dimensional scores from the adaptive interview evaluator."""
    technical: float = Field(..., ge=0, le=10)
    communication: float = Field(..., ge=0, le=10)
    leadership: float = Field(..., ge=0, le=10)
    critical_thinking: float = Field(..., ge=0, le=10)
    decision_making: float = Field(..., ge=0, le=10)
    project_knowledge: float = Field(..., ge=0, le=10)
    overall: float = Field(..., ge=0, le=10)
    strengths: List[str] = Field(default_factory=list)
    weak_areas: List[str] = Field(default_factory=list)
    feedback: str = Field(default="")


class AdaptiveInterviewState(TypedDict):
    """State for the adaptive interview session."""
    thread_id: str
    user_id: int
    session_id: int

    role: str
    resume_text: str
    job_description: Optional[str]
    plan_type: str   # normal, thunder, max

    # Conversation history: list of {role, content, type}
    messages: List[Dict[str, Any]]
    question_count: int
    follow_up_count: int   # follow-ups asked on the current question
    current_topic: str     # which dimension is being probed currently

    # Live scores per dimension (updated after each answer)
    scores: Dict[str, float]

    status: str   # active, completed
    started_at: str
    completed_at: Optional[str]
    roadmap: str


# API request/response models

class InterviewStartRequest(BaseModel):
    role: str = Field(..., min_length=1)
    resume_text: str = Field(..., min_length=10)
    plan_type: str = Field(default="normal")
    job_description: Optional[str] = None


class AnswerSubmissionRequest(BaseModel):
    thread_id: str
    answer: str = Field(..., min_length=1)


class ChatHistoryResponse(BaseModel):
    thread_id: str
    session_id: int
    role: str
    status: str
    total_score: float
    average_score: float
    created_at: datetime
    completed_at: Optional[datetime]
    messages: List[Dict[str, Any]]


class InterviewSessionResponse(BaseModel):
    thread_id: str
    session_id: int
    role: str
    status: str
    plan_type: str
    credits_used: int
    total_score: float
    average_score: float
    is_pinned: bool = False
    created_at: datetime
    score_technical: Optional[float] = None
    score_communication: Optional[float] = None
    score_leadership: Optional[float] = None
    score_critical_thinking: Optional[float] = None
    score_decision_making: Optional[float] = None
    score_project_knowledge: Optional[float] = None


# OTP models
class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp_code: str = Field(..., min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    email: str
    otp_code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)


class MessageResponse(BaseModel):
    message: str
