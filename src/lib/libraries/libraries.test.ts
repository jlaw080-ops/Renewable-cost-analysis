import { describe, expect, it } from "vitest";
import {
  calendarDays,
  getFuelCellProduct,
  getGasRate,
  getOperationProfile,
  getTariff,
  getTouTariff,
  getUsageRow,
  listFuelCells,
  monthToSeason,
} from "./index";

describe("라이브러리 로더", () => {
  it("용도 원단위를 읽는다", () => {
    expect(getUsageRow("업무").전력원단위).toBe(76.41);
    expect(getUsageRow("업무").도시가스원단위).toBe(42.8);
    expect(getUsageRow("의료").전력원단위).toBe(154.33);
  });

  it("없는 용도는 throw", () => {
    expect(() => getUsageRow("없는용도")).toThrow();
  });

  it("계절별 요금제를 읽는다", () => {
    const t = getTariff("일반용(갑)Ⅰ 고압A 선택Ⅱ");
    expect(t.방식).toBe("계절별");
    if (t.방식 === "계절별") {
      expect(t.기본요금_원per_kW).toBe(8230);
      expect(t.계절단가.여름철).toBe(138.6);
    }
  });

  it("시간대별 요금제(연료전지 발전수익용)를 읽는다", () => {
    const t = getTouTariff();
    expect(t.방식).toBe("시간대별");
    expect(t.기본요금_원per_kW).toBe(8320);
    expect(t.데이터).toHaveLength(12);
    expect(t.데이터[0].최대부하).toBe(197.9);
    expect(t.시간대구분.최대부하).toEqual([10, 11, 13, 14, 15, 16]);
  });

  it("월→계절 매핑", () => {
    expect(monthToSeason(7)).toBe("여름철");
    expect(monthToSeason(1)).toBe("겨울철");
    expect(monthToSeason(4)).toBe("봄가을철");
  });

  it("가스 단가를 읽는다", () => {
    expect(getGasRate("연료전지전용")).toBe(4.01154);
    expect(getGasRate("일반용(영업1) 도시가스 요금")).toBe(5.3072);
  });

  it("운전유형/달력일수를 읽는다", () => {
    expect(getOperationProfile("365일가동").연간가동일).toBe(365);
    expect(getOperationProfile("평일가동").연간가동일).toBe(250);
    expect(calendarDays()).toEqual([31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
  });

  it("연료전지 25종을 읽는다", () => {
    expect(listFuelCells()).toHaveLength(25);
    const bnh050 = getFuelCellProduct("BNH050");
    expect(bnh050.정격발전용량_kW).toBe(5);
    expect(bnh050.가스소비량_kW).toBe(13.6);
    expect(bnh050.kW당설치단가).toBe(10000000);
  });
});
