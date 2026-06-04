// C/D/E. 신재생 도입 절감 — calculation-formulas.md §C-합계, §D, §E
// 전력요금 절감과 가스요금 절감을 항상 분리 산출한다.
import type {
  EnergyBillResult,
  FuelCellResult,
  SavingsResult,
  SolarResult,
} from "@/types/results";

function pct(part: number, base: number): number {
  return base === 0 ? 0 : (part / base) * 100;
}

export function calcSavings(
  bill: EnergyBillResult,
  solar: SolarResult,
  fuelcell: FuelCellResult,
): SavingsResult {
  // C. 전력요금 절감
  const 태양광_전력요금절감 = solar.전력요금절감;
  const 연료전지_발전수익 = fuelcell.발전_연간총수익;
  const 전력요금_절감합계 = 태양광_전력요금절감 + 연료전지_발전수익;

  // D. 가스요금 절감 (열생산수익 − 도시가스사용요금)
  const 연료전지_열생산수익 = fuelcell.열생산_연간총수익;
  const 연료전지_도시가스사용요금 = fuelcell.연간_도시가스사용요금;
  const 가스요금_절감합계 = 연료전지_열생산수익 - 연료전지_도시가스사용요금;

  // E. 총 효과
  const 연간_총절감액 = 전력요금_절감합계 + 가스요금_절감합계;

  return {
    태양광_전력요금절감,
    연료전지_발전수익,
    전력요금_절감합계,
    연료전지_열생산수익,
    연료전지_도시가스사용요금,
    가스요금_절감합계,
    연간_총절감액,
    전력_절감률: pct(전력요금_절감합계, bill.연간_전기요금),
    가스_절감률: pct(가스요금_절감합계, bill.연간_가스요금),
    총_절감률: pct(연간_총절감액, bill.연간_총에너지요금),
  };
}
