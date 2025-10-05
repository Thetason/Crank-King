from typing import Optional

from sqlalchemy.orm import Session

from app.models.guest_session import GuestSession


def get(db: Session, session_id: str) -> Optional[GuestSession]:
    return db.query(GuestSession).filter(GuestSession.id == session_id).first()


def create(db: Session) -> GuestSession:
    session = GuestSession()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
