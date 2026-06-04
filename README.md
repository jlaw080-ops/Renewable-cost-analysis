# 신재생에너지 생산량·경제성 검토 앱 — 설계 문서 패키지

Harness Engineering 방식으로 Claude Code에 넘길 설계 문서 + 라이브러리 모음입니다.

## 사용 순서
1. 프레임워크 레포 클론
   `git clone https://github.com/jha0313/harness_framework.git renewable-feasibility`
2. 이 패키지의 파일을 같은 위치 구조로 복사
   - `CLAUDE.md` → 레포 루트
   - `docs/` → 레포 `docs/`
   - `src/data/` → 레포 `src/data/`
3. (선택) `src/data/용도라이브러리.json` 값 검토 — 이미 통계 기반으로 채워져 있음
4. Claude Code에서 `/harness` 실행 → Phase 자동 진행
5. `/review`로 점검, 부족하면 docs 보강 후 재실행

## 폴더 구조
```
CLAUDE.md                         프로젝트 헌법(AI가 먼저 읽음)
docs/
  PRD.md                          무엇을 만드는지
  ARCHITECTURE.md                 어떻게 만드는지
  ADR.md                          왜 이렇게 정했는지
  UI_GUIDE.md                     어떻게 보여야 하는지
  calculation-formulas.md         계산 수식 단일 원본 (⚠️ 수정 주의)
  references/                     이전 연료전지 앱의 입출력 형식(모듈 이식 참고)
src/data/
  용도라이브러리.json              용도별 전력·도시가스 원단위 (kWh/m²·yr)
  전기요금라이브러리.json          일반용 갑(계절별) + 을(시간대별) 요금제
  가스요금라이브러리.json          일반용/연료전지전용 도시가스 단가
  월별가동일라이브러리.json        운전유형별 월별 가동일수
  연료전지제품라이브러리.json      연료전지 모델 사양(25종)
```

## 확인 사항 (개발 시)
- 연료전지(F)·경제성(G)은 이전 앱 결과와 일치해야 함 — 부가세/기금 가산·차감 방향, ROI 정의를 이전 코드 기준으로 맞출 것.
- 모든 계산 결과는 `docs/calculation-formulas.md`와 일치해야 함.

---

## 개발 · 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run test     # Vitest — 계산 로직 단위 테스트 (수식 정의서 일치 검증)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

### 구현 현황 (MVP 완료)
- 계산 코어 `src/lib/calc/*` — 순수함수 6모듈(소비량·요금·태양광·연료전지·절감·경제성) + 체인. 55개 테스트 통과.
- 5탭 UI: 입력 → 소비량/요금 → 생산·절감 → 경제성 → 리포트. 전력/가스 절감 분리 표시.
- PDF 리포트(A4, 한글 Pretendard 임베드) + 검토안 저장(localStorage 기본, GitHub Gist 온라인 선택).

### 빌드 순서 기록
구현 진행 순서는 `docs/BUILD_PLAN.md`, 온라인 저장(GitHub Gist) 연결은 `docs/github-storage-setup.md` 참조.
