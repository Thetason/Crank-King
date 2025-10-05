from datetime import datetime
from uuid import uuid4

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, String, Text
try:
    from sqlalchemy.dialects.postgresql import JSONB
except ImportError:  # pragma: no cover
    from sqlalchemy import JSON as JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import BaseModel


class Keyword(BaseModel):
    __tablename__ = "keywords"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    guest_session_id = Column(
        UUID(as_uuid=True), ForeignKey("guest_sessions.id", ondelete="CASCADE"), nullable=True, index=True
    )
    query = Column(String, nullable=False, index=True)
    category = Column(String, nullable=True)
    target_names = Column(JSONB, nullable=True)
    target_domains = Column(JSONB, nullable=True)
    status = Column(String, nullable=False, default="active")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", backref="keywords")
    guest_session = relationship("GuestSession", back_populates="keywords")
    crawl_runs = relationship("CrawlRun", cascade="all, delete-orphan", back_populates="keyword")

    __table_args__ = (
        CheckConstraint(
            "(owner_id IS NOT NULL AND guest_session_id IS NULL) OR "
            "(owner_id IS NULL AND guest_session_id IS NOT NULL)",
            name="ck_keywords_owner_or_guest",
        ),
    )
