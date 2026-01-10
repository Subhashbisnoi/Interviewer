"""add_indexes_for_performance

Revision ID: 7b98a5b1950d
Revises: a8b2c3d4e5f6
Create Date: 2026-01-10 00:17:23.195268

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '7b98a5b1950d'
down_revision = 'a8b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add index on user_id for faster user session lookups
    op.create_index(
        'ix_interview_sessions_user_id', 
        'interview_sessions', 
        ['user_id'], 
        unique=False,
        if_not_exists=True
    )
    
    # Add index on session_id for faster message lookups
    op.create_index(
        'ix_chat_messages_session_id', 
        'chat_messages', 
        ['session_id'], 
        unique=False,
        if_not_exists=True
    )
    
    # Add compound index for message_type lookups
    op.create_index(
        'ix_chat_messages_session_id_message_type',
        'chat_messages',
        ['session_id', 'message_type'],
        unique=False,
        if_not_exists=True
    )


def downgrade() -> None:
    op.drop_index('ix_chat_messages_session_id_message_type', table_name='chat_messages')
    op.drop_index('ix_chat_messages_session_id', table_name='chat_messages')
    op.drop_index('ix_interview_sessions_user_id', table_name='interview_sessions')
