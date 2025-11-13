"""add_proctoring_data_to_interview_sessions

Revision ID: f3f23c01a7f9
Revises: 
Create Date: 2025-11-12 21:07:44.735346

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f3f23c01a7f9'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add proctoring_data column to interview_sessions table
    op.add_column('interview_sessions', sa.Column('proctoring_data', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove proctoring_data column from interview_sessions table
    op.drop_column('interview_sessions', 'proctoring_data')
