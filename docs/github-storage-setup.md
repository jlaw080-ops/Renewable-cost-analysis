# GitHub Gist 검토안 저장 설정 (선택)

검토안 저장은 기본적으로 **브라우저 localStorage**에 저장되어 별도 설정 없이 즉시 동작한다.
여러 기기에서 공유하거나 온라인에 영구 저장하려면 **무료 GitHub Gist**를 연결한다.

> 토큰은 **서버 전용**(`NEXT_PUBLIC` 아님)이라 브라우저에 노출되지 않는다.
> 클라이언트는 `/api/scenarios` 서버 라우트를 통해서만 Gist에 접근한다.

## 1. 빈 Gist 생성
1. https://gist.github.com 접속 → 파일명 `scenarios.json`, 내용 `[]` 입력.
2. **Create secret gist** (비공개) 클릭.
3. 생성된 URL `https://gist.github.com/<user>/<GIST_ID>` 에서 **GIST_ID**(끝의 해시) 복사.

## 2. 토큰 발급
- **Fine-grained token** (권장): Settings → Developer settings → Fine-grained tokens
  → Permissions의 **Gists: Read and write** 만 부여.
- 또는 **Classic token**: scope `gist` 하나만 체크.

## 3. 환경변수
`.env.local` 생성 (`.env.example` 참고):
```
GITHUB_TOKEN=github_pat_xxx_또는_ghp_xxx
GITHUB_GIST_ID=abc123...
```
- 로컬: `npm run dev` 재시작 후 적용.
- Vercel 배포: Project → Settings → Environment Variables 에 동일하게 등록.

두 값이 모두 있으면 리포트 탭 "저장 위치"가 **GitHub Gist (온라인)** 으로 표시된다.

## 동작 메모
- 저장 단위는 `ScenarioInput`(입력값만). 결과(NPV 등)는 저장하지 않고 불러올 때 `calcFeasibility`로 재계산.
- Gist 파일 `scenarios.json` = `SavedScenario[]` 배열. 저장/삭제는 읽기→수정→PATCH 방식(단일 사용자 전제).
- 서버 라우트: `src/app/api/scenarios/route.ts`, Gist 접근: `src/lib/storage/gist.ts`.
- env 미설정이면 클라이언트(`src/lib/storage/scenarios.ts`)가 자동으로 localStorage로 폴백.
