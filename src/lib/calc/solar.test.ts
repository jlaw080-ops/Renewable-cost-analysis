import { describe, expect, it } from "vitest";
import { calcSolar } from "./solar";

describe("C-1. 태양광 calcSolar", () => {
  it("100kW × 3.5h → 일 350kWh, 연 127,750kWh", () => {
    const r = calcSolar({
      용량: 100,
      일간발전시간: 3.5,
      kW당설치단가: 0,
      kW당유지비: 0,
    });
    expect(r.연간_발전량).toBeCloseTo(127750, 4); // 350 × 365
    expect(r.월간_발전량[0]).toBeCloseTo(350 * 31, 4); // 1월
  });

  it("전력요금절감 = Σ 월간발전량 × 월별 최대부하단가 = 22,993,635", () => {
    const r = calcSolar({
      용량: 100,
      일간발전시간: 3.5,
      kW당설치단가: 0,
      kW당유지비: 0,
    });
    expect(r.전력요금절감).toBeCloseTo(22993635, 2);
  });

  it("용량 0 → 발전·절감 0", () => {
    const r = calcSolar({ 용량: 0, 일간발전시간: 3.5, kW당설치단가: 0, kW당유지비: 0 });
    expect(r.연간_발전량).toBe(0);
    expect(r.전력요금절감).toBe(0);
  });
});
