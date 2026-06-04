// JSON 라이브러리(src/data/*.json)의 타입 정의. 실제 파일 형식과 1:1 대응.

// ── 용도라이브러리 ──
export interface UsageRow {
  용도: string;
  전력원단위: number; // kWh/m²·yr
  도시가스원단위: number; // kWh/m²·yr
}
export interface UsageLibrary {
  단위: string;
  데이터: UsageRow[];
}

// ── 전기요금라이브러리 ──
export type Season = "여름철" | "봄가을철" | "겨울철";

export interface SeasonMap {
  여름철: number[];
  봄가을철: number[];
  겨울철: number[];
}

/** 방식="계절별" (일반용 갑): 월이 속한 계절 단가 적용 */
export interface SeasonalTariff {
  요금제: string;
  적용: string;
  방식: "계절별";
  기본요금_원per_kW: number;
  단위: string;
  계절단가: Record<Season, number>;
}

export interface TouMonthRate {
  월: number;
  경부하: number;
  중간부하: number;
  최대부하: number;
}

/** 방식="시간대별" (일반용 을): 경/중/최부하 시간대 배분 후 월별 단가 적용 */
export interface TouTariff {
  요금제: string;
  적용: string;
  방식: "시간대별";
  기본요금_원per_kW: number;
  단위: string;
  시간대구분: {
    경부하: number[];
    중간부하: number[];
    최대부하: number[];
  };
  데이터: TouMonthRate[];
}

export type Tariff = SeasonalTariff | TouTariff;

export interface ElectricityLibrary {
  계절구분: SeasonMap;
  기본선택: {
    건물소비_기준선: string;
    연료전지_발전수익: string;
  };
  요금제목록: Tariff[];
}

// ── 가스요금라이브러리 ──
export interface GasRate {
  구분: string;
  단가_원per_kW: number;
}
export type GasLibrary = GasRate[];

// ── 월별가동일라이브러리 ──
export interface OperationProfile {
  연간가동일: number;
  월별가동일: number[]; // 길이 12
}
export type OperationLibrary = Record<string, OperationProfile>;

// ── 연료전지제품라이브러리 ──
export interface FuelCellProduct {
  형식: string;
  제조사: string;
  모델명: string | null;
  정격발전용량_kW: number;
  열생산용량_kW: number | null;
  가스소비량_kW: number | null;
  발전효율: number;
  열회수효율: number | null;
  kW당설치단가: number | null;
  kW당연간유지비용: number | null;
}
export type FuelCellLibrary = FuelCellProduct[];
