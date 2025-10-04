from __future__ import annotations

import json
from dataclasses import dataclass
from html import unescape
from typing import Iterable, Iterator, List, Optional
from urllib.parse import urlencode

import httpx
from bs4 import BeautifulSoup

BASE_SEARCH_URL = "https://search.naver.com/search.naver"
WEB_SERP_ANCHOR = '"data-slog-container":"web_lis"'


@dataclass
class SerpEntry:
    page: int
    rank: int
    title: str
    display_url: str
    landing_url: str


@dataclass
class SerpPage:
    keyword: str
    page_number: int
    entries: List[SerpEntry]


async def build_search_urls(query: str, pages: Iterable[int] = (1, 2)) -> List[str]:
    urls: List[str] = []
    for page in pages:
        start = 1 if page == 1 else (page - 1) * 10 + 1
        params = {
            "where": "web",
            "sm": "tab_pge",
            "query": query,
            "start": start,
            "page": page,
        }
        urls.append(f"{BASE_SEARCH_URL}?{urlencode(params)}")
    return urls


async def fetch_serp(client: httpx.AsyncClient, url: str) -> str:
    response = await client.get(url, timeout=10.0)
    response.raise_for_status()
    return response.text


def parse_serp(html: str, query: str, page_number: int) -> SerpPage:
    payload = _extract_web_payload(html)
    if payload is None:
        soup = BeautifulSoup(html, "html.parser")
        entries = list(_extract_entries_from_dom(soup, page_number))
    else:
        entries = list(_extract_entries_from_payload(payload, page_number))
    return SerpPage(keyword=query, page_number=page_number, entries=entries)


def _extract_entries_from_payload(payload: dict, page_number: int) -> Iterator[SerpEntry]:
    rank = 1
    body = payload.get("body", {})
    props = body.get("props", {})
    sections = props.get("children", [])
    for section in sections:
        section_props = section.get("props", {})
        for child in section_props.get("children", []):
            item = child.get("props", {})
            href = item.get("href")
            if not href or not href.startswith(("http://", "https://")):
                continue

            title_html = item.get("title", "")
            title_text = _strip_html(title_html)

            display_url = _derive_display_url(item)

            yield SerpEntry(
                page=page_number,
                rank=rank,
                title=title_text,
                display_url=display_url,
                landing_url=href,
            )
            rank += 1


def _derive_display_url(item: dict) -> str:
    profile = item.get("profile")
    if isinstance(profile, dict):
        subtexts = profile.get("subTexts") or []
        for sub in subtexts:
            text = sub.get("text")
            if text:
                return text
        href = profile.get("href")
        if isinstance(href, str) and href:
            return href
    return item.get("href", "")


def _strip_html(raw: str | dict | None) -> str:
    text = ""
    if isinstance(raw, dict):
        text = raw.get("text", "")
    elif isinstance(raw, str):
        text = raw
    soup = BeautifulSoup(unescape(text), "html.parser")
    return soup.get_text(separator=" ", strip=True)


def _extract_web_payload(html: str) -> Optional[dict]:
    anchor_idx = html.find(WEB_SERP_ANCHOR)
    if anchor_idx == -1:
        return None
    bootstrap_idx = html.rfind("entry.bootstrap", 0, anchor_idx)
    if bootstrap_idx == -1:
        return None

    start = html.find("{", bootstrap_idx)
    if start == -1:
        return None

    json_str = _consume_balanced_json(html, start)
    if not json_str:
        return None
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


def _consume_balanced_json(text: str, start: int) -> Optional[str]:
    stack = 0
    end = start
    length = len(text)
    while end < length:
        ch = text[end]
        if ch == '"':
            end += 1
            while end < length:
                ch2 = text[end]
                if ch2 == '\\':
                    end += 2
                    continue
                if ch2 == '"':
                    break
                end += 1
        if ch == "{":
            stack += 1
        elif ch == "}":
            stack -= 1
            if stack == 0:
                end += 1
                return text[start:end]
        end += 1
    return None


def _extract_entries_from_dom(soup: BeautifulSoup, page_number: int) -> Iterator[SerpEntry]:
    rank = 1
    seen_urls: set[str] = set()
    for node in _iter_result_nodes(soup):
        title_elem = node.select_one("a.link_name, a.title, a.api_txt_lines.total_tit")
        if not title_elem:
            continue

        href = title_elem.get("href")
        if not href or href in seen_urls:
            continue

        seen_urls.add(href)
        title_text = title_elem.get_text(strip=True)
        display_elem = node.select_one("a.link_url, span.sub_url, div.total_source a")
        display_text = display_elem.get_text(strip=True) if display_elem else href

        yield SerpEntry(
            page=page_number,
            rank=rank,
            title=title_text,
            display_url=display_text,
            landing_url=href,
        )
        rank += 1


def _iter_result_nodes(soup: BeautifulSoup) -> Iterator[BeautifulSoup]:
    selectors = [
        "div.total_group > div.total_wrap",
        "div#main_pack div.total_wrap",
        "div#main_pack li.bx",
    ]
    for selector in selectors:
        matched = soup.select(selector)
        if matched:
            for node in matched:
                yield node
            return


async def crawl_keyword(query: str) -> List[SerpPage]:
    urls = await build_search_urls(query)
    pages: List[SerpPage] = []
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0 (compatible; CrankKingBot/0.1)"}) as client:
        for page_number, url in enumerate(urls, start=1):
            html = await fetch_serp(client, url)
            pages.append(parse_serp(html, query, page_number))
    return pages
