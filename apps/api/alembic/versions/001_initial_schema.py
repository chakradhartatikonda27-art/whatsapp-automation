"""Initial schema creation with PostgreSQL RLS policies and indexes

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Organizations
    op.create_table(
        'organizations',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False, unique=True),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # 2. Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), server_default='operator'),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_index('idx_users_org', 'users', ['organization_id'])

    # 3. Contacts
    op.create_table(
        'contacts',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('metadata_json', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('status', sa.String(), server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_unique_constraint('uq_org_contact_phone', 'contacts', ['organization_id', 'phone_number'])
    op.create_index('idx_contacts_org_phone', 'contacts', ['organization_id', 'phone_number'])

    # 4. Campaigns
    op.create_table(
        'campaigns',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('message_type', sa.String(), server_default='template'),
        sa.Column('template_id', sa.String(), nullable=True),
        sa.Column('message_body', sa.Text(), nullable=True),
        sa.Column('media_url', sa.String(), nullable=True),
        sa.Column('status', sa.String(), server_default='DRAFT'),
        sa.Column('total_contacts', sa.Integer(), server_default='0'),
        sa.Column('queued_count', sa.Integer(), server_default='0'),
        sa.Column('sent_count', sa.Integer(), server_default='0'),
        sa.Column('delivered_count', sa.Integer(), server_default='0'),
        sa.Column('read_count', sa.Integer(), server_default='0'),
        sa.Column('failed_count', sa.Integer(), server_default='0'),
        sa.Column('skipped_count', sa.Integer(), server_default='0'),
        sa.Column('created_by', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('idx_campaigns_org_status', 'campaigns', ['organization_id', 'status'])

    # 5. Campaign Contacts (Idempotency Keyed)
    op.create_table(
        'campaign_contacts',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('campaign_id', sa.String(), sa.ForeignKey('campaigns.id', ondelete='CASCADE'), nullable=False),
        sa.Column('contact_id', sa.String(), sa.ForeignKey('contacts.id', ondelete='SET NULL'), nullable=True),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('message_hash', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(), server_default='QUEUED'),
        sa.Column('skip_reason', sa.String(), nullable=True),
        sa.Column('job_id', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    op.create_unique_constraint('uq_org_phone_message_hash', 'campaign_contacts', ['organization_id', 'phone_number', 'message_hash'])
    op.create_index('idx_campaign_contacts_org_status', 'campaign_contacts', ['organization_id', 'campaign_id', 'status'])

    # 6. Message Attempts
    op.create_table(
        'message_attempts',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('campaign_id', sa.String(), sa.ForeignKey('campaigns.id', ondelete='CASCADE'), nullable=False),
        sa.Column('contact_id', sa.String(), nullable=True),
        sa.Column('phone_number', sa.String(), nullable=False),
        sa.Column('message_hash', sa.String(length=64), nullable=False),
        sa.Column('status', sa.String(), server_default='QUEUED'),
        sa.Column('whatsapp_message_id', sa.String(), nullable=True),
        sa.Column('attempt_count', sa.Integer(), server_default='0'),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('queued_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_at', sa.DateTime(timezone=True), nullable=True)
    )
    op.create_index('idx_msg_attempts_wa_id', 'message_attempts', ['whatsapp_message_id'])

    # 7. WhatsApp Accounts
    op.create_table(
        'whatsapp_accounts',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('business_account_id', sa.String(), nullable=False),
        sa.Column('phone_number_id', sa.String(), nullable=False),
        sa.Column('display_phone_number', sa.String(), nullable=False),
        sa.Column('encrypted_access_token', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), server_default='connected'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # 8. Message Templates
    op.create_table(
        'message_templates',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('template_name', sa.String(), nullable=False),
        sa.Column('language', sa.String(), server_default='en_US'),
        sa.Column('category', sa.String(), server_default='MARKETING'),
        sa.Column('status', sa.String(), server_default='APPROVED'),
        sa.Column('components', postgresql.JSON(astext_type=sa.Text()), server_default='[]'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # 9. Webhook Events
    op.create_table(
        'webhook_events',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), nullable=True),
        sa.Column('provider', sa.String(), server_default='meta_whatsapp'),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('external_event_id', sa.String(), nullable=False, unique=True),
        sa.Column('payload', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('processed', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # 10. Audit Logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), nullable=False, primary_key=True),
        sa.Column('organization_id', sa.String(), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('metadata_json', postgresql.JSON(astext_type=sa.Text()), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )

    # Enable RLS policies on multi-tenant tables
    rls_tables = [
        'users', 'contacts', 'campaigns', 'campaign_contacts',
        'message_attempts', 'whatsapp_accounts', 'message_templates', 'audit_logs'
    ]
    for table in rls_tables:
        op.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")
        op.execute(
            f"CREATE POLICY {table}_tenant_isolation ON {table} "
            f"FOR ALL USING (organization_id = NULLIF(current_setting('app.current_org_id', true), ''));"
        )

def downgrade() -> None:
    rls_tables = [
        'audit_logs', 'message_templates', 'whatsapp_accounts', 'message_attempts',
        'campaign_contacts', 'campaigns', 'contacts', 'users'
    ]
    for table in rls_tables:
        op.execute(f"DROP POLICY IF EXISTS {table}_tenant_isolation ON {table};")
        op.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")

    op.drop_table('audit_logs')
    op.drop_table('webhook_events')
    op.drop_table('message_templates')
    op.drop_table('whatsapp_accounts')
    op.drop_table('message_attempts')
    op.drop_table('campaign_contacts')
    op.drop_table('campaigns')
    op.drop_table('contacts')
    op.drop_table('users')
    op.drop_table('organizations')
