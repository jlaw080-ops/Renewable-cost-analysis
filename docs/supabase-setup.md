# Supabase 검토안 저장 설정 (선택)

검토안 저장은 기본적으로 **브라우저 localStorage**에 저장되어 별도 설정 없이 즉시 동작한다.
여러 기기에서 공유하거나 영구 저장하려면 Supabase를 연결한다.

## 1. 환경변수
`.env.local` 생성 (`.env.example` 참고):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```
두 값이 모두 있으면 자동으로 Supabase 백엔드로 전환된다(리포트 탭의 "저장 위치" 표시로 확인).

## 2. 테이블 생성 (SQL Editor)
```sql
create table public.scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  input jsonb not null,           -- ScenarioInput (입력값만 저장, 결과는 불러올 때 재계산)
  created_at timestamptz not null default now()
);

-- MVP: 로그인 없음 → anon 키로 읽기/쓰기 허용
alter table public.scenarios enable row level security;
create policy "anon all" on public.scenarios
  for all to anon using (true) with check (true);
```

> ⚠️ anon 전체 허용은 단일 사용자 개략 검토 MVP 전제다. 다중 사용자/인증 도입 시 정책을 좁힐 것.

## 구현 메모
- 클라이언트(`src/lib/storage/scenarios.ts`)가 `@supabase/supabase-js`로 직접 접근한다.
  ARCHITECTURE.md의 `api/scenarios/route.ts`(서버 경유) 대신, anon 키 기반 MVP에서는
  클라이언트 직접 접근으로 단순화했다. 서버 검증이 필요해지면 API 라우트로 이전한다.
- 저장 단위는 `ScenarioInput`. 결과(NPV 등)는 저장하지 않고 불러올 때 `calcFeasibility`로 재계산한다.
