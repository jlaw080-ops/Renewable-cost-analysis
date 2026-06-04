import { describe, expect, it } from "vitest";
import { calcFuelCell } from "./fuelcell";
import type { FuelCellInput } from "@/types/inputs";

// BNH050: 정격5, 열생산8, 가스소비13.6. ×10대 → 총50kW, 열80, 가스136.
// 365일가동, 중간18/최대6 (합24).
const base: FuelCellInput = {
  sets: [{ 모델명: "BNH050", 설치수량: 10 }],
  일일_중간부하_운전시간: 18,
  일일_최대부하_운전시간: 6,
};

describe("F. 연료전지 output1 (월별 생산량)", () => {
  const r = calcFuelCell(base, "365일가동");

  it("총설치용량 = Σ(정격 × 수량)", () => {
    expect(r.총설치용량_kW).toBe(50);
  });

  it("1월(31일) 생산량", () => {
    const m = r.output1[0];
    expect(m.월간_중간부하시간_전력생산량_kWh).toBe(50 * 18 * 31); // 27,900
    expect(m.월간_최대부하시간_전력생산량_kWh).toBe(50 * 6 * 31); // 9,300
    expect(m.월간_연료전지_열생산량_kWh).toBe(80 * 24 * 31); // 59,520
    expect(m.월간_도시가스사용량_kWh).toBe(136 * 24 * 31); // 101,184
  });

  it("연간 생산량 합계", () => {
    const sum = (k: keyof (typeof r.output1)[number]) =>
      r.output1.reduce((s, m) => s + (m[k] as number), 0);
    expect(sum("월간_중간부하시간_전력생산량_kWh")).toBe(50 * 18 * 365); // 328,500
    expect(sum("월간_최대부하시간_전력생산량_kWh")).toBe(50 * 6 * 365); // 109,500
    expect(sum("월간_연료전지_열생산량_kWh")).toBe(80 * 24 * 365); // 700,800
    expect(sum("월간_도시가스사용량_kWh")).toBe(136 * 24 * 365); // 1,191,360
  });
});

describe("F. 연료전지 output2 (월별 수익) + 연간 합계", () => {
  const r = calcFuelCell(base, "365일가동");

  it("1월 발전 월간총수익 = (50×8320 + 27900×140.4 + 9300×197.9)×1.1352", () => {
    expect(r.output2[0].발전_월간총수익_원).toBeCloseTo(7008304.776, 2);
  });

  it("1월 에너지생산 최종수익", () => {
    // 발전 7,008,304.776 + 열생산 59520×5.3072 − 도시가스 101184×4.01154
    expect(r.output2[0].에너지생산_최종수익_원).toBeCloseTo(6918285.657, 1);
  });

  it("발전_연간총수익 = 75,595,295.16", () => {
    expect(r.발전_연간총수익).toBeCloseTo(75595295.16, 1);
  });

  it("열생산_연간총수익 = 700,800 × 5.3072 = 3,719,285.76", () => {
    expect(r.열생산_연간총수익).toBeCloseTo(3719285.76, 2);
  });

  it("연간_도시가스사용요금 = 1,191,360 × 4.01154 = 4,779,188.29", () => {
    expect(r.연간_도시가스사용요금).toBeCloseTo(4779188.2944, 2);
  });
});

describe("F. 열생산용량 null 모델은 열생산 0", () => {
  it("Doosan S300 (열생산 null) → 열생산수익 0", () => {
    const r = calcFuelCell(
      {
        sets: [{ 모델명: "Doosan S300", 설치수량: 1 }],
        일일_중간부하_운전시간: 18,
        일일_최대부하_운전시간: 6,
      },
      "365일가동",
    );
    expect(r.열생산_연간총수익).toBe(0);
  });
});
