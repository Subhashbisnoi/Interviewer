"""
Adaptive Interview Engine

Conducts realistic, conversational interviews that:
- Shape themselves based on candidate responses
- Ask intelligent follow-up questions
- Evaluate across 6 dimensions: technical, communication, leadership,
  critical thinking, decision making, project knowledge
- Use the model appropriate to the chosen plan
"""
import os
import json
import random
from typing import Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

# ── Model selection by plan ────────────────────────────────────────────────

PLAN_MODELS = {
    "normal":  "openai/gpt-4o",
    "thunder": "anthropic/claude-sonnet-4-5",
    "max":     "anthropic/claude-opus-4-7",
}

CREDIT_COST_RANGE = {
    "normal":  (13, 17),
    "thunder": (33, 39),
    "max":     (55, 60),
}


def get_llm(plan_type: str) -> ChatOpenAI:
    model = PLAN_MODELS.get(plan_type, PLAN_MODELS["normal"])
    return ChatOpenAI(
        model=model,
        openai_api_key=os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY"),
        openai_api_base=os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1"),
    )


def get_interview_cost(plan_type: str) -> int:
    lo, hi = CREDIT_COST_RANGE.get(plan_type, (13, 17))
    return random.randint(lo, hi)


# ── Pydantic output schemas ────────────────────────────────────────────────

class NextAction(BaseModel):
    action: str = Field(..., description="'ask_question', 'ask_followup', or 'wrap_up'")
    message: str = Field(..., description="The question or closing statement to send to the candidate")
    topic: str = Field(default="technical", description="Dimension being probed")


class DimensionEval(BaseModel):
    technical: float = Field(..., ge=0, le=10)
    communication: float = Field(..., ge=0, le=10)
    leadership: float = Field(..., ge=0, le=10)
    critical_thinking: float = Field(..., ge=0, le=10)
    decision_making: float = Field(..., ge=0, le=10)
    project_knowledge: float = Field(..., ge=0, le=10)
    overall: float = Field(..., ge=0, le=10)
    strengths: List[str] = Field(default_factory=list)
    weak_areas: List[str] = Field(default_factory=list)
    detailed_feedback: str = Field(default="")
    roadmap: str = Field(default="")


# ── Core interview logic ───────────────────────────────────────────────────

INTERVIEWER_SYSTEM = """You are an experienced technical interviewer conducting a real online interview.

Your goal is to holistically assess the candidate across these 6 dimensions:
1. Technical Knowledge – depth and accuracy on relevant tech
2. Communication – clarity, structure, and articulation
3. Leadership & Collaboration – taking ownership, teamwork
4. Critical Thinking – analysis, problem breakdown
5. Decision Making – trade-offs, prioritisation under constraints
6. Project Knowledge – understanding of their own past work

Rules:
- Sound natural, warm, and professional — NOT robotic
- Ask ONE question at a time
- If an answer is interesting or shallow, ask a targeted follow-up (max 2 follow-ups per main question)
- Shape the interview based on the candidate's performance — go deeper where strong, help explore where weak
- Cover at least 4 of the 6 dimensions across the interview
- Total interview: 6-9 questions (main + follow-ups combined)
- When you've gathered enough signal, wrap up graciously

You will receive the conversation history and must decide the next action:
- 'ask_question'  → move to a new main question (new dimension or deepen current)
- 'ask_followup'  → drill deeper on the last answer
- 'wrap_up'       → enough signal collected, end the interview

Return valid JSON matching {action, message, topic}."""


def build_context(role: str, resume_text: str, job_description: Optional[str]) -> str:
    jd_section = f"\nJob Description:\n{job_description}" if job_description else ""
    return f"""Role: {role}{jd_section}

Candidate Resume:
{resume_text[:3000]}"""


def get_next_interviewer_action(
    role: str,
    resume_text: str,
    job_description: Optional[str],
    conversation: list,  # list of {role, content}
    plan_type: str,
    question_count: int,
    follow_up_count: int,
) -> NextAction:
    """Decide what the interviewer should say next."""
    llm = get_llm(plan_type)
    structured = llm.with_structured_output(NextAction)

    history_text = "\n".join(
        f"{'Interviewer' if m['role'] == 'assistant' else 'Candidate'}: {m['content']}"
        for m in conversation
    )

    context = build_context(role, resume_text, job_description)
    turn_info = f"\nQuestions asked so far: {question_count} | Follow-ups on current question: {follow_up_count}"

    messages = [
        SystemMessage(content=INTERVIEWER_SYSTEM),
        HumanMessage(content=f"""{context}

--- Conversation so far ---
{history_text or '(Interview just starting)'}
{turn_info}

Based on the conversation, decide the next action. Remember:
- Wrap up only after 6+ exchanges or when you have clear signal on most dimensions.
- If conversation is empty, start with a warm opening question.
- Never exceed 2 follow-ups on the same question before moving on."""),
    ]

    return structured.invoke(messages)


EVALUATOR_SYSTEM = """You are an expert interview evaluator. Based on a complete interview transcript,
score the candidate across 6 dimensions (0-10 each), compute an overall score,
list 2-3 strengths, 2-3 areas for improvement, write concise feedback (3-4 sentences),
and create a personalised learning roadmap (bullet points).

Return valid JSON matching the DimensionEval schema."""


def evaluate_interview(
    role: str,
    resume_text: str,
    conversation: list,
    plan_type: str,
) -> DimensionEval:
    """Evaluate the full interview and return dimension scores + roadmap."""
    llm = get_llm(plan_type)
    structured = llm.with_structured_output(DimensionEval)

    history_text = "\n".join(
        f"{'Interviewer' if m['role'] == 'assistant' else 'Candidate'}: {m['content']}"
        for m in conversation
    )

    messages = [
        SystemMessage(content=EVALUATOR_SYSTEM),
        HumanMessage(content=f"""Role: {role}

Resume (excerpt):
{resume_text[:2000]}

--- Full Interview Transcript ---
{history_text}

Evaluate the candidate comprehensively."""),
    ]

    return structured.invoke(messages)
