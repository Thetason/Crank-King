# Data Model & API Outline

## Database Schema

### keywords
- `id` (UUID, PK)
- `query` (text, unique, required)
- `category` (enum: brand, region_business, region_store, nullable)
- `target_names` (jsonb array of strings, optional manually curated match terms)
- `target_domains` (jsonb array of strings, optional preferred domains)
- `notes` (text)
- `status` (enum: active, paused, archived; default active)
- `created_at` (timestamp, default now)
- `updated_at` (timestamp)

### crawl_runs
- `id` (UUID, PK)
- `keyword_id` (FK → keywords.id, cascade delete)
- `started_at` (timestamp)
- `ended_at` (timestamp)
- `status` (enum: pending, success, failure)
- `flag` (enum: green, yellow, purple)
- `https_issues` (jsonb, optional details on certificate failure)
- `notes` (text, operator comment)

### serp_entries
- `id` (UUID, PK)
- `crawl_run_id` (FK → crawl_runs.id, cascade delete)
- `rank` (int)
- `page` (int)
- `title` (text)
- `display_url` (text)
- `landing_url` (text)
- `is_match` (boolean)
- `match_reason` (text)

### crawl_logs
- `id` (UUID, PK)
- `crawl_run_id` (FK → crawl_runs.id)
- `event_time` (timestamp)
- `level` (enum: info, warning, error)
- `message` (text)

### http_checks
- `id` (UUID, PK)
- `crawl_run_id` (FK → crawl_runs.id)
- `url` (text)
- `protocol` (enum: http, https)
- `status_code` (int)
- `ssl_valid` (boolean)
- `ssl_error` (text)
- `checked_at` (timestamp)

## API Surface (FastAPI)

### Keyword Management
- `POST /keywords`
  - Payload: `query`, `category`, `target_names`, `target_domains`, `notes`
  - Response: created keyword.
- `GET /keywords`
  - Query params: pagination, `status`, `flag` (latest flag filter), `search`.
  - Response: list with latest crawl info (join on last crawl_runs).
- `GET /keywords/{keyword_id}`
  - Response: keyword detail + recent crawl history summary.
- `PUT /keywords/{keyword_id}`
  - Update mutable fields.
- `DELETE /keywords/{keyword_id}`
  - Soft archive (set status=archived).

### Crawl Control
- `POST /keywords/{keyword_id}/crawl`
  - Trigger immediate crawl job; enqueues task and returns run id.
- `POST /crawl-runs/reschedule`
  - Bulk trigger by filter (e.g., all green older than N days).
- `GET /crawl-runs/{run_id}`
  - Detailed run status, SERP entries, HTTPS checks.

### Reports
- `GET /reports/latest`
  - Summaries: counts by flag, recent purple cases.
- `GET /reports/export`
  - Generates CSV of latest keyword states.

## Background Jobs
- `crawl_keyword(keyword_id)` Celery/APS task
  - Steps: fetch SERP pages, parse, match, HTTPS check, persist, finalize flag.
- Nightly scheduler iterates over active keywords.

## Matching Strategy Notes
- Normalize strings: lower-case, remove spaces/punctuation, Hangul Jamo decomposition.
- Compare against `target_names` and domain list; fallback to heuristics (contains keyword + region token).
- Adjustable similarity threshold stored in config.

## HTTPS Validation Logic
1. Check `https` URL for 200-range status and valid cert.
2. If HTTPS fails, test HTTP fallback and record response.
3. Record SSL error message for operator context.
4. Flag priority: if any matched SERP entry fails HTTPS → purple.

