// 경제성 탭 — 현금흐름 / NPV / IRR / 회수기간 / B·C / 최종평가.
"use client";

import { useScenario } from "@/components/ScenarioContext";
import { Card, Stat } from "@/components/ui/primitives";
import { Table, THead, Tr } from "@/components/ui/table";
import { LineChartCard, SignedBarChart } from "@/components/ui/charts";
import { num, pct, won } from "@/lib/format";

function irrText(irr: number | null): string {
  return irr === null ? "—" : pct(irr * 100);
}

export function EconomicsPanel() {
  const { result } = useScenario();
  if (!result) return null;
  const { economics } = result;

  const cashData = economics.연도별.map((r) => ({
    연도: r.연도,
    순현금흐름: Math.round(r.순현금흐름),
    누적순현금흐름: Math.round(r.누적순현금흐름),
  }));

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="초기투자비용" value={`${won(economics.초기투자비용)} 원`} tone="cost" />
        <Stat label="연간 유지보수비" value={`${won(economics.연간유지보수비용)} 원`} tone="cost" />
        <Stat label="연간 편익 (총절감)" value={`${won(economics.연간편익)} 원`} tone="accent" />
        <Stat
          label="단순 투자회수기간"
          value={economics.단순투자회수기간 === null ? "회수 안 됨" : `${economics.단순투자회수기간} 년`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label={`NPV (분석기간)`} value={`${won(economics.NPV)} 원`} tone={economics.NPV >= 0 ? "accent" : "cost"} />
        <Stat label="IRR" value={irrText(economics.IRR)} />
        <Stat label="B/C" value={num(economics.BC, 2)} tone={economics.BC >= 1 ? "accent" : "cost"} />
      </div>

      <Card title="누적 순현금흐름" desc="0 상향 교차 시점이 단순 투자회수기간">
        <LineChartCard data={cashData} xKey="연도" dataKey="누적순현금흐름" />
      </Card>

      <Card title="연도별 순현금흐름">
        <SignedBarChart data={cashData} xKey="연도" dataKey="순현금흐름" />
      </Card>

      <Card title="연도별 현금흐름 상세">
        <Table>
          <THead cols={["연도", "총수익", "유지보수비", "순현금흐름", "누적순현금", "할인순현금"]} />
          <tbody>
            {economics.연도별.map((r) => (
              <Tr
                key={r.연도}
                cells={[
                  String(r.연도),
                  won(r.총수익),
                  won(r.유지보수비용),
                  won(r.순현금흐름),
                  won(r.누적순현금흐름),
                  won(r.할인순현금흐름),
                ]}
              />
            ))}
          </tbody>
        </Table>
      </Card>

      <Card title="기간별 최종평가">
        <Table>
          <THead cols={["기간(년)", "누적수익", "총비용", "ROI(초기)", "ROI(총비용)", "NPV", "IRR"]} />
          <tbody>
            {economics.최종평가.map((r) => (
              <Tr
                key={r.기간}
                cells={[
                  String(r.기간),
                  won(r.누적수익),
                  won(r.총비용),
                  pct(r.ROI_초기투자),
                  pct(r.ROI_총비용),
                  won(r.NPV),
                  irrText(r.IRR),
                ]}
              />
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
