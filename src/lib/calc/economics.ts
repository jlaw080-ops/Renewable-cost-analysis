// G. 경제성 평가 — calculation-formulas.md §G
import type { ScenarioInput } from "@/types/inputs";
import type {
  CashflowRow,
  EconomicsResult,
  FinalEvaluationRow,
} from "@/types/results";
import { getFuelCellProduct } from "@/lib/libraries";
import { 최종평가_기간목록 } from "./constants";

/** G-1. 초기투자비용 / 연간유지보수비용 (태양광 + 연료전지 sets) */
export function calcInvestment(input: ScenarioInput): {
  초기투자비용: number;
  연간유지보수비용: number;
} {
  const s = input.태양광;
  let 초기투자비용 = s.용량 * s.kW당설치단가;
  let 연간유지보수비용 = s.용량 * s.kW당유지비;

  for (const set of input.연료전지.sets) {
    const p = getFuelCellProduct(set.모델명);
    const 용량 = p.정격발전용량_kW * set.설치수량;
    초기투자비용 += 용량 * (p.kW당설치단가 ?? 0);
    연간유지보수비용 += 용량 * (p.kW당연간유지비용 ?? 0);
  }

  return { 초기투자비용, 연간유지보수비용 };
}

/** 순현금흐름 배열 [연도0..N]. y0 = −초기투자, y≥1 = 연간편익 − 연간유지 */
function buildNetFlows(
  연간편익: number,
  초기투자비용: number,
  연간유지보수비용: number,
  기간: number,
): number[] {
  const flows = [-초기투자비용];
  for (let n = 1; n <= 기간; n++) flows.push(연간편익 - 연간유지보수비용);
  return flows;
}

function npvOf(rate: number, flows: number[]): number {
  return flows.reduce((s, cf, n) => s + cf / Math.pow(1 + rate, n), 0);
}

/** IRR — 이분법. 부호가 바뀌지 않으면 null */
export function calcIRR(flows: number[]): number | null {
  let lo = -0.9999;
  let hi = 10;
  let fLo = npvOf(lo, flows);
  let fHi = npvOf(hi, flows);
  if (Number.isNaN(fLo) || Number.isNaN(fHi)) return null;
  if (fLo * fHi > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npvOf(mid, flows);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
      fHi = fMid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

/** 특정 기간에 대한 최종평가 (output4 한 행) */
function evaluate기간(
  기간: number,
  연간편익: number,
  초기투자비용: number,
  연간유지보수비용: number,
  할인율: number,
): FinalEvaluationRow {
  const 누적수익 = 연간편익 * 기간;
  const 누적유지보수비용 = 연간유지보수비용 * 기간;
  const 총비용 = 초기투자비용 + 누적유지보수비용;
  const flows = buildNetFlows(연간편익, 초기투자비용, 연간유지보수비용, 기간);

  return {
    기간,
    누적수익,
    누적유지보수비용,
    초기투자비용,
    총비용,
    ROI_초기투자:
      초기투자비용 === 0 ? 0 : ((누적수익 - 총비용) / 초기투자비용) * 100,
    ROI_총비용: 총비용 === 0 ? 0 : ((누적수익 - 총비용) / 총비용) * 100,
    NPV: npvOf(할인율, flows),
    IRR: calcIRR(flows),
  };
}

/**
 * G. 경제성 평가 본체 (순수 수치). 연도별 현금흐름 + 헤드라인 지표 + 최종평가(5/10/15/20).
 */
export function calcEconomics(params: {
  연간편익: number;
  초기투자비용: number;
  연간유지보수비용: number;
  분석기간: number;
  할인율: number;
}): EconomicsResult {
  const { 연간편익, 초기투자비용, 연간유지보수비용, 분석기간, 할인율 } = params;

  // G-2. 연도별 현금흐름
  const 연도별: CashflowRow[] = [];
  let 누적 = 0;
  for (let n = 0; n <= 분석기간; n++) {
    const 총수익 = n === 0 ? 0 : 연간편익;
    const 유지보수비용 = n === 0 ? 0 : 연간유지보수비용;
    const 순현금흐름 = n === 0 ? -초기투자비용 : 총수익 - 유지보수비용;
    누적 += 순현금흐름;
    연도별.push({
      연도: n,
      총수익,
      유지보수비용,
      순현금흐름,
      누적순현금흐름: 누적,
      할인순현금흐름: 순현금흐름 / Math.pow(1 + 할인율, n),
    });
  }

  // 단순투자회수기간 = 누적순현금흐름 ≥ 0 되는 최초 연도(n≥1)
  const 회수 = 연도별.find((r) => r.연도 >= 1 && r.누적순현금흐름 >= 0);
  const 단순투자회수기간 = 회수 ? 회수.연도 : null;

  // NPV / IRR (분석기간 기준)
  const flows = buildNetFlows(연간편익, 초기투자비용, 연간유지보수비용, 분석기간);
  const NPV = npvOf(할인율, flows);
  const IRR = calcIRR(flows);

  // B/C = 편익현재가치 / 비용현재가치
  let 편익PV = 0;
  let 유지PV = 0;
  for (let n = 1; n <= 분석기간; n++) {
    const disc = Math.pow(1 + 할인율, n);
    편익PV += 연간편익 / disc;
    유지PV += 연간유지보수비용 / disc;
  }
  const 비용PV = 초기투자비용 + 유지PV;
  const BC = 비용PV === 0 ? 0 : 편익PV / 비용PV;

  // G-3. 최종평가 (5/10/15/20년)
  const 최종평가 = 최종평가_기간목록.map((기간) =>
    evaluate기간(기간, 연간편익, 초기투자비용, 연간유지보수비용, 할인율),
  );

  return {
    초기투자비용,
    연간유지보수비용,
    연간편익,
    연도별,
    단순투자회수기간,
    NPV,
    IRR,
    BC,
    최종평가,
  };
}
