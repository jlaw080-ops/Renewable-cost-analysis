// F. 연료전지 산출 (output1/output2) — calculation-formulas.md §F
// ⚠️ 이전 "연료전지 경제성 평가 앱" 로직 이식. 수식·계수를 변경하지 말 것.
import type { FuelCellInput } from "@/types/inputs";
import type {
  FuelCellMonthlyProduction,
  FuelCellMonthlyRevenue,
  FuelCellResult,
} from "@/types/results";
import {
  GAS_KEY_연료전지전용,
  GAS_KEY_일반용,
  getFuelCellProduct,
  getGasRate,
  getOperationProfile,
  getTouTariff,
} from "@/lib/libraries";
import { ELEC_GROSS } from "./constants";

/**
 * 연료전지 월별 생산량/수익. 전력 수익은 시간대별(일반용 을) 단가로 산정(이전 앱 동일).
 */
export function calcFuelCell(
  input: FuelCellInput,
  연간운전유형: string,
): FuelCellResult {
  const products = input.sets.map((s) => ({
    p: getFuelCellProduct(s.모델명),
    n: s.설치수량,
  }));

  const 총설치용량_kW = products.reduce(
    (sum, { p, n }) => sum + p.정격발전용량_kW * n,
    0,
  );
  const 총열생산용량_kW = products.reduce(
    (sum, { p, n }) => sum + (p.열생산용량_kW ?? 0) * n,
    0,
  );
  const 총가스소비_kW = products.reduce(
    (sum, { p, n }) => sum + (p.가스소비량_kW ?? 0) * n,
    0,
  );

  const op = getOperationProfile(연간운전유형);
  const tou = getTouTariff();
  const 기본요금단가 = tou.기본요금_원per_kW;
  const 일반용단가 = getGasRate(GAS_KEY_일반용);
  const 연료전지전용단가 = getGasRate(GAS_KEY_연료전지전용);

  const 중간시간 = input.일일_중간부하_운전시간;
  const 최대시간 = input.일일_최대부하_운전시간;
  const 운전시간합 = 중간시간 + 최대시간;

  const output1: FuelCellMonthlyProduction[] = [];
  const output2: FuelCellMonthlyRevenue[] = [];

  for (let i = 0; i < 12; i++) {
    const 월 = i + 1;
    const 일수 = op.월별가동일[i];

    const 월간_중간부하시간_전력생산량_kWh = 총설치용량_kW * 중간시간 * 일수;
    const 월간_최대부하시간_전력생산량_kWh = 총설치용량_kW * 최대시간 * 일수;
    const 월간_연료전지_열생산량_kWh = 총열생산용량_kW * 운전시간합 * 일수;
    const 월간_도시가스사용량_kWh = 총가스소비_kW * 운전시간합 * 일수;

    output1.push({
      월,
      일수,
      계약용량_kW: 총설치용량_kW,
      월간_중간부하시간_전력생산량_kWh,
      월간_최대부하시간_전력생산량_kWh,
      월간_연료전지_열생산량_kWh,
      월간_도시가스사용량_kWh,
    });

    const rate = tou.데이터[i];
    const 발전_월간총수익_원 =
      (총설치용량_kW * 기본요금단가 +
        월간_중간부하시간_전력생산량_kWh * rate.중간부하 +
        월간_최대부하시간_전력생산량_kWh * rate.최대부하) *
      ELEC_GROSS;
    const 열생산_월간총수익_원 = 월간_연료전지_열생산량_kWh * 일반용단가;
    const 도시가스사용요금_원 = 월간_도시가스사용량_kWh * 연료전지전용단가;
    const 에너지생산_최종수익_원 =
      발전_월간총수익_원 + 열생산_월간총수익_원 - 도시가스사용요금_원;

    output2.push({
      월,
      발전_월간총수익_원,
      열생산_월간총수익_원,
      도시가스사용요금_원,
      에너지생산_최종수익_원,
    });
  }

  return {
    총설치용량_kW,
    output1,
    output2,
    발전_연간총수익: output2.reduce((s, r) => s + r.발전_월간총수익_원, 0),
    열생산_연간총수익: output2.reduce((s, r) => s + r.열생산_월간총수익_원, 0),
    연간_도시가스사용요금: output2.reduce((s, r) => s + r.도시가스사용요금_원, 0),
  };
}
