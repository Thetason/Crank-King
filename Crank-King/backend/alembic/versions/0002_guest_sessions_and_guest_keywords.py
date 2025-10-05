"""support guest sessions and optional keyword ownership

Revision ID: 0002
Revises: 0001
Create Date: 2025-10-05
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "guest_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )

    op.add_column(
        "keywords",
        sa.Column("guest_session_id", postgresql.UUID(as_uuid=True), nullable=True),
    )

    op.alter_column("keywords", "owner_id", existing_type=postgresql.UUID(as_uuid=True), nullable=True)

    op.create_foreign_key(
        op.f("fk_keywords_guest_session_id_guest_sessions"),
        "keywords",
        "guest_sessions",
        ["guest_session_id"],
        ondelete="CASCADE",
    )

    op.drop_index("ix_keywords_query", table_name="keywords")
    op.create_index(op.f("ix_keywords_guest_session_id"), "keywords", ["guest_session_id"], unique=False)
    op.create_index(
        "uq_keywords_owner_query", "keywords", ["owner_id", "query"], unique=True, postgresql_where=sa.text("owner_id IS NOT NULL")
    )
    op.create_index(
        "uq_keywords_guest_query",
        "keywords",
        ["guest_session_id", "query"],
        unique=True,
        postgresql_where=sa.text("guest_session_id IS NOT NULL"),
    )

    op.create_check_constraint(
        "ck_keywords_owner_or_guest",
        "keywords",
        "(owner_id IS NOT NULL AND guest_session_id IS NULL) OR "
        "(owner_id IS NULL AND guest_session_id IS NOT NULL)",
    )


def downgrade() -> None:
    op.drop_constraint("ck_keywords_owner_or_guest", "keywords", type_="check")
    op.drop_index("uq_keywords_guest_query", table_name="keywords")
    op.drop_index("uq_keywords_owner_query", table_name="keywords")
    op.drop_index(op.f("ix_keywords_guest_session_id"), table_name="keywords")
    op.create_index("ix_keywords_query", "keywords", ["query"], unique=True)
    op.drop_constraint(op.f("fk_keywords_guest_session_id_guest_sessions"), "keywords", type_="foreignkey")
    op.alter_column("keywords", "owner_id", existing_type=postgresql.UUID(as_uuid=True), nullable=False)
    op.drop_column("keywords", "guest_session_id")
    op.drop_table("guest_sessions")
*** End Patch
