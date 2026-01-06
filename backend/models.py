from typing import List, Optional, Dict, Any, TypedDict
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl
from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from database import Base


# Interview Mode Enums
class InterviewMode(str, Enum):
    """Interview mode types."""
    SHORT = "short"
    DETAILED = "detailed"


class RoundType(str, Enum):
    """Types of interview rounds for detailed interviews."""
    SCREENING = "screening"
    CORE_SKILLS = "core_skills"
    ADVANCED = "advanced"
    BAR_RAISER = "bar_raiser"


class DifficultyLevel(str, Enum):
    """Difficulty levels for adaptive questioning."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Subscription fields
    subscription_tier = Column(String, default="free")  # free, premium
    subscription_status = Column(String, default="active")  # active, cancelled, expired
    subscription_expires_at = Column(DateTime, nullable=True)
    razorpay_customer_id = Column(String, nullable=True)
    razorpay_subscription_id = Column(String, nullable=True)
    interviews_this_month = Column(Integer, default=0)  # Track monthly usage
    last_interview_reset = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    interviews = relationship("InterviewSession", back_populates="user")
    otps = relationship("OTP", back_populates="user")
    payments = relationship("Payment", back_populates="user")

class OTP(Base):
    __tablename__ = "otps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String, nullable=False)
    purpose = Column(String, default="password_reset")  # password_reset, email_verification, etc.
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="otps")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Allow anonymous interviews
    thread_id = Column(String, unique=True, index=True)  # LangGraph thread ID
    role = Column(String)
    company = Column(String)
    resume_text = Column(Text)  # Store resume text directly
    status = Column(String, default="active")  # active, completed, archived, terminated
    total_score = Column(Float, default=0.0)
    average_score = Column(Float, default=0.0)
    is_pinned = Column(Boolean, default=False)  # For pinned results
    proctoring_data = Column(JSON, nullable=True)  # Store proctoring/integrity data
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # NEW: Interview mode and round tracking
    interview_mode = Column(String, default="short")  # short, detailed
    current_round = Column(Integer, default=1)  # Current round number (1-4)
    rounds_attempted = Column(Integer, default=0)  # Total rounds attempted
    round_results = Column(JSON, nullable=True)  # Stores per-round results
    termination_reason = Column(String, nullable=True)  # Why interview ended early
    current_difficulty = Column(String, default="medium")  # easy, medium, hard
    
    # Relationships
    user = relationship("User", back_populates="interviews")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id"))
    thread_id = Column(String, index=True)  # LangGraph thread ID for quick access
    message_type = Column(String)  # question, answer, feedback, roadmap, system
    role = Column(String)  # user, assistant, system
    content = Column(Text)
    question_number = Column(Integer, nullable=True)  # For tracking which question this relates to
    marks = Column(Integer, nullable=True)  # Marks for answers (0-10)
    created_at = Column(DateTime, default=datetime.utcnow)
    message_metadata = Column("metadata", JSON)  # For storing additional structured data
    
    # Relationships
    session = relationship("InterviewSession", back_populates="messages")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    razorpay_order_id = Column(String, unique=True, index=True, nullable=False)
    razorpay_payment_id = Column(String, unique=True, index=True, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    amount = Column(Float, nullable=False)  # Amount in INR
    currency = Column(String, default="INR")
    status = Column(String, default="created")  # created, paid, failed, refunded
    payment_method = Column(String, nullable=True)  # card, upi, netbanking, wallet
    plan_type = Column(String, nullable=False)  # monthly, yearly
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="payments")

# Pydantic Models (for request/response validation)

class FeedbackItem(BaseModel):
    """Feedback for a single interview question answer."""
    feedback: str = Field(..., description="Constructive feedback in one concise statement.")
    marks: int = Field(..., ge=0, le=10, description="Score for the answer out of 10.")

class InterviewQuestions(BaseModel):
    """Model for interview questions."""
    questions: List[str] = Field(..., description="A list of 3 interview questions.")

class StructuredEvaluator(BaseModel):
    """Model for structured evaluation of interview answers."""
    feedback_list: List[FeedbackItem] = Field(
        ..., description="List containing feedback and marks for each answer."
    )


# NEW: Multi-dimensional scoring models for detailed interviews
class QuestionScore(BaseModel):
    """Multi-dimensional score for a single question in detailed interviews."""
    correctness: int = Field(..., ge=0, le=10, description="Technical accuracy score")
    clarity: int = Field(..., ge=0, le=10, description="Communication clarity score")
    structure: int = Field(..., ge=0, le=10, description="Answer structure score")
    depth: int = Field(..., ge=0, le=10, description="Technical depth score")
    feedback: str = Field(default="", description="Detailed feedback text")
    
    @property
    def average(self) -> float:
        return (self.correctness + self.clarity + self.structure + self.depth) / 4


class RoundResult(BaseModel):
    """Results for a single interview round."""
    round_number: int = Field(..., ge=1, le=4, description="Round number (1-4)")
    round_type: str = Field(..., description="Type of round: screening, core_skills, advanced, bar_raiser")
    questions: List[str] = Field(default_factory=list, description="Questions asked in this round")
    answers: List[str] = Field(default_factory=list, description="Candidate answers")
    scores: List[QuestionScore] = Field(default_factory=list, description="Scores for each question")
    average_score: float = Field(default=0.0, description="Average score for this round")
    passed: bool = Field(default=False, description="Whether candidate passed this round")
    difficulty_used: str = Field(default="medium", description="Difficulty level used in this round")

# Enhanced state management for LangGraph
class InterviewState(TypedDict):
    """Enhanced state of the interview process with threading support."""
    # Session info
    thread_id: str
    user_id: int
    session_id: int
    
    # Interview details
    role: str
    company: str
    resume_text: str
    
    # Company research data
    company_research: Optional[Dict[str, Any]]
    
    # Interview progress (for short interviews)
    questions: List[str]
    answers: List[str]
    current_question: int
    
    # Evaluation data (for short interviews)
    feedback: List[dict]
    marks: List[int]
    total_score: float
    average_score: float
    
    # Final output
    roadmap: str
    
    # Status and metadata
    status: str  # started, in_progress, completed, terminated
    started_at: str
    completed_at: Optional[str]
    chat_history: List[dict]
    
    # NEW: Interview mode and round tracking (for detailed interviews)
    interview_mode: str  # short, detailed
    current_round: int  # 1-4 for detailed interviews
    current_difficulty: str  # easy, medium, hard
    round_results: List[dict]  # List of RoundResult dicts
    termination_reason: Optional[str]  # Why interview ended early

# Pydantic models for API requests/responses
class InterviewStartRequest(BaseModel):
    role: str = Field(..., min_length=1, description="Job role for the interview")
    company: str = Field(..., min_length=1, description="Company name")
    resume_text: str = Field(..., min_length=10, description="Resume text content")
    interview_mode: str = Field(default="short", description="Interview mode: short or detailed")


class AnswerSubmissionRequest(BaseModel):
    thread_id: str = Field(..., description="Thread ID of the interview session")
    question_number: int = Field(..., ge=1, description="Question number (1-based, no upper limit for detailed)")
    answer: str = Field(..., min_length=1, description="Answer to the question")
    round_number: Optional[int] = Field(default=None, description="Round number for detailed interviews (1-4)")

class ChatHistoryResponse(BaseModel):
    thread_id: str
    session_id: int
    role: str
    company: str
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
    company: str
    status: str
    questions: List[str]
    current_question: int
    total_score: float
    average_score: float
    is_pinned: bool = False
    created_at: datetime
    # NEW: Fields for detailed interviews
    interview_mode: str = "short"
    current_round: int = 1
    rounds_attempted: int = 0
    termination_reason: Optional[str] = None


class DetailedInterviewResultResponse(BaseModel):
    """Response model for detailed interview results."""
    thread_id: str
    session_id: int
    role: str
    company: str
    status: str
    interview_mode: str
    rounds_attempted: int
    round_results: List[Dict[str, Any]]  # List of RoundResult dicts
    final_round_reached: int
    termination_reason: Optional[str]
    total_score: float
    average_score: float
    strengths: List[str]
    weak_areas: List[str]
    roadmap: str
    created_at: datetime
    completed_at: Optional[datetime]

# OTP related models
class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address to send OTP")

class VerifyOTPRequest(BaseModel):
    email: str = Field(..., description="Email address")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")

class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="Email address")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")
    new_password: str = Field(..., min_length=6, description="New password")

class MessageResponse(BaseModel):
    message: str