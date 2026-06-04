# 진행 기록 (PROGRESS / HANDOFF)

> 기준일: 2026-06-04 · 저장소: https://github.com/jlaw080-ops/Renewable-cost-analysis (main)
> 원본 명세: `docs/PRD.md` · 계산 단일원본: `docs/calculation-formulas.md` · 빌드 순서: `docs/BUILD_PLAN.md`

## 현재 상태 한 줄
MVP **완료**. 린트 0 · 테스트 55/55 통과 · 프로덕션 빌드 성공. 2개 커밋 푸시 완료.

---

## 완료된 작업 (이번 작업분)

### Phase 0 — 스캐폴드
Next.js 15.5 (App Router) + TypeScript(strict) + Tailwind v3 + Vitest + ESLint(no-explicit-any:error).
`next.config.mjs`(outputFileTracingRoot 고정), `tailwind.config.ts`(UI_GUIDE 색 토큰), `.env.example`.

### Phase 1 — 타입 & 라이브러리 로더
- `src/types/{libraries,inputs,results}.ts` — `any` 없이 명시적 타입.
- `src/lib/libraries/index.ts` — JSON 5종 로더 + 런타임 검증 + 접근자(용도/요금제/가스/가동일/연료전지). 8 테스트.

### Phase 2 — 계산 코어 (순수함수, TDD) ★CRITICAL
`src/lib/calc/*` 6모듈 + 체인(`index.ts`). **기대값은 전부 `calculation-formulas.md` 수식에서 직접 손계산하여 고정.**
- `consumption.ts` (A 소비량) / `energy-bill.ts` (B 요금, 계절별·시간대별 분기 + 가스 기준선)
- `solar.ts` (C-1) / `fuelcell.ts` (F, 이전 앱 수식 격리·미변경) / `savings.ts` (C·D·E 절감 분리) / `economics.ts` (G NPV·IRR·회수·B·C)
- 43 + 통합 5 = 계산 테스트 다수. 전체 55 테스트 통과.

### Phase 3 — UI 5탭
`AppShell`(탭) + `ScenarioContext`(단일 폼 상태, 결과는 useMemo 파생). 입력/소비량·요금/생산·절감/경제성/리포트.
UI_GUIDE 준수(그린 액센트 1색, 숫자 우측정렬·고정폭·콤마, 월12행+합계, AI슬롭 안티패턴 배제) — Playwright 시각 검증 완료.

### Phase 4 — 리포트 & 저장
- `report/ReportDocument.tsx` — @react-pdf/renderer A4 PDF, 한글 Pretendard(`public/fonts/*.otf`) 임베드. PDF 텍스트 추출로 검증.
- `lib/storage/scenarios.ts` + `gist.ts` + `app/api/scenarios/route.ts` — 검토안(입력값만) 저장. **localStorage 기본**, env 있으면 **GitHub Gist(서버 라우트, 무료)**. 6 테스트.

---

## 다음 작업 범위 (원본 명세 기준 전수 — 미구현 항목 전부)

### A. PRD가 명시한 MVP 제외 항목 (의도적 보류)
| 항목 | 출처 | 비고 |
|------|------|------|
| 지열 모듈 | PRD MVP제외, calc §H | 별도 계산 모듈로 추가 |
| AI 검토 의견(Gemini 코멘트) | PRD MVP제외, ADR-006, calc §H | 외부 API 키/비용 이유로 제외 |
| 잉여 발전 판매 보정 | PRD MVP제외, calc §H | 생산>소비 초과분 미보정(현재 전량 단가환산) |
| 다중 사용자 / 로그인·인증 | PRD MVP제외 | 현재 단일 사용자 전제 |

### B. calculation-formulas.md / ADR가 남긴 후속 과제
| 항목 | 출처 | 내용 |
|------|------|------|
| 시간대구분 계절 분리 | calc §H | 현재 시간대구분 단일(계절차는 단가에만 반영) |
| 운전 시작 시각 입력 옵션 | ADR-004 | 현재 09:00 고정. 24시간 시설(병원·데이터센터) 경부하 과소반영 |
| 연료전지 발전수익 요금제 통일 검토 | calc §F 주석 | 건물 기준선=갑이어도 연료전지 수익은 을 시간대 단가 사용(이전 앱 일치 목적) |

### C. 검증/확인이 남은 항목 (정확성 리스크 — 중요)
| 항목 | 상태 | 메모 |
|------|------|------|
| 연료전지(F)·경제성(G) **이전 앱 실제 수치 대조** | **미완** | `docs/references/output*.json`이 전부 null(스키마)이라 실제 이전 앱 출력과 1:1 대조는 못 함. 현재는 `calculation-formulas.md` 수식 기준으로만 검증. 이전 앱 실데이터 확보 시 회귀 테스트 추가 필요 |
| 부가세·기금 가산/차감 방향 | 가산(×1.1×1.032)으로 구현 | 수식 정의서 표기를 따름(README가 "이전 코드 기준 확인" 요구) |
| ROI 정의(초기투자/총비용) | calc §G-3대로 구현 | "(이전 앱 정의 확인)" 주석 — 실코드 대조 미완 |
| GitHub Gist 실연결 | 미실증 | token/gist-id 없어 localStorage만 실증. 설정은 `docs/github-storage-setup.md` |

### D. 폴리시/배포 (미진행)
- Vercel 배포(ARCHITECTURE 명시) 미수행.
- E2E(Playwright) 자동화 테스트 미작성(수동 시각 검증만).
- `next lint` → Next 16 대비 ESLint CLI 마이그레이션 권고 메시지 있음.

## 범위 조정 사항
- 검토안 저장을 Supabase → **GitHub Gist**로 변경(ADR-009). 토큰 보호를 위해 서버 라우트 `app/api/scenarios` 사용(ARCHITECTURE 원안 구조로 복귀). 계산·UI·PDF 불변. 설정: `docs/github-storage-setup.md`.
