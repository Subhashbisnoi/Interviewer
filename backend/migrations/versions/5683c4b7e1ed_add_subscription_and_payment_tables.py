"""add_subscription_and_payment_tables

Revision ID: 5683c4b7e1ed
Revises: f3f23c01a7f9
Create Date: 2025-11-13 14:38:35.899043

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5683c4b7e1ed'
down_revision = 'f3f23c01a7f9'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add subscription fields to users table
    op.add_column('users', sa.Column('subscription_tier', sa.String(), nullable=True, server_default='free'))
    op.add_column('users', sa.Column('subscription_status', sa.String(), nullable=True, server_default='active'))
    op.add_column('users', sa.Column('subscription_expires_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('razorpay_customer_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('razorpay_subscription_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('interviews_this_month', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('users', sa.Column('last_interview_reset', sa.DateTime(), nullable=True))
    
    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('razorpay_order_id', sa.String(), nullable=False),
        sa.Column('razorpay_payment_id', sa.String(), nullable=True),
        sa.Column('razorpay_signature', sa.String(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(), nullable=True, server_default='INR'),
        sa.Column('status', sa.String(), nullable=True, server_default='created'),
        sa.Column('payment_method', sa.String(), nullable=True),
        sa.Column('plan_type', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_payments_razorpay_order_id'), 'payments', ['razorpay_order_id'], unique=True)
    op.create_index(op.f('ix_payments_razorpay_payment_id'), 'payments', ['razorpay_payment_id'], unique=True)


def downgrade() -> None:
    # Drop payments table
    op.drop_index(op.f('ix_payments_razorpay_payment_id'), table_name='payments')
    op.drop_index(op.f('ix_payments_razorpay_order_id'), table_name='payments')
    op.drop_table('payments')
    
    # Remove subscription fields from users table
    op.drop_column('users', 'last_interview_reset')
    op.drop_column('users', 'interviews_this_month')
    op.drop_column('users', 'razorpay_subscription_id')
    op.drop_column('users', 'razorpay_customer_id')
    op.drop_column('users', 'subscription_expires_at')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'subscription_tier')
