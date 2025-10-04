from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings
from app.db.base_class import Base
from app.db.session import engine
from app import models  # noqa: F401
from app.services.scheduler import start_scheduler, stop_scheduler


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


app = FastAPI(title=settings.project_name)

if settings.backend_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.backend_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    start_scheduler()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.on_event("shutdown")
def on_shutdown() -> None:
    stop_scheduler()
