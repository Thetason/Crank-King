from uuid import UUID

from pydantic import BaseModel


class GuestSessionOut(BaseModel):
    id: UUID

    class Config:
        from_attributes = True
