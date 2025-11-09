from common import generator_llm, extract_resume_text
from models import InterviewState, InterviewQuestions
from langchain_core.messages import SystemMessage, HumanMessage

def generate_question(state: InterviewState) -> dict:
    """Generate highly focused, role-specific interview questions 
    that deeply evaluate the candidate's technical expertise 
    based on their resume and company research."""

    # Extract resume text
    resume_text = state.get("resume_text", "")
    
    # Extract company research data
    company_research = state.get("company_research", {})
    company_overview = company_research.get("company_overview", "Not available")
    role_insights = company_research.get("role_specific_insights", "Not available")
    interview_patterns = company_research.get("common_interview_patterns", [])
    tech_stack = company_research.get("tech_stack", [])
    key_skills = company_research.get("key_skills", [])
    relevant_context = company_research.get("relevant_context", "")

    structured_generator = generator_llm.with_structured_output(InterviewQuestions)
    
    # Build context about company research
    research_context = f"""
Company Overview: {company_overview}

Role-Specific Insights: {role_insights}

Common Interview Focus Areas: {', '.join(interview_patterns) if interview_patterns else 'Standard technical interview'}

Tech Stack for this Role: {', '.join(tech_stack) if tech_stack else 'General technologies'}

Key Skills Emphasized: {', '.join(key_skills) if key_skills else 'Standard role skills'}

Additional Context: {relevant_context}
"""

    messages = [
        SystemMessage(content="""
You are an AI technical interviewer with deep knowledge about companies and their hiring practices.
Your job is to ask exactly 3 interview questions that BEST test the candidate's readiness for the given role at the specific company.
You will be provided with:
1. The role and company context
2. Research about the company and role (including their tech stack, interview patterns, and key skills)
3. The candidate's resume

Use ALL of this information to generate the most relevant and targeted questions.
"""),
        
        HumanMessage(content=f"""
You are interviewing for the role of **{state['role']}** at **{state['company']}**.

{research_context}

Here is the candidate's resume text:
{resume_text}

Your task:
- Generate *exactly 3 questions*.  
- **Q1**: A **technical deep-dive** question that combines:
    - The candidate's listed skills/projects from their resume
    - The tech stack and key skills identified for this role at {state['company']}
    - Common interview patterns for this company (if available)
    - Must require applied expertise, not just definitions
    
- **Q2**: A **problem-solving/scenario** question that:
    - Tests technical depth in areas critical to this specific role
    - References the company's tech stack or known challenges
    - Evaluates how the candidate applies their resume experience to real-world scenarios
    - Should be specific to the type of problems this role typically faces
    
- **Q3**: A **technical collaboration/architecture** question that:
    - Tests how they handle technical decision-making or system design
    - Relates to their resume projects but in the context of this company's scale/needs
    - Evaluates communication of complex technical concepts
    - Should be grounded in realistic challenges for this role

Hard requirements:
- Ask ONLY the **most skill-revealing questions** possible for THIS specific company and role
- Prioritize questions that align with identified interview patterns and key skills
- Leverage the company research to make questions highly relevant
- Do NOT ask generic questions - make them company-specific and role-specific
- Do NOT ask fluffy or basic questions
- Do NOT ask about personality or general behavior

Generate ONLY the 3 final questions, nothing else.
""")
    ]

    response = structured_generator.invoke(messages)

    return {
        "question": response.questions
    }
