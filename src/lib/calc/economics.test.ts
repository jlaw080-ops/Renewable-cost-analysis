import { describe, expect, it } from "vitest";
import { calcEconomics, calcInvestment, calcIRR } from "./economics";
import type { ScenarioInput } from "@/types/inputs";

describe("G-1. 투자비/유지비 calcInvestment", () => {
  it("태양광 + 연료전지 sets 합산", () => {
    const input = {
      태양광: { 용량: 100, 일간발전시간: 3.5, kW당설치단가: 1_000_000, kW당유지비: 10_000 },
      연료전지: {
        sets: [{ 모델명: "BNH050", 설치수량: 10 }], // 정격5×10=50kW, 설치1천만/유지220만
        일일_중간부하_운전시간: 18,
        일일_최대부하_운전시간: 6,
      },
    } as ScenarioInput;
    const r = calcInvestment(input);
    // 태양광 100×1e6=1e8 + 연료전지 50×1e7=5e8 = 6e8
    expect(r.초기투자비용).toBe(600_000_000);
    // 태양광 100×1e4=1e6 + 연료전지 50×2.2e6=1.1e8 = 1.11e8
    expect(r.연간유지보수비용).toBe(111_000_000);
  });
});

describe("G. 현금흐름/NPV/IRR/회수 (편익300, 투자1000, 유지100, 5년, 10%)", () => {
  const r = calcEconomics({
    연간편익: 300,
    초기투자비용: 1000,
    연간유지보수비용: 100,
    분석기간: 5,
    할인율: 0.1,
  });

  it("연도별 순현금흐름·누적", () => {
    expect(r.연도별[0].순현금흐름).toBe(-1000);
    expect(r.연도별[1].순현금흐름).toBe(200); // 300−100
    expect(r.연도별[5].누적순현금흐름).toBeCloseTo(0, 6); // −1000 + 200×5
  });

  it("단순투자회수기간 = 5년", () => {
    expect(r.단순투자회수기간).toBe(5);
  });

  it("NPV(5년,10%) ≈ −241.84", () => {
    expect(r.NPV).toBeCloseTo(-241.8426, 3);
  });

  it("IRR ≈ 0 (편익=투자 회수, 순흐름합 0)", () => {
    expect(r.IRR).not.toBeNull();
    expect(r.IRR as number).toBeCloseTo(0, 4);
  });

  it("B/C ≈ 0.8246", () => {
    expect(r.BC).toBeCloseTo(0.824636, 4);
  });

  it("최종평가 기간=5: ROI 0, 총비용 1500", () => {
    const row = r.최종평가.find((x) => x.기간 === 5)!;
    expect(row.총비용).toBe(1500);
    expect(row.ROI_초기투자).toBeCloseTo(0, 6);
    expect(row.ROI_총비용).toBeCloseTo(0, 6);
    expect(row.NPV).toBeCloseTo(-241.8426, 3);
  });

  it("최종평가는 5/10/15/20 4행", () => {
    expect(r.최종평가.map((x) => x.기간)).toEqual([5, 10, 15, 20]);
  });
});

describe("G. 회수 불가/IRR 없음 (편익<유지)", () => {
  it("연간 순흐름 음수 → 회수 null, IRR null", () => {
    const r = calcEconomics({
      연간편익: 50,
      초기투자비용: 1000,
      연간유지보수비용: 100,
      분석기간: 20,
      할인율: 0.05,
    });
    expect(r.단순투자회수기간).toBeNull();
    expect(r.IRR).toBeNull();
  });
});

describe("calcIRR 단독: [-1000, 600, 600] → IRR≈13.07%", () => {
  it("두 기간 회수", () => {
    // 600/(1+r) + 600/(1+r)^2 = 1000
    const irr = calcIRR([-1000, 600, 600]);
    expect(irr).not.toBeNull();
    expect(irr as number).toBeCloseTo(0.130662, 4);
  });
});
