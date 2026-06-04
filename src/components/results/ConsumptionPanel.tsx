// 소비량/요금 탭 — 기준선(신재생 도입 전).
"use client";

import { useScenario } from "@/components/ScenarioContext";
import { Card, Stat } from "@/components/ui/primitives";
import { Table, THead, Tr } from "@/components/ui/table";
import { BarChartCard } from "@/components/ui/charts";
import { num, won } from "@/lib/format";

export function ConsumptionPanel() {
  const { result } = useScenario();
  if (!result) return null;
  const { consumption, bill } = result;

  const chartData = bill.월별.map((m) => ({
    월: `${m.월}월`,
    사용량요금: Math.round(m.사용량요금),
  }));

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="연간 전력 사용량" value={`${num(consumption.총_연간_전력사용량)} kWh`} />
        <Stat label="연간 가스 사용량" value={`${num(consumption.총_연간_가스사용량)} kWh`} />
        <Stat label="전기요금 기준선" value={`${won(bill.연간_전기요금)} 원`} />
        <Stat label="가스요금 기준선" value={`${won(bill.연간_가스요금)} 원`} />
      </div>

      <Card title="용도별 소비량">
        <Table>
          <THead cols={["용도", "전력 (kWh/yr)", "가스 (kWh/yr)"]} />
          <tbody>
            {consumption.perUse.map((p) => (
              <Tr key={p.용도} cells={[p.용도, num(p.연간_전력사용량), num(p.연간_가스사용량)]} />
            ))}
            <Tr
              total
              cells={[
                "합계",
                num(consumption.총_연간_전력사용량),
                num(consumption.총_연간_가스사용량),
              ]}
            />
          </tbody>
        </Table>
      </Card>

      <Card title="월별 전기 사용량요금 (기준선)" desc={`기본요금 ${won(bill.연간_기본요금)}원/년 별도. 표시 금액은 부가세·기금 가산 전 사용량요금.`}>
        <Table>
          <THead cols={["월", "사용량 (kWh)", "사용량요금 (원)"]} />
          <tbody>
            {bill.월별.map((m) => (
              <Tr key={m.월} cells={[`${m.월}월`, num(m.사용량), won(m.사용량요금)]} />
            ))}
            <Tr total cells={["연간", num(consumption.총_연간_전력사용량), won(bill.연간_사용량요금)]} />
          </tbody>
        </Table>
        <div className="mt-4">
          <BarChartCard data={chartData} xKey="월" bars={[{ key: "사용량요금", name: "사용량요금" }]} />
        </div>
      </Card>

      <Card title="총 에너지요금 기준선">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="전기요금" value={`${won(bill.연간_전기요금)} 원`} />
          <Stat label="가스요금" value={`${won(bill.연간_가스요금)} 원`} />
          <Stat label="합계" value={`${won(bill.연간_총에너지요금)} 원`} />
        </div>
      </Card>
    </div>
  );
}
