// B. 연간 에너지요금 기준선 — calculation-formulas.md §B
import type { ScenarioInput } from "@/types/inputs";
import type { ConsumptionResult, EnergyBillResult, MonthlyBillRow } from "@/types/results";
import type { Tariff } from "@/types/libraries";
import {
  GAS_KEY_일반용,
  getGasRate,
  getOperationProfile,
  getTariff,
  monthToSeason,
} from "@/lib/libraries";
import { ELEC_GROSS, OPERATION_START_HOUR } from "./constants";

/** B-1. 기본요금 = 계약전력 × 기본요금단가 × 12 */
export function calc기본요금(계약전력: number, tariff: Tariff): number {
  return 계약전력 * tariff.기본요금_원per_kW * 12;
}

/** 월별 사용량(kWh) = 총사용량 × 월별가동일 / 연간가동일 */
export function calc월별사용량(총_연간_전력사용량: number, 연간운전유형: string): number[] {
  const op = getOperationProfile(연간운전유형);
  return op.월별가동일.map((d) => (총_연간_전력사용량 * d) / op.연간가동일);
}

/**
 * 시간대별 요금제: 09:00 시작 기준 운전시각을 경/중/최부하로 분류.
 * 운전시각집합 = {(시작 + k) mod 24 | k=0..일간사용시간-1}. ≥24면 0~23 전체.
 */
export function classifyHours(
  tariff: Extract<Tariff, { 방식: "시간대별" }>,
  일간사용시간: number,
  startHour = OPERATION_START_HOUR,
): { 경부하: number; 중간부하: number; 최대부하: number } {
  const n = Math.min(Math.max(Math.floor(일간사용시간), 0), 24);
  const hours = new Set<number>();
  for (let k = 0; k < n; k++) hours.add((startHour + k) % 24);

  const count = (arr: number[]) =>
    [...hours].filter((h) => arr.includes(h)).length;

  return {
    경부하: count(tariff.시간대구분.경부하),
    중간부하: count(tariff.시간대구분.중간부하),
    최대부하: count(tariff.시간대구분.최대부하),
  };
}

/** B-2. 사용량요금 (월별) — 요금제 방식에 따라 분기 */
export function calc월별사용량요금(
  월별사용량: number[],
  tariff: Tariff,
  일간사용시간: number,
): MonthlyBillRow[] {
  if (tariff.방식 === "계절별") {
    return 월별사용량.map((사용량, i) => {
      const 월 = i + 1;
      const 단가 = tariff.계절단가[monthToSeason(월)];
      return { 월, 사용량, 사용량요금: 사용량 * 단가 };
    });
  }

  // 시간대별
  const cls = classifyHours(tariff, 일간사용시간);
  const denom = cls.경부하 + cls.중간부하 + cls.최대부하 || 1;
  return 월별사용량.map((사용량, i) => {
    const 월 = i + 1;
    const rate = tariff.데이터.find((d) => d.월 === 월);
    if (!rate) throw new Error(`[energy-bill] 월 ${월} 시간대 단가 없음`);
    const 경 = (사용량 * cls.경부하) / denom;
    const 중 = (사용량 * cls.중간부하) / denom;
    const 최 = (사용량 * cls.최대부하) / denom;
    const 사용량요금 =
      경 * rate.경부하 + 중 * rate.중간부하 + 최 * rate.최대부하;
    return { 월, 사용량, 사용량요금 };
  });
}

/** B-4. 가스요금 기준선 = 총가스사용량 × 일반용 단가 (부가세 미적용, D와 대칭) */
export function calc가스요금기준선(총_연간_가스사용량: number): number {
  return 총_연간_가스사용량 * getGasRate(GAS_KEY_일반용);
}

/** B. 에너지요금 기준선 전체 */
export function calcEnergyBill(
  consumption: ConsumptionResult,
  input: ScenarioInput,
): EnergyBillResult {
  const tariff = getTariff(input.요금제);
  const 연간_기본요금 = calc기본요금(input.계약전력, tariff);
  const 월별사용량 = calc월별사용량(
    consumption.총_연간_전력사용량,
    input.연간운전유형,
  );
  const 월별 = calc월별사용량요금(월별사용량, tariff, input.일간사용시간);
  const 연간_사용량요금 = 월별.reduce((s, m) => s + m.사용량요금, 0);
  const 연간_전기요금 = (연간_기본요금 + 연간_사용량요금) * ELEC_GROSS;
  const 연간_가스요금 = calc가스요금기준선(consumption.총_연간_가스사용량);

  return {
    연간_기본요금,
    월별,
    연간_사용량요금,
    연간_전기요금,
    연간_가스요금,
    연간_총에너지요금: 연간_전기요금 + 연간_가스요금,
  };
}
