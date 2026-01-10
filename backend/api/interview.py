import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
import os
import tempfile
from pathlib import Path
from typing import List, Dict, Any
import json

# Import from the parent directory
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import InterviewState, InterviewSession, ChatMessage, User, InterviewMode
from database import get_db
from common import extract_resume_text
from generator import generate_question
from feedback import feedback_generator
from roadmap import generate_roadmap
from cache import cache
from detailed_interview import detailed_interview_manager, ROUND_CONFIG

# Import authentication
from api.auth import get_current_user, get_current_user_optional

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

router = APIRouter(prefix="/interview", tags=["interview"])

# Store interview sessions in memory (in production, use a database)
interview_sessions: Dict[str, Dict[str, Any]] = {}
uploaded_resumes: Dict[str, Dict[str, str]] = {}

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload resume PDF, extract text, and return it."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="File too large (max 10MB)")
        
        # Save to a temporary file for text extraction
        temp_path = None
        try:
            # Write the content to a temporary file (in case we need it for debugging)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(content)
                temp_path = temp_file.name
            
            # Extract text from the PDF using the already read content
            resume_text = extract_resume_text(content)
            
            if not resume_text.strip():
                raise HTTPException(status_code=400, detail="Failed to extract text from PDF")
                
            return {"resume_text": resume_text}
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
            
        finally:
            # Clean up the temporary file if it was created
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass
                    
        return {
            "message": "Resume uploaded successfully",
            "resume_id": resume_id,
            "filename": file.filename
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.post("/start")
async def start_interview(
    interview_data: Dict[str, Any], 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Start a new interview session by generating questions only."""
    try:
        # Check subscription limits for authenticated users
        if current_user:
            from subscription_middleware import check_subscription_limit, increment_interview_count
            
            limit_check = check_subscription_limit(current_user, db)
            
            if not limit_check["allowed"]:
                raise HTTPException(
                    status_code=403, 
                    detail={
                        "message": limit_check["message"],
                        "tier": limit_check["tier"],
                        "limit": limit_check.get("limit"),
                        "upgrade_required": True
                    }
                )
        
        role = interview_data.get("role")
        company = interview_data.get("company")
        resume_text = interview_data.get("resume_text", "")
        interview_mode = interview_data.get("interview_mode", "short")  # NEW: Get interview mode
        
        # Validate interview mode
        if interview_mode not in ["short", "detailed"]:
            interview_mode = "short"

        if not role or not company:
            raise HTTPException(status_code=400, detail="Missing required fields: role, company")

        if not resume_text:
            raise HTTPException(status_code=400, detail="Resume text is required")
        
        initial_state: InterviewState = {
            "role": role,
            "company": company,
            "resume_text": resume_text,
            "question": [],
            "answer": [],
            "feedback": [],
            "roadmap": "",
        }

        # Generate questions based on interview mode
        if interview_mode == "detailed":
            # For detailed mode, generate questions for Round 1 (Screening)
            from models import DifficultyLevel, RoundType
            questions = detailed_interview_manager.generate_round_questions(
                role=role,
                company=company,
                resume_text=resume_text,
                round_number=1,
                difficulty=DifficultyLevel.MEDIUM
            )
        else:
            # Short mode: use existing question generator
            gen = generate_question(initial_state)
            questions = gen.get("question", [])
            
        if not questions or len(questions) < 3:
            raise HTTPException(status_code=500, detail="Failed to generate interview questions")
        
        # Create unique session ID
        session_id = f"session_{uuid.uuid4().hex[:8]}"
        
        # Ensure uniqueness in database (double-check for safety)
        existing_count = 0
        while db.query(InterviewSession).filter(InterviewSession.thread_id == session_id).first():
            existing_count += 1
            session_id = f"session_{uuid.uuid4().hex[:8]}"
            # Prevent infinite loop (though extremely unlikely with UUID)
            if existing_count > 10:
                session_id = f"session_{uuid.uuid4().hex}"
                break
        
        # Create database session with interview mode
        db_session = InterviewSession(
            user_id=current_user.id if current_user else None,
            thread_id=session_id,
            role=role,
            company=company,
            status="in_progress",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            # NEW: Interview mode fields
            interview_mode=interview_mode,
            current_round=1,
            rounds_attempted=0,
            round_results=None,
            termination_reason=None,
            current_difficulty="medium"
        )
        db.add(db_session)
        db.commit()
        
        # Increment interview count for authenticated users
        if current_user:
            from subscription_middleware import increment_interview_count
            increment_interview_count(current_user, db)
        
        # Store in memory for the duration of the interview
        interview_sessions[session_id] = {
            "state": initial_state,
            "questions": questions,
            "interview_mode": interview_mode,
            "current_round": 1,
            "round_results": [],
            "current_difficulty": "medium"
        }
        
        # Prepare response based on interview mode
        response = {
            "message": "Interview started successfully",
            "session_id": session_id,
            "questions": questions,
            "role": role,
            "company": company,
            "interview_mode": interview_mode
        }
        
        # Add detailed interview specific info
        if interview_mode == "detailed":
            response["current_round"] = 1
            response["round_name"] = ROUND_CONFIG[1]["name"]
            response["total_rounds"] = 4
            response["round_description"] = ROUND_CONFIG[1]["description"]
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error starting interview: {str(e)}")

@router.post("/submit-answers")
async def submit_answers(
    session_data: Dict[str, Any], 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Submit all answers and generate feedback and roadmap."""
    try:
        session_id = session_data.get("session_id")
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        # Check if session exists in database
        if current_user:
            # If user is authenticated, check that session belongs to them
            session = db.query(InterviewSession).filter(
                InterviewSession.thread_id == session_id,
                InterviewSession.user_id == current_user.id
            ).first()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
        else:
            # If no user, just check if session exists
            session = db.query(InterviewSession).filter(
                InterviewSession.thread_id == session_id
            ).first()
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
        
        answers: List[str] = session_data.get("answers", [])
        if len(answers) != 3:
            raise HTTPException(status_code=400, detail="Exactly 3 answers are required")
        
        # Get proctoring data if provided
        proctoring_data = session_data.get("proctoring_data")
        
        # Get questions from in-memory storage for now (we can improve this later)
        if session_id not in interview_sessions:
            raise HTTPException(status_code=404, detail="Session questions not found")
            
        session_data_memory = interview_sessions[session_id]
        questions: List[str] = session_data_memory.get("questions", [])
        state: InterviewState = session_data_memory.get("state", {})  # type: ignore
        
        complete_state: InterviewState = {
            **state,
            "question": questions,
            "answer": answers,
        }

        # Generate feedback
        feedback_result = feedback_generator(complete_state)
        feedback_items = feedback_result.get("feedback", [])
        complete_state["feedback"] = feedback_items
        
        # Generate roadmap with the complete state including feedback
        roadmap_result = generate_roadmap(complete_state)
        complete_state["roadmap"] = roadmap_result.get("roadmap", "")

        # Store questions in database as chat messages
        for i, question in enumerate(questions):
            question_msg = ChatMessage(
                session_id=session.id,  # Use the session's primary key
                thread_id=session_id,   # Store the thread_id for reference
                role="assistant",
                content=question,
                message_type="question",
                question_number=i + 1,
                created_at=datetime.utcnow()
            )
            db.add(question_msg)
        
        # Store answers and feedback in database as chat messages
        total_score = 0
        for i, (answer, feedback_item) in enumerate(zip(answers, feedback_items)):
            # Store answer
            answer_msg = ChatMessage(
                session_id=session.id,  # Use the session's primary key
                thread_id=session_id,   # Store the thread_id for reference
                role="user",
                content=answer,
                message_type="answer",
                question_number=i + 1,
                created_at=datetime.utcnow()
            )
            db.add(answer_msg)
            
            # Store feedback
            feedback_msg = ChatMessage(
                session_id=session.id,  # Use the session's primary key
                thread_id=session_id,   # Store the thread_id for reference
                role="assistant",
                content=feedback_item.get('feedback', ''),
                message_type="feedback",
                question_number=i + 1,
                marks=feedback_item.get('marks', 0),
                created_at=datetime.utcnow()
            )
            db.add(feedback_msg)
            total_score += feedback_item.get('marks', 0)
        
        # Store roadmap
        roadmap_msg = ChatMessage(
            session_id=session.id,  # Use the session's primary key
            thread_id=session_id,   # Store the thread_id for reference
            role="assistant",
            content=complete_state["roadmap"],
            message_type="roadmap",
            created_at=datetime.utcnow()
        )
        db.add(roadmap_msg)
        
        # Update session status and scores
        avg_score = total_score / len(feedback_items) if feedback_items else 0
        session.status = "completed"
        session.total_score = total_score
        session.average_score = avg_score
        session.proctoring_data = proctoring_data  # Store proctoring data
        session.updated_at = datetime.utcnow()
        session.completed_at = datetime.utcnow()
        
        db.commit()
        
        # Invalidate cache after completing interview
        if current_user:
            cache.delete(f"analytics:user:{current_user.id}")
            cache.delete(f"sessions:user:{current_user.id}")
        cache.invalidate_pattern("leaderboard:")

        # Clean up in-memory session
        if session_id in interview_sessions:
            del interview_sessions[session_id]

        return {
            "message": "Interview completed successfully",
            "session_id": session_id,
            "feedback": feedback_items,
            "roadmap": complete_state["roadmap"],
            "total_score": total_score,
            "average_score": avg_score,
            "fit_percentage": min(100, int((avg_score / 10) * 100)),  # Calculate fit percentage
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error completing interview: {str(e)}")


@router.post("/submit-round")
async def submit_round_answers(
    session_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
):
    """Submit answers for a round in detailed interview and get evaluation.
    
    This endpoint handles round progression in detailed interviews:
    - Evaluates answers with multi-dimensional scoring
    - Determines if candidate passed the round
    - Either advances to next round or terminates interview
    """
    try:
        from models import DifficultyLevel, RoundType, QuestionScore, RoundResult
        
        session_id = session_data.get("session_id")
        answers = session_data.get("answers", [])
        round_number = session_data.get("round_number", 1)
        
        if not session_id:
            raise HTTPException(status_code=400, detail="Session ID is required")
        
        # Get session from database
        session = db.query(InterviewSession).filter(
            InterviewSession.thread_id == session_id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify this is a detailed interview
        if session.interview_mode != "detailed":
            raise HTTPException(
                status_code=400, 
                detail="This endpoint is only for detailed interviews. Use /submit-answers for short interviews."
            )
        
        # Get session data from memory
        if session_id not in interview_sessions:
            raise HTTPException(status_code=404, detail="Session data not found")
        
        session_memory = interview_sessions[session_id]
        questions = session_memory.get("questions", [])
        current_difficulty = session_memory.get("current_difficulty", "medium")
        
        if len(answers) != len(questions):
            raise HTTPException(
                status_code=400, 
                detail=f"Expected {len(questions)} answers, got {len(answers)}"
            )
        
        # Evaluate each answer
        scores: list[QuestionScore] = []
        round_type = ROUND_CONFIG[round_number]["type"]
        
        for i, (question, answer) in enumerate(zip(questions, answers)):
            score = detailed_interview_manager.evaluate_answer(
                question=question,
                answer=answer,
                role=session.role,
                company=session.company,
                round_type=round_type
            )
            scores.append(score)
            
            # Adapt difficulty for next question (within round)
            if i < len(questions) - 1:
                new_difficulty = detailed_interview_manager.adapt_difficulty(
                    score.average, 
                    DifficultyLevel(current_difficulty)
                )
                current_difficulty = new_difficulty.value
        
        # Calculate round average
        round_avg = sum(s.average for s in scores) / len(scores) if scores else 0
        
        # Determine if passed
        passed = detailed_interview_manager.should_pass_round(scores, round_number)
        
        # Create round result
        round_result = RoundResult(
            round_number=round_number,
            round_type=round_type.value,
            questions=questions,
            answers=answers,
            scores=scores,
            average_score=round_avg,
            passed=passed,
            difficulty_used=current_difficulty
        )
        
        # Store round result
        round_results = session_memory.get("round_results", [])
        round_results.append(round_result.model_dump())
        session_memory["round_results"] = round_results
        
        # Update database
        session.rounds_attempted = round_number
        session.round_results = round_results
        session.current_difficulty = current_difficulty
        
        # Prepare response
        response = {
            "session_id": session_id,
            "round_number": round_number,
            "round_name": ROUND_CONFIG[round_number]["name"],
            "passed": passed,
            "average_score": round(round_avg, 2),
            "scores": [s.model_dump() for s in scores],
            "round_summary": detailed_interview_manager.generate_round_summary(round_result)
        }
        
        if passed and round_number < 4:
            # Advance to next round
            next_round = round_number + 1
            session.current_round = next_round
            session_memory["current_round"] = next_round
            
            # Generate questions for next round
            next_questions = detailed_interview_manager.generate_round_questions(
                role=session.role,
                company=session.company,
                resume_text=session.resume_text or "",
                round_number=next_round,
                difficulty=DifficultyLevel(current_difficulty),
                previous_qa=[{"question": q, "answer": a} for q, a in zip(questions, answers)]
            )
            session_memory["questions"] = next_questions
            
            # Calculate fit percentage (performance so far)
            fit_percentage = min(100, int((round_avg / 10) * 100))
            
            response["next_round"] = next_round
            response["next_round_name"] = ROUND_CONFIG[next_round]["name"]
            response["next_round_description"] = ROUND_CONFIG[next_round]["description"]
            response["next_questions"] = next_questions
            response["interview_continues"] = True
            response["fit_percentage"] = fit_percentage
            response["message"] = f"Great work! You've passed {ROUND_CONFIG[round_number]['name']}. Moving to {ROUND_CONFIG[next_round]['name']}!"
        else:
            # Interview ends (either failed or completed all rounds)
            if passed and round_number == 4:
                session.status = "completed"
                session.termination_reason = "Completed all rounds successfully"
                fit_percentage = min(100, int((round_avg / 10) * 100))
                response["message"] = "🎉 Congratulations! You completed all 4 rounds successfully!"
                response["fit_percentage"] = fit_percentage
            else:
                session.status = "terminated"
                session.termination_reason = f"Did not pass Round {round_number}: {ROUND_CONFIG[round_number]['name']}"
                
                # Calculate fit percentage based on performance
                fit_percentage = min(100, int((round_avg / 10) * 100))
                
                # Threshold they needed to pass
                pass_threshold = ROUND_CONFIG[round_number]["pass_threshold"]
                
                # Generate sympathetic, constructive messaging
                response["message"] = (
                    f"Thank you for participating in the interview. Unfortunately, we are unable to move you "
                    f"to Round {round_number + 1} ({ROUND_CONFIG.get(round_number + 1, {}).get('name', 'next round') if round_number < 4 else 'completion'}) "
                    f"at this time. Your performance in {ROUND_CONFIG[round_number]['name']} scored {round_avg:.1f}/10, "
                    f"which is below the required threshold of {pass_threshold}/10."
                )
                response["fit_percentage"] = fit_percentage
                response["improvement_needed"] = round(pass_threshold - round_avg, 1)
            
            session.completed_at = datetime.utcnow()
            
            # Generate final report
            all_round_results = [RoundResult(**r) for r in round_results]
            final_report = detailed_interview_manager.generate_final_report(
                role=session.role,
                company=session.company,
                all_round_results=all_round_results,
                termination_reason=session.termination_reason
            )
            
            response["interview_continues"] = False
            response["final_report"] = final_report
            response["roadmap"] = final_report.get("roadmap", "")
            response["strengths"] = final_report.get("strengths", [])
            response["weak_areas"] = final_report.get("weak_areas", [])
            
            # Calculate overall scores
            total_avg = sum(r.average_score for r in all_round_results) / len(all_round_results)
            session.average_score = total_avg
            session.total_score = sum(
                sum(s.average for s in RoundResult(**r).scores) 
                for r in round_results
            )
            
            # Clean up memory
            if session_id in interview_sessions:
                del interview_sessions[session_id]
        
        session.updated_at = datetime.utcnow()
        db.commit()
        
        # Invalidate cache
        if current_user:
            cache.delete(f"analytics:user:{current_user.id}")
            cache.delete(f"sessions:user:{current_user.id}")
        cache.invalidate_pattern("leaderboard:")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing round: {str(e)}")

@router.get("/session/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db)):
    """Get interview session details."""
    session = db.query(InterviewSession).filter(InterviewSession.thread_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.thread_id,
        "role": session.role,
        "company": session.company,
        "status": session.status,
        "total_score": session.total_score,
        "average_score": session.average_score,
        "created_at": session.created_at,
        "updated_at": session.updated_at
    }

@router.get("/session/{session_id}/chat")
async def get_session_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get chat history for a specific session."""
    # Check cache first (5 minutes TTL for chat history)
    cache_key = f"chat_history:{session_id}"
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return cached_data
    
    # Check if session exists
    session = db.query(InterviewSession).filter(InterviewSession.thread_id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get all chat messages for this session using the session's primary key
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.asc()).all()
    
    result = {
        "session_id": session_id,
        "messages": [
            {
                "role": msg.role,
                "content": msg.content,
                "type": msg.message_type,
                "question_number": msg.question_number,
                "marks": msg.marks,
                "timestamp": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }
    
    # Cache for 5 minutes (chat history is mostly static)
    cache.set(cache_key, result, ttl=300)
    return result

@router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all interview sessions for the current user."""
    import time
    start_time = time.time()
    
    try:
        # Check cache first (60 seconds TTL for sessions list)
        cache_key = f"sessions:user:{current_user.id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            print(f"TIMING: Cache HIT - returning cached sessions")
            return cached_data
        
        # Get all sessions for the current user
        t1 = time.time()
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id
        ).order_by(InterviewSession.created_at.desc()).all()
        t2 = time.time()
        print(f"TIMING: Session query took {t2-t1:.3f}s")
        
        print(f"DEBUG: Found {len(sessions)} sessions for user {current_user.email}")
        
        # Batch query: Get all session IDs that have feedback (single query instead of N queries)
        t3 = time.time()
        session_ids = [s.id for s in sessions]
        sessions_with_feedback = set(
            row[0] for row in db.query(ChatMessage.session_id).filter(
                ChatMessage.session_id.in_(session_ids),
                ChatMessage.message_type == "feedback"
            ).distinct().all()
        ) if session_ids else set()
        t4 = time.time()
        print(f"TIMING: Feedback batch query took {t4-t3:.3f}s")
        
        # Format sessions for the frontend
        formatted_sessions = []
        for session in sessions:
            has_feedback = session.id in sessions_with_feedback
            
            session_data = {
                "thread_id": session.thread_id,  # Use thread_id for frontend consistency
                "session_id": session.thread_id,  # Keep session_id for backward compatibility
                "created_at": session.created_at.isoformat(),
                "status": "completed" if has_feedback else "in_progress",
                "score": session.average_score if session.average_score > 0 else None,
                "company": session.company,
                "role": session.role,
                "has_results": has_feedback,
                "is_pinned": session.is_pinned
            }
            
            formatted_sessions.append(session_data)
        
        result = {"sessions": formatted_sessions}
        
        # Cache the result for 60 seconds
        cache.set(cache_key, result, ttl=60)
        
        t5 = time.time()
        print(f"TIMING: Total endpoint time: {t5-start_time:.3f}s")
        return result
        
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sessions")

@router.get("/analytics")
async def get_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analytics for the current user."""
    try:
        # Check cache first (5 minutes TTL)
        cache_key = f"analytics:user:{current_user.id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data
        
        # Get all sessions for the current user
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id
        ).all()
        
        print(f"DEBUG: Found {len(sessions)} sessions for user {current_user.email}")
        
        total_interviews = len(sessions)
        
        # Batch query: Get all session IDs that have feedback (single query instead of N queries)
        session_ids = [s.id for s in sessions]
        sessions_with_feedback = set(
            row[0] for row in db.query(ChatMessage.session_id).filter(
                ChatMessage.session_id.in_(session_ids),
                ChatMessage.message_type == "feedback"
            ).distinct().all()
        ) if session_ids else set()
        
        # Get completed sessions (those with feedback)
        completed_sessions = []
        companies = set()
        roles = set()
        
        for session in sessions:
            has_feedback = session.id in sessions_with_feedback
            print(f"DEBUG: Session {session.thread_id} - status: {session.status}, avg_score: {session.average_score}")
            
            companies.add(session.company)
            roles.add(session.role)
            
            print(f"DEBUG: Session {session.thread_id} has_feedback: {has_feedback}")
            
            if has_feedback:
                completed_sessions.append(session)
        
        completed_interviews = len(completed_sessions)
        
        print(f"DEBUG: Completed sessions: {completed_interviews}")
        
        # Calculate average and best scores from completed sessions
        scores = [session.average_score for session in completed_sessions if session.average_score > 0]
        average_score = sum(scores) / len(scores) if scores else 0
        best_score = max(scores) if scores else 0
        
        print(f"DEBUG: Scores: {scores}, avg: {average_score}, best: {best_score}")
        
        result = {
            "total_interviews": total_interviews,
            "completed_interviews": completed_interviews,
            "average_score": round(average_score, 1),
            "best_score": round(best_score, 1),
            "companies": list(companies),
            "roles": list(roles)
        }
        
        # Cache the result for 5 minutes (300 seconds)
        cache.set(cache_key, result, ttl=300)
        
        return result
        
    except Exception as e:
        print(f"Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics")

@router.delete("/session/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an interview session."""
    try:
        # Find the session for the current user
        session = db.query(InterviewSession).filter(
            InterviewSession.thread_id == session_id,
            InterviewSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Delete associated chat messages first
        db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).delete()
        
        # Delete the session
        db.delete(session)
        db.commit()
        
        return {"message": "Session deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting session: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete session")

@router.post("/pin/{session_id}")
async def pin_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Pin an interview session."""
    try:
        # Find the session for the current user
        session = db.query(InterviewSession).filter(
            InterviewSession.thread_id == session_id,
            InterviewSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Pin the session
        session.is_pinned = True
        db.commit()
        
        # Invalidate caches
        cache.delete(f"pinned:user:{current_user.id}")
        cache.delete(f"sessions:user:{current_user.id}")
        
        return {"message": "Session pinned successfully", "is_pinned": True}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error pinning session: {e}")
        raise HTTPException(status_code=500, detail="Failed to pin session")

@router.post("/unpin/{session_id}")
async def unpin_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unpin an interview session."""
    try:
        # Find the session for the current user
        session = db.query(InterviewSession).filter(
            InterviewSession.thread_id == session_id,
            InterviewSession.user_id == current_user.id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Unpin the session
        session.is_pinned = False
        db.commit()
        
        # Invalidate caches
        cache.delete(f"pinned:user:{current_user.id}")
        cache.delete(f"sessions:user:{current_user.id}")
        
        return {"message": "Session unpinned successfully", "is_pinned": False}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error unpinning session: {e}")
        raise HTTPException(status_code=500, detail="Failed to unpin session")

@router.get("/pinned")
async def get_pinned_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all pinned interview sessions for the current user."""
    try:
        # Check cache first (60 seconds TTL)
        cache_key = f"pinned:user:{current_user.id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return cached_data
        
        sessions = db.query(InterviewSession).filter(
            InterviewSession.user_id == current_user.id,
            InterviewSession.is_pinned == True
        ).order_by(InterviewSession.updated_at.desc()).all()
        
        if not sessions:
            result = {"pinned_sessions": []}
            cache.set(cache_key, result, ttl=60)
            return result
        
        # Batch query: Get all messages for all pinned sessions at once
        session_ids = [s.id for s in sessions]
        all_messages = db.query(ChatMessage).filter(
            ChatMessage.session_id.in_(session_ids),
            ChatMessage.message_type.in_(["feedback", "roadmap"])
        ).all()
        
        # Group messages by session_id
        messages_by_session = {}
        for msg in all_messages:
            if msg.session_id not in messages_by_session:
                messages_by_session[msg.session_id] = []
            messages_by_session[msg.session_id].append(msg)
        
        sessions_data = []
        for session in sessions:
            session_messages = messages_by_session.get(session.id, [])
            
            # Extract feedback and roadmap if available
            feedback_msg = next((msg for msg in session_messages if msg.message_type == "feedback"), None)
            roadmap_msg = next((msg for msg in session_messages if msg.message_type == "roadmap"), None)
            
            session_data = {
                "thread_id": session.thread_id,
                "session_id": session.id,
                "role": session.role,
                "company": session.company,
                "status": session.status,
                "total_score": session.total_score,
                "average_score": session.average_score,
                "is_pinned": session.is_pinned,
                "created_at": session.created_at.isoformat() if session.created_at else None,
                "completed_at": session.completed_at.isoformat() if session.completed_at else None,
                "feedback": feedback_msg.content if feedback_msg else None,
                "roadmap": roadmap_msg.content if roadmap_msg else None
            }
            sessions_data.append(session_data)
        
        result = {"pinned_sessions": sessions_data}
        cache.set(cache_key, result, ttl=60)
        return result
        
    except Exception as e:
        print(f"Error fetching pinned sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pinned sessions")

@router.get("/leaderboard")
async def get_leaderboard(
    timeframe: str = "all",  # all, week, month
    role_filter: str = None,  # Optional: filter by specific role
    limit: int = 50,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get leaderboard showing top performers (anonymized for privacy)."""
    try:
        from sqlalchemy import func, and_
        from datetime import timedelta
        
        # Check cache first (10 minutes TTL for leaderboard)
        cache_key = f"leaderboard:{timeframe}:{role_filter or 'all'}:{limit}"
        cached_data = cache.get(cache_key)
        
        if cached_data is not None:
            # If we have cached data, update current_user info if logged in
            if current_user:
                # Check if current user is in leaderboard
                found_in_list = False
                for entry in cached_data["leaderboard"]:
                    if entry.get("user_id") == current_user.id:
                        entry["is_current_user"] = True
                        entry["display_name"] = "You"
                        cached_data["current_user"] = entry.copy()
                        found_in_list = True
                        break
                
                # If not in cached leaderboard, fetch current user's stats
                if not found_in_list and cached_data.get("current_user") is None:
                    user_stats = db.query(
                        func.count(InterviewSession.id).label('total_interviews'),
                        func.avg(InterviewSession.average_score).label('avg_score'),
                        func.max(InterviewSession.average_score).label('best_score'),
                        func.sum(InterviewSession.total_score).label('total_points')
                    ).filter(
                        InterviewSession.user_id == current_user.id,
                        InterviewSession.status == "completed",
                        InterviewSession.average_score > 0
                    ).first()
                    
                    if user_stats and user_stats.total_interviews > 0:
                        better_users = db.query(func.count(func.distinct(InterviewSession.user_id))).filter(
                            InterviewSession.status == "completed",
                            InterviewSession.average_score > 0
                        ).group_by(InterviewSession.user_id).having(
                            func.avg(InterviewSession.average_score) > user_stats.avg_score
                        ).count()
                        
                        cached_data["current_user"] = {
                            "rank": better_users + 1,
                            "display_name": "You",
                            "total_interviews": user_stats.total_interviews,
                            "average_score": round(float(user_stats.avg_score), 2) if user_stats.avg_score else 0,
                            "best_score": round(float(user_stats.best_score), 2) if user_stats.best_score else 0,
                            "total_points": int(user_stats.total_points) if user_stats.total_points else 0,
                            "is_current_user": True
                        }
            
            return cached_data
        
        # Base query for completed sessions with scores
        query = db.query(
            InterviewSession.user_id,
            User.full_name,
            User.email,
            func.count(InterviewSession.id).label('total_interviews'),
            func.avg(InterviewSession.average_score).label('avg_score'),
            func.max(InterviewSession.average_score).label('best_score'),
            func.sum(InterviewSession.total_score).label('total_points')
        ).join(
            User, InterviewSession.user_id == User.id
        ).filter(
            InterviewSession.status == "completed",
            InterviewSession.average_score > 0
        )
        
        # Apply role filter if specified
        if role_filter:
            query = query.filter(InterviewSession.role.ilike(f"%{role_filter}%"))
        
        # Apply timeframe filter
        if timeframe == "week":
            week_ago = datetime.utcnow() - timedelta(days=7)
            query = query.filter(InterviewSession.completed_at >= week_ago)
        elif timeframe == "month":
            month_ago = datetime.utcnow() - timedelta(days=30)
            query = query.filter(InterviewSession.completed_at >= month_ago)
        
        # Group by user and order by average score
        query = query.group_by(
            InterviewSession.user_id, 
            User.full_name,
            User.email
        ).order_by(
            func.avg(InterviewSession.average_score).desc()
        ).limit(limit)
        
        results = query.all()
        
        # Format leaderboard data
        leaderboard = []
        current_user_rank = None
        current_user_data = None
        
        for rank, result in enumerate(results, 1):
            user_id, full_name, email, total_interviews, avg_score, best_score, total_points = result
            
            # Anonymize user data (show only first name + initial, or "User #X")
            if full_name:
                name_parts = full_name.split()
                if len(name_parts) > 1:
                    display_name = f"{name_parts[0]} {name_parts[1][0]}."
                else:
                    display_name = name_parts[0]
            else:
                display_name = f"User #{user_id}"
            
            entry = {
                "rank": rank,
                "display_name": display_name,
                "user_id": user_id,  # Store for cache matching
                "total_interviews": total_interviews,
                "average_score": round(float(avg_score), 2) if avg_score else 0,
                "best_score": round(float(best_score), 2) if best_score else 0,
                "total_points": int(total_points) if total_points else 0,
                "is_current_user": False
            }
            
            # Check if this is the current user
            if current_user and user_id == current_user.id:
                entry["is_current_user"] = True
                entry["display_name"] = "You"
                current_user_rank = rank
                current_user_data = entry
            
            leaderboard.append(entry)
        
        # If current user is not in top results, add their stats separately
        if current_user and not current_user_rank:
            user_stats = db.query(
                func.count(InterviewSession.id).label('total_interviews'),
                func.avg(InterviewSession.average_score).label('avg_score'),
                func.max(InterviewSession.average_score).label('best_score'),
                func.sum(InterviewSession.total_score).label('total_points')
            ).filter(
                InterviewSession.user_id == current_user.id,
                InterviewSession.status == "completed",
                InterviewSession.average_score > 0
            ).first()
            
            if user_stats and user_stats.total_interviews > 0:
                # Calculate rank
                better_users = db.query(func.count(func.distinct(InterviewSession.user_id))).filter(
                    InterviewSession.status == "completed",
                    InterviewSession.average_score > 0
                ).group_by(InterviewSession.user_id).having(
                    func.avg(InterviewSession.average_score) > user_stats.avg_score
                ).count()
                
                current_user_data = {
                    "rank": better_users + 1,
                    "display_name": "You",
                    "total_interviews": user_stats.total_interviews,
                    "average_score": round(float(user_stats.avg_score), 2) if user_stats.avg_score else 0,
                    "best_score": round(float(user_stats.best_score), 2) if user_stats.best_score else 0,
                    "total_points": int(user_stats.total_points) if user_stats.total_points else 0,
                    "is_current_user": True
                }
        
        # Get total number of users with completed interviews
        total_users = db.query(func.count(func.distinct(InterviewSession.user_id))).filter(
            InterviewSession.status == "completed",
            InterviewSession.average_score > 0
        ).scalar()
        
        result = {
            "leaderboard": leaderboard,
            "current_user": current_user_data,
            "total_users": total_users,
            "timeframe": timeframe,
            "role_filter": role_filter
        }
        
        # Cache the result for 10 minutes (600 seconds)
        cache.set(cache_key, result, ttl=600)
        
        return result
        
    except Exception as e:
        print(f"Error fetching leaderboard: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")