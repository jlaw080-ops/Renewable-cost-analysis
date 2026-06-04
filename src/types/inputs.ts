// 사용자 입력(검토안). DB에는 이 객체만 저장하고, 불러올 때 재계산한다.
// calculation-formulas.md "0. 입력값" 기준.

export interface UsageEntry {
  용도: string; // 용도라이브러리 키
  연면적: number; // m²
}

export interface SolarInput {
  용량: number; // kW
  일간발전시간: number; // h
  kW당설치단가: number; // 원/kW
  kW당유지비: number; // 원/kW·yr
}

export interface FuelCellSet {
  모델명: string; // 연료전지제품라이브러리 모델명
  설치수량: number;
}

export interface FuelCellInput {
  sets: FuelCellSet[];
  일일_중간부하_운전시간: number; // 기본 18
  일일_최대부하_운전시간: number; // 기본 6
}

export interface EconomicsInput {
  분석기간: number; // 년 (기본 20)
  할인율: number; // 비율 (0.05 = 5%)
}

export interface ScenarioInput {
  /** 검토안 이름 (저장/불러오기용) */
  이름?: string;
  uses: UsageEntry[];
  /** 전기요금라이브러리 요금제명 (건물 소비 기준선) */
  요금제: string;
  계약전력: number; // kW
  연간운전유형: string; // 월별가동일라이브러리 키
  일간사용시간: number; // h (시간대별 요금제일 때만 사용)
  태양광: SolarInput;
  연료전지: FuelCellInput;
  경제성: EconomicsInput;
}
