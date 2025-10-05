from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api import deps
from app.crud import guest_session as crud_guest_session
from app.crud import keyword as crud_keyword, crawl as crud_crawl
from app.schemas.guest import GuestSessionOut
from app.schemas.keyword import KeywordCreate, KeywordDetail, KeywordSummary
from app.services.crawler import execute_crawl

router = APIRouter()

HEADER_KEY = "X-Guest-Id"
MAX_GUEST_KEYWORDS = 10


def _require_guest_session(db: Session, guest_id: str):
    if not guest_id:
        raise HTTPException(status_code=400, detail="Missing guest session header")
    session = crud_guest_session.get(db, guest_id)
    if not session:
        raise HTTPException(status_code=404, detail="Guest session not found")
    return session


def _build_summary(db: Session, keyword) -> KeywordSummary:
    runs = crud_crawl.get_recent_runs(db, keyword_id=keyword.id, limit=1)
    latest_run = runs[0] if runs else None
    return KeywordSummary(
        **KeywordSummary.model_validate(keyword).model_dump(),
        latest_flag=latest_run.flag if latest_run else None,
        latest_run_at=latest_run.completed_at if latest_run else None,
    )


@router.post("/session", response_model=GuestSessionOut)
def create_guest_session(
    response: Response,
    *,
    db: Session = Depends(deps.get_db),
    guest_id: str | None = Header(default=None, alias=HEADER_KEY),
) -> GuestSessionOut:
    if guest_id:
        session = crud_guest_session.get(db, guest_id)
        if session:
            response.headers[HEADER_KEY] = str(session.id)
            return session
    session = crud_guest_session.create(db)
    response.headers[HEADER_KEY] = str(session.id)
    return session


@router.get("/keywords", response_model=List[KeywordSummary])
def list_guest_keywords(
    *, db: Session = Depends(deps.get_db), guest_id: str | None = Header(default=None, alias=HEADER_KEY)
) -> List[KeywordSummary]:
    session = _require_guest_session(db, guest_id)
    keywords = crud_keyword.get_multi(db, guest_session_id=session.id)
    return [_build_summary(db, keyword) for keyword in keywords]


@router.post("/keywords", response_model=KeywordSummary, status_code=status.HTTP_201_CREATED)
def create_guest_keyword(
    *,
    db: Session = Depends(deps.get_db),
    payload: KeywordCreate,
    guest_id: str | None = Header(default=None, alias=HEADER_KEY),
) -> KeywordSummary:
    session = _require_guest_session(db, guest_id)

    current_count = crud_keyword.count_for_guest(db, session.id)
    if current_count >= MAX_GUEST_KEYWORDS:
        raise HTTPException(status_code=403, detail="Guest keyword limit reached")

    existing = crud_keyword.get_by_query(db, payload.query, guest_session_id=session.id)
    if existing:
        raise HTTPException(status_code=400, detail="Keyword already exists")

    keyword = crud_keyword.create(db, guest_session_id=session.id, obj_in=payload)
    return _build_summary(db, keyword)


@router.get("/keywords/{keyword_id}", response_model=KeywordDetail)
def get_guest_keyword(
    keyword_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    guest_id: str | None = Header(default=None, alias=HEADER_KEY),
) -> KeywordDetail:
    session = _require_guest_session(db, guest_id)
    keyword = crud_keyword.get(db, keyword_id)
    if not keyword or str(keyword.guest_session_id) != str(session.id):
        raise HTTPException(status_code=404, detail="Keyword not found")
    runs = crud_crawl.get_recent_runs(db, keyword_id=keyword.id, limit=10)
    return KeywordDetail(
        **KeywordDetail.model_validate(keyword).model_dump(),
        recent_runs=runs,
    )


@router.delete("/keywords/{keyword_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guest_keyword(
    keyword_id: UUID,
    *, db: Session = Depends(deps.get_db), guest_id: str | None = Header(default=None, alias=HEADER_KEY)
) -> None:
    session = _require_guest_session(db, guest_id)
    keyword = crud_keyword.get(db, keyword_id)
    if not keyword or str(keyword.guest_session_id) != str(session.id):
        raise HTTPException(status_code=404, detail="Keyword not found")
    crud_keyword.remove(db, keyword)


@router.post("/keywords/{keyword_id}/crawl", response_model=KeywordDetail, status_code=status.HTTP_202_ACCEPTED)
async def crawl_guest_keyword(
    keyword_id: UUID,
    *,
    db: Session = Depends(deps.get_db),
    guest_id: str | None = Header(default=None, alias=HEADER_KEY),
) -> KeywordDetail:
    session = _require_guest_session(db, guest_id)
    keyword = crud_keyword.get(db, keyword_id)
    if not keyword or str(keyword.guest_session_id) != str(session.id):
        raise HTTPException(status_code=404, detail="Keyword not found")
    run = await execute_crawl(db, keyword)
    return KeywordDetail(
        **KeywordDetail.model_validate(keyword).model_dump(),
        recent_runs=crud_crawl.get_recent_runs(db, keyword_id=keyword.id, limit=10),
    )
