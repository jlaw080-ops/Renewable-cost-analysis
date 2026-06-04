import { describe, expect, it } from "vitest";
import {
  calc가스요금기준선,
  calc기본요금,
  calc월별사용량,
  calc월별사용량요금,
  calcEnergyBill,
  classifyHours,
} from "./energy-bill";
import { getTariff, getTouTariff } from "@/lib/libraries";
import type { ConsumptionResult } from "@/types/results";
import type { ScenarioInput } from "@/types/inputs";

const 갑 = getTariff("일반용(갑)Ⅰ 고압A 선택Ⅱ"); // 계절별, 기본 8230
const 을 = getTouTariff(); // 시간대별, 기본 8320

describe("B-1. 기본요금", () => {
  it("계약전력 × 단가 × 12", () => {
    expect(calc기본요금(100, 갑)).toBe(100 * 8230 * 12); // 9,876,000
  });
});

describe("B-2. 월별 사용량 분배 (365000kWh, 365일가동 → 1000×일수)", () => {
  it("월별 = 총사용량 × 가동일 / 연간가동일", () => {
    const m = calc월별사용량(365000, "365일가동");
    expect(m[0]).toBeCloseTo(31000, 6); // 1월 31일
    expect(m[1]).toBeCloseTo(28000, 6); // 2월 28일
    expect(m.reduce((s, x) => s + x, 0)).toBeCloseTo(365000, 6);
  });
});

describe("시간대 분류 (09:00 시작)", () => {
  it("10시간: 경0 중4 최6", () => {
    expect(classifyHours(을, 10)).toEqual({ 경부하: 0, 중간부하: 4, 최대부하: 6 });
  });
  it("24시간: 경10 중8 최6 (배열 전체)", () => {
    expect(classifyHours(을, 24)).toEqual({ 경부하: 10, 중간부하: 8, 최대부하: 6 });
  });
});

describe("B-2 계절별 사용량요금 (365000kWh, 365일가동)", () => {
  it("연간 사용량요금 = Σ(1000×일수 × 계절단가) = 42,179,100", () => {
    const m = calc월별사용량(365000, "365일가동");
    const rows = calc월별사용량요금(m, 갑, 0);
    const 연간 = rows.reduce((s, r) => s + r.사용량요금, 0);
    expect(연간).toBeCloseTo(42179100, 2);
  });
});

describe("B-2 시간대별 사용량요금 (월1 검증, 24h 운전)", () => {
  it("1월 사용량요금 ≈ 4,202,566.67", () => {
    const m = calc월별사용량(365000, "365일가동"); // 1월 31000
    const rows = calc월별사용량요금(m, 을, 24); // 경10 중8 최6
    // 31000×(10/24)×94.3 + ×(8/24)×140.4 + ×(6/24)×197.9
    expect(rows[0].사용량요금).toBeCloseTo(4202566.67, 1);
  });
});

describe("B-4 가스요금 기준선", () => {
  it("총가스 × 일반용 단가(5.3072)", () => {
    expect(calc가스요금기준선(100000)).toBeCloseTo(530720, 4);
  });
});

describe("B 전체 (계절별, 부가세·기금 가산)", () => {
  it("연간_전기요금 = (기본+사용량)×1.1×1.032", () => {
    const consumption: ConsumptionResult = {
      perUse: [],
      총_연간_전력사용량: 365000,
      총_연간_가스사용량: 100000,
    };
    const input = {
      uses: [],
      요금제: "일반용(갑)Ⅰ 고압A 선택Ⅱ",
      계약전력: 100,
      연간운전유형: "365일가동",
      일간사용시간: 0,
    } as ScenarioInput;
    const r = calcEnergyBill(consumption, input);
    // (9,876,000 + 42,179,100) × 1.1352 = 59,092,949.52
    expect(r.연간_전기요금).toBeCloseTo(59092949.52, 1);
    expect(r.연간_가스요금).toBeCloseTo(530720, 4);
    expect(r.연간_총에너지요금).toBeCloseTo(59092949.52 + 530720, 1);
  });
});
