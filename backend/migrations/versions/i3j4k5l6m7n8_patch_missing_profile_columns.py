"""Patch missing user_profiles columns for production

Revision ID: i3j4k5l6m7n8
Revises: h2i3j4k5l6m7
Create Date: 2026-05-19
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

revision = 'i3j4k5l6m7n8'
down_revision = 'h2i3j4k5l6m7'
branch_labels = None
depends_on = None


def _add_col_if_missing(conn, table, column, col_type):
    """Add a column only if it doesn't already exist."""
    conn.execute(text(
        f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {column} {col_type}"
    ))


def upgrade():
    conn = op.get_bind()

    cols = [
        ("headline",               "VARCHAR"),
        ("bio",                    "TEXT"),
        ("location",               "VARCHAR"),
        ("avatar_url",             "VARCHAR"),
        ("target_roles",           "JSON"),
        ("experience_years",       "FLOAT DEFAULT 0"),
        ("skills",                 "JSON"),
        ("work_experience",        "JSON"),
        ("education",              "JSON"),
        ("projects",               "JSON"),
        ("linkedin_url",           "VARCHAR"),
        ("github_url",             "VARCHAR"),
        ("portfolio_url",          "VARCHAR"),
        ("resume_text",            "TEXT"),
        ("is_visible_to_recruiters", "BOOLEAN DEFAULT true"),
        # scoring columns (added by h2i3j4k5l6m7 — safe to re-add with IF NOT EXISTS)
        ("resume_score",           "FLOAT"),
        ("linkedin_score",         "FLOAT"),
        ("github_score",           "FLOAT"),
        ("profile_score",          "FLOAT"),
        ("profile_completion",     "FLOAT DEFAULT 0"),
        ("resume_filename",        "VARCHAR"),
        ("resume_uploaded_at",     "TIMESTAMP"),
        ("streak_days",            "INTEGER DEFAULT 0"),
        ("last_active_date",       "DATE"),
        ("daily_activity",         "JSON"),
        ("resume_score_breakdown", "JSON"),
        ("github_score_breakdown", "JSON"),
        ("linkedin_score_breakdown","JSON"),
        ("resume_feedback",        "TEXT"),
        ("github_feedback",        "TEXT"),
        ("linkedin_feedback",      "TEXT"),
        ("created_at",             "TIMESTAMP DEFAULT now()"),
        ("updated_at",             "TIMESTAMP DEFAULT now()"),
    ]

    for col, col_type in cols:
        _add_col_if_missing(conn, "user_profiles", col, col_type)

    # Also add credits to users if missing
    conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 20"
    ))

    # Add interview_sessions score columns if missing
    score_cols = [
        ("plan_type",              "VARCHAR DEFAULT 'normal'"),
        ("credits_used",           "INTEGER DEFAULT 0"),
        ("score_technical",        "FLOAT"),
        ("score_communication",    "FLOAT"),
        ("score_leadership",       "FLOAT"),
        ("score_critical_thinking","FLOAT"),
        ("score_decision_making",  "FLOAT"),
        ("score_project_knowledge","FLOAT"),
    ]
    for col, col_type in score_cols:
        _add_col_if_missing(conn, "interview_sessions", col, col_type)


def downgrade():
    pass
