from common import generator_llm
from models import InterviewState
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_community.tools import DuckDuckGoSearchRun
from pydantic import BaseModel, Field
from typing import List, Optional
import json

class CompanyResearchData(BaseModel):
    """Structured data from company and role research."""
    company_overview: str = Field(..., description="Brief overview of the company")
    role_specific_insights: str = Field(..., description="Key insights about the role at this company")
    common_interview_patterns: List[str] = Field(..., description="Common interview patterns or focus areas for this role at this company")
    tech_stack: List[str] = Field(default_factory=list, description="Technologies commonly used for this role")
    key_skills: List[str] = Field(default_factory=list, description="Key skills emphasized for this role")
    relevant_context: str = Field(..., description="Any other relevant context for generating questions")

def search_company_and_role(state: InterviewState) -> dict:
    """
    Search the internet for information about the company and role.
    Extracts patterns, tech stack, and relevant context to generate better questions.
    """
    
    role = state.get("role", "")
    company = state.get("company", "")
    
    # Initialize search tool
    search = DuckDuckGoSearchRun()
    
    try:
        # Search for company information
        company_query = f"{company} company overview tech stack culture"
        company_results = search.invoke(company_query)
        
        # Search for role-specific information
        role_query = f"{role} at {company} interview questions patterns skills required"
        role_results = search.invoke(role_query)
        
        # Search for general role patterns
        general_role_query = f"{role} interview common questions technical skills 2024"
        general_results = search.invoke(general_role_query)
        
        # Combine all search results
        combined_results = f"""
Company Information:
{company_results}

Role at Company:
{role_results}

General Role Information:
{general_results}
"""
        
        # Use LLM to extract structured information
        structured_extractor = generator_llm.with_structured_output(CompanyResearchData)
        
        extraction_messages = [
            SystemMessage(content="""
You are an expert research analyst specializing in tech companies and job roles.
Your task is to extract and structure relevant information about a company and role
to help generate highly targeted interview questions.

Focus on:
- Company's technology stack and engineering practices
- Role-specific requirements and expectations
- Common interview patterns for this role at this company (if available)
- Key technical skills that are most important
- Any unique aspects of the company's approach to this role

Be concise but comprehensive. Extract only factual, relevant information.
"""),
            HumanMessage(content=f"""
Based on the following search results, extract structured information about:
**Role**: {role}
**Company**: {company}

Search Results:
{combined_results}

Extract:
1. Company overview (brief - focus on tech aspects)
2. Role-specific insights at this company
3. Common interview patterns or focus areas (if found)
4. Technology stack for this role
5. Key skills emphasized
6. Any other relevant context for interview question generation

If specific information is not available, provide general industry-standard insights for this role.
""")
        ]
        
        research_data = structured_extractor.invoke(extraction_messages)
        
        # Convert to dict for state
        research_dict = {
            "company_overview": research_data.company_overview,
            "role_specific_insights": research_data.role_specific_insights,
            "common_interview_patterns": research_data.common_interview_patterns,
            "tech_stack": research_data.tech_stack,
            "key_skills": research_data.key_skills,
            "relevant_context": research_data.relevant_context
        }
        
        print(f"\n✓ Company research completed for {role} at {company}")
        print(f"  - Tech stack: {', '.join(research_data.tech_stack[:5])}")
        print(f"  - Key skills: {', '.join(research_data.key_skills[:5])}")
        
        return {
            "company_research": research_dict
        }
        
    except Exception as e:
        print(f"Error during company research: {str(e)}")
        # Return minimal fallback data
        return {
            "company_research": {
                "company_overview": f"{company} is a technology company.",
                "role_specific_insights": f"Standard {role} position.",
                "common_interview_patterns": ["Technical depth", "Problem solving", "System design"],
                "tech_stack": [],
                "key_skills": [],
                "relevant_context": "Focus on candidate's resume and standard role expectations."
            }
        }
