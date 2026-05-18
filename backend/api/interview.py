"""
Interview API - Adaptive, conversational interview sessions.
"""
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel

from models import (
    InterviewSession, ChatMessage, User, CreditTransaction, BestAnswer,
    InterviewStartRequest, AnswerSubmissionRequest,
)
from database import get_db
from common import extract_resume_text
from adaptive_interview import (
    get_next_interviewer_action, evaluate_interview,
    get_interview_cost, PLAN_MODELS, get_llm,
)
from api.auth import get_current_user, get_current_user_optional
from api.profile import get_completion_pct, record_interview_activity

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

router = APIRouter(prefix="/interview", tags=["interview"])


# ── Helpers ────────────────────────────────────────────────────────────────

def _deduct_credits(user: User, cost: int, db: Session, description: str):
    if (user.credits or 0) < cost:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Need {cost}, have {user.credits or 0}.",
        )
    user.credits = (user.credits or 0) - cost
    txn = CreditTransaction(
        user_id=user.id,
        amount=-cost,
        balance_after=user.credits,
        transaction_type="interview_cost",
        description=description,
    )
    db.add(txn)


def _session_to_dict(session: InterviewSession) -> dict:
    return {
        "thread_id": session.thread_id,
        "session_id": session.id,
        "role": session.role,
        "status": session.status,
        "plan_type": session.plan_type,
        "credits_used": session.credits_used or 0,
        "total_score": session.total_score,
        "average_score": session.average_score,
        "is_pinned": session.is_pinned,
        "created_at": session.created_at.isoformat(),
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
        "score_technical": session.score_technical,
        "score_communication": session.score_communication,
        "score_leadership": session.score_leadership,
        "score_critical_thinking": session.score_critical_thinking,
        "score_decision_making": session.score_decision_making,
        "score_project_knowledge": session.score_project_knowledge,
    }


# ── Resume upload ──────────────────────────────────────────────────────────

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    resume_text = extract_resume_text(content)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF")

    return {"resume_text": resume_text}


# ── Start interview ────────────────────────────────────────────────────────

