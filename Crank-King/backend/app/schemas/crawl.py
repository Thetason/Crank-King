from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, HttpUrl


class SerpEntry(BaseModel):
    id: UUID
    rank: int
    page: int
    title: str
    display_url: str
    landing_url: HttpUrl | str
    is_match: bool
    match_reason: Optional[str]

    class Config:
        from_attributes = True


class HttpCheck(BaseModel):
    id: UUID
    url: str
    protocol: str
    status_code: Optional[int]
    ssl_valid: Optional[bool]
    ssl_error: Optional[str]
    checked_at: datetime

    class Config:
        from_attributes = True


class CrawlRun(BaseModel):
    id: UUID
    keyword_id: UUID
    started_at: datetime
    completed_at: Optional[datetime]
    status: str
    flag: Optional[str]
    notes: Optional[str]
    https_issues: Optional[dict]
    serp_entries: List[SerpEntry] = []
    http_checks: List[HttpCheck] = []

    class Config:
        from_attributes = True
