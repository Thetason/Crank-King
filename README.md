# Crank King

Crank King은 네이버 검색 결과 2페이지까지를 자동으로 수집해 키워드 경쟁도를 **Green / Yellow / Purple** 플래그로 분류하고 아카이빙하는 웹서비스입니다. 이 저장소는 FastAPI 기반 백엔드와 Next.js 프런트엔드를 목표로 한 전체 개발 계획과 현재까지의 구현물을 담고 있습니다.

## 현재 진행 상황
- `docs/mvp_spec.md`: 서비스 목적, 플래그 규칙, MVP 범위를 정의한 기능 명세.
- `docs/data_model_and_api.md`: 데이터베이스 스키마와 API 엔드포인트 설계 문서.
- `backend/app`: FastAPI 골격과 키워드 임시 CRUD, 네이버 SERP 크롤러 프로토타입.
- `docs/samples`: 실제 네이버 검색 HTML 샘플(분당 보컬학원 1·2페이지)로 파서 검증에 활용.

## 다음 개발 단계
1. PostgreSQL + SQLAlchemy로 영속 계층 구성하고 Alembic 마이그레이션 작성.
2. 크롤링 작업(네이버 SERP 파싱, HTTPS 검사, 플래그 산정)과 스케줄러/큐 연동.
3. JWT 인증 기반 회원가입/로그인, 키워드 관리용 REST API 완성.
4. Next.js + Tailwind UI로 대시보드, 키워드 상세, 결과 필터/CSV 내보내기 구현.
5. Docker Compose 기반 배포 파이프라인과 운영 가이드 정리.

## 빠른 시작 가이드 (임시)
```bash
# 백엔드 의존성 설치
cd Crank-King/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 개발 서버 실행
uvicorn app.main:app --reload
```

프런트엔드는 아직 추가되지 않았으며, 위 명령은 백엔드 API 뼈대를 로컬에서 실행하기 위한 임시 절차입니다.

## 기여 방법
- 새로운 문서나 코드는 Pull Request로 올리되, `docs` 하위 문서와 `backend/app` 파서 로직에 대한 테스트를 함께 제출합니다.
- 네이버 이용약관과 robots.txt 제한을 준수할 수 있도록 크롤러 수정 시 요청 간 딜레이·헤더 설정을 꼭 포함합니다.

문의나 개선 제안은 Issues 탭을 이용해 주세요.
