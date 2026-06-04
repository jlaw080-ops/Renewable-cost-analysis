import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  _resetBackendCache,
  currentBackend,
  deleteScenario,
  listScenarios,
  parseStored,
  saveScenario,
} from "./scenarios";
import { DEFAULT_SCENARIO } from "@/lib/defaults";

describe("parseStored (직렬화 파싱)", () => {
  it("null/빈/깨진 입력 → 빈 배열", () => {
    expect(parseStored(null)).toEqual([]);
    expect(parseStored("")).toEqual([]);
    expect(parseStored("{not json")).toEqual([]);
    expect(parseStored('{"a":1}')).toEqual([]); // 배열 아님
  });
  it("정상 배열 파싱", () => {
    const v = parseStored('[{"id":"1","name":"a","input":{},"createdAt":"x"}]');
    expect(v).toHaveLength(1);
    expect(v[0].name).toBe("a");
  });
});

function mockWindowStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
    },
  });
}

describe("백엔드 선택 (GitHub 미설정 → localStorage)", () => {
  beforeEach(() => {
    _resetBackendCache();
    mockWindowStorage();
    // /api/scenarios → configured:false
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ configured: false, scenarios: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it("currentBackend = localStorage", async () => {
    expect(await currentBackend()).toBe("localStorage");
  });

  it("save → list → delete (localStorage)", async () => {
    const saved = await saveScenario("테스트안", DEFAULT_SCENARIO);
    expect(saved.id).toBeTruthy();
    const list = await listScenarios();
    expect(list).toHaveLength(1);
    expect(list[0].input.요금제).toBe(DEFAULT_SCENARIO.요금제);
    await deleteScenario(saved.id);
    expect(await listScenarios()).toHaveLength(0);
  });
});

describe("백엔드 선택 (GitHub 설정됨 → 서버 API)", () => {
  beforeEach(() => _resetBackendCache());
  afterEach(() => vi.unstubAllGlobals());

  it("configured:true 이면 서버 scenarios 반환", async () => {
    const server = [
      { id: "g1", name: "온라인안", input: DEFAULT_SCENARIO, createdAt: "2026-01-01" },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ configured: true, scenarios: server }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const list = await listScenarios();
    expect(await currentBackend()).toBe("github");
    expect(list).toEqual(server);
  });

  it("네트워크 실패 시 localStorage 폴백", async () => {
    mockWindowStorage();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network"); }));
    expect(await currentBackend()).toBe("localStorage");
  });
});
