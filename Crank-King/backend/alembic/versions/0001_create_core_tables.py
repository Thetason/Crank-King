"""create core tables

Revision ID: 0001
Revises: 
Create Date: 2025-10-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.sql.expression.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "keywords",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("query", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("target_names", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("target_domains", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_keywords_query", "keywords", ["query"], unique=True)

    op.create_table(
        "crawl_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("keyword_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("keywords.id", ondelete="CASCADE"), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("flag", sa.String(), nullable=True),
        sa.Column("https_issues", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_crawl_runs_keyword_id", "crawl_runs", ["keyword_id"])

    op.create_table(
        "serp_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("crawl_run_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("page", sa.Integer(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("display_url", sa.String(), nullable=False),
        sa.Column("landing_url", sa.String(), nullable=False),
        sa.Column("is_match", sa.Boolean(), nullable=False, server_default=sa.sql.expression.false()),
        sa.Column("match_reason", sa.Text(), nullable=True),
    )
    op.create_index("ix_serp_entries_crawl_run_id", "serp_entries", ["crawl_run_id"])

    op.create_table(
        "http_checks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("crawl_run_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("protocol", sa.String(), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("ssl_valid", sa.Boolean(), nullable=True),
        sa.Column("ssl_error", sa.Text(), nullable=True),
        sa.Column("checked_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_http_checks_crawl_run_id", "http_checks", ["crawl_run_id"])


def downgrade() -> None:
    op.drop_index("ix_http_checks_crawl_run_id", table_name="http_checks")
    op.drop_table("http_checks")
    op.drop_index("ix_serp_entries_crawl_run_id", table_name="serp_entries")
    op.drop_table("serp_entries")
    op.drop_index("ix_crawl_runs_keyword_id", table_name="crawl_runs")
    op.drop_table("crawl_runs")
    op.drop_index("ix_keywords_query", table_name="keywords")
    op.drop_table("keywords")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
