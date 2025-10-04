from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.keyword import Keyword
from app.schemas.keyword import KeywordCreate, KeywordUpdate


def get(db: Session, keyword_id):
    return db.query(Keyword).filter(Keyword.id == keyword_id).first()


def get_by_query(db: Session, query: str) -> Optional[Keyword]:
    return db.query(Keyword).filter(Keyword.query == query).first()


def get_multi(db: Session, owner_id, skip: int = 0, limit: int = 100) -> List[Keyword]:
    return (
        db.query(Keyword)
        .filter(Keyword.owner_id == owner_id)
        .order_by(Keyword.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create(db: Session, owner_id, obj_in: KeywordCreate) -> Keyword:
    keyword = Keyword(
        owner_id=owner_id,
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
