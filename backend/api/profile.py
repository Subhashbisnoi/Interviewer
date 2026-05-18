"""
Profile API
Candidate LinkedIn-style profile CRUD plus AI-driven profile scoring.
"""
import json
import re
from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any

import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import User, UserProfile, CreditTransaction
from api.auth import get_current_user, get_current_user_optional
from adaptive_interview import get_llm

router = APIRouter(prefix="/profile", tags=["profile"])


# ── Pydantic ──────────────────────────────────────────────────────────────

class ProfileUpdateRequest(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    target_roles: Optional[List[str]] = None
    experience_years: Optional[float] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_text: Optional[str] = None
    resume_filename: Optional[str] = None
    is_visible_to_recruiters: Optional[bool] = None


# ── Helpers ───────────────────────────────────────────────────────────────

def _profile_to_dict(profile: UserProfile, user: User) -> dict:
    return {
        "user_id": profile.user_id,
        "full_name": user.full_name,
        "email": user.email,
        "credits": user.credits or 0,
        "headline": profile.headline,
        "bio": profile.bio,
        "location": profile.location,
        "avatar_url": profile.avatar_url,
        "target_roles": profile.target_roles or [],
        "experience_years": profile.experience_years,
        "skills": profile.skills or [],
        "work_experience": profile.work_experience or [],
        "education": profile.education or [],
        "projects": profile.projects or [],
        "linkedin_url": profile.linkedin_url,
        "github_url": profile.github_url,
        "portfolio_url": profile.portfolio_url,
        "resume_text": profile.resume_text,
        "resume_filename": profile.resume_filename,
        "resume_uploaded_at": profile.resume_uploaded_at.isoformat() if profile.resume_uploaded_at else None,
        "is_visible_to_recruiters": profile.is_visible_to_recruiters,
        "resume_score": profile.resume_score,
        "linkedin_score": profile.linkedin_score,
        "github_score": profile.github_score,
        "profile_score": profile.profile_score,
        "profile_completion": profile.profile_completion or 0,
        "resume_score_breakdown": profile.resume_score_breakdown,
        "github_score_breakdown": profile.github_score_breakdown,
        "linkedin_score_breakdown": profile.linkedin_score_breakdown,
        "resume_feedback": profile.resume_feedback,
        "github_feedback": profile.github_feedback,
        "linkedin_feedback": profile.linkedin_feedback,
        "streak_days": profile.streak_days or 0,
        "last_active_date": profile.last_active_date.isoformat() if profile.last_active_date else None,
        "daily_activity": profile.daily_activity or {},
        "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
    }


def _get_or_create_profile(user: User, db: Session) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id, daily_activity={})
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _compute_completion(profile: UserProfile, user: User) -> Dict[str, Any]:
    """Returns dict {completion_pct, missing[]}."""
    checks = [
        ("Full name",     bool(user.full_name and user.full_name.strip()), 10),
        ("Bio",           bool(profile.bio and profile.bio.strip()), 10),
        ("Target roles",  bool(profile.target_roles), 10),
        ("Skills",        bool(profile.skills), 10),
        ("Experience years", (profile.experience_years or 0) > 0, 10),
        ("Resume",        bool(profile.resume_text and profile.resume_text.strip()), 15),
        ("LinkedIn URL",  bool(profile.linkedin_url), 10),
        ("GitHub URL",    bool(profile.github_url), 10),
        ("Resume scored", profile.resume_score is not None, 10),
        ("Overall score", profile.profile_score is not None, 5),
    ]
    pct = sum(weight for _, ok, weight in checks if ok)
    missing = [label for label, ok, _ in checks if not ok]
    return {"completion_pct": float(pct), "missing": missing}


def _save_completion(profile: UserProfile, user: User, db: Session) -> Dict[str, Any]:
    info = _compute_completion(profile, user)
    profile.profile_completion = info["completion_pct"]
    db.commit()
    return info


def _deduct_credits(user: User, cost: int, db: Session, description: str, txn_type: str):
    if (user.credits or 0) < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Need {cost}, have {user.credits or 0}.",
        )
    user.credits = (user.credits or 0) - cost
    db.add(CreditTransaction(
        user_id=user.id,
        amount=-cost,
        balance_after=user.credits,
        transaction_type=txn_type,
        description=description,
    ))


