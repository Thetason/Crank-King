from typing import List, Optional, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.keyword import Keyword
from app.schemas.keyword import KeywordCreate, KeywordUpdate


def get(db: Session, keyword_id):
    return db.query(Keyword).filter(Keyword.id == keyword_id).first()


def get_by_query(
    db: Session,
    query: str,
    *,
    owner_id: Optional[Union[str, UUID]] = None,
    guest_session_id: Optional[Union[str, UUID]] = None,
) -> Optional[Keyword]:
    stmt = db.query(Keyword).filter(Keyword.query == query)
    if owner_id is not None:
        stmt = stmt.filter(Keyword.owner_id == owner_id)
    if guest_session_id is not None:
        stmt = stmt.filter(Keyword.guest_session_id == guest_session_id)
    return stmt.first()


def get_multi(
    db: Session,
    *,
    owner_id: Optional[Union[str, UUID]] = None,
    guest_session_id: Optional[Union[str, UUID]] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Keyword]:
    stmt = db.query(Keyword)
    if owner_id is not None:
        stmt = stmt.filter(Keyword.owner_id == owner_id)
    if guest_session_id is not None:
        stmt = stmt.filter(Keyword.guest_session_id == guest_session_id)
    return stmt.order_by(Keyword.created_at.desc()).offset(skip).limit(limit).all()


def create(
    db: Session,
    *,
    owner_id: Optional[Union[str, UUID]] = None,
    guest_session_id: Optional[Union[str, UUID]] = None,
    obj_in: KeywordCreate,
) -> Keyword:
    keyword = Keyword(
        owner_id=owner_id,
        guest_session_id=guest_session_id,
        query=obj_in.query,
        category=obj_in.category,
        target_names=obj_in.target_names,
        target_domains=obj_in.target_domains,
        status=obj_in.status,
        notes=obj_in.notes,
    )
    db.add(keyword)
    db.commit()
    db.refresh(keyword)
    return keyword


def update(db: Session, keyword: Keyword, obj_in: KeywordUpdate) -> Keyword:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(keyword, field, value)
    db.add(keyword)
    db.commit()
    db.refresh(keyword)
    return keyword


def remove(db: Session, keyword: Keyword) -> Keyword:
    db.delete(keyword)
    db.commit()
    return keyword


def count_for_guest(db: Session, guest_session_id: Union[str, UUID]) -> int:
    return db.query(Keyword).filter(Keyword.guest_session_id == guest_session_id).count()
