import { describe, expect, it } from "vitest";
import { calcConsumption } from "./consumption";

describe("A. 소비량 calcConsumption", () => {
  it("단일 용도: 연면적 × 원단위", () => {
    const r = calcConsumption([{ 용도: "업무", 연면적: 1000 }]);
    expect(r.총_연간_전력사용량).toBeCloseTo(76410, 6); // 1000 × 76.41
    expect(r.총_연간_가스사용량).toBeCloseTo(42800, 6); // 1000 × 42.8
  });

  it("복수 용도 합산", () => {
    const r = calcConsumption([
      { 용도: "업무", 연면적: 1000 },
      { 용도: "의료", 연면적: 500 },
    ]);
    // 전력: 76410 + 500×154.33=77165 → 153575
    expect(r.총_연간_전력사용량).toBeCloseTo(153575, 6);
    // 가스: 42800 + 500×82.11=41055 → 83855
    expect(r.총_연간_가스사용량).toBeCloseTo(83855, 6);
    expect(r.perUse).toHaveLength(2);
  });

  it("빈 입력은 0", () => {
    const r = calcConsumption([]);
    expect(r.총_연간_전력사용량).toBe(0);
    expect(r.총_연간_가스사용량).toBe(0);
  });
});
