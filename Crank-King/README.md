# Crank King

Crank King은 네이버 검색 결과 2페이지까지를 자동으로 수집해 키워드 경쟁도를 Green / Yellow / Purple 플래그로 분류하고 HTTPS 보안 상태까지 아카이빙하는 웹 서비스입니다.

## 아키텍처 개요
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + APScheduler
- **Frontend**: Next.js (App Router) + React Query + Tailwind CSS
- **Crawler**: httpx 기반 비동기 크롤러, 네이버 SERP JSON payload 파싱, HTTPS 검사 포함
- **Infra**: Docker Compose (PostgreSQL / Backend / Frontend), Alembic 마이그레이션 지원

## 주요 기능
- 이메일 회원가입 / 로그인 (JWT 발급)
- 키워드 CRUD, 타깃 상호/도메인 메타데이터 관리
- 네이버 검색 1~2페이지 자동 크롤링 및 수동 재크롤
- 플래그 산정 규칙 (green / yellow / purple) 및 HTTPS 이슈 로그
- 크롤 이력·SERP 상세 화면, CSV 내보내기 준비(추후 확장)
- APScheduler로 매일 새벽 자동 크롤 작업 예약

## 빠른 시작 (로컬 Docker)
```bash
# 1) 환경 변수 템플릿 복사
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2) 컨테이너 실행
docker compose up --build

# 3) 접속
# 백엔드: http://localhost:8000/docs
# 프런트엔드: http://localhost:3000
```

## 수동 개발 환경
### 백엔드
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### 프런트엔드
```bash
cd frontend
npm install
npm run dev
```

## 배포 가이드
- Render + Vercel 조합으로 백엔드/프런트 배포하는 방법은 `deploy/README.md` 참고
- Render는 `deploy/render.yaml` 블루프린트를 사용하면 Postgres + FastAPI 서비스를 한 번에 생성할 수 있습니다.

## API 개요
- `POST /api/v1/auth/register`: 회원가입
- `POST /api/v1/auth/token`: JWT 발급 (OAuth2 Password)
- `GET /api/v1/keywords`: 키워드 목록 + 최신 플래그
- `POST /api/v1/keywords`: 키워드 생성
- `POST /api/v1/keywords/{id}/crawl`: 즉시 크롤
- `GET /api/v1/crawl-runs/{id}`: 크롤 이력 상세

## 폴더 구조
```
backend/
  app/
    api/            # Auth, Keywords, Crawl endpoints
    core/           # 설정 및 보안 유틸
    crawlers/       # 네이버 SERP 파서
    crud/           # DB CRUD 모듈
    models/         # SQLAlchemy 모델
    schemas/        # Pydantic 스키마
    services/       # 크롤 실행, 스케줄러
  alembic/          # 마이그레이션 스크립트
frontend/
  app/              # Next.js App Router 페이지
  src/              # hooks, providers, API 래퍼
```

## 향후 개선 아이디어
1. SERP·랜딩 페이지 캡처 저장 및 증빙 다운로드
2. 다중 사용자와 권한 레벨(읽기/쓰기) 분리
3. Slack · 이메일 알림, 플래그 변경 감지 워크플로우
4. HTTPS 검사 고도화 (만료일, 체인 유효성 등 추가 수집)
5. 키워드 그룹/태그 별 리포트, CSV/Excel 내보내기 구현
