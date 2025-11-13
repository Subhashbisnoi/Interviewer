# Workflow Update: Company & Role Research Integration

## Overview
Added a new node to the interview workflow that searches the internet for company and role-specific information to generate more targeted and relevant interview questions.

## Changes Made

### 1. New File: `company_detail_extractor.py`
**Purpose**: Search the internet and extract structured information about the company and role

**Key Features**:
- Uses DuckDuckGo search to gather information about:
  - Company overview and tech stack
  - Role-specific requirements at the company
  - Common interview patterns
  - Key skills and technologies
- Extracts structured data using LLM:
  - `company_overview`: Brief company description
  - `role_specific_insights`: Role expectations at this company
  - `common_interview_patterns`: Interview focus areas
  - `tech_stack`: Technologies used for the role
  - `key_skills`: Key skills emphasized
  - `relevant_context`: Additional context for question generation

**Function**: `search_company_and_role(state: InterviewState) -> dict`

### 2. Updated: `models.py`
**Change**: Added `company_research` field to `InterviewState`

```python
class InterviewState(TypedDict):
    # ... existing fields ...
    
    # Company research data
    company_research: Optional[Dict[str, Any]]
    
    # ... other fields ...
```

### 3. Updated: `generator.py`
**Change**: Modified `generate_question()` to use company research data

**Enhancements**:
- Now incorporates company research into question generation
- Questions are tailored based on:
  - Company's tech stack
  - Common interview patterns
  - Role-specific insights
  - Key skills for the position
- More targeted and relevant questions for the specific company and role

### 4. Updated: `workflow.py`
**Changes**:
- Added import for `search_company_and_role`
- Added new node `"search_company_and_role"` to the graph
- Updated workflow flow:
  ```
  START → search_company_and_role → generate_question → answer_1st_question → 
  answer_2nd_question → answer_3rd_question → feedback_generator → 
  generate_roadmap → END
  ```

### 5. Updated: `requirements.txt`
**Added Dependencies**:
- `langchain-community==0.3.74` - For community tools including search
- `duckduckgo-search==6.3.5` - For internet search capabilities

## Workflow Flow

```
┌─────────────────────────────────────────────┐
│              START                          │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│      search_company_and_role                │
│  • Searches internet for company info       │
│  • Extracts tech stack & interview patterns │
│  • Identifies key skills for role           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        generate_question                    │
│  • Uses resume + company research           │
│  • Generates 3 targeted questions           │
│  • Questions aligned with company needs     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
          (Rest of workflow...)
```

## Benefits

1. **More Relevant Questions**: Questions are now tailored to the specific company's tech stack and requirements
2. **Better Preparation**: Candidates get questions that reflect actual company interview patterns
3. **Industry Insights**: Leverages real-world information about the company and role
4. **Improved Accuracy**: Questions align with what the company actually values in candidates

## Installation

To use the updated workflow, install the new dependencies:

```bash
cd backend
pip install -r requirements.txt
```

## Example Output

For a role like "Senior Backend Engineer at Google":

**Before**: Generic backend questions
**After**: Questions about:
- Google's tech stack (Go, gRPC, Kubernetes)
- Large-scale distributed systems (Google-specific)
- Interview patterns (system design, coding, behavioral)
- Specific technologies mentioned in Google job postings

## Error Handling

The search function includes fallback behavior:
- If search fails, returns minimal default data
- Ensures workflow continues even if research fails
- Logs errors for debugging

## Future Enhancements

Potential improvements:
- Cache company research to avoid repeated searches
- Add more search sources (LinkedIn, Glassdoor APIs)
- Store research results in database for reuse
- Add real-time job posting analysis
