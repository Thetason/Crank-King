import asyncio
from typing import Iterable, List, Tuple
from urllib.parse import urlparse

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.crawlers.naver import SerpEntryData, crawl_keyword
from app.crud import crawl as crud_crawl
from app.models.crawl import CrawlRun, HttpCheck, SerpEntry
from app.models.keyword import Keyword


def normalize_text(value: str) -> str:
    return "".join(value.lower().split())


def entry_matches(entry: SerpEntryData, keyword: Keyword) -> Tuple[bool, str | None]:
    target_names = keyword.target_names or []
    target_domains = keyword.target_domains or []

    normalized_title = normalize_text(entry.title)

    name_candidates = [keyword.query, *target_names]
    for candidate in name_candidates:
        cand = normalize_text(candidate)
        if cand and cand in normalized_title:
            return True, f"matched name '{candidate}'"

    domain_candidates = [*target_domains]
    parsed_display = urlparse(entry.display_url if "://" in entry.display_url else f"http://{entry.display_url}")
    display_host = parsed_display.netloc.lower()
    landing_host = urlparse(entry.landing_url).netloc.lower()
    for candidate in domain_candidates:
        if not candidate:
            continue
        needle = candidate.lower()
        if needle in display_host or needle in landing_host:
            return True, f"matched domain '{candidate}'"

    return False, None


async def check_https(client: httpx.AsyncClient, url: str) -> HttpCheck:
    parsed = urlparse(url)
    protocol = parsed.scheme or "http"
    if protocol != "https":
        return HttpCheck(url=url, protocol=protocol or "http", ssl_valid=False, ssl_error="Non-HTTPS URL")

    try:
        response = await client.get(url, timeout=15.0, follow_redirects=True)
        response.raise_for_status()
    except httpx.HTTPError as exc:
        return HttpCheck(url=url, protocol=protocol, ssl_valid=False, ssl_error=str(exc))
    return HttpCheck(url=url, protocol=protocol, ssl_valid=True, status_code=response.status_code)


async def execute_crawl(db: Session, keyword: Keyword) -> CrawlRun:
    run = crud_crawl.create_run(db, keyword_id=keyword.id)
    try:
        pages = await crawl_keyword(keyword.query)
        serp_objects: List[SerpEntry] = []
        matched_urls: List[str] = []

        for page in pages:
            for entry in page.entries:
                is_match, reason = entry_matches(entry, keyword)
                serp_objects.append(
                    SerpEntry(
                        crawl_run_id=run.id,
                        page=entry.page,
                        rank=entry.rank,
                        title=entry.title,
                        display_url=entry.display_url,
                        landing_url=entry.landing_url,
                        is_match=is_match,
                        match_reason=reason,
                    )
                )
                if is_match and entry.landing_url not in matched_urls:
                    matched_urls.append(entry.landing_url)

        crud_crawl.add_serp_entries(db, run, serp_objects)

        checks: List[HttpCheck] = []
        if matched_urls:
            headers = {"User-Agent": settings.crawler_user_agent}
            async with httpx.AsyncClient(headers=headers) as client:
                for url in matched_urls:
                    await asyncio.sleep(settings.crawler_delay_seconds)
                    checks.append(await check_https(client, url))
            crud_crawl.add_http_checks(db, run, checks)

        flag = determine_flag(matched_urls, checks)
        https_issues = {
            check.url: check.ssl_error for check in checks if check.ssl_valid is False and check.ssl_error
        }
        crud_crawl.mark_run_complete(db, run, flag=flag, https_issues=https_issues or None)
        return crud_crawl.get_run(db, run.id)
    except Exception as exc:  # pragma: no cover - guard rail
        crud_crawl.mark_run_failed(db, run, message=str(exc))
        raise


def determine_flag(matched_urls: Iterable[str], checks: List[HttpCheck]) -> str:
    matched_list = list(matched_urls)
    if not matched_list:
        return "green"
    if any(check.ssl_valid is False for check in checks):
        return "purple"
    return "yellow"
