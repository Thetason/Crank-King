from fastapi import FastAPI

from .routers import keywords

app = FastAPI(title="Crank King API")

app.include_router(keywords.router, prefix="/keywords", tags=["keywords"])


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
