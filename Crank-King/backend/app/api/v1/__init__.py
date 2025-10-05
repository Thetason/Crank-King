from fastapi import APIRouter

from . import auth, keywords, crawls, guest

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(keywords.router, prefix="/keywords", tags=["keywords"])
api_router.include_router(crawls.router, tags=["crawls"])
api_router.include_router(guest.router, prefix="/guest", tags=["guest"])
