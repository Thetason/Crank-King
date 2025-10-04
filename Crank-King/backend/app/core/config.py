from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
from typing import List, Optional


class Settings(BaseSettings):
    project_name: str = "Crank King"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/crank_king"

    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60 * 12
    algorithm: str = "HS256"

    backend_cors_origins: List[AnyHttpUrl] | List[str] = []

    crawler_user_agent: str = "Mozilla/5.0 (compatible; CrankKingBot/1.0)"
    crawler_delay_seconds: float = 2.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @validator("backend_cors_origins", pre=True)
    def assemble_cors(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v


settings = Settings()
