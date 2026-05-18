"""Credit system, user profiles, companies, job postings

Revision ID: g1h2i3j4k5l6
Revises: 7b98a5b1950d
Create Date: 2026-04-28
"""
from alembic import op
import sqlalchemy as sa

revision = 'g1h2i3j4k5l6'
down_revision = '7b98a5b1950d'
branch_labels = None
depends_on = None


def upgrade():
    # Add credits to users
    op.add_column('users', sa.Column('credits', sa.Integer(), nullable=True, server_default='20'))

    # user_profiles
    op.create_table(
        'user_profiles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), unique=True, index=True),
        sa.Column('headline', sa.String(), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('target_roles', sa.JSON(), nullable=True),
        sa.Column('experience_years', sa.Float(), server_default='0'),
        sa.Column('skills', sa.JSON(), nullable=True),
        sa.Column('work_experience', sa.JSON(), nullable=True),
        sa.Column('education', sa.JSON(), nullable=True),
        sa.Column('projects', sa.JSON(), nullable=True),
        sa.Column('linkedin_url', sa.String(), nullable=True),
        sa.Column('github_url', sa.String(), nullable=True),
        sa.Column('portfolio_url', sa.String(), nullable=True),
        sa.Column('resume_text', sa.Text(), nullable=True),
        sa.Column('is_visible_to_recruiters', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # companies
    op.create_table(
        'companies',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('industry', sa.String(), nullable=True),
        sa.Column('website', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('contact_name', sa.String(), nullable=False),
        sa.Column('contact_email', sa.String(), unique=True, index=True, nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_approved', sa.Boolean(), server_default='false'),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # job_postings
    op.create_table(
        'job_postings',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('company_id', sa.Integer(), sa.ForeignKey('companies.id'), index=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('required_skills', sa.JSON(), nullable=True),
        sa.Column('experience_min', sa.Float(), server_default='0'),
        sa.Column('experience_max', sa.Float(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('is_remote', sa.Boolean(), server_default='false'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # credit_transactions
    op.create_table(
        'credit_transactions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), index=True),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('balance_after', sa.Integer(), nullable=False),
        sa.Column('transaction_type', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('payment_id', sa.Integer(), sa.ForeignKey('payments.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # New columns on interview_sessions
    op.add_column('interview_sessions', sa.Column('plan_type', sa.String(), server_default='normal'))
    op.add_column('interview_sessions', sa.Column('credits_used', sa.Integer(), server_default='0'))
    op.add_column('interview_sessions', sa.Column('score_technical', sa.Float(), nullable=True))
    op.add_column('interview_sessions', sa.Column('score_communication', sa.Float(), nullable=True))
    op.add_column('interview_sessions', sa.Column('score_leadership', sa.Float(), nullable=True))
    op.add_column('interview_sessions', sa.Column('score_critical_thinking', sa.Float(), nullable=True))
    op.add_column('interview_sessions', sa.Column('score_decision_making', sa.Float(), nullable=True))
    op.add_column('interview_sessions', sa.Column('score_project_knowledge', sa.Float(), nullable=True))

    # New columns on payments
    op.add_column('payments', sa.Column('package_type', sa.String(), nullable=True))
    op.add_column('payments', sa.Column('credits_granted', sa.Integer(), server_default='0'))


def downgrade():
    op.drop_column('payments', 'credits_granted')
    op.drop_column('payments', 'package_type')
    op.drop_column('interview_sessions', 'score_project_knowledge')
    op.drop_column('interview_sessions', 'score_decision_making')
    op.drop_column('interview_sessions', 'score_critical_thinking')
    op.drop_column('interview_sessions', 'score_leadership')
    op.drop_column('interview_sessions', 'score_communication')
    op.drop_column('interview_sessions', 'score_technical')
    op.drop_column('interview_sessions', 'credits_used')
    op.drop_column('interview_sessions', 'plan_type')
    op.drop_table('credit_transactions')
    op.drop_table('job_postings')
    op.drop_table('companies')
    op.drop_table('user_profiles')
    op.drop_column('users', 'credits')
