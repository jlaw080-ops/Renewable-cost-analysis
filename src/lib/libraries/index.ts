// JSON 라이브러리 로더 + 접근자. data/*.json 을 타입으로 검증·노출한다.
// 코드에 수치를 박지 않고 JSON에서만 값을 읽기 위한 단일 진입점.

import usageJson from "@/data/용도라이브러리.json";
import electricityJson from "@/data/전기요금라이브러리.json";
import gasJson from "@/data/가스요금라이브러리.json";
import operationJson from "@/data/월별가동일라이브러리.json";
import fuelcellJson from "@/data/연료전지제품라이브러리.json";

import type {
  ElectricityLibrary,
  FuelCellLibrary,
  FuelCellProduct,
  GasLibrary,
  OperationLibrary,
  OperationProfile,
  Season,
  Tariff,
  UsageLibrary,
  UsageRow,
} from "@/types/libraries";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`[libraries] ${msg}`);
}

export const USAGE = usageJson as unknown as UsageLibrary;
export const ELECTRICITY = electricityJson as unknown as ElectricityLibrary;
export const GAS = gasJson as unknown as GasLibrary;
export const OPERATION = operationJson as unknown as OperationLibrary;
export const FUELCELLS = fuelcellJson as unknown as FuelCellLibrary;

// 가스 라이브러리 키 (구분명)
export const GAS_KEY_연료전지전용 = "연료전지전용";
export const GAS_KEY_일반용 = "일반용(영업1) 도시가스 요금";

// ── 용도 ──
export function getUsageRow(용도: string): UsageRow {
  const row = USAGE.데이터.find((r) => r.용도 === 용도);
  assert(row, `용도 '${용도}' 없음`);
  return row;
}
export function listUsages(): string[] {
  return USAGE.데이터.map((r) => r.용도);
}

// ── 전기요금 ──
export function getTariff(요금제: string): Tariff {
  const t = ELECTRICITY.요금제목록.find((r) => r.요금제 === 요금제);
  assert(t, `요금제 '${요금제}' 없음`);
  return t;
}
export function listTariffs(): Tariff[] {
  return ELECTRICITY.요금제목록;
}
/** 시간대별(일반용 을) 요금제 — 연료전지 발전수익 산정용 */
export function getTouTariff(): Extract<Tariff, { 방식: "시간대별" }> {
  const t = getTariff(ELECTRICITY.기본선택.연료전지_발전수익);
  assert(t.방식 === "시간대별", "연료전지_발전수익 요금제가 시간대별이 아님");
  return t;
}
/** 월(1~12)이 속한 계절 */
export function monthToSeason(month: number): Season {
  const s = ELECTRICITY.계절구분;
  if (s.여름철.includes(month)) return "여름철";
  if (s.겨울철.includes(month)) return "겨울철";
  if (s.봄가을철.includes(month)) return "봄가을철";
  throw new Error(`[libraries] 월 '${month}' 계절 미분류`);
}

// ── 가스요금 ──
export function getGasRate(구분: string): number {
  const r = GAS.find((g) => g.구분 === 구분);
  assert(r, `가스요금 구분 '${구분}' 없음`);
  return r.단가_원per_kW;
}

// ── 월별가동일 ──
export function getOperationProfile(운전유형: string): OperationProfile {
  const p = OPERATION[운전유형];
  assert(p, `운전유형 '${운전유형}' 없음`);
  assert(p.월별가동일.length === 12, `운전유형 '${운전유형}' 월별가동일 길이≠12`);
  return p;
}
export function listOperationTypes(): string[] {
  return Object.keys(OPERATION);
}
/** 달력일수(365일가동 기준) — 태양광 등 매일 발전 항목용 */
export function calendarDays(): number[] {
  return getOperationProfile("365일가동").월별가동일;
}

// ── 연료전지 ──
export function getFuelCellProduct(모델명: string): FuelCellProduct {
  const p = FUELCELLS.find((f) => f.모델명 === 모델명);
  assert(p, `연료전지 모델 '${모델명}' 없음`);
  return p;
}
export function listFuelCells(): FuelCellProduct[] {
  return FUELCELLS;
}
