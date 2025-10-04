# Crank King MVP Functional Spec

## Goal
Deliver a web-based archiving service that classifies Naver search keywords by competitive flag (green/yellow/purple) based on their presence and HTTPS status within the second SERP page.

## Primary Personas
- **Operator**: single internal user managing keyword backlog, triggering crawls, and reviewing outcomes.

## Supported Keyword Types
- Brand-only keywords (e.g. `마스크팩`).
- Region + business keywords (e.g. `강남 피부과`, `강남역 피부과`).
- Region + store keywords (e.g. `마장동 한우`).

## Core User Flow
1. Operator adds or imports keywords with optional type and memo.
2. System runs a crawl job against the keyword (manual trigger or scheduled).
3. Crawler fetches Naver SERP page 1 and 2, extracts organic results, and normalizes titles/URLs.
4. Matching engine determines whether the operator's target brand/domain appears.
5. HTTPS checker inspects candidate domains for TLS support.
6. Service stores the crawl evidence and assigns a flag.
7. Operator reviews results via dashboard, filters by flag, and schedules follow-up crawls if needed.

## Flag Logic Definitions
- **Green flag**: Target brand/domain absent from Naver page 1 and 2 organic results.
- **Yellow flag**: Target brand/domain (or close variant) present within the first two pages.
- **Purple flag**: Target detected, but primary URL lacks HTTPS or returns SSL warnings.
- Flag priority: purple supersedes yellow when HTTPS issues exist.

## Minimum Viable Features
- Keyword registry CRUD (single user scope).
- Manual crawl trigger per keyword; nightly batch crawl for all active keywords.
- Naver SERP fetcher with rate limiting and random User-Agent rotation.
- HTML parser that captures title, snippet, display URL, and landing URL for first 20 results per page.
- String normalization and fuzzy matching (case folding, Hangul normalization, similarity threshold) against operator-provided brand/domain hints.
- HTTPS validation using HEAD/GET request with SSL error capture.
- Result persistence (keyword id, crawl timestamp, SERP entries, flag decision, evidence URLs).
- Simple web dashboard: keyword list with latest flag, detail view showing evidence and HTTPS notes.
- Export latest results as CSV for archiving.

## Out of Scope for MVP
- Multi-user authentication/authorization.
- Automatic screenshot capture of SERP or landing pages.
- Support for additional search engines beyond Naver.
- Automated notifications (email, Slack).
- Keyword suggestion or grouping intelligence.

## Operational Considerations
- Respect Naver robots guidelines; enforce minimum 2–3 second delay between SERP requests.
- Store crawl logs and HTTP errors for troubleshooting.
- Provide configuration for proxy rotation if SERP blocking becomes an issue (placeholder hooks only in MVP).

## Success Metrics
- Operator can archive at least 100 keywords with accurate flagging (>90% manual verification match).
- Crawl pipeline completes nightly batch (<=100 keywords) within acceptable window (<30 minutes) without rate-limit bans.

