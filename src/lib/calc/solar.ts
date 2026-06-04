// C-1. 태양광 발전량 → 전력요금 절감 — calculation-formulas.md §C-1
import type { SolarInput } from "@/types/inputs";
import type { SolarResult } from "@/types/results";
import { calendarDays, getTouTariff } from "@/lib/libraries";

/**
 * 태양광은 매일 발전 → 가동일이 아닌 달력일수 사용.
 * 절감 단가는 월별 최대부하단가(시간대별 요금제 데이터) 기준.
 */
export function calcSolar(input: SolarInput): SolarResult {
  const 일간_발전량 = input.용량 * input.일간발전시간;
  const days = calendarDays();
  const tou = getTouTariff();

  const 월간_발전량 = days.map((d) => 일간_발전량 * d);
  const 연간_발전량 = 월간_발전량.reduce((s, x) => s + x, 0);

  const 전력요금절감 = 월간_발전량.reduce((s, gen, i) => {
    const rate = tou.데이터[i].최대부하;
    return s + gen * rate;
  }, 0);

  return { 월간_발전량, 연간_발전량, 전력요금절감 };
}
