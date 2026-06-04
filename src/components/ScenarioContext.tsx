// 단일 폼 상태(검토안) Context. 결과는 저장하지 않고 useMemo로 파생 계산.
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ScenarioInput } from "@/types/inputs";
import type { FeasibilityResult } from "@/types/results";
import { calcFeasibility } from "@/lib/calc";
import { DEFAULT_SCENARIO } from "@/lib/defaults";

interface ScenarioContextValue {
  input: ScenarioInput;
  setInput: (next: ScenarioInput) => void;
  patch: (updater: (prev: ScenarioInput) => ScenarioInput) => void;
  result: FeasibilityResult | null;
  error: string | null;
}

const Ctx = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState<ScenarioInput>(DEFAULT_SCENARIO);

  const { result, error } = useMemo(() => {
    try {
      return { result: calcFeasibility(input), error: null };
    } catch (e) {
      return {
        result: null,
        error: e instanceof Error ? e.message : "계산 오류",
      };
    }
  }, [input]);

  const patch = (updater: (prev: ScenarioInput) => ScenarioInput) =>
    setInput(updater(input));

  return (
    <Ctx.Provider value={{ input, setInput, patch, result, error }}>
      {children}
    </Ctx.Provider>
  );
}

export function useScenario(): ScenarioContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useScenario must be used within ScenarioProvider");
  return v;
}
