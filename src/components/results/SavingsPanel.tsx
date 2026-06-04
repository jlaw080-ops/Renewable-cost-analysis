// 신재생 생산·절감 탭 — 전력요금 절감과 가스요금 절감을 분리 표시.
"use client";

import { useScenario } from "@/components/ScenarioContext";
import { Card, Stat } from "@/components/ui/primitives";
import { Table, THead, Tr } from "@/components/ui/table";
import { BarChartCard } from "@/components/ui/charts";
import { num, pct, won } from "@/lib/format";

export function SavingsPanel() {
  const { result } = useScenario();
  if (!result) return null;
  const { solar, fuelcell, savings, bill } = result;

  const compareData = [
    {
      구분: "전력",
      기준선: Math.round(bill.연간_전기요금),
      절감액: Math.round(savings.전력요금_절감합계),
    },
    {
      구분: "가스",
      기준선: Math.round(bill.연간_가스요금),
      절감액: Math.round(savings.가스요금_절감합계),
    },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="전력요금 절감" value={`${won(savings.전력요금_절감합계)} 원`} tone="accent" sub={pct(savings.전력_절감률)} />
        <Stat label="가스요금 절감" value={`${won(savings.가스요금_절감합계)} 원`} tone="accent" sub={pct(savings.가스_절감률)} />
        <Stat label="연간 총절감액" value={`${won(savings.연간_총절감액)} 원`} tone="accent" sub={`총 절감률 ${pct(savings.총_절감률)}`} />
      </div>

      <Card title="신재생 생산 요약">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="태양광 연간 발전량" value={`${num(solar.연간_발전량)} kWh`} />
          <Stat label="연료전지 총설치용량" value={`${num(fuelcell.총설치용량_kW)} kW`} />
          <Stat label="연료전지 연간 열생산" value={`${num(fuelcell.output1.reduce((s, m) => s + m.월간_연료전지_열생산량_kWh, 0))} kWh`} />
          <Stat label="연료전지 연간 가스사용" value={`${num(fuelcell.output1.reduce((s, m) => s + m.월간_도시가스사용량_kWh, 0))} kWh`} />
        </div>
      </Card>

      <Card title="절감액 상세 (전력·가스 분리)">
        <Table>
          <THead cols={["구분", "기준선 (원)", "절감액 (원)", "절감률"]} />
          <tbody>
            <Tr cells={["태양광 발전 (전력)", "—", won(savings.태양광_전력요금절감), "—"]} />
            <Tr cells={["연료전지 발전 (전력)", "—", won(savings.연료전지_발전수익), "—"]} />
            <Tr total cells={["전력요금 절감 합계", won(bill.연간_전기요금), won(savings.전력요금_절감합계), pct(savings.전력_절감률)]} />
            <Tr cells={["연료전지 열생산 (가스)", "—", won(savings.연료전지_열생산수익), "—"]} />
            <Tr cells={["연료전지 도시가스 사용요금", "—", `-${won(savings.연료전지_도시가스사용요금)}`, "—"]} />
            <Tr total cells={["가스요금 절감 합계", won(bill.연간_가스요금), won(savings.가스요금_절감합계), pct(savings.가스_절감률)]} />
            <Tr total cells={["총 절감액", won(bill.연간_총에너지요금), won(savings.연간_총절감액), pct(savings.총_절감률)]} />
          </tbody>
        </Table>
      </Card>

      <Card title="기준선 대비 절감액" desc="회색=연간 기준선, 그린=절감액">
        <BarChartCard
          data={compareData}
          xKey="구분"
          bars={[
            { key: "기준선", name: "기준선", color: "#9CA3AF" },
            { key: "절감액", name: "절감액", color: "#2F855A" },
          ]}
        />
      </Card>
    </div>
  );
}
