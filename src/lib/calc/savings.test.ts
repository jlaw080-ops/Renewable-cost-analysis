import { describe, expect, it } from "vitest";
import { calcSavings } from "./savings";
import type {
  EnergyBillResult,
  FuelCellResult,
  SolarResult,
} from "@/types/results";

const bill = {
  연간_기본요금: 0,
  월별: [],
  연간_사용량요금: 0,
  연간_전기요금: 100,
  연간_가스요금: 50,
  연간_총에너지요금: 150,
} as EnergyBillResult;

const solar = { 월간_발전량: [], 연간_발전량: 0, 전력요금절감: 20 } as SolarResult;

const fuelcell = {
  총설치용량_kW: 0,
  output1: [],
  output2: [],
  발전_연간총수익: 10,
  열생산_연간총수익: 30,
  연간_도시가스사용요금: 5,
} as FuelCellResult;

describe("E. 절감 calcSavings", () => {
  const r = calcSavings(bill, solar, fuelcell);

  it("전력 절감 = 태양광 + 연료전지발전 (분리)", () => {
    expect(r.태양광_전력요금절감).toBe(20);
    expect(r.연료전지_발전수익).toBe(10);
    expect(r.전력요금_절감합계).toBe(30);
  });

  it("가스 절감 = 열생산수익 − 도시가스사용요금", () => {
    expect(r.가스요금_절감합계).toBe(25); // 30 − 5
  });

  it("총 절감액 = 전력 + 가스", () => {
    expect(r.연간_총절감액).toBe(55);
  });

  it("절감률 (전력/가스/총)", () => {
    expect(r.전력_절감률).toBeCloseTo(30, 6); // 30/100
    expect(r.가스_절감률).toBeCloseTo(50, 6); // 25/50
    expect(r.총_절감률).toBeCloseTo(36.6667, 3); // 55/150
  });

  it("기준선 0이면 절감률 0 (divide guard)", () => {
    const r0 = calcSavings(
      { ...bill, 연간_전기요금: 0, 연간_가스요금: 0, 연간_총에너지요금: 0 },
      solar,
      fuelcell,
    );
    expect(r0.전력_절감률).toBe(0);
    expect(r0.총_절감률).toBe(0);
  });
});
