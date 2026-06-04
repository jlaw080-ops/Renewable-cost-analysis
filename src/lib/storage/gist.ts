// 서버 전용 — GitHub Gist에 검토안(JSON)을 저장/조회. 토큰은 서버 env에만 둔다.
// app/api/scenarios/route.ts 에서만 import 한다 (클라이언트 번들 금지).
import type { SavedScenario } from "./scenarios";

const FILE = "scenarios.json";
const API = "https://api.github.com";

export function gistConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_GIST_ID);
}

function ghHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function readScenarios(): Promise<SavedScenario[]> {
  const id = process.env.GITHUB_GIST_ID as string;
  const res = await fetch(`${API}/gists/${id}`, {
    headers: ghHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gist 읽기 실패 (${res.status})`);
  const data = (await res.json()) as { files?: Record<string, { content?: string }> };
  const content = data.files?.[FILE]?.content;
  if (!content) return [];
  try {
    const arr = JSON.parse(content);
    return Array.isArray(arr) ? (arr as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

export async function writeScenarios(list: SavedScenario[]): Promise<void> {
  const id = process.env.GITHUB_GIST_ID as string;
  const res = await fetch(`${API}/gists/${id}`, {
    method: "PATCH",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ files: { [FILE]: { content: JSON.stringify(list, null, 2) } } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Gist 쓰기 실패 (${res.status})`);
}
