"""
Detailed Interview Manager - Multi-round interview system with adaptive difficulty.

This module implements the 4-round detailed interview flow with:
- Performance-gated progression between rounds
- Adaptive difficulty within rounds
- Multi-dimensional scoring (correctness, clarity, structure, depth)
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from langgraph.graph import StateGraph, END
import json

from database import get_db, SessionLocal
from models import (
    User, InterviewSession, ChatMessage, InterviewState,
    InterviewMode, RoundType, DifficultyLevel, QuestionScore, RoundResult
)
from common import generator_llm, feedback_llm
from langchain_core.messages import SystemMessage, HumanMessage


# Round configuration with pass thresholds
ROUND_CONFIG = {
    1: {
        "name": "Screening Round",
        "type": RoundType.SCREENING,
        "pass_threshold": 5.5,
        "questions_count": 3,
        "description": "Fundamentals & communication check"
    },
    2: {
        "name": "Core Skills Round", 
        "type": RoundType.CORE_SKILLS,
        "pass_threshold": 6.0,
        "questions_count": 3,
        "description": "Applied understanding & reasoning"
    },
    3: {
        "name": "Advanced/Problem-Solving Round",
        "type": RoundType.ADVANCED,
        "pass_threshold": 6.5,
        "questions_count": 3,
        "description": "Scenario-based thinking & trade-offs"
    },
    4: {
        "name": "Bar Raiser Round",
        "type": RoundType.BAR_RAISER,
        "pass_threshold": 7.0,
        "questions_count": 3,
        "description": "Senior-level thinking & ownership"
    }
}


# Question type prompts by round
ROUND_QUESTION_PROMPTS = {
    RoundType.SCREENING: """
Generate questions for a SCREENING round. Focus on:
- Easy factual questions (one-line answers expected)
- Basic conceptual understanding
- Simple behavioral questions
Questions should test fundamentals and communication clarity.
""",
    RoundType.CORE_SKILLS: """
Generate questions for a CORE SKILLS round. Focus on:
- Medium conceptual depth
- "How" and "Why" questions
- Project-based explanations from their resume
Questions should test applied understanding and reasoning.
""",
    RoundType.ADVANCED: """
Generate questions for an ADVANCED/PROBLEM-SOLVING round. Focus on:
- Scenario-based questions
- Trade-off discussions
- Design-lite or deep behavioral questions
Questions should test thought process and handling ambiguity.
""",
    RoundType.BAR_RAISER: """
Generate questions for a BAR RAISER round. Focus on:
- Open-ended design questions
- Leadership and ownership scenarios
- "Defend your decision" type questions
Questions should test senior-level thinking and decision quality.
"""
}


# Difficulty adaptation prompts
DIFFICULTY_PROMPTS = {
    DifficultyLevel.EASY: "Generate EASY questions that can be answered in 1-2 sentences.",
    DifficultyLevel.MEDIUM: "Generate MEDIUM difficulty questions requiring explanation.",
    DifficultyLevel.HARD: "Generate HARD questions requiring deep analysis and examples."
}


class DetailedInterviewManager:
    """Manages the 4-round detailed interview with adaptive difficulty."""
    
    def __init__(self):
        self.states: Dict[str, InterviewState] = {}
    
    def generate_round_questions(
        self,
        role: str,
        company: str,
        resume_text: str,
        round_number: int,
        difficulty: DifficultyLevel,
        previous_qa: List[Dict[str, str]] = None
    ) -> List[str]:
        """Generate questions for a specific round with given difficulty."""
        
        round_config = ROUND_CONFIG.get(round_number)
        if not round_config:
            raise ValueError(f"Invalid round number: {round_number}")
        
        round_type = round_config["type"]
        round_prompt = ROUND_QUESTION_PROMPTS.get(round_type, "")
        difficulty_prompt = DIFFICULTY_PROMPTS.get(difficulty, DIFFICULTY_PROMPTS[DifficultyLevel.MEDIUM])
        
        # Build context from previous Q&A if available
        previous_context = ""
        if previous_qa:
            previous_context = "\n\nPrevious questions and answers in this interview:\n"
            for i, qa in enumerate(previous_qa[-6:]):  # Only last 6 Q&As
                previous_context += f"Q{i+1}: {qa.get('question', '')}\n"
                previous_context += f"A{i+1}: {qa.get('answer', '')[:200]}...\n\n"
        
        messages = [
            SystemMessage(content=f"""You are an expert technical interviewer conducting Round {round_number}: {round_config['name']}.
{round_prompt}

