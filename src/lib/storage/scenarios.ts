// 검토안 저장/불러오기 (클라이언트). 입력값(ScenarioInput)만 저장, 불러올 때 재계산.
// GitHub Gist(서버 API /api/scenarios) 설정 시 온라인 저장, 아니면 localStorage 폴백.
import type { ScenarioInput } from "@/types/inputs";

export interface SavedScenario {
  id: string;
  name: string;
  input: ScenarioInput;
  createdAt: string;
}

export type Backend = "github" | "localStorage";

const LS_KEY = "rf:scenarios";
const API = "/api/scenarios";

let cachedBackend: Backend | null = null;

/** 테스트용 — 백엔드 캐시 초기화 */
export function _resetBackendCache(): void {
  cachedBackend = null;
}

function makeId(): string {
  return `s_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

// ── localStorage 직렬화 (순수, 테스트 가능) ──
export function parseStored(raw: string | null): SavedScenario[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

function lsRead(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  return parseStored(window.localStorage.getItem(LS_KEY));
}
function lsWrite(list: SavedScenario[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/** GitHub 설정 여부를 서버에 1회 질의 후 캐시. 실패 시 localStorage. */
export async function currentBackend(): Promise<Backend> {
  if (cachedBackend) return cachedBackend;
  try {
    const res = await fetch(API, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { configured?: boolean };
      cachedBackend = data.configured ? "github" : "localStorage";
    } else {
      cachedBackend = "localStorage";
    }
  } catch {
    cachedBackend = "localStorage";
  }
  return cachedBackend;
}

// ── 공개 API ──
export async function listScenarios(): Promise<SavedScenario[]> {
  try {
    const res = await fetch(API, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as {
        configured?: boolean;
        scenarios?: SavedScenario[];
      };
      if (data.configured) {
        cachedBackend = "github";
        return data.scenarios ?? [];
      }
      cachedBackend = "localStorage";
    }
  } catch {
    // 네트워크 실패 → localStorage 폴백
  }
  cachedBackend = cachedBackend ?? "localStorage";
  return lsRead().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveScenario(
  name: string,
  input: ScenarioInput,
): Promise<SavedScenario> {
  if ((await currentBackend()) === "github") {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, input }),
    });
    if (!res.ok) throw new Error(`저장 실패 (${res.status})`);
    return (await res.json()) as SavedScenario;
  }
  const saved: SavedScenario = {
    id: makeId(),
    name,
    input,
    createdAt: new Date().toISOString(),
  };
  lsWrite([saved, ...lsRead()]);
  return saved;
}

export async function deleteScenario(id: string): Promise<void> {
  if ((await currentBackend()) === "github") {
    const res = await fetch(`${API}?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
    return;
  }
  lsWrite(lsRead().filter((x) => x.id !== id));
}
