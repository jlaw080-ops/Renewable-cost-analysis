// 계산 상수 (calculation-formulas.md 0.상수). 이전 앱 기준.

/** 부가세 계수 */
export const VAT = 1.1;
/** 전력산업기반기금 계수 */
export const POWER_FUND = 1.032;
/** 전기요금 가산 계수 (부가세 × 기금) — 절감(회피비용) 관점 가산 */
export const ELEC_GROSS = VAT * POWER_FUND;

/** 운전 시작 시각 09:00 고정 (시간대별 요금제 시간대 배분용) */
export const OPERATION_START_HOUR = 9;

/** 연료전지 기본 운전시간 (Input2) */
export const FC_DEFAULT_중간부하시간 = 18;
export const FC_DEFAULT_최대부하시간 = 6;

/** 경제성 기본값 */
export const DEFAULT_분석기간 = 20;
export const DEFAULT_할인율 = 0.05;
export const 최종평가_기간목록 = [5, 10, 15, 20] as const;