def _extract_json(text: str) -> Dict[str, Any]:
    """Best-effort extraction of a JSON object from an LLM response."""
    if not text:
        raise ValueError("Empty model response")
    # Strip code fences
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.MULTILINE)
    # Try direct parse first
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    # Find first {...} block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON object found in model output: {text[:200]}")
    return json.loads(match.group(0))


def _call_scorer(prompt: str) -> Dict[str, Any]:
    """Call the LLM scoring helper. Uses 'normal' plan with capped tokens to stay within budget."""
    llm = get_llm("normal").bind(max_tokens=1024)
    resp = llm.invoke(prompt)
    content = resp.content if hasattr(resp, "content") else str(resp)
    return _extract_json(content)


def _clamp_score(v: Any, default: float = 0.0) -> float:
    try:
        f = float(v)
    except (TypeError, ValueError):
        return default
    return max(0.0, min(10.0, f))


# ── Basic CRUD ────────────────────────────────────────────────────────────

@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        return {
            "user_id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "credits": current_user.credits or 0,
            "headline": None, "bio": None, "location": None, "avatar_url": None,
            "target_roles": [], "experience_years": 0, "skills": [],
            "work_experience": [], "education": [], "projects": [],
            "linkedin_url": None, "github_url": None, "portfolio_url": None,
            "resume_text": None, "resume_filename": None, "resume_uploaded_at": None,
            "is_visible_to_recruiters": True,
            "resume_score": None, "linkedin_score": None, "github_score": None,
            "profile_score": None, "profile_completion": 0,
            "resume_score_breakdown": None, "github_score_breakdown": None, "linkedin_score_breakdown": None,
            "resume_feedback": None, "github_feedback": None, "linkedin_feedback": None,
            "streak_days": 0, "last_active_date": None, "daily_activity": {},
            "updated_at": None,
        }
    return _profile_to_dict(profile, current_user)


@router.put("/me")
async def update_my_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)

    payload = data.dict(exclude_none=True)

    # If resume_text is replaced, invalidate cached resume score
    if "resume_text" in payload and payload["resume_text"] != profile.resume_text:
        profile.resume_score = None
        profile.resume_score_breakdown = None
        profile.resume_feedback = None
        profile.resume_uploaded_at = datetime.utcnow()

    for field, value in payload.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    _save_completion(profile, current_user, db)
    db.refresh(profile)
    return _profile_to_dict(profile, current_user)


# ── Completion ────────────────────────────────────────────────────────────