{difficulty_prompt}

Generate exactly {round_config['questions_count']} questions that:
1. Are tailored to the role and company
2. Build on the candidate's resume
3. Match the difficulty level specified
4. Are different from any previous questions asked

Return ONLY the questions, one per line, numbered 1-{round_config['questions_count']}.
"""),
            HumanMessage(content=f"""
Role: {role}
Company: {company}
Round: {round_number} - {round_config['name']}
Difficulty: {difficulty.value}

Resume:
{resume_text[:3000]}
{previous_context}

Generate {round_config['questions_count']} questions for this round:
""")
        ]
        
        try:
            response = generator_llm.invoke(messages)
            content = response.content if hasattr(response, 'content') else str(response)
            
            # Parse questions from response
            lines = content.strip().split('\n')
            questions = []
            for line in lines:
                line = line.strip()
                if line and len(line) > 10:
                    # Remove numbering like "1.", "1)", etc.
                    if line[0].isdigit() and len(line) > 3:
                        line = line[2:].strip() if line[1] in '.):' else line
                    if line:
                        questions.append(line)
            
            # Ensure we have enough questions
            while len(questions) < round_config['questions_count']:
                questions.append(f"Tell me more about your experience relevant to {role} at {company}.")
            
            return questions[:round_config['questions_count']]
            
        except Exception as e:
            print(f"Error generating round questions: {e}")
            # Fallback questions
            return [
                f"Tell me about your experience with the core skills required for {role}.",
                f"Describe a challenging project you worked on that's relevant to {company}.",
                f"How would you approach a typical problem in this {role} position?"
            ]
    
    def evaluate_answer(
        self,
        question: str,
        answer: str,
        role: str,
        company: str,
        round_type: RoundType
    ) -> QuestionScore:
        """Evaluate an answer with multi-dimensional scoring."""
        
        if not answer or answer.strip() == "" or answer == "[No answer provided]":
            return QuestionScore(
                correctness=0,
                clarity=0,
                structure=0,
                depth=0,
                feedback="No answer was provided for this question."
            )
        
        messages = [
            SystemMessage(content=f"""You are an expert interviewer evaluating a candidate's answer.
Evaluate the answer based on these 4 dimensions (score each 0-10):

1. CORRECTNESS: Technical accuracy and factual correctness
2. CLARITY: How clearly the answer communicates the idea
3. STRUCTURE: Organization and logical flow of the answer
4. DEPTH: Level of technical depth and insight shown

This is a {round_type.value} round question.

Provide your evaluation in this EXACT format:
CORRECTNESS: [0-10]
CLARITY: [0-10]
STRUCTURE: [0-10]
DEPTH: [0-10]
FEEDBACK: [One paragraph of constructive feedback]
"""),
            HumanMessage(content=f"""
Interview for: {role} at {company}
Round Type: {round_type.value}

Question: {question}

Answer: {answer}

