import { describe, expect, it } from "vitest";
import { calcFeasibility } from "./index";
import { DEFAULT_SCENARIO } from "@/lib/defaults";

describe("전체 체인 calcFeasibility (기본 시나리오)", () => {
  const r = calcFeasibility(DEFAULT_SCENARIO);

  it("소비량·기준선이 양수", () => {
    expect(r.consumption.총_연간_전력사용량).toBeGreaterThan(0);
    expect(r.bill.연간_총에너지요금).toBeGreaterThan(0);
  });

  it("절감 분리 일관성: 전력절감 = 태양광 + 연료전지발전", () => {
    expect(r.savings.전력요금_절감합계).toBeCloseTo(
      r.savings.태양광_전력요금절감 + r.savings.연료전지_발전수익,
      4,
    );
  });

  it("가스절감 = 열생산수익 − 도시가스사용요금", () => {
    expect(r.savings.가스요금_절감합계).toBeCloseTo(
      r.savings.연료전지_열생산수익 - r.savings.연료전지_도시가스사용요금,
      4,
    );
  });

  it("총절감 = 전력 + 가스, 경제성 편익과 일치", () => {
    expect(r.savings.연간_총절감액).toBeCloseTo(
      r.savings.전력요금_절감합계 + r.savings.가스요금_절감합계,
      4,
    );
    expect(r.economics.연간편익).toBeCloseTo(r.savings.연간_총절감액, 6);
  });

  it("연도별 현금흐름 길이 = 분석기간+1", () => {
    expect(r.economics.연도별).toHaveLength(DEFAULT_SCENARIO.경제성.분석기간 + 1);
  });
});
