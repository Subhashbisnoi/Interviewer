"""Profile scoring and gamification columns

Revision ID: h2i3j4k5l6m7
Revises: g1h2i3j4k5l6
Create Date: 2026-05-18
"""
from alembic import op
import sqlalchemy as sa

revision = 'h2i3j4k5l6m7'
down_revision = 'g1h2i3j4k5l6'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('user_profiles', sa.Column('resume_score', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('linkedin_score', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('github_score', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('profile_score', sa.Float(), nullable=True))
    op.add_column('user_profiles', sa.Column('profile_completion', sa.Float(), server_default='0', nullable=True))
    op.add_column('user_profiles', sa.Column('resume_filename', sa.String(), nullable=True))
    op.add_column('user_profiles', sa.Column('resume_uploaded_at', sa.DateTime(), nullable=True))
    op.add_column('user_profiles', sa.Column('streak_days', sa.Integer(), server_default='0', nullable=True))
    op.add_column('user_profiles', sa.Column('last_active_date', sa.Date(), nullable=True))
    op.add_column('user_profiles', sa.Column('daily_activity', sa.JSON(), nullable=True))

    # Per-dimension score breakdowns persisted as JSON
    op.add_column('user_profiles', sa.Column('resume_score_breakdown', sa.JSON(), nullable=True))
    op.add_column('user_profiles', sa.Column('github_score_breakdown', sa.JSON(), nullable=True))
    op.add_column('user_profiles', sa.Column('linkedin_score_breakdown', sa.JSON(), nullable=True))
    op.add_column('user_profiles', sa.Column('resume_feedback', sa.Text(), nullable=True))
    op.add_column('user_profiles', sa.Column('github_feedback', sa.Text(), nullable=True))
    op.add_column('user_profiles', sa.Column('linkedin_feedback', sa.Text(), nullable=True))


def downgrade():
    for col in (
        'linkedin_feedback', 'github_feedback', 'resume_feedback',
        'linkedin_score_breakdown', 'github_score_breakdown', 'resume_score_breakdown',
        'daily_activity', 'last_active_date', 'streak_days',
        'resume_uploaded_at', 'resume_filename', 'profile_completion',
        'profile_score', 'github_score', 'linkedin_score', 'resume_score',
    ):
        op.drop_column('user_profiles', col)