Please evaluate this answer:
""")
        ]
        
        try:
            response = feedback_llm.invoke(messages)
            content = response.content if hasattr(response, 'content') else str(response)
            
            # Parse scores
            scores = {"correctness": 5, "clarity": 5, "structure": 5, "depth": 5}
            feedback = "Evaluation generated."
            
            lines = content.strip().split('\n')
            for line in lines:
                line_upper = line.upper().strip()
                if line_upper.startswith("CORRECTNESS:"):
                    try:
                        scores["correctness"] = min(10, max(0, int(line.split(":")[-1].strip().split()[0])))
                    except: pass
                elif line_upper.startswith("CLARITY:"):
                    try:
                        scores["clarity"] = min(10, max(0, int(line.split(":")[-1].strip().split()[0])))
                    except: pass
                elif line_upper.startswith("STRUCTURE:"):
                    try:
                        scores["structure"] = min(10, max(0, int(line.split(":")[-1].strip().split()[0])))
                    except: pass
                elif line_upper.startswith("DEPTH:"):
                    try:
                        scores["depth"] = min(10, max(0, int(line.split(":")[-1].strip().split()[0])))
                    except: pass
                elif line_upper.startswith("FEEDBACK:"):
                    feedback = line.split(":", 1)[-1].strip()
            
            return QuestionScore(
                correctness=scores["correctness"],
                clarity=scores["clarity"],
                structure=scores["structure"],
                depth=scores["depth"],
                feedback=feedback
            )
            
        except Exception as e:
            print(f"Error evaluating answer: {e}")
            return QuestionScore(
                correctness=5,
                clarity=5,
                structure=5,
                depth=5,
                feedback="An error occurred during evaluation."
            )
    
    def adapt_difficulty(
        self,
        current_score: float,
        current_difficulty: DifficultyLevel
    ) -> DifficultyLevel:
        """Adapt difficulty based on answer performance."""
        
        if current_score >= 8.0:
            # Excellent performance, increase difficulty
            if current_difficulty == DifficultyLevel.EASY:
                return DifficultyLevel.MEDIUM
            elif current_difficulty == DifficultyLevel.MEDIUM:
                return DifficultyLevel.HARD
            return DifficultyLevel.HARD
        elif current_score < 5.0:
            # Poor performance, decrease difficulty
            if current_difficulty == DifficultyLevel.HARD:
                return DifficultyLevel.MEDIUM
            elif current_difficulty == DifficultyLevel.MEDIUM:
                return DifficultyLevel.EASY
            return DifficultyLevel.EASY
        else:
            # Maintain current difficulty
            return current_difficulty
    
    def should_pass_round(self, round_scores: List[QuestionScore], round_number: int) -> bool:
        """Determine if candidate passed the round based on scores."""
        
        if not round_scores:
            return False
        
        round_config = ROUND_CONFIG.get(round_number)
        if not round_config:
            return False
        
        # Calculate average score across all dimensions
        total_avg = sum(score.average for score in round_scores) / len(round_scores)
        
        return total_avg >= round_config["pass_threshold"]
    
    def generate_round_summary(self, round_result: RoundResult) -> str:
        """Generate a summary for a completed round."""
        
        passed_text = "PASSED ✓" if round_result.passed else "NOT PASSED ✗"
        
        summary = f"""
## Round {round_result.round_number}: {ROUND_CONFIG[round_result.round_number]['name']}

**Result**: {passed_text}
**Average Score**: {round_result.average_score:.1f}/10
**Difficulty Level**: {round_result.difficulty_used}

### Performance Breakdown:
"""
        for i, (q, a, s) in enumerate(zip(
            round_result.questions, 
            round_result.answers, 
            round_result.scores
        )):
            summary += f"""
**Question {i+1}**: {q[:100]}...
- Correctness: {s.correctness}/10
- Clarity: {s.clarity}/10
- Structure: {s.structure}/10
- Depth: {s.depth}/10
- **Overall**: {s.average:.1f}/10

