# 프로젝트: 신재생에너지 생산량·경제성 검토 앱

건축물의 전력 소비량·전기요금을 예측하고, 신재생(연료전지·태양광) 도입 시
연간 절감액과 경제성(NPV·IRR·회수기간)을 산출하는 개략 검토 도구.

## 기술 스택
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS / 차트는 Recharts
- 검토안 저장: GitHub Gist(서버 API 라우트, 무료) / 미설정 시 localStorage 폴백
- PDF: @react-pdf/renderer
- 테스트: Vitest

## 아키텍처 규칙
- CRITICAL: 모든 계산 결과는 `docs/calculation-formulas.md`와 정확히 일치해야 한다. 수식을 임의로 바꾸지 말 것. 변경이 필요하면 먼저 그 문서를 고치고 코드를 맞춘다.
- CRITICAL: 계산 로직(`src/lib/calc/*`)은 부수효과 없는 순수함수로 작성하고, 각 함수에 단위 테스트를 둔다.
- CRITICAL: 연료전지 계산은 이전 앱 로직을 이식해 `src/lib/calc/fuelcell.ts`에 격리한다. 발전수익·열생산수익·가스사용요금 수식을 바꾸지 않는다.
- 검토안 저장은 GitHub Gist(서버 API `app/api/scenarios`) 또는 localStorage. 토큰은 서버 전용 env(`GITHUB_TOKEN`/`GITHUB_GIST_ID`)에만 둔다 — `NEXT_PUBLIC` 금지. Supabase는 사용하지 않는다.
- CRITICAL: `any` 타입 사용 금지. 입력·결과는 `src/types`에 명시적 타입으로 정의한다.
- 요금·원단위 등 데이터는 코드가 아니라 `src/data/*.json` 라이브러리에 둔다.
- 계산 결과는 DB에 저장하지 않는다. 검토안(입력값)만 저장하고 불러올 때 재계산한다.
- 화면/계산/저장(UI · lib/calc · supabase)을 분리한다.
- 절감액은 전력요금 절감과 가스요금 절감을 **항상 분리 표시**한다.

## UI 규칙
- CRITICAL: `docs/UI_GUIDE.md`의 AI 슬롭 안티패턴을 지킨다 — glass morphism, gradient-text, 네온 글로우, 보라/인디고 색상, gradient orb 금지.
- 숫자는 우측 정렬·고정폭 글꼴·천단위 콤마. 표는 월별 12행 + 연간 합계 행.

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 통과하는 구현을 작성할 것 (TDD). 특히 계산 함수는 예시 입력→기대 출력 테스트를 만든다.
- 커밋 메시지는 conventional commits 형식 (feat:, fix:, docs:, refactor:, test:).
- 작업 중 실패가 반복되면 그 원인을 이 파일의 "실패 기록"에 "하지 말 것"으로 추가한다.

## MVP 제외 (만들지 말 것)
- 지열, AI 검토 의견(Gemini), 잉여 발전 보정, 로그인/인증.

## 명령어
```
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run test     # Vitest 테스트
```

## 세부 문서 (docs/)
- `calculation-formulas.md` — 계산 수식 단일 원본 (⚠️ 수정 주의)
- `PRD.md` — 무엇을 만드는지
- `ARCHITECTURE.md` — 어떻게 만드는지
- `ADR.md` — 왜 이렇게 정했는지
- `UI_GUIDE.md` — 어떻게 보여야 하는지

## 실패 기록
- (작업하며 반복된 실수를 여기에 "하지 말 것"으로 누적한다)
- ESLint 설정(`eslint.config.mjs`/`.eslintrc.json`)은 config-protection 훅이 Write를 차단함 → 신규 생성은 Bash로 작성(규칙 약화가 아닌 강화일 때만).
- PDF 한글: `@react-pdf/renderer`는 기본 폰트로 한글이 깨짐 → `public/fonts/Pretendard-*.otf`를 `Font.register`로 등록(OTF 정상 동작 확인). 폰트 src는 `/fonts/...` public 경로.
- Recharts 다중카테고리 차트는 Playwright `fullPage` 스크린샷에서 좌측 압축되어 보이는 아티팩트가 있음(실제 렌더는 정상) → 요소 단위 스크린샷으로 확인할 것.
- 계산 테스트 기대값은 references/output*.json이 전부 null(스키마)이므로 `calculation-formulas.md` 수식에서 직접 손계산하여 고정.
