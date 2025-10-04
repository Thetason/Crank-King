from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from uuid import UUID, uuid4


class KeywordCreate(BaseModel):
    query: str = Field(..., min_length=1)
    category: Optional[str] = Field(default=None, regex=r"^(brand|region_business|region_store)?$")
    target_names: List[str] = Field(default_factory=list)
    target_domains: List[str] = Field(default_factory=list)
    notes: Optional[str] = None


class KeywordRead(KeywordCreate):
    id: UUID


router = APIRouter()

# Temporary in-memory storage until DB wiring is ready.
_FAKE_DB: dict[UUID, KeywordRead] = {}


@router.get("", response_model=List[KeywordRead])
def list_keywords() -> List[KeywordRead]:
    return list(_FAKE_DB.values())


@router.post("", response_model=KeywordRead, status_code=201)
def create_keyword(payload: KeywordCreate) -> KeywordRead:
    new_keyword = KeywordRead(id=uuid4(), **payload.dict())
    _FAKE_DB[new_keyword.id] = new_keyword
    return new_keyword


@router.get("/{keyword_id}", response_model=KeywordRead)
def get_keyword(keyword_id: UUID) -> KeywordRead:
    keyword = _FAKE_DB.get(keyword_id)
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    return keyword


@router.delete("/{keyword_id}", status_code=204)
def delete_keyword(keyword_id: UUID) -> None:
    if keyword_id not in _FAKE_DB:
        raise HTTPException(status_code=404, detail="Keyword not found")
    del _FAKE_DB[keyword_id]