Feedback: {s.feedback}
"""
        return summary
    
    def generate_final_report(
        self,
        role: str,
        company: str,
        all_round_results: List[RoundResult],
        termination_reason: Optional[str]
    ) -> Dict[str, Any]:
        """Generate the final comprehensive report."""
        
        if not all_round_results:
            return {
                "strengths": ["Unable to assess - no rounds completed"],
                "weak_areas": ["Complete at least one round for assessment"],
                "roadmap": "No roadmap available without completed rounds."
            }
        
        final_round = max(r.round_number for r in all_round_results)
        total_questions = sum(len(r.questions) for r in all_round_results)
        overall_avg = sum(r.average_score for r in all_round_results) / len(all_round_results)
        
        # Collect all scores by dimension
        all_correctness = []
        all_clarity = []
        all_structure = []
        all_depth = []
        
        for rr in all_round_results:
            for score in rr.scores:
                all_correctness.append(score.correctness)
                all_clarity.append(score.clarity)
                all_structure.append(score.structure)
                all_depth.append(score.depth)
        
        avg_correctness = sum(all_correctness) / len(all_correctness) if all_correctness else 0
        avg_clarity = sum(all_clarity) / len(all_clarity) if all_clarity else 0
        avg_structure = sum(all_structure) / len(all_structure) if all_structure else 0
        avg_depth = sum(all_depth) / len(all_depth) if all_depth else 0
        
        # Identify strengths and weaknesses
        dimensions = {
            "Technical Correctness": avg_correctness,
            "Communication Clarity": avg_clarity,
            "Answer Structure": avg_structure,
            "Technical Depth": avg_depth
        }
        
        sorted_dims = sorted(dimensions.items(), key=lambda x: x[1], reverse=True)
        strengths = [d[0] for d in sorted_dims[:2] if d[1] >= 6.0]
        weak_areas = [d[0] for d in sorted_dims[-2:] if d[1] < 7.0]
        
        if not strengths:
            strengths = ["Shows potential - continue practicing"]
        if not weak_areas:
            weak_areas = ["Overall strong performance - focus on advanced topics"]
        
        # Generate roadmap using LLM
        roadmap = self._generate_personalized_roadmap(
            role, company, all_round_results, final_round, termination_reason,
            strengths, weak_areas
        )
        
        return {
            "strengths": strengths,
            "weak_areas": weak_areas,
            "roadmap": roadmap,
            "final_round_reached": final_round,
            "total_questions_answered": total_questions,
            "overall_average": overall_avg,
            "dimension_averages": {
                "correctness": avg_correctness,
                "clarity": avg_clarity,
                "structure": avg_structure,
                "depth": avg_depth
            }
        }
    
    def _generate_personalized_roadmap(
        self,
        role: str,
        company: str,
        all_round_results: List[RoundResult],
        final_round: int,
        termination_reason: Optional[str],
        strengths: List[str],
        weak_areas: List[str]
    ) -> str:
        """Generate a personalized learning roadmap based on interview performance."""
        
        # Build round performance summary
        round_summary = ""
        for rr in all_round_results:
            passed = "Passed" if rr.passed else "Did not pass"
            round_summary += f"- Round {rr.round_number} ({ROUND_CONFIG[rr.round_number]['name']}): {passed}, Score: {rr.average_score:.1f}/10\n"
        
        messages = [
            SystemMessage(content="""You are a career coach creating a personalized learning roadmap.
Based on the interview performance, create a detailed improvement plan that:
1. Acknowledges specific strengths
2. Addresses identified weak areas
3. Provides actionable steps with resources
4. Includes both free and paid learning resources
5. Sets realistic timelines based on the round reached

Format in markdown with clear sections."""),
            HumanMessage(content=f"""
Role Applied: {role}
Company: {company}
Rounds Completed: {final_round}
Termination Reason: {termination_reason or "Completed all rounds"}

Round Performance:
{round_summary}

Identified Strengths: {', '.join(strengths)}
Areas for Improvement: {', '.join(weak_areas)}

Create a personalized 4-8 week learning roadmap to help this candidate improve for future interviews.
Focus more heavily on the areas where they struggled.
If they didn't pass early rounds, focus on fundamentals.
If they reached later rounds, focus on advanced topics.
""")
        ]
        
        try:
            response = generator_llm.invoke(messages)
            roadmap = response.content if hasattr(response, 'content') else str(response)
            return roadmap
        except Exception as e:
            print(f"Error generating roadmap: {e}")
            return f"""# Improvement Roadmap for {role}

## Based on Your Performance
You completed {final_round} round(s) of the interview.

## Recommended Focus Areas
{chr(10).join(f'- {area}' for area in weak_areas)}

## Action Items
1. Review fundamentals in your weak areas
2. Practice mock interviews
3. Study system design patterns
4. Improve communication skills

Continue practicing and you'll improve!
"""


# Create global instance
detailed_interview_manager = DetailedInterviewManager()
