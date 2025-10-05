from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import crawl as crud_crawl
from app.crud import keyword as crud_keyword
from app.models.crawl import CrawlRun
from app.models.keyword import Keyword
from app.schemas.keyword import KeywordCreate, KeywordDetail, KeywordSummary, KeywordUpdate

router = APIRouter()


@router.get("", response_model=List[KeywordSummary])
def list_keywords(
    *,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = Query(default=100, le=200),
) -> List[KeywordSummary]:
    keywords = crud_keyword.get_multi(db, owner_id=current_user.id, skip=skip, limit=limit)
    summaries: List[KeywordSummary] = []
    for item in keywords:
        latest_run = (
            db.query(CrawlRun)
            .filter(CrawlRun.keyword_id == item.id, CrawlRun.status == "success")
            .order_by(CrawlRun.started_at.desc())
            .first()
        )
        summaries.append(
            KeywordSummary(
                **KeywordSummary.model_validate(item).model_dump(),
                latest_flag=latest_run.flag if latest_run else None,
                latest_run_at=latest_run.completed_at if latest_run else None,
            )
        )
    return summaries


@router.post("", response_model=KeywordSummary, status_code=201)
def create_keyword(
    *, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user), payload: KeywordCreate
) -> KeywordSummary:
    existing = crud_keyword.get_by_query(db, payload.query, owner_id=current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Keyword already exists")
    keyword = crud_keyword.create(db, owner_id=current_user.id, obj_in=payload)
    return KeywordSummary(**KeywordSummary.model_validate(keyword).model_dump())


def _get_owned_keyword(db: Session, keyword_id: UUID, user_id: UUID) -> Keyword:
    keyword = crud_keyword.get(db, keyword_id)
    if not keyword or keyword.owner_id != user_id:
        raise HTTPException(status_code=404, detail="Keyword not found")
    return keyword


@router.get("/{keyword_id}", response_model=KeywordDetail)
def retrieve_keyword(
    keyword_id: UUID, *, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)
) -> KeywordDetail:
    keyword = _get_owned_keyword(db, keyword_id, current_user.id)
    runs = crud_crawl.get_recent_runs(db, keyword_id=keyword.id, limit=10)
    return KeywordDetail(
        **KeywordDetail.model_validate(keyword).model_dump(),
        recent_runs=runs,
    )


@router.put("/{keyword_id}", response_model=KeywordSummary)
def update_keyword(
    keyword_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
    payload: KeywordUpdate,
) -> KeywordSummary:
    keyword = _get_owned_keyword(db, keyword_id, current_user.id)
    keyword = crud_keyword.update(db, keyword=keyword, obj_in=payload)
    latest_run = (
        db.query(CrawlRun)
        .filter(CrawlRun.keyword_id == keyword.id, CrawlRun.status == "success")
        .order_by(CrawlRun.started_at.desc())
        .first()
    )
    return KeywordSummary(
        **KeywordSummary.model_validate(keyword).model_dump(),
        latest_flag=latest_run.flag if latest_run else None,
        latest_run_at=latest_run.completed_at if latest_run else None,
    )


@router.delete("/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_keyword(
    keyword_id: UUID, *, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)
) -> None:
    keyword = _get_owned_keyword(db, keyword_id, current_user.id)
    crud_keyword.remove(db, keyword)
