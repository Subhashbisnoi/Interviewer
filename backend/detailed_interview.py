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
        "pass_threshold": 5,
        "questions_count": 5,
        "description": "Fundamentals & communication check"
    },
    2: {
        "name": "Core Skills Round", 
        "type": RoundType.CORE_SKILLS,
        "pass_threshold": 5,
        "questions_count": 4,
        "description": "Applied understanding & reasoning"
    },
    3: {
        "name": "Advanced/Problem-Solving Round",
        "type": RoundType.ADVANCED,
        "pass_threshold": 5.5,
        "questions_count": 3,
        "description": "Scenario-based thinking & trade-offs"
    },
    4: {
        "name": "Bar Raiser Round",
        "type": RoundType.BAR_RAISER,
        "pass_threshold": 6.5,
        "questions_count": 3,
        "description": "Senior-level thinking & ownership"
    }
}


# Question type prompts by round
ROUND_QUESTION_PROMPTS = {
    RoundType.SCREENING: """
Generate SCREENING round questions that are QUICK (1-2 minute answers) and test FUNDAMENTALS.

Use these proven question patterns:

**For Software Engineer/Backend roles:**
- "What's the time complexity of [algorithm]? When would you use it over [alternative]?"
- "Explain the difference between [concept A] and [concept B]. Give a real-world example"
- "What happens when you type a URL in a browser and hit Enter? (Focus on [specific layer])"
- "What are the key differences between [technology X] and [technology Y]?"

**For Data Scientist roles:**
- "Explain precision vs recall. When would you optimize for one over the other?"
- "What is overfitting and how do you prevent it? Name 3 techniques"
- "Describe the difference between supervised and unsupervised learning with examples"
- "What is the bias-variance tradeoff?"

**For Product Manager/Non-Technical roles:**
- "What is an API? Explain it like I'm not technical"
- "How would you prioritize between [feature A] and [feature B]? What factors matter?"
- "Explain agile methodology in 2 minutes"

CRITICAL RULES:
1. Each question should have a CLEAR right answer or well-defined good answer
2. Questions must be answerable in 1-2 minutes
3. DO NOT ask about resume or past projects in screening
4. Test fundamental concepts specific to the role
5. Be SPECIFIC - no generic questions like "tell me about your experience"

Examples of GOOD screening questions:
✓ "What's the difference between HTTP and HTTPS? How does encryption work?"
✓ "Explain what happens during a SQL JOIN operation"
✓ "What is the CAP theorem? Give an example of choosing AP vs CP"

Examples of BAD screening questions:
✗ "Tell me about your background in technology"
✗ "How do you stay updated with new technologies?"
✗ "Describe your general approach to problem-solving"
""",
    RoundType.CORE_SKILLS: """
Generate CORE SKILLS questions that test PRACTICAL problem-solving and hands-on technical ability.

Use these proven question patterns:

**Debugging/Troubleshooting (MUST include at least 1):**
- "Your API suddenly returns 500 errors for 10% of requests after deployment. Walk me through your debugging process"
- "Users report slow page loads. Your monitoring shows database queries taking 5 seconds (normally 100ms). How do you investigate?"
- "A batch job that processes 1M records started failing halfway through. How would you make it resumable?"

**Implementation/Coding (explain approach):**
- "Walk me through how you would implement [specific feature]. What data structures would you use and why?"
- "How would you design the data model for [use case]? Consider these constraints: [constraint1, constraint2]"
- "Given an unsorted array of integers, write an algorithm to find the two numbers that sum to a target. What's the time complexity?"

**Real-World Scenarios:**
- "You need to process 100GB of log files to find patterns. What's your approach?"
- "Two microservices are showing data inconsistency. Service A shows 1000 records, Service B shows 950. How do you investigate?"
- "Your cache hit rate dropped from 95% to 60%. What could cause this and how would you fix it?"

CRITICAL RULES:
1. At least ONE question must be debugging/troubleshooting
2. Questions should require explaining APPROACH, not just theory
3. Include specific scenarios with concrete constraints
4. Test hands-on technical skills from the JD

Examples of GOOD core skills questions:
✓ "Your microservice memory usage keeps growing until it crashes. How do you debug this memory leak?"
✓ "Walk me through implementing a rate limiter that allows 100 requests per minute per user"
✓ "In your e-commerce project, how did you ensure payment processing was idempotent?"

Examples of BAD core skills questions:
✗ "What is your experience with distributed systems?"
✗ "How do you approach solving technical problems in general?"
✗ "Tell me about a challenging project you worked on"
""",
    RoundType.ADVANCED: """
Generate ADVANCED/PROBLEM-SOLVING questions that test SYSTEM DESIGN, TRADE-OFFS, and PRODUCTION thinking.

Use these proven question patterns:

**System Design (MUST include at least 1 with specific scale/requirements):**
- "Design a URL shortener like bit.ly that handles 100M new URLs per day. Focus on data storage and retrieval"
- "Design a real-time leaderboard system for a mobile game with 5M active users. Scores update every few seconds"
- "Design a notification system that guarantees at-least-once delivery to 10M users. Consider push, email, and SMS"
- "Design a rate limiter for an API handling 10,000 requests/second. How do you distribute it across multiple servers?"

**Architecture & Trade-offs:**
- "Would you use SQL or NoSQL for [specific use case]? Explain your reasoning with pros/cons of each"
- "How would you design [service] to be horizontally scalable? What are the main challenges?"
- "You need to choose between synchronous and asynchronous communication for [scenario]. What factors influence your decision?"
- "Microservices vs Monolith for [use case]. Defend your choice"

**Production Scenarios:**
- "Your service latency jumped from 100ms to 2 seconds. Walk me through diagnosis and resolution"
- "You need to migrate 10TB of data from MySQL to PostgreSQL with zero downtime. Describe your approach"
- "Your database is at 90% capacity and growing 10GB/day. What are your options? Compare trade-offs"

**Technical Decision-Making:**
- "Your team wants to adopt [new technology]. What questions would you ask before approving it?"
- "Design a caching strategy for [use case]. Where do you cache (client, CDN, application, database)? Why?"

CRITICAL RULES:
1. At least ONE system design question with SPECIFIC scale requirements (users, requests/sec, data size)
2. Questions must require explaining TRADE-OFFS and justifying decisions
3. Use real company examples (URL shortener, Twitter feed, WhatsApp, etc.)
4. Test production-level thinking, not just theory
5. Include numbers/metrics (latency, throughput, data size)

Examples of GOOD advanced questions:
✓ "Design Instagram Stories. 500M users, stories expire in 24h, video/photo uploads up to 100MB"
✓ "Your Kafka cluster is dropping messages during peak load (5M msgs/sec). How do you fix it?"
✓ "Design a distributed lock service that handles 100K lock requests/second with <10ms latency"

Examples of BAD advanced questions:
✗ "How would you design a scalable system?"
✗ "What is system design?"
✗ "Tell me about a complex system you've built"
""",
    RoundType.BAR_RAISER: """
Generate BAR RAISER questions that test LEADERSHIP, AMBIGUITY HANDLING, and SENIOR JUDGMENT.

Use these proven question patterns:

**Production Crisis/Incident Response:**
- "At 2 AM, your payment service goes down affecting 100K transactions/hour. Walk me through your incident response from first alert to resolution"
- "You discover a bug that exposed customer PII for 48 hours. What are your immediate next steps? Long-term?"
- "Your CDN provider has an outage affecting 50% of your users. You have 15 minutes to decide: wait or failover. How do you decide?"

**Cross-Team Engineering Leadership:**
- "You're building [feature] requiring coordination with data, mobile, and infrastructure teams. They have conflicting timelines. How do you align them?"
- "Two senior engineers propose completely different technical solutions to the same problem. How do you drive consensus?"
- "Your team wants to rewrite a legacy system to microservices. It'll take 6 months. How do you evaluate if it's worth it?"

**Ambiguous/Strategic Problems:**
- "Customer churn increased 15% this quarter. CEO asks you to 'fix it with better technology'. What's your approach?"
- "You're told to 'improve system reliability'. Where do you start? How do you measure success?"
- "You have $500K budget to improve engineering productivity. How do you allocate it?"

**Technical Leadership & Decision-Making:**
- "Your team is split 50/50 on using [technology A] vs [technology B]. As tech lead, how do you break the tie?"
- "You need to introduce Kubernetes to a team comfortable with traditional deployments. They're resistant. How do you handle it?"
- "Your architecture broke at 10x scale. You have 2 options: band-aid fix (2 weeks) or proper rebuild (3 months). How do you decide?"

**Ownership & High-Stakes

 Scenarios:**
- "You're 2 weeks from a critical launch. QA finds a blocking bug, backend needs 3 more days, and product wants to add a requirement. What do you do?"
- "You made a technical decision that ended up costing the company $1M. What went wrong? What would you do differently?"
- "As tech lead at [company], what would be your top 3 technical priorities for the next quarter? Why?"

**Strategic Thinking:**
- "If you joined [company] as a senior engineer tomorrow, what would you focus on in your first 30 days?"
- "Your startup's traffic doubled overnight due to viral growth. Your infrastructure isn't ready. What are your next 24 hours?"

CRITICAL RULES:
1. Questions must test LEADERSHIP and DECISION-MAKING under uncertainty
2. Include at least ONE production crisis scenario
3. Require demonstrating OWNERSHIP and cross-functional collaboration
4. Test how they handle HIGH-STAKES situations with incomplete information
5. Should NOT be answerable with pure technical knowledge - requires judgment

Examples of GOOD bar raiser questions:
✓ "Your monitoring shows data loss in production but you can't reproduce it. Users are complaining. What do you do in the next hour? Next day? Next week?"
✓ "You're leading a 5-team initiative to migrate to cloud. Budget is $2M, timeline is 6 months. 3 months in, you're 50% over budget. How do you handle it?"
✓ "Two key engineers quit 3 weeks before your biggest product launch. What's your plan?"

Examples of BAD bar raiser questions:
✗ "Tell me about a time you showed leadership"
✗ "How do you handle difficult situations?"
✗ "Describe your management style"
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
        job_description: Optional[str] = None,
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
        
        # Add JD context
        jd_context = ""
        if job_description:
            jd_context = f"\n\nJob Description:\n{job_description[:1000]}\n"
        
        messages = [
            SystemMessage(content=f"""You are an expert technical interviewer from a top tech company (Google/Amazon/Meta/Microsoft).
You are conducting Round {round_number}: {round_config['name']}.

{round_prompt}

{difficulty_prompt}

STRICT REQUIREMENTS - READ CAREFULLY:
1. Follow the question patterns and examples provided above EXACTLY
2. Ask SPECIFIC, problem-based questions - NO generic questions
3. Use real-world scenarios with concrete constraints and numbers
4. For technical questions: include data structures, algorithms, scale requirements
5. For behavioral questions: use STAR method format ("Tell me about a time when...")
6. Include the job description requirements in your questions

Questions MUST:
- Be answerable in a real interview setting (consider timing)
- Have clear evaluation criteria
- Match the role ({role}), company ({company}), and {jd_context} requirements
- Be different from previous questions asked
- Follow the GOOD examples pattern, NOT the BAD examples

BAD question example: "Tell me about your experience"
GOOD question example: "Your API returns 500 errors after deployment. Debug it"

BAD question example: "How would you design a scalable system?"
GOOD question example: "Design a URL shortener handling 100M requests/day with <100ms latency"

Generate EXACTLY {round_config['questions_count']} questions following these patterns.
Return ONLY the questions, numbered 1-{round_config['questions_count']}.
"""),
            HumanMessage(content=f"""
Role: {role}
Company: {company}
Round: {round_number} - {round_config['name']}
Difficulty: {difficulty.value}

Resume:
{resume_text[:3000]}
{previous_context}

Generate {round_config['questions_count']} questions following the patterns above:
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
        round_type: RoundType,
        job_description: Optional[str] = None
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
        
        # Add JD context
        jd_context = ""
        if job_description:
            jd_context = f"\n\nJob Description:\n{job_description[:1000]}\n\nEvaluate how well the answer demonstrates skills and experience relevant to this JD."
        
        messages = [
            SystemMessage(content=f"""You are an expert interviewer evaluating a candidate's answer.
Evaluate the answer based on these 4 dimensions (score each 0-10):

1. CORRECTNESS: Technical accuracy and factual correctness
2. CLARITY: How clearly the answer communicates the idea
3. STRUCTURE: Organization and logical flow of the answer
4. DEPTH: Level of technical depth and insight shown

This is a {round_type.value} round question.

IMPORTANT: Consider how well the answer aligns with the job description requirements.
Award higher scores if the candidate demonstrates skills/experience mentioned in the JD.

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
{jd_context}

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
