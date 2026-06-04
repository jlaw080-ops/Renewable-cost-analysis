# 아키텍처

## 기술 스택
| 항목 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 웹앱 구조 |
| 언어 | TypeScript (strict) | 타입 안전성 |
| 스타일 | Tailwind CSS | UI 스타일링 |
| 차트 | Recharts | 결과 그래프 |
| 저장 | GitHub Gist (서버 API) / localStorage 폴백 | 검토안 저장/불러오기 (무료, 토큰은 서버 전용) |
| PDF | @react-pdf/renderer | 리포트 다운로드 |
| 테스트 | Vitest | 계산 로직 단위 테스트 |
| 린트 | ESLint + Prettier | 코드 품질 |
| 배포 | Vercel | 호스팅 |

## 디렉토리 구조
```
src/
├── app/
│   ├── page.tsx                 # 메인 (탭 컨테이너)
│   ├── layout.tsx
│   └── api/scenarios/route.ts   # 검토안 저장/조회 (GitHub Gist, 서버 토큰)
├── components/
│   ├── input/                   # 용도·연면적·계약전력·일간사용시간 / 태양광 / 연료전지 / 경제성 입력
│   ├── results/                 # 소비량·요금·절감·경제성 결과 테이블/차트
│   └── report/                  # PDF 리포트 레이아웃
├── lib/
│   ├── calc/
│   │   ├── consumption.ts       # A. 건물 전력·가스 소비량
│   │   ├── energy-bill.ts       # B. 전기요금(요금제 분기) + 가스요금 기준선
│   │   ├── solar.ts             # C-1. 태양광 발전량/절감
│   │   ├── fuelcell.ts          # C-2/D/F. 연료전지 (이전 앱 이식)
│   │   ├── savings.ts           # E. 절감액·절감률
│   │   └── economics.ts         # G. NPV/IRR/회수기간
│   ├── libraries/               # JSON 라이브러리 로더 + 검증
│   └── storage/                 # 검토안 저장 (gist.ts 서버 + scenarios.ts 클라이언트/localStorage)
├── data/                        # 라이브러리 원본 (JSON, 첨부 파일 형식)
│   ├── 용도라이브러리.json           # 신규 (전력 원단위)
│   ├── 전기요금라이브러리.json        # 이전 데이터 + 시간대구분 추가
│   ├── 가스요금라이브러리.json        # 이전 앱 그대로 [{구분,단가}]
│   ├── 월별가동일라이브러리.json      # 이전 앱 그대로 (운전유형별)
│   └── 연료전지제품라이브러리.json    # 이전 앱 그대로 (25개 모델)
└── types/                       # 공용 타입 정의
```

## 패턴
- **계산은 순수함수**: `lib/calc/*`는 입력 → 출력만 있는 부수효과 없는 함수. UI·DB와 분리하여 테스트가 쉽다.
- **라이브러리는 정적 JSON**: 요금·원단위 등은 `data/`의 JSON. 코드 수정 없이 값만 갱신.
- **UI / 계산 / 저장 3분리**: 컴포넌트는 표시만, 계산은 lib/calc, 영속화는 Supabase.

## 데이터 흐름
```
사용자 입력(폼 상태)
   → lib/libraries 에서 라이브러리 값 로드
   → lib/calc 순수함수 체인 (consumption → bill → solar/fuelcell → savings → economics)
   → 결과 객체
        ├─ components/results 로 화면 렌더 (테이블 + Recharts)
        ├─ components/report 로 PDF 생성
        └─ (저장 시) api/scenarios → GitHub Gist(또는 localStorage)에 검토안 저장
```

## 상태 관리
- 입력값은 **단일 폼 상태 객체**로 관리(React state 또는 가벼운 Context). 외부 상태 라이브러리는 불필요.
- 결과는 입력값에서 **파생 계산**(저장하지 않고 매번 계산). DB에는 입력값(검토안)만 저장하고, 불러올 때 재계산.

## 계산 모듈 입출력 (인터페이스 개요)
- `calcConsumption(uses[], areas[], 용도라이브러리)` → 총_연간_전력사용량
- `calcElectricityBill(연간사용량, 계약전력, 일간사용시간, 전기요금라이브러리, 월별가동일)` → 기준선 요금(월별/연간)
- `calcSolar(용량, 일간발전시간, 월별일수, 최대부하단가)` → 발전량/절감액
- `calcFuelCell(sets[], 운전시간, 라이브러리들)` → 발전수익/열생산수익/가스사용요금 (이전 앱 시그니처 준수)
- `calcSavings(...)` → 전력절감/가스절감/총절감/절감률
- `calcEconomics(연간편익, 초기투자비, 연간유지비, 분석기간, 할인율)` → 현금흐름/NPV/IRR/회수기간/BC

> 구현 세부는 위임. 계산 결과는 반드시 `docs/calculation-formulas.md`와 일치해야 한다.
