# Data Model & API Outline

## Database Schema

### users
- `id` (UUID, PK)
- `email` (text, unique, required)
- `hashed_password` (text)
- `is_active` (bool)
- `created_at` (timestamp)

### guest_sessions
- `id` (UUID, PK)
- `created_at` (timestamp)

### keywords
- `id` (UUID, PK)
- `owner_id` (FK → users.id, nullable)
- `guest_session_id` (FK → guest_sessions.id, nullable)
- `query` (text, required, unique per owner/guest)
- `category` (text, nullable)
- `target_names` (jsonb array of strings)
- `target_domains` (jsonb array of strings)
- `status` (enum: active, paused, archived; default active)
- `notes` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `CHECK`: 반드시 owner 혹은 guest 중 하나만 채워져야 함

### crawl_runs
- `id` (UUID, PK)
- `keyword_id` (FK → keywords.id, cascade delete)
- `started_at` (timestamp)
- `completed_at` (timestamp nullable)
- `status` (enum: pending, success, failure)
- `flag` (enum: green, yellow, purple)
- `https_issues` (jsonb key/value of failing URLs → message)
- `notes` (text)

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

### http_checks
- `id` (UUID, PK)
- `crawl_run_id` (FK → crawl_runs.id)
- `url` (text)
- `protocol` (enum: http, https)
- `status_code` (int nullable)
- `ssl_valid` (boolean)
- `ssl_error` (text)
- `checked_at` (timestamp)

## REST API (FastAPI `/api/v1`)

### Auth
- `POST /auth/register` — 사용자 생성
- `POST /auth/token` — OAuth2 Password Grant, JWT 반환
- `GET /auth/me` — 현재 사용자 프로필

### Keywords (로그인 사용자 전용)
- `GET /keywords` — 로그인 사용자의 키워드 목록 + 최근 플래그
- `POST /keywords` — 키워드 생성 (`query`, `category`, `target_names`, `target_domains`, `notes`)
- `GET /keywords/{keyword_id}` — 키워드 상세 + 최신 10개 크롤 이력
- `PUT /keywords/{keyword_id}` — 메타데이터 수정
- `DELETE /keywords/{keyword_id}` — 키워드 삭제(하드 삭제)

### Guest Mode
- `POST /guest/session` — 게스트 세션 발급 또는 갱신 (응답 및 헤더로 `X-Guest-Id` 반환)
- `GET /guest/keywords` — 게스트 키워드 목록 (최대 10개)
- `POST /guest/keywords` — 게스트 키워드 추가 (limit 초과 시 403)
- `GET /guest/keywords/{keyword_id}` — 게스트 키워드 상세 + 크롤 이력
- `DELETE /guest/keywords/{keyword_id}` — 게스트 키워드 삭제
- `POST /guest/keywords/{keyword_id}/crawl` — 게스트 키워드 수동 크롤

### Crawls
- `POST /keywords/{keyword_id}/crawl` — 즉시 크롤 실행, 결과(SerpEntries/HttpChecks) 반환
- `GET /crawl-runs/{run_id}` — 단일 크롤 이력 조회

## 배치 & 스케줄링
- APScheduler `crawl_all_active_keywords` → 매일 03:00, 활성 키워드 전체 순회
- 작업 과정: SERP Fetch → 결과 파싱 → 매칭 로직 → HTTPS 검사 → 플래그 결정 → DB 저장

## 매칭 전략
- 문자열 표준화: 소문자 + 공백 제거 (`normalize_text`)
- 타깃 상호명 포함 여부 우선 → 도메인(`display_url`, `landing_url`) 부분 일치 검사
- 타깃 정보 미입력 시 기본적으로 전체 키워드 문구 기준 탐색

## HTTPS 판별 기준
1. 매칭된 결과가 없으면 `green`
2. 매칭된 결과가 있고 모든 HTTPS 검증이 통과 → `yellow`
3. 매칭된 URL 중 하나라도 비-HTTPS 또는 SSL 오류 → `purple`
4. 검사 결과는 `http_checks` 테이블에 저장하고, 실패 메시지는 `crawl_runs.https_issues`에 요약 저장
