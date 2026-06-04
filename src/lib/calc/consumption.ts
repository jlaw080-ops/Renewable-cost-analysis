// A. 건물 에너지 소비량 — calculation-formulas.md §A
import type { UsageEntry } from "@/types/inputs";
import type { ConsumptionResult } from "@/types/results";
import { getUsageRow } from "@/lib/libraries";

/**
 * 용도별 연면적 → 연간 전력·가스 소비량.
 * 연간_사용량_i = 연면적_i × 원단위_i, 총합 = Σ.
 */
export function calcConsumption(uses: UsageEntry[]): ConsumptionResult {
  const perUse = uses.map((u) => {
    const row = getUsageRow(u.용도);
    return {
      용도: u.용도,
      연간_전력사용량: u.연면적 * row.전력원단위,
      연간_가스사용량: u.연면적 * row.도시가스원단위,
    };
  });

  return {
    perUse,
    총_연간_전력사용량: perUse.reduce((s, p) => s + p.연간_전력사용량, 0),
    총_연간_가스사용량: perUse.reduce((s, p) => s + p.연간_가스사용량, 0),
  };
}