@router.get("/completion")
async def get_profile_completion(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    info = _save_completion(profile, current_user, db)
    db.refresh(profile)
    return {
        "completion_pct": info["completion_pct"],
        "missing": info["missing"],
        "scores": {
            "resume": profile.resume_score,
            "github": profile.github_score,
            "linkedin": profile.linkedin_score,
            "overall": profile.profile_score,
        },
    }


# ── Resume scoring ────────────────────────────────────────────────────────

RESUME_SCORE_COST = 3
GITHUB_SCORE_COST = 2
LINKEDIN_SCORE_COST = 2
OVERALL_SCORE_COST = 1


RESUME_PROMPT = """You are a senior tech recruiter scoring a candidate's resume against their target roles.

Target roles: {target_roles}
Years of experience claimed: {experience_years}
Skills claimed: {skills}

Resume text:
---
{resume_text}
---

Score the resume from 0-10 on these four sub-dimensions:
- experience: years of experience vs target role expectations (relevance, seniority match)
- projects: project complexity, scope, technical depth
- leadership: ownership signals, mentorship, team / cross-functional impact
- thinking: problem-solving depth, trade-offs, measurable outcomes

Then provide an overall resume_score (0-10) as a weighted average and one paragraph of feedback (3-5 sentences) that calls out specific strengths and concrete improvements.

Return ONLY a JSON object exactly in this shape:
{{
  "resume_score": <float 0-10>,
  "breakdown": {{
    "experience": <float 0-10>,
    "projects": <float 0-10>,
    "leadership": <float 0-10>,
    "thinking": <float 0-10>
  }},
  "feedback": "<string>"
}}
No markdown, no commentary.
"""


@router.post("/score/resume")
async def score_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    if not profile.resume_text or not profile.resume_text.strip():
        raise HTTPException(status_code=400, detail="No resume on file. Upload your resume first.")

    _deduct_credits(current_user, RESUME_SCORE_COST, db,
                    "Resume scoring", "profile_score_resume")

    prompt = RESUME_PROMPT.format(
        target_roles=", ".join(profile.target_roles or []) or "(not specified)",
        experience_years=profile.experience_years or 0,
        skills=", ".join(profile.skills or []) or "(not specified)",
        resume_text=(profile.resume_text or "")[:15000],
    )

    try:
        result = _call_scorer(prompt)
    except Exception as e:
        # Refund on model failure
        current_user.credits = (current_user.credits or 0) + RESUME_SCORE_COST
        db.add(CreditTransaction(
            user_id=current_user.id,
            amount=RESUME_SCORE_COST,
            balance_after=current_user.credits,
            transaction_type="refund",
            description=f"Refund: resume scoring failed ({e})",
        ))
        db.commit()
        raise HTTPException(status_code=502, detail=f"Resume scoring failed: {e}")

    score = _clamp_score(result.get("resume_score"))
    breakdown_raw = result.get("breakdown") or {}
    breakdown = {k: _clamp_score(breakdown_raw.get(k)) for k in ("experience", "projects", "leadership", "thinking")}
    feedback = str(result.get("feedback") or "").strip()

    profile.resume_score = score
    profile.resume_score_breakdown = breakdown
    profile.resume_feedback = feedback
    db.commit()
    _save_completion(profile, current_user, db)

    return {
        "resume_score": score,
        "breakdown": breakdown,
        "feedback": feedback,
        "credits_remaining": current_user.credits,
    }


# ── GitHub scoring ────────────────────────────────────────────────────────

GITHUB_PROMPT = """You are evaluating a software engineer's public GitHub presence as a hiring signal.

Target roles: {target_roles}

GitHub profile (raw API JSON, trimmed):
{profile_json}

Recent repositories (most recently pushed, JSON):
{repos_json}

Score from 0-10 on these sub-dimensions:
- activity: how recently / consistently they push code
- breadth: variety of languages, frameworks, project types
- depth: substance of repos (stars, forks, README presence, descriptions)
- impact: community signal — stars, followers, original work vs forks

Then give an overall github_score (0-10) and 3-5 sentences of feedback citing the actual repos / numbers you observed. If the account is essentially empty, score low and say so.

Return ONLY this JSON shape:
{{
  "github_score": <float>,
  "breakdown": {{
    "activity": <float>,
    "breadth": <float>,
    "depth": <float>,
    "impact": <float>
  }},
  "feedback": "<string>"
}}
"""


def _parse_github_username(url: str) -> Optional[str]:
    if not url:
        return None
    m = re.search(r"github\.com/([A-Za-z0-9_-]+)", url)
    return m.group(1) if m else None


@router.post("/score/github")
async def score_github(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    username = _parse_github_username(profile.github_url or "")
    if not username:
        raise HTTPException(status_code=400, detail="Add a valid GitHub URL to your profile first.")

    try:
        user_resp = requests.get(f"https://api.github.com/users/{username}", timeout=10)
        repos_resp = requests.get(
            f"https://api.github.com/users/{username}/repos?sort=pushed&per_page=10",
            timeout=10,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"GitHub API unreachable: {e}")

    if user_resp.status_code == 404:
        raise HTTPException(status_code=404, detail=f"GitHub user '{username}' not found")
    if user_resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"GitHub API error {user_resp.status_code}")

    gh_user = user_resp.json()
    repos = repos_resp.json() if repos_resp.status_code == 200 else []

    _deduct_credits(current_user, GITHUB_SCORE_COST, db,
                    "GitHub scoring", "profile_score_github")

    trimmed_profile = {
        "login": gh_user.get("login"),
        "name": gh_user.get("name"),
        "bio": gh_user.get("bio"),
        "company": gh_user.get("company"),
        "public_repos": gh_user.get("public_repos"),
        "followers": gh_user.get("followers"),
        "following": gh_user.get("following"),
        "created_at": gh_user.get("created_at"),
        "updated_at": gh_user.get("updated_at"),
    }
    trimmed_repos = [
        {
            "name": r.get("name"),
            "description": r.get("description"),
            "language": r.get("language"),
            "stargazers_count": r.get("stargazers_count"),
            "forks_count": r.get("forks_count"),
            "fork": r.get("fork"),
            "pushed_at": r.get("pushed_at"),
            "size": r.get("size"),
            "has_readme_hint": bool(r.get("description")),
        }
        for r in (repos or [])
    ]

    prompt = GITHUB_PROMPT.format(
        target_roles=", ".join(profile.target_roles or []) or "(not specified)",
        profile_json=json.dumps(trimmed_profile, indent=2),
        repos_json=json.dumps(trimmed_repos, indent=2),
    )

    try:
        result = _call_scorer(prompt)
    except Exception as e:
        current_user.credits = (current_user.credits or 0) + GITHUB_SCORE_COST
        db.add(CreditTransaction(
            user_id=current_user.id,
            amount=GITHUB_SCORE_COST,
            balance_after=current_user.credits,
            transaction_type="refund",
            description=f"Refund: github scoring failed ({e})",
        ))
        db.commit()
        raise HTTPException(status_code=502, detail=f"GitHub scoring failed: {e}")

    score = _clamp_score(result.get("github_score"))
    breakdown_raw = result.get("breakdown") or {}
    breakdown = {k: _clamp_score(breakdown_raw.get(k)) for k in ("activity", "breadth", "depth", "impact")}
    feedback = str(result.get("feedback") or "").strip()

    profile.github_score = score
    profile.github_score_breakdown = breakdown
    profile.github_feedback = feedback
    db.commit()
    _save_completion(profile, current_user, db)

    return {
        "github_score": score,
        "breakdown": breakdown,
        "feedback": feedback,
        "credits_remaining": current_user.credits,
    }


# ── LinkedIn scoring ──────────────────────────────────────────────────────

LINKEDIN_PROMPT = """You are evaluating the strength of a candidate's LinkedIn presence.

LinkedIn cannot be scraped, so you must reason from the URL format plus the candidate's stated profile fields. A bare /in/<slug> URL plus a rich profile here implies a fleshed-out LinkedIn; missing fields imply a thin one.

LinkedIn URL: {url}
Headline: {headline}
Bio / about: {bio}
Experience (years): {experience_years}
Target roles: {target_roles}
Skills count: {skills_count}
Work experience entries: {work_count}
Education entries: {edu_count}

Score 0-10 on each sub-dimension:
- url_validity: is the URL well-formed and looks like a real /in/<slug>?
- completeness: headline, bio, experience, skills are present and substantial
- consistency: do the claimed years / roles / skills align coherently?
- searchability: would a recruiter searching their target roles realistically find them based on signals present?

Then output an overall linkedin_score (0-10) and 3-5 sentences of feedback with concrete suggestions (e.g. "write a longer about section", "add 3 more skills").

Return ONLY this JSON:
{{
  "linkedin_score": <float>,
  "breakdown": {{
    "url_validity": <float>,
    "completeness": <float>,
    "consistency": <float>,
    "searchability": <float>
  }},
  "feedback": "<string>"
}}
"""


def _looks_like_linkedin(url: str) -> bool:
    return bool(re.search(r"linkedin\.com/in/[A-Za-z0-9_\-]+", url or ""))


@router.post("/score/linkedin")
async def score_linkedin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)
    if not profile.linkedin_url:
        raise HTTPException(status_code=400, detail="Add your LinkedIn URL to your profile first.")
    if not _looks_like_linkedin(profile.linkedin_url):
        raise HTTPException(status_code=400, detail="LinkedIn URL doesn't look valid (expected linkedin.com/in/<slug>).")

    _deduct_credits(current_user, LINKEDIN_SCORE_COST, db,
                    "LinkedIn scoring", "profile_score_linkedin")

    prompt = LINKEDIN_PROMPT.format(
        url=profile.linkedin_url,
        headline=profile.headline or "(empty)",
        bio=(profile.bio or "(empty)")[:1500],
        experience_years=profile.experience_years or 0,
        target_roles=", ".join(profile.target_roles or []) or "(none)",
        skills_count=len(profile.skills or []),
        work_count=len(profile.work_experience or []),
        edu_count=len(profile.education or []),
    )

    try:
        result = _call_scorer(prompt)
    except Exception as e:
        current_user.credits = (current_user.credits or 0) + LINKEDIN_SCORE_COST
        db.add(CreditTransaction(
            user_id=current_user.id,
            amount=LINKEDIN_SCORE_COST,
            balance_after=current_user.credits,
            transaction_type="refund",
            description=f"Refund: linkedin scoring failed ({e})",
        ))
        db.commit()
        raise HTTPException(status_code=502, detail=f"LinkedIn scoring failed: {e}")

    score = _clamp_score(result.get("linkedin_score"))
    breakdown_raw = result.get("breakdown") or {}
    breakdown = {k: _clamp_score(breakdown_raw.get(k)) for k in ("url_validity", "completeness", "consistency", "searchability")}
    feedback = str(result.get("feedback") or "").strip()

    profile.linkedin_score = score
    profile.linkedin_score_breakdown = breakdown
    profile.linkedin_feedback = feedback
    db.commit()
    _save_completion(profile, current_user, db)

    return {
        "linkedin_score": score,
        "breakdown": breakdown,
        "feedback": feedback,
        "credits_remaining": current_user.credits,
    }


