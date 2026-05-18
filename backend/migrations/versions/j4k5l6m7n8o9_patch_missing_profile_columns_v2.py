"""Patch missing user_profiles columns for production (v2)

Revision ID: j4k5l6m7n8o9
Revises: i3j4k5l6m7n8
Create Date: 2026-05-19
"""
from alembic import op
import sqlalchemy as sa

revision = 'j4k5l6m7n8o9'
down_revision = 'i3j4k5l6m7n8'
branch_labels = None
depends_on = None


def upgrade():
    stmts = [
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS headline VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS location VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_roles JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS experience_years FLOAT DEFAULT 0",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS skills JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS work_experience JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS education JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS projects JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS github_url VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_text TEXT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_visible_to_recruiters BOOLEAN DEFAULT true",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_score FLOAT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin_score FLOAT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS github_score FLOAT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_score FLOAT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_completion FLOAT DEFAULT 0",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_filename VARCHAR",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active_date DATE",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_activity JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_score_breakdown JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS github_score_breakdown JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin_score_breakdown JSON",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS resume_feedback TEXT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS github_feedback TEXT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS linkedin_feedback TEXT",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT now()",
        "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT now()",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 20",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS plan_type VARCHAR DEFAULT 'normal'",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS score_technical FLOAT",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS score_communication FLOAT",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS score_leadership FLOAT",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS score_critical_thinking FLOAT",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS score_decision_making FLOAT",
        "ALTER TABLE interview_sessions ADD COLUMN IF NOT EXISTS score_project_knowledge FLOAT",
    ]

    for stmt in stmts:
        op.execute(sa.text(stmt))


def downgrade():
    pass
