# Deployment Guide

이 문서는 Crank King 서비스를 웹에서 바로 사용할 수 있도록 백엔드(FastAPI)와 프런트엔드(Vercel)를 배포하는 절차를 요약합니다.

## 1. Render 에 백엔드 배포
1. Render Dashboard에서 **New + → Blueprint** 선택 후 저장소 `Thetason/Crank-King`를 연결합니다.
2. 브랜치는 `main`, 루트는 그대로 두고, `render.yaml` 경로(`deploy/render.yaml`)를 선택합니다.
3. Render가 `crank-king-postgres` 데이터베이스와 `crank-king-backend` 웹 서비스를 자동 생성합니다.
4. 생성된 Postgres 인스턴스에서 `Internal Database URL` 값을 복사합니다.
5. 백엔드 서비스 환경 변수 설정:
   - `DATABASE_URL`: (4)에서 복사한 URL (예: `postgresql://crank:...`)
   - `SECRET_KEY`: 임의의 긴 문자열
   - `BACKEND_CORS_ORIGINS`: `https://<vercel-domain>` (예: `https://crank-king.vercel.app`)
   - 나머지는 Blueprint 기본값을 그대로 사용.
6. Deploy 완료 후 `https://<render-app-name>.onrender.com/api/v1/health` 에서 `{"status":"ok"}` 응답을 확인합니다.

## 2. Vercel 프런트엔드 설정
1. Vercel에서 새 프로젝트 생성: Repository `Crank-King`, 브랜치 `main`.
2. **Root Directory**: `Crank-King/frontend`.
3. **Framework Preset**: `Next.js`.
4. Environment Variable 추가:
   - `NEXT_PUBLIC_API_URL`: `https://<render-app-name>.onrender.com/api/v1`
5. Deploy 후 `https://<vercel-domain>/login` 접속 → 회원가입/로그인이 백엔드와 통신되는지 확인합니다.

## 3. 기본 계정 생성
- Render 백엔드에서 다음 명령으로 관리자 계정을 만듭니다 (Render Shell 혹은 로컬 curl 사용).

```bash
curl -X POST https://<render-app-name>.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@crank-king.com", "password": "StrongPassword123"}'
```

이제 Vercel 프런트에서 위 계정으로 로그인해 키워드 관리, 크롤링을 사용할 수 있습니다.

## 4. Optional: 스케줄러 확인
- Render 로그에서 APScheduler 잡이 새벽 3시에 실행되는지 확인하거나, 수동 크롤 API(`/api/v1/keywords/{id}/crawl`)를 호출해 동작을 검증합니다.

이 절차를 따르면 사용자가 별도 서버 구출 없이 Render + Vercel 조합으로 바로 서비스를 운용할 수 있습니다.