# ── Overall profile score ─────────────────────────────────────────────────

@router.post("/score/overall")
async def score_overall(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(current_user, db)

    weights = {"resume": 0.5, "github": 0.25, "linkedin": 0.25}
    scores = {
        "resume": profile.resume_score,
        "github": profile.github_score,
        "linkedin": profile.linkedin_score,
    }
    available = {k: v for k, v in scores.items() if v is not None}
    if not available:
        raise HTTPException(
            status_code=400,
            detail="No component scores yet. Score your resume, GitHub, or LinkedIn first.",
        )

    _deduct_credits(current_user, OVERALL_SCORE_COST, db,
                    "Overall profile score", "profile_score_overall")

    total_weight = sum(weights[k] for k in available)
    overall = sum(available[k] * weights[k] for k in available) / total_weight
    overall = round(_clamp_score(overall), 2)

    profile.profile_score = overall
    db.commit()
    info = _save_completion(profile, current_user, db)
    db.refresh(profile)

    return {
        "completion_pct": info["completion_pct"],
        "missing": info["missing"],
        "scores": {
            "resume": profile.resume_score,
            "github": profile.github_score,
            "linkedin": profile.linkedin_score,
            "overall": profile.profile_score,
        },
        "credits_remaining": current_user.credits,
    }


# ── Activity / streak ─────────────────────────────────────────────────────

def record_interview_activity(user: User, db: Session) -> None:
    """Called by interview completion to bump today's count and recompute streak."""
    profile = _get_or_create_profile(user, db)
    today = date.today()
    today_iso = today.isoformat()

    activity = dict(profile.daily_activity or {})
    activity[today_iso] = int(activity.get(today_iso, 0)) + 1
    profile.daily_activity = activity

    # Recompute streak ending today
    streak = 0
    d = today
    while activity.get(d.isoformat(), 0) > 0:
        streak += 1
        d -= timedelta(days=1)
    profile.streak_days = streak
    profile.last_active_date = today

    db.commit()


def get_completion_pct(user: User, db: Session) -> float:
    """Cheap helper for interview-start gating."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        return 0.0
    info = _compute_completion(profile, user)
    return info["completion_pct"]


# ── Public profile / search ───────────────────────────────────────────────

@router.get("/{user_id}")
async def get_public_profile(
    user_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    is_own = current_user and current_user.id == user_id
    if not is_own and not profile.is_visible_to_recruiters:
        raise HTTPException(status_code=403, detail="This profile is private")

    user = db.query(User).filter(User.id == user_id).first()
    return _profile_to_dict(profile, user)


@router.get("/search/candidates")
async def search_candidates(
    role: Optional[str] = None,
    skills: Optional[str] = None,
    min_experience: Optional[float] = None,
    max_experience: Optional[float] = None,
    location: Optional[str] = None,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(UserProfile).filter(UserProfile.is_visible_to_recruiters == True)

    if min_experience is not None:
        query = query.filter(UserProfile.experience_years >= min_experience)
    if max_experience is not None:
        query = query.filter(UserProfile.experience_years <= max_experience)

    profiles = query.offset(offset).limit(limit).all()

    results = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        if not user:
            continue

        if role:
            role_lower = role.lower()
            if not any(role_lower in r.lower() for r in (p.target_roles or [])):
                continue

        if skills:
            wanted = {s.strip().lower() for s in skills.split(",")}
            candidate_skills = {s.lower() for s in (p.skills or [])}
            if not wanted.intersection(candidate_skills):
                continue

        results.append({
            "user_id": p.user_id,
            "full_name": user.full_name,
            "headline": p.headline,
            "location": p.location,
            "experience_years": p.experience_years,
            "skills": p.skills or [],
            "target_roles": p.target_roles or [],
            "profile_score": p.profile_score,
        })

    return {"candidates": results, "total": len(results)}
