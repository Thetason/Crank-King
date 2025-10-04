import asyncio
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.keyword import Keyword
from app.services.crawler import execute_crawl

scheduler: Optional[AsyncIOScheduler] = None


async def crawl_all_active_keywords() -> None:
    db = SessionLocal()
    try:
        keywords = db.query(Keyword).filter(Keyword.status == "active").all()
        for keyword in keywords:
            await execute_crawl(db, keyword)
            await asyncio.sleep(settings.crawler_delay_seconds)
    finally:
        db.close()


def start_scheduler() -> None:
    global scheduler
    if scheduler and scheduler.running:
        return
    scheduler = AsyncIOScheduler()
    scheduler.add_job(crawl_all_active_keywords, "cron", hour=3, minute=0)
    scheduler.start()


def stop_scheduler() -> None:
    if scheduler and scheduler.running:
        scheduler.shutdown()
