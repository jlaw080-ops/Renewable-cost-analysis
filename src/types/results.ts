// 계산 결과 타입. calculation-formulas.md A~G 산출물에 대응.
// 결과는 저장하지 않고 입력값에서 매번 파생 계산한다.

// ── A. 소비량 ──
export interface ConsumptionPerUse {
  용도: string;
  연간_전력사용량: number; // kWh
  연간_가스사용량: number; // kWh
}
export interface ConsumptionResult {
  perUse: ConsumptionPerUse[];
  총_연간_전력사용량: number; // kWh
  총_연간_가스사용량: number; // kWh
}

// ── B. 에너지요금 기준선 ──
export interface MonthlyBillRow {
  월: number;
  사용량: number; // kWh
  사용량요금: number; // 원 (부가세·기금 가산 전)
}
export interface EnergyBillResult {
  연간_기본요금: number; // 원
  월별: MonthlyBillRow[];
  연간_사용량요금: number; // 원
  연간_전기요금: number; // 원 (×1.1×1.032 가산 후)
  연간_가스요금: number; // 원
  연간_총에너지요금: number; // 원
}

// ── C-1. 태양광 ──
export interface SolarResult {
  월간_발전량: number[]; // 길이 12, kWh
  연간_발전량: number; // kWh
  전력요금절감: number; // 원
}

// ── F. 연료전지 (output1/output2) ──
export interface FuelCellMonthlyProduction {
  월: number;
  일수: number;
  계약용량_kW: number;
  월간_중간부하시간_전력생산량_kWh: number;
  월간_최대부하시간_전력생산량_kWh: number;
  월간_연료전지_열생산량_kWh: number;
  월간_도시가스사용량_kWh: number;
}
export interface FuelCellMonthlyRevenue {
  월: number;
  발전_월간총수익_원: number;
  열생산_월간총수익_원: number;
  도시가스사용요금_원: number;
  에너지생산_최종수익_원: number;
}
export interface FuelCellResult {
  총설치용량_kW: number;
  output1: FuelCellMonthlyProduction[];
  output2: FuelCellMonthlyRevenue[];
  발전_연간총수익: number; // 원
  열생산_연간총수익: number; // 원
  연간_도시가스사용요금: number; // 원
}

// ── E. 절감 ──
export interface SavingsResult {
  태양광_전력요금절감: number;
  연료전지_발전수익: number;
  전력요금_절감합계: number;
  연료전지_열생산수익: number;
  연료전지_도시가스사용요금: number;
  가스요금_절감합계: number;
  연간_총절감액: number;
  전력_절감률: number; // %
  가스_절감률: number; // %
  총_절감률: number; // %
}

// ── G. 경제성 ──
export interface CashflowRow {
  연도: number;
  총수익: number;
  유지보수비용: number;
  순현금흐름: number;
  누적순현금흐름: number;
  할인순현금흐름: number;
}
export interface FinalEvaluationRow {
  기간: number; // 년
  누적수익: number;
  누적유지보수비용: number;
  초기투자비용: number;
  총비용: number;
  ROI_초기투자: number; // %
  ROI_총비용: number; // %
  NPV: number;
  IRR: number | null; // 비율, 수렴 실패 시 null
}
export interface EconomicsResult {
  초기투자비용: number;
  연간유지보수비용: number;
  연간편익: number;
  연도별: CashflowRow[];
  단순투자회수기간: number | null; // 년, 회수 불가 시 null
  NPV: number; // 분석기간 기준
  IRR: number | null;
  BC: number;
  최종평가: FinalEvaluationRow[];
}

// ── 전체 결과 ──
export interface FeasibilityResult {
  consumption: ConsumptionResult;
  bill: EnergyBillResult;
  solar: SolarResult;
  fuelcell: FuelCellResult;
  savings: SavingsResult;
  economics: EconomicsResult;
}
