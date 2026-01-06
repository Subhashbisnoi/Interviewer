"""add interview mode columns

Revision ID: a8b2c3d4e5f6
Revises: f3f23c01a7f9
Create Date: 2026-01-05 23:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a8b2c3d4e5f6'
down_revision = '5683c4b7e1ed'
branch_labels = None
depends_on = None


def upgrade():
    """Add interview mode and round tracking columns to interview_sessions."""
    # Add new columns for interview mode support
    op.add_column('interview_sessions', 
        sa.Column('interview_mode', sa.String(), nullable=True, server_default='short'))
    op.add_column('interview_sessions', 
        sa.Column('current_round', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('interview_sessions', 
        sa.Column('rounds_attempted', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('interview_sessions', 
        sa.Column('round_results', sa.JSON(), nullable=True))
    op.add_column('interview_sessions', 
        sa.Column('termination_reason', sa.String(), nullable=True))
    op.add_column('interview_sessions', 
        sa.Column('current_difficulty', sa.String(), nullable=True, server_default='medium'))


def downgrade():
    """Remove interview mode columns."""
    op.drop_column('interview_sessions', 'current_difficulty')
    op.drop_column('interview_sessions', 'termination_reason')
    op.drop_column('interview_sessions', 'round_results')
    op.drop_column('interview_sessions', 'rounds_attempted')
    op.drop_column('interview_sessions', 'current_round')
    op.drop_column('interview_sessions', 'interview_mode')
