import os
import io
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
import pdfplumber
from PyPDF2 import PdfReader

load_dotenv()

# Use OpenRouter for all LLM calls
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_API_BASE", "https://openrouter.ai/api/v1")

os.environ["OPENAI_API_KEY"] = OPENROUTER_API_KEY or ""
os.environ["OPENAI_BASE_URL"] = OPENROUTER_BASE_URL

# Default shared LLM instances (normal plan model)
generator_llm = ChatOpenAI(
    model="openai/gpt-4o",
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base=OPENROUTER_BASE_URL,
)
feedback_llm = ChatOpenAI(
    model="openai/gpt-4o",
    openai_api_key=OPENROUTER_API_KEY,
    openai_api_base=OPENROUTER_BASE_URL,
)


def extract_resume_text(pdf_bytes: bytes) -> str:
    if not pdf_bytes or not isinstance(pdf_bytes, bytes) or len(pdf_bytes) < 4:
        return ""
    if not pdf_bytes.startswith(b'%PDF'):
        return ""

    text = ""

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                try:
                    page_text = page.extract_text(x_tolerance=1, y_tolerance=1) or ""
                    if page_text.strip():
                        text += f"\n--- Page {i+1} ---\n{page_text}\n"
                except Exception:
                    continue
        if text.strip():
            return text.strip()
    except Exception:
        pass

    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text() or ""
                if page_text.strip():
                    text += f"\n--- Page {i+1} ---\n{page_text}\n"
            except Exception:
                continue
        if text.strip():
            return text.strip()
    except Exception:
        pass

    return ""


def generate_job_description(role: str) -> str:
    """Generate a realistic JD for the given role (no company context needed)."""
    from langchain_core.messages import SystemMessage, HumanMessage

    messages = [
        SystemMessage(content="You are an expert recruiter. Generate a concise, realistic job description."),
        HumanMessage(content=f"Write a job description for the role: {role}. Include responsibilities, required skills, and nice-to-haves. Keep it under 300 words."),
    ]
    try:
        response = generator_llm.invoke(messages)
        return (response.content if hasattr(response, "content") else str(response)).strip()
    except Exception:
        return f"We are looking for a talented {role} to join our team."
