// 탭 컨테이너. 입력 → 소비량/요금 → 생산·절감 → 경제성 → 리포트.
"use client";

import { useState } from "react";
import { ScenarioProvider, useScenario } from "@/components/ScenarioContext";
import { InputPanel } from "@/components/input/InputPanel";
import { ConsumptionPanel } from "@/components/results/ConsumptionPanel";
import { SavingsPanel } from "@/components/results/SavingsPanel";
import { EconomicsPanel } from "@/components/results/EconomicsPanel";
import { ReportPanel } from "@/components/report/ReportPanel";

const TABS = [
  { id: "input", label: "입력" },
  { id: "consumption", label: "소비량 · 요금" },
  { id: "savings", label: "생산 · 절감" },
  { id: "economics", label: "경제성" },
  { id: "report", label: "리포트" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Shell() {
  const [tab, setTab] = useState<TabId>("input");
  const { error, result } = useScenario();

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-8">
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-ink">신재생에너지 생산량·경제성 검토</h1>
        <p className="mt-1 text-sm text-muted">
          건물 전력·가스 소비량과 신재생(연료전지·태양광) 도입 시 절감액·경제성 개략 검토
        </p>
      </header>

      <nav className="mb-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-accent text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="mb-4 rounded-card border border-cost/40 bg-cost/5 px-4 py-3 text-sm text-cost">
          입력값을 확인하세요: {error}
        </div>
      )}

      <div key={tab} className="fade-in">
        {tab === "input" && <InputPanel />}
        {tab !== "input" && !result ? (
          <div className="text-sm text-muted">계산 결과를 표시할 수 없습니다. 입력값을 확인하세요.</div>
        ) : (
          <>
            {tab === "consumption" && <ConsumptionPanel />}
            {tab === "savings" && <SavingsPanel />}
            {tab === "economics" && <EconomicsPanel />}
            {tab === "report" && <ReportPanel />}
          </>
        )}
      </div>
    </main>
  );
}

export function AppShell() {
  return (
    <ScenarioProvider>
      <Shell />
    </ScenarioProvider>
  );
}
