from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crawl as crud_crawl
from app.crud import keyword as crud_keyword
from app.schemas.crawl import CrawlRun
from app.services.crawler import execute_crawl

router = APIRouter()


def _get_owned_keyword(db: Session, keyword_id: UUID, user_id: UUID):
    keyword = crud_keyword.get(db, keyword_id)
    if not keyword or keyword.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Keyword not found")
    return keyword


@router.post("/keywords/{keyword_id}/crawl", response_model=CrawlRun, status_code=202)
async def trigger_crawl(keyword_id: UUID, *, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    keyword = _get_owned_keyword(db, keyword_id, current_user.id)
    run = await execute_crawl(db, keyword)
    return run


@router.get("/crawl-runs/{run_id}", response_model=CrawlRun)
def get_crawl_run(run_id: UUID, *, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    run = crud_crawl.get_run(db, run_id)
    if not run or run.keyword.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
