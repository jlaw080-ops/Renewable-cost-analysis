// 계산 체인 오케스트레이터: 입력 → 전체 결과. (부수효과 없음)
import type { ScenarioInput } from "@/types/inputs";
import type { FeasibilityResult } from "@/types/results";
import { calcConsumption } from "./consumption";
import { calcEnergyBill } from "./energy-bill";
import { calcSolar } from "./solar";
import { calcFuelCell } from "./fuelcell";
import { calcSavings } from "./savings";
import { calcEconomics, calcInvestment } from "./economics";

export function calcFeasibility(input: ScenarioInput): FeasibilityResult {
  const consumption = calcConsumption(input.uses);
  const bill = calcEnergyBill(consumption, input);
  const solar = calcSolar(input.태양광);
  const fuelcell = calcFuelCell(input.연료전지, input.연간운전유형);
  const savings = calcSavings(bill, solar, fuelcell);

  const { 초기투자비용, 연간유지보수비용 } = calcInvestment(input);
  const economics = calcEconomics({
    연간편익: savings.연간_총절감액,
    초기투자비용,
    연간유지보수비용,
    분석기간: input.경제성.분석기간,
    할인율: input.경제성.할인율,
  });

  return { consumption, bill, solar, fuelcell, savings, economics };
}

export * from "./consumption";
export * from "./energy-bill";
export * from "./solar";
export * from "./fuelcell";
export * from "./savings";
export * from "./economics";
