// PDF 리포트 (@react-pdf/renderer). 한글 = Pretendard(public/fonts) 등록 필수.
"use client";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { ScenarioInput } from "@/types/inputs";
import type { FeasibilityResult } from "@/types/results";
import { num, pct, won } from "@/lib/format";

Font.register({
  family: "Pretendard",
  fonts: [
    { src: "/fonts/Pretendard-Regular.otf" },
    { src: "/fonts/Pretendard-Bold.otf", fontWeight: "bold" },
  ],
});

const C = { ink: "#1F2328", muted: "#6B7280", line: "#E5E7EB", accent: "#2F855A", cost: "#B91C1C" };

const s = StyleSheet.create({
  page: { fontFamily: "Pretendard", fontSize: 9, color: C.ink, padding: 36, lineHeight: 1.4 },
  h1: { fontSize: 16, fontWeight: "bold" },
  sub: { fontSize: 9, color: C.muted, marginTop: 2 },
  section: { marginTop: 16 },
  h2: { fontSize: 11, fontWeight: "bold", marginBottom: 6, paddingBottom: 3, borderBottom: `1pt solid ${C.line}` },
  row: { flexDirection: "row" },
  cell: { flex: 1 },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 1.5 },
  k: { color: C.muted },
  v: { fontWeight: "bold" },
  vAccent: { fontWeight: "bold", color: C.accent },
  vCost: { fontWeight: "bold", color: C.cost },
  tr: { flexDirection: "row", borderBottom: `0.5pt solid ${C.line}`, paddingVertical: 2 },
  th: { flexDirection: "row", borderBottom: `1pt solid ${C.ink}`, paddingVertical: 2, fontWeight: "bold" },
  tcL: { flex: 2 },
  tcR: { flex: 1.5, textAlign: "right" },
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 7, color: C.muted, textAlign: "center" },
});

function KV({ k, v, tone }: { k: string; v: string; tone?: "accent" | "cost" }) {
  const st = tone === "accent" ? s.vAccent : tone === "cost" ? s.vCost : s.v;
  return (
    <View style={s.kv}>
      <Text style={s.k}>{k}</Text>
      <Text style={st}>{v}</Text>
    </View>
  );
}

export function ReportDocument({
  input,
  result,
}: {
  input: ScenarioInput;
  result: FeasibilityResult;
}) {
  const { consumption, bill, savings, economics } = result;
  const usesText = input.uses.map((u) => `${u.용도} ${num(u.연면적)}㎡`).join(", ");

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.h1}>신재생에너지 생산량·경제성 검토 보고서</Text>
          <Text style={s.sub}>
            {input.이름 ?? "검토안"} · 개략 검토 결과 (입력값 기반 자동 산출)
          </Text>
        </View>

        {/* 검토 조건 */}
        <View style={s.section}>
          <Text style={s.h2}>1. 검토 조건</Text>
          <KV k="건물 용도·연면적" v={usesText || "—"} />
          <KV k="전기 요금제 / 계약전력" v={`${input.요금제} / ${num(input.계약전력)} kW`} />
          <KV k="운전유형 / 일간 사용시간" v={`${input.연간운전유형} / ${input.일간사용시간} h`} />
          <KV k="태양광" v={`${num(input.태양광.용량)} kW, ${input.태양광.일간발전시간} h/일`} />
          <KV
            k="연료전지"
            v={input.연료전지.sets.map((x) => `${x.모델명}×${x.설치수량}`).join(", ") || "—"}
          />
          <KV k="분석기간 / 할인율" v={`${input.경제성.분석기간}년 / ${pct(input.경제성.할인율 * 100)}`} />
        </View>

        {/* 에너지요금 기준선 */}
        <View style={s.section}>
          <Text style={s.h2}>2. 에너지요금 기준선 (신재생 도입 전)</Text>
          <KV k="연간 전력 사용량" v={`${num(consumption.총_연간_전력사용량)} kWh`} />
          <KV k="연간 가스 사용량" v={`${num(consumption.총_연간_가스사용량)} kWh`} />
          <KV k="전기요금 기준선" v={`${won(bill.연간_전기요금)} 원`} />
          <KV k="가스요금 기준선" v={`${won(bill.연간_가스요금)} 원`} />
          <KV k="총 에너지요금 기준선" v={`${won(bill.연간_총에너지요금)} 원`} />
        </View>

        {/* 절감 */}
        <View style={s.section}>
          <Text style={s.h2}>3. 신재생 도입 절감액 (전력·가스 분리)</Text>
          <KV k="전력요금 절감 (태양광+연료전지 발전)" v={`${won(savings.전력요금_절감합계)} 원 (${pct(savings.전력_절감률)})`} tone="accent" />
          <KV k="가스요금 절감 (연료전지 열생산−가스사용)" v={`${won(savings.가스요금_절감합계)} 원 (${pct(savings.가스_절감률)})`} tone={savings.가스요금_절감합계 >= 0 ? "accent" : "cost"} />
          <KV k="연간 총절감액" v={`${won(savings.연간_총절감액)} 원 (총 ${pct(savings.총_절감률)})`} tone="accent" />
        </View>

        {/* 경제성 */}
        <View style={s.section}>
          <Text style={s.h2}>4. 경제성 평가</Text>
          <KV k="초기투자비용" v={`${won(economics.초기투자비용)} 원`} tone="cost" />
          <KV k="연간 유지보수비용" v={`${won(economics.연간유지보수비용)} 원`} tone="cost" />
          <KV k="연간 편익(총절감)" v={`${won(economics.연간편익)} 원`} tone="accent" />
          <KV k="NPV (분석기간)" v={`${won(economics.NPV)} 원`} tone={economics.NPV >= 0 ? "accent" : "cost"} />
          <KV k="IRR" v={economics.IRR === null ? "—" : pct(economics.IRR * 100)} />
          <KV k="단순 투자회수기간" v={economics.단순투자회수기간 === null ? "회수 안 됨" : `${economics.단순투자회수기간} 년`} />
          <KV k="B/C" v={num(economics.BC, 2)} tone={economics.BC >= 1 ? "accent" : "cost"} />
        </View>

        {/* 최종평가 표 */}
        <View style={s.section}>
          <Text style={s.h2}>5. 기간별 최종평가</Text>
          <View style={s.th}>
            <Text style={s.tcL}>기간(년)</Text>
            <Text style={s.tcR}>누적수익</Text>
            <Text style={s.tcR}>총비용</Text>
            <Text style={s.tcR}>NPV</Text>
            <Text style={s.tcR}>IRR</Text>
          </View>
          {economics.최종평가.map((r) => (
            <View style={s.tr} key={r.기간}>
              <Text style={s.tcL}>{r.기간}</Text>
              <Text style={s.tcR}>{won(r.누적수익)}</Text>
              <Text style={s.tcR}>{won(r.총비용)}</Text>
              <Text style={s.tcR}>{won(r.NPV)}</Text>
              <Text style={s.tcR}>{r.IRR === null ? "—" : pct(r.IRR * 100)}</Text>
            </View>
          ))}
        </View>

        <Text style={s.footer} fixed>
          본 보고서는 calculation-formulas.md 기준 개략 검토 결과입니다. 상세 설계 시 실측·정밀 분석이 필요합니다.
        </Text>
      </Page>
    </Document>
  );
}
