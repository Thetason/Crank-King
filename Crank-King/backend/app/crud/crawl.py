from datetime import datetime
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.models.crawl import CrawlRun, HttpCheck, SerpEntry


def create_run(db: Session, keyword_id: UUID) -> CrawlRun:
    run = CrawlRun(keyword_id=keyword_id)
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def mark_run_complete(db: Session, run: CrawlRun, flag: str, https_issues: dict | None = None) -> CrawlRun:
    run.status = "success"
    run.completed_at = datetime.utcnow()
    run.flag = flag
    run.https_issues = https_issues
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def mark_run_failed(db: Session, run: CrawlRun, message: str) -> CrawlRun:
    run.status = "failure"
    run.completed_at = datetime.utcnow()
    run.notes = message
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


def add_serp_entries(db: Session, run: CrawlRun, entries: List[SerpEntry]) -> None:
    if not entries:
        return
    db.bulk_save_objects(entries)
    db.commit()


def add_http_checks(db: Session, run: CrawlRun, checks: List[HttpCheck]) -> None:
    if not checks:
        return
    db.bulk_save_objects(checks)
    db.commit()


def get_recent_runs(db: Session, keyword_id: UUID, limit: int = 10) -> List[CrawlRun]:
    return (
        db.query(CrawlRun)
        .options(joinedload(CrawlRun.serp_entries), joinedload(CrawlRun.http_checks))
        .filter(CrawlRun.keyword_id == keyword_id)
        .order_by(CrawlRun.started_at.desc())
        .limit(limit)
        .all()
    )


def get_run(db: Session, run_id: UUID) -> CrawlRun | None:
    return (
        db.query(CrawlRun)
        .options(joinedload(CrawlRun.keyword), joinedload(CrawlRun.serp_entries), joinedload(CrawlRun.http_checks))
        .filter(CrawlRun.id == run_id)
        .first()
    )
