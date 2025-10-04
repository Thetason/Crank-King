from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
try:
    from sqlalchemy.dialects.postgresql import JSONB
except ImportError:  # pragma: no cover
    from sqlalchemy import JSON as JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import BaseModel


class CrawlRun(BaseModel):
    __tablename__ = "crawl_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    keyword_id = Column(UUID(as_uuid=True), ForeignKey("keywords.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="pending")
    flag = Column(String, nullable=True)
    https_issues = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)

    keyword = relationship("Keyword", back_populates="crawl_runs")
    serp_entries = relationship("SerpEntry", cascade="all, delete-orphan", back_populates="crawl_run")
    http_checks = relationship("HttpCheck", cascade="all, delete-orphan", back_populates="crawl_run")


class SerpEntry(BaseModel):
    __tablename__ = "serp_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    crawl_run_id = Column(UUID(as_uuid=True), ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    rank = Column(Integer, nullable=False)
    page = Column(Integer, nullable=False)
    title = Column(Text, nullable=False)
    display_url = Column(String, nullable=False)
    landing_url = Column(String, nullable=False)
    is_match = Column(Boolean, nullable=False, default=False)
    match_reason = Column(Text, nullable=True)

    crawl_run = relationship("CrawlRun", back_populates="serp_entries")


class HttpCheck(BaseModel):
    __tablename__ = "http_checks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    crawl_run_id = Column(UUID(as_uuid=True), ForeignKey("crawl_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    protocol = Column(String, nullable=False)
    status_code = Column(Integer, nullable=True)
    ssl_valid = Column(Boolean, nullable=True)
    ssl_error = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    crawl_run = relationship("CrawlRun", back_populates="http_checks")
