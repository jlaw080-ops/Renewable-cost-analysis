# 빌드 워크플로우 (개발 진행 순서)

> 설계 문서(PRD/ARCHITECTURE/ADR/UI_GUIDE/calculation-formulas)는 **확정**. 본 문서는 구현 순서만 정의한다.
> 원칙: 계산 코어 먼저(CRITICAL: TDD + `calculation-formulas.md` 일치) → UI → 출력/저장.

## Phase 0 — 스캐폴드
- Next.js 15(App Router) + TypeScript(strict) + Tailwind + Vitest 설치
- 설정 파일: tsconfig(strict), tailwind, postcss, vitest, eslint, .env.example
- 검증: `npm run build`(빈 페이지), `npm run test`(0 통과) 동작

## Phase 1 — 타입 & 라이브러리 로더
- `src/types/*` : 입력값/라이브러리/결과 타입 (any 금지)
- `src/lib/libraries/*` : 5종 JSON 로더 + 런타임 검증(키 존재/숫자형)
- 테스트: 로더가 각 JSON을 타입대로 파싱하는지

## Phase 2 — 계산 코어 (TDD, 순수함수) ★CRITICAL
각 모듈 = 테스트(수식 정의서 기준 기대값) 먼저 → 구현. 부수효과 없음.
1. `calc/consumption.ts` — A. 전력·가스 소비량
2. `calc/energy-bill.ts` — B. 전기요금(계절별/시간대별 분기) + 가스 기준선
3. `calc/solar.ts` — C-1. 태양광 발전량/절감
4. `calc/fuelcell.ts` — F. 연료전지 output1/output2 (이전 앱 수식 격리, 변경 금지)
5. `calc/savings.ts` — C/D/E. 전력·가스 절감 분리 + 총절감/절감률
6. `calc/economics.ts` — G. 현금흐름/NPV/IRR/회수기간/B·C
- `calc/index.ts` — 전체 체인 오케스트레이터(입력→결과 객체)
- 검증: 전 모듈 단위 테스트 통과, 커버리지 핵심 함수 100%

## Phase 3 — UI (5탭)
- `app/page.tsx` 탭 컨테이너 + 단일 폼 상태(Context)
- 입력: 용도/연면적(복수), 요금제·계약전력·운전유형·일간사용시간, 태양광, 연료전지 sets, 경제성
- 결과: 소비량/요금, 신재생 생산·절감(전력/가스 분리), 경제성(표+Recharts)
- UI_GUIDE 준수: 그린 액센트 1색, 숫자 우측정렬·고정폭·콤마, 월12행+합계, AI슬롭 금지
- 검증: 입력→결과 수치가 calc 테스트와 일치

## Phase 4 — 리포트 & 저장
- `components/report/*` : @react-pdf/renderer PDF (입력요약+기준선+절감+경제성)
- `lib/supabase/*` + `app/api/scenarios/route.ts` : 검토안(입력값만) 저장/불러오기
  - env 없으면 localStorage 폴백(즉시 사용 가능). 결과는 저장 안 함 → 불러올 때 재계산
- 검증: 저장→불러오기→재계산 동일 결과, PDF 생성

## 완료 기준
- `npm run test` 전부 통과(계산 수식 정의서 일치), `npm run build` 성공, `npm run lint` 0 에러
- 5탭 입력→결과→PDF→저장/불러오기 동작