@router.post("/start")
async def start_interview(
    data: InterviewStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    plan_type = data.plan_type or "normal"
    if plan_type not in PLAN_MODELS:
        raise HTTPException(status_code=400, detail="Invalid plan_type. Choose: normal, thunder, max")

    # Gate on profile completion (60% threshold) — only enforced for logged-in users
    if current_user:
        completion = get_completion_pct(current_user, db)
        if completion < 60:
            raise HTTPException(
                status_code=403,
                detail={
                    "detail": "Complete at least 60% of your profile before starting an interview.",
                    "completion": completion,
                    "redirect": "/profile",
                },
            )

    # Check candidate has minimum credits
    from adaptive_interview import CREDIT_COST_RANGE
    lo, _ = CREDIT_COST_RANGE[plan_type]
    if current_user and (current_user.credits or 0) < lo:
        raise HTTPException(
            status_code=402,
            detail=f"Insufficient credits. Need at least {lo} for a {plan_type} interview. Top up your credits.",
        )

    thread_id = str(uuid.uuid4())

    session = InterviewSession(
        user_id=current_user.id if current_user else None,
        thread_id=thread_id,
        role=data.role,
        resume_text=data.resume_text,
        job_description=data.job_description,
        plan_type=plan_type,
        status="active",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Get the first interviewer message
    action = get_next_interviewer_action(
        role=data.role,
        resume_text=data.resume_text,
        job_description=data.job_description,
        conversation=[],
        plan_type=plan_type,
        question_count=0,
        follow_up_count=0,
    )

    msg = ChatMessage(
        session_id=session.id,
        thread_id=thread_id,
        message_type="question",
        role="assistant",
        content=action.message,
        question_number=1,
    )
    db.add(msg)
    db.commit()

    return {
        "thread_id": thread_id,
        "session_id": session.id,
        "message": action.message,
        "status": "active",
        "plan_type": plan_type,
    }


# ── Submit answer ──────────────────────────────────────────────────────────

@router.post("/answer")
async def submit_answer(
    data: AnswerSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.thread_id == data.thread_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Interview already completed")

    # Load conversation history
    messages_db = (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == data.thread_id)
        .order_by(ChatMessage.id)
        .all()
    )
    conversation = [{"role": m.role, "content": m.content} for m in messages_db]

    # Count questions and recent follow-ups
    question_count = sum(1 for m in messages_db if m.message_type == "question")
    recent_follow_ups = 0
    for m in reversed(messages_db):
        if m.message_type == "question":
            break
        if m.message_type == "follow_up":
            recent_follow_ups += 1

    # Save candidate answer
    answer_msg = ChatMessage(
        session_id=session.id,
        thread_id=data.thread_id,
        message_type="answer",
        role="user",
        content=data.answer,
    )
    db.add(answer_msg)
    db.flush()

    conversation.append({"role": "user", "content": data.answer})

    # Decide next action
    action = get_next_interviewer_action(
        role=session.role,
        resume_text=session.resume_text or "",
        job_description=session.job_description,
        conversation=conversation,
        plan_type=session.plan_type,
        question_count=question_count,
        follow_up_count=recent_follow_ups,
    )

    if action.action == "wrap_up":
        conversation.append({"role": "assistant", "content": action.message})

        closing_msg = ChatMessage(
            session_id=session.id,
            thread_id=data.thread_id,
            message_type="system",
            role="assistant",
            content=action.message,
        )
        db.add(closing_msg)

        # Evaluate the full interview
        scores = evaluate_interview(
            role=session.role,
            resume_text=session.resume_text or "",
            conversation=conversation,
            plan_type=session.plan_type,
        )

        overall = scores.overall
        cost = get_interview_cost(session.plan_type)

        if current_user:
            _deduct_credits(
                current_user, cost, db,
                f"{session.plan_type.title()} interview – {session.role}",
            )

        roadmap_msg = ChatMessage(
            session_id=session.id,
            thread_id=data.thread_id,
            message_type="roadmap",
            role="assistant",
            content=scores.roadmap,
        )
        db.add(roadmap_msg)

        session.status = "completed"
        session.completed_at = datetime.utcnow()
        session.total_score = overall * 10
        session.average_score = overall
        session.credits_used = cost
        session.score_technical = scores.technical
        session.score_communication = scores.communication
        session.score_leadership = scores.leadership
        session.score_critical_thinking = scores.critical_thinking
        session.score_decision_making = scores.decision_making
        session.score_project_knowledge = scores.project_knowledge

        db.commit()

        # Update daily activity + streak
        if current_user:
            try:
                record_interview_activity(current_user, db)
            except Exception:
                # Never fail interview completion on activity tracking errors
                db.rollback()

        return {
            "action": "completed",
            "message": action.message,
            "session_id": session.id,
            "scores": {
                "technical": scores.technical,
                "communication": scores.communication,
                "leadership": scores.leadership,
                "critical_thinking": scores.critical_thinking,
                "decision_making": scores.decision_making,
                "project_knowledge": scores.project_knowledge,
                "overall": overall,
            },
            "strengths": scores.strengths,
            "weak_areas": scores.weak_areas,
            "feedback": scores.detailed_feedback,
            "roadmap": scores.roadmap,
            "credits_used": cost,
            "credits_remaining": current_user.credits if current_user else None,
        }

    # Interview continues
    msg_type = "follow_up" if action.action == "ask_followup" else "question"
    next_msg = ChatMessage(
        session_id=session.id,
        thread_id=data.thread_id,
        message_type=msg_type,
        role="assistant",
        content=action.message,
        question_number=question_count + (1 if msg_type == "question" else 0),
    )
    db.add(next_msg)
    db.commit()

    return {
        "action": action.action,
        "message": action.message,
        "topic": action.topic,
        "status": "active",
    }


# ── Session management ─────────────────────────────────────────────────────

@router.get("/session/{thread_id}")
async def get_session(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.thread_id == thread_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == thread_id)
        .order_by(ChatMessage.id)
        .all()
    )

    return {
        **_session_to_dict(session),
        "messages": [
            {"role": m.role, "content": m.content, "type": m.message_type, "question_number": m.question_number}
            for m in messages
        ],
    }


BEST_ANSWER_COST = 2  # credits per generation


class BestAnswerRequest(BaseModel):
    session_id: int
    question_number: int
    question: str
    user_answer: str
    regenerate: bool = False


@router.post("/best-answer")
async def get_best_answer(
    payload: BestAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(BestAnswer).filter(
        BestAnswer.session_id == payload.session_id,
        BestAnswer.question_number == payload.question_number,
    ).first()

    if existing and not payload.regenerate:
        return {"best_answer": existing.best_answer_text, "credits_used": 0, "from_cache": True}

    if (current_user.credits or 0) < BEST_ANSWER_COST:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    llm = get_llm("normal")
    prompt = (
        f"A candidate was asked the following interview question:\n\n"
        f"Question: {payload.question}\n\n"
        f"Their answer was:\n{payload.user_answer}\n\n"
        f"Write a concise, high-quality model answer for this question that would impress an interviewer. "
        f"Keep it practical and structured (2-4 paragraphs max)."
    )
    response = llm.invoke(prompt)
    answer_text = response.content

    current_user.credits -= BEST_ANSWER_COST
    db.add(CreditTransaction(
        user_id=current_user.id,
        amount=-BEST_ANSWER_COST,
        balance_after=current_user.credits,
        transaction_type="best_answer",
        description=f"Best answer for session {payload.session_id} Q{payload.question_number}",
    ))

    if existing:
        existing.best_answer_text = answer_text
        existing.updated_at = datetime.utcnow()
    else:
        db.add(BestAnswer(
            session_id=payload.session_id,
            question_number=payload.question_number,
            question_text=payload.question,
            best_answer_text=answer_text,
            credits_used=BEST_ANSWER_COST,
        ))

    db.commit()
    return {"best_answer": answer_text, "credits_used": BEST_ANSWER_COST, "from_cache": False}


@router.get("/session/{session_id}/best-answers")
async def get_session_best_answers(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = db.query(BestAnswer).filter(BestAnswer.session_id == session_id).all()
    return {str(r.question_number): r.best_answer_text for r in rows}


@router.get("/session/{session_id}/chat")
async def get_session_chat(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.thread_id == session.thread_id)
        .order_by(ChatMessage.id)
        .all()
    )

    return {
        "session_id": session.id,
        "thread_id": session.thread_id,
        "messages": [
            {"role": m.role, "content": m.content, "type": m.message_type}
            for m in messages
        ],
    }


@router.get("/sessions")
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
        .all()
    )
    return {"sessions": [_session_to_dict(s) for s in sessions]}


@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = (
        db.query(InterviewSession)
        .filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.status == "completed",
        )
        .all()
    )
    if not sessions:
        return {
            "total_interviews": 0,
            "average_score": 0,
            "credits_remaining": current_user.credits or 0,
            "sessions": [],
        }

    avg = sum(s.average_score for s in sessions) / len(sessions)
    return {
        "total_interviews": len(sessions),
        "average_score": round(avg, 2),
        "credits_remaining": current_user.credits or 0,
        "sessions": [_session_to_dict(s) for s in sessions[-10:]],
    }


@router.post("/pin/{session_id}")
async def toggle_pin(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_pinned = not session.is_pinned
    db.commit()
    return {"is_pinned": session.is_pinned}


@router.delete("/session/{session_id}")
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}


@router.get("/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.status == "completed")
        .order_by(InterviewSession.average_score.desc())
        .limit(20)
        .all()
    )
    result = []
    for s in sessions:
        user = db.query(User).filter(User.id == s.user_id).first()
        result.append({
            "full_name": user.full_name if user else "Anonymous",
            "role": s.role,
            "average_score": s.average_score,
            "plan_type": s.plan_type,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
        })
    return {"leaderboard": result}
