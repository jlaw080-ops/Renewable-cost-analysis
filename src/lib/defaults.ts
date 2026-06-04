// UI 초기값 / 예시 검토안.
import type { ScenarioInput } from "@/types/inputs";
import {
  DEFAULT_분석기간,
  DEFAULT_할인율,
  FC_DEFAULT_중간부하시간,
  FC_DEFAULT_최대부하시간,
} from "./calc/constants";

export const DEFAULT_SCENARIO: ScenarioInput = {
  이름: "신규 검토안",
  uses: [{ 용도: "업무", 연면적: 10000 }],
  요금제: "일반용(갑)Ⅰ 고압A 선택Ⅱ",
  계약전력: 300,
  연간운전유형: "평일가동",
  일간사용시간: 10,
  태양광: {
    용량: 100,
    일간발전시간: 3.5,
    kW당설치단가: 1_500_000,
    kW당유지비: 15_000,
  },
  연료전지: {
    sets: [{ 모델명: "BNH100", 설치수량: 5 }],
    일일_중간부하_운전시간: FC_DEFAULT_중간부하시간,
    일일_최대부하_운전시간: FC_DEFAULT_최대부하시간,
  },
  경제성: {
    분석기간: DEFAULT_분석기간,
    할인율: DEFAULT_할인율,
  },
};
