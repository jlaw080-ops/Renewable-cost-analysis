// 검토안 저장/불러오기. 결과는 저장하지 않고 입력값(ScenarioInput)만 저장.
// Supabase 설정 시 'scenarios' 테이블 사용, 아니면 localStorage 폴백.
import type { ScenarioInput } from "@/types/inputs";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export interface SavedScenario {
  id: string;
  name: string;
  input: ScenarioInput;
  createdAt: string;
}

const LS_KEY = "rf:scenarios";
const TABLE = "scenarios";

export function storageBackend(): "supabase" | "localStorage" {
  return isSupabaseConfigured() ? "supabase" : "localStorage";
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

// ── 공개 API ──
export async function listScenarios(): Promise<SavedScenario[]> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from(TABLE)
      .select("id, name, input, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      id: String(r.id),
      name: r.name as string,
      input: r.input as ScenarioInput,
      createdAt: r.created_at as string,
    }));
  }
  return lsRead().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveScenario(
  name: string,
  input: ScenarioInput,
): Promise<SavedScenario> {
  const createdAt = new Date().toISOString();
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from(TABLE)
      .insert({ name, input })
      .select("id, name, input, created_at")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: String(data.id),
      name: data.name as string,
      input: data.input as ScenarioInput,
      createdAt: data.created_at as string,
    };
  }
  const saved: SavedScenario = { id: makeId(), name, input, createdAt };
  lsWrite([saved, ...lsRead()]);
  return saved;
}

export async function deleteScenario(id: string): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  lsWrite(lsRead().filter((x) => x.id !== id));
}
