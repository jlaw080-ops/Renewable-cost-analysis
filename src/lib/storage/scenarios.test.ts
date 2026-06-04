import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteScenario,
  listScenarios,
  parseStored,
  saveScenario,
  storageBackend,
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

describe("localStorage 폴백 라운드트립", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, v),
        removeItem: (k: string) => store.delete(k),
      },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("env 없으면 localStorage 백엔드", () => {
    expect(storageBackend()).toBe("localStorage");
  });

  it("save → list → delete", async () => {
    const saved = await saveScenario("테스트안", DEFAULT_SCENARIO);
    expect(saved.id).toBeTruthy();

    const list = await listScenarios();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("테스트안");
    expect(list[0].input.요금제).toBe(DEFAULT_SCENARIO.요금제);

    await deleteScenario(saved.id);
    expect(await listScenarios()).toHaveLength(0);
  });
});
