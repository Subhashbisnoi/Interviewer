"""
Company / Recruiter Portal API
Manual onboarding by admin; approved companies can search talent.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from passlib.context import CryptContext

from database import get_db
from models import Company, JobPosting, UserProfile, User
from api.auth import create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/company", tags=["company"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
company_oauth = OAuth2PasswordBearer(tokenUrl="/company/login", auto_error=False)


def get_current_company(
    token: str = Depends(company_oauth),
    db: Session = Depends(get_db),
) -> Company:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        company_id: int = payload.get("company_id")
        if not company_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    company = db.query(Company).filter(Company.id == company_id).first()
    if not company or not company.is_approved:
        raise HTTPException(status_code=403, detail="Company not approved")
    return company


# ── Public registration request (admin approves manually) ─────────────────

class CompanyRegisterRequest(BaseModel):
    name: str
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    contact_name: str
    contact_email: str
    password: str


class CompanyLoginRequest(BaseModel):
    email: str
    password: str


class JobPostingRequest(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    experience_min: Optional[float] = 0.0
    experience_max: Optional[float] = None
    location: Optional[str] = None
    is_remote: bool = False


# ── Endpoints ─────────────────────────────────────────────────────────────

@router.post("/register", status_code=202)
async def register_company(data: CompanyRegisterRequest, db: Session = Depends(get_db)):
    """
    Submit a company registration request.
    Account is NOT active until manually approved by admin.
    """
    existing = db.query(Company).filter(Company.contact_email == data.contact_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    company = Company(
        name=data.name,
        industry=data.industry,
        website=data.website,
        description=data.description,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        hashed_password=pwd_context.hash(data.password),
        is_approved=False,
    )
    db.add(company)
    db.commit()
    return {
        "message": "Registration submitted. Our team will review your application and contact you within 24 hours.",
        "company_id": company.id,
    }


@router.post("/login")
async def company_login(data: CompanyLoginRequest, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.contact_email == data.email).first()
    if not company or not pwd_context.verify(data.password, company.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not company.is_approved:
        raise HTTPException(status_code=403, detail="Your account is pending approval. We'll notify you via email.")

    token = create_access_token({"company_id": company.id, "sub": company.contact_email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "company": {
            "id": company.id,
            "name": company.name,
            "contact_email": company.contact_email,
        },
    }


@router.get("/me")
async def get_company_profile(current_company: Company = Depends(get_current_company)):
    return {
        "id": current_company.id,
        "name": current_company.name,
        "industry": current_company.industry,
        "website": current_company.website,
        "contact_name": current_company.contact_name,
        "contact_email": current_company.contact_email,
    }


@router.get("/search/candidates")
async def search_candidates(
    role: Optional[str] = None,
    skills: Optional[str] = None,
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    location: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db),
):
    """Search visible candidate profiles."""
    query = db.query(UserProfile).filter(UserProfile.is_visible_to_recruiters == True)

    if min_experience is not None:
        query = query.filter(UserProfile.experience_years >= min_experience)
    if max_experience is not None:
        query = query.filter(UserProfile.experience_years <= max_experience)

    profiles = query.offset(offset).limit(100).all()  # fetch more then filter in-app

    results = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        if not user:
            continue
        if role:
            role_lower = role.lower()
            if not any(role_lower in r.lower() for r in (p.target_roles or [])):
                if not (p.headline and role_lower in p.headline.lower()):
                    continue
        if skills:
            wanted = {s.strip().lower() for s in skills.split(",")}
            candidate_skills = {s.lower() for s in (p.skills or [])}
            if not wanted.intersection(candidate_skills):
                continue
        if location and p.location:
            if location.lower() not in p.location.lower():
                continue

        results.append({
            "user_id": p.user_id,
            "full_name": user.full_name,
            "headline": p.headline,
            "location": p.location,
            "experience_years": p.experience_years,
            "skills": (p.skills or [])[:10],
            "target_roles": p.target_roles or [],
            "github_url": p.github_url,
            "linkedin_url": p.linkedin_url,
            "portfolio_url": p.portfolio_url,
        })

    # Paginate results
    total = len(results)
    paginated = results[offset: offset + limit]
    return {"candidates": paginated, "total": total}


@router.get("/candidate/{user_id}")
async def get_candidate_detail(
    user_id: int,
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == user_id,
        UserProfile.is_visible_to_recruiters == True,
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate not found or profile is private")

    user = db.query(User).filter(User.id == user_id).first()

    # Fetch recent interview performance (aggregate scores)
    from models import InterviewSession
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id, InterviewSession.status == "completed")
        .order_by(InterviewSession.completed_at.desc())
        .limit(10)
        .all()
    )

    interview_summary = []
    for s in sessions:
        interview_summary.append({
            "role": s.role,
            "plan_type": s.plan_type,
            "average_score": s.average_score,
            "score_technical": s.score_technical,
            "score_communication": s.score_communication,
            "score_leadership": s.score_leadership,
            "score_critical_thinking": s.score_critical_thinking,
            "score_decision_making": s.score_decision_making,
            "score_project_knowledge": s.score_project_knowledge,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        })

    return {
        "user_id": user_id,
        "full_name": user.full_name,
        "headline": profile.headline,
        "bio": profile.bio,
        "location": profile.location,
        "experience_years": profile.experience_years,
        "skills": profile.skills or [],
        "target_roles": profile.target_roles or [],
        "work_experience": profile.work_experience or [],
        "education": profile.education or [],
        "projects": profile.projects or [],
        "linkedin_url": profile.linkedin_url,
        "github_url": profile.github_url,
        "portfolio_url": profile.portfolio_url,
        "interview_performance": interview_summary,
    }


# ── Job postings ───────────────────────────────────────────────────────────

@router.post("/jobs")
async def create_job(
    data: JobPostingRequest,
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db),
):
    job = JobPosting(
        company_id=current_company.id,
        title=data.title,
        description=data.description,
        required_skills=data.required_skills or [],
        experience_min=data.experience_min,
        experience_max=data.experience_max,
        location=data.location,
        is_remote=data.is_remote,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"job_id": job.id, "message": "Job posting created"}


@router.get("/jobs")
async def list_jobs(
    current_company: Company = Depends(get_current_company),
    db: Session = Depends(get_db),
):
    jobs = db.query(JobPosting).filter(JobPosting.company_id == current_company.id).all()
    return {"jobs": [
        {
            "id": j.id,
            "title": j.title,
            "required_skills": j.required_skills,
            "experience_min": j.experience_min,
            "experience_max": j.experience_max,
            "location": j.location,
            "is_remote": j.is_remote,
            "is_active": j.is_active,
            "created_at": j.created_at.isoformat(),
        }
        for j in jobs
    ]}
