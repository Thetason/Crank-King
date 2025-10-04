from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.crawl import CrawlRun


class KeywordBase(BaseModel):
    query: str = Field(..., min_length=1)
    category: Optional[str] = None
    target_names: List[str] = []
    target_domains: List[str] = []
    status: Optional[str] = "active"
    notes: Optional[str] = None


class KeywordCreate(KeywordBase):
    pass


class KeywordUpdate(BaseModel):
    category: Optional[str] = None
    target_names: Optional[List[str]] = None
    target_domains: Optional[List[str]] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class KeywordRead(KeywordBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KeywordSummary(KeywordRead):
    latest_flag: Optional[str] = None
    latest_run_at: Optional[datetime] = None


class KeywordDetail(KeywordRead):
    recent_runs: List[CrawlRun] = []
