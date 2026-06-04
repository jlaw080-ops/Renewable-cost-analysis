// 입력 탭 — 용도/연면적, 전기요금, 태양광, 연료전지, 경제성.
"use client";

import { useScenario } from "@/components/ScenarioContext";
import { Button, Card, Field, NumberInput, Select } from "@/components/ui/primitives";
import {
  getTariff,
  listFuelCells,
  listOperationTypes,
  listTariffs,
  listUsages,
} from "@/lib/libraries";
import type { ScenarioInput, UsageEntry, FuelCellSet } from "@/types/inputs";

const usageOptions = listUsages().map((u) => ({ value: u, label: u }));
const tariffOptions = listTariffs().map((t) => ({
  value: t.요금제,
  label: `${t.요금제} (${t.방식})`,
}));
const operationOptions = listOperationTypes().map((o) => ({ value: o, label: o }));
const fuelcellOptions = listFuelCells()
  .filter((f) => f.모델명 !== null)
  .map((f) => ({
    value: f.모델명 as string,
    label: `${f.제조사} ${f.모델명} · ${f.정격발전용량_kW}kW (${f.형식})`,
  }));

export function InputPanel() {
  const { input, patch } = useScenario();
  const tariff = (() => {
    try {
      return getTariff(input.요금제);
    } catch {
      return null;
    }
  })();
  const 시간대별 = tariff?.방식 === "시간대별";

  const setUse = (i: number, next: Partial<UsageEntry>) =>
    patch((p) => ({
      ...p,
      uses: p.uses.map((u, idx) => (idx === i ? { ...u, ...next } : u)),
    }));
  const addUse = () =>
    patch((p) => ({ ...p, uses: [...p.uses, { 용도: usageOptions[0].value, 연면적: 1000 }] }));
  const removeUse = (i: number) =>
    patch((p) => ({ ...p, uses: p.uses.filter((_, idx) => idx !== i) }));

  const setSet = (i: number, next: Partial<FuelCellSet>) =>
    patch((p) => ({
      ...p,
      연료전지: {
        ...p.연료전지,
        sets: p.연료전지.sets.map((s, idx) => (idx === i ? { ...s, ...next } : s)),
      },
    }));
  const addSet = () =>
    patch((p) => ({
      ...p,
      연료전지: {
        ...p.연료전지,
        sets: [...p.연료전지.sets, { 모델명: fuelcellOptions[0].value, 설치수량: 1 }],
      },
    }));
  const removeSet = (i: number) =>
    patch((p) => ({
      ...p,
      연료전지: { ...p.연료전지, sets: p.연료전지.sets.filter((_, idx) => idx !== i) },
    }));

  const field = <K extends keyof ScenarioInput>(key: K, value: ScenarioInput[K]) =>
    patch((p) => ({ ...p, [key]: value }));

  return (
    <div className="grid gap-5">
      {/* 건물 용도 */}
      <Card title="건물 용도 · 연면적" desc="복수 용도 입력 가능. 용도별 원단위로 전력·가스 소비량을 산출합니다.">
        <div className="grid gap-2">
          {input.uses.map((u, i) => (
            <div key={i} className="grid grid-cols-[1fr_140px_auto] items-end gap-2">
              <Field label={i === 0 ? "용도" : ""}>
                <Select
                  value={u.용도}
                  onChange={(v) => setUse(i, { 용도: v })}
                  options={usageOptions}
                />
              </Field>
              <Field label={i === 0 ? "연면적" : ""} unit="m²">
                <NumberInput value={u.연면적} onChange={(v) => setUse(i, { 연면적: v })} step={100} />
              </Field>
              <button
                onClick={() => removeUse(i)}
                className="mb-1.5 px-2 text-sm text-muted hover:text-cost"
                aria-label="용도 삭제"
              >
                ✕
              </button>
            </div>
          ))}
          <div>
            <Button variant="outline" onClick={addUse}>
              + 용도 추가
            </Button>
          </div>
        </div>
      </Card>

      {/* 전기요금 */}
      <Card title="전기요금 기준" desc="요금제 방식(계절별/시간대별)에 따라 사용량요금 산정이 달라집니다.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="요금제">
            <Select value={input.요금제} onChange={(v) => field("요금제", v)} options={tariffOptions} />
          </Field>
          <Field label="계약전력" unit="kW" hint="기본요금 산정용 (직접 입력)">
            <NumberInput value={input.계약전력} onChange={(v) => field("계약전력", v)} step={10} />
          </Field>
          <Field label="연간 운전유형">
            <Select
              value={input.연간운전유형}
              onChange={(v) => field("연간운전유형", v)}
              options={operationOptions}
            />
          </Field>
          <Field
            label="일간 사용시간"
            unit="h"
            hint={시간대별 ? "09:00 시작 기준 경/중/최부하 배분" : "시간대별 요금제에서만 사용"}
          >
            <NumberInput
              value={input.일간사용시간}
              onChange={(v) => field("일간사용시간", v)}
              step={1}
            />
          </Field>
        </div>
      </Card>

      {/* 태양광 */}
      <Card title="태양광" desc="매일 발전(달력일수 기준). 절감 단가는 월별 최대부하단가.">
        <div className="grid grid-cols-2 gap-4">
          <Field label="설치 용량" unit="kW">
            <NumberInput
              value={input.태양광.용량}
              onChange={(v) => patch((p) => ({ ...p, 태양광: { ...p.태양광, 용량: v } }))}
              step={10}
            />
          </Field>
          <Field label="일간 발전시간" unit="h">
            <NumberInput
              value={input.태양광.일간발전시간}
              onChange={(v) => patch((p) => ({ ...p, 태양광: { ...p.태양광, 일간발전시간: v } }))}
              step={0.1}
            />
          </Field>
          <Field label="kW당 설치단가" unit="원/kW">
            <NumberInput
              value={input.태양광.kW당설치단가}
              onChange={(v) => patch((p) => ({ ...p, 태양광: { ...p.태양광, kW당설치단가: v } }))}
              step={100000}
            />
          </Field>
          <Field label="kW당 연간유지비" unit="원/kW·yr">
            <NumberInput
              value={input.태양광.kW당유지비}
              onChange={(v) => patch((p) => ({ ...p, 태양광: { ...p.태양광, kW당유지비: v } }))}
              step={1000}
            />
          </Field>
        </div>
      </Card>

      {/* 연료전지 */}
      <Card title="연료전지" desc="모델·설치수량 입력. 전력·열·가스 수익을 이전 앱 로직으로 산출합니다.">
        <div className="grid gap-2">
          {input.연료전지.sets.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
              <Field label={i === 0 ? "모델" : ""}>
                <Select value={s.모델명} onChange={(v) => setSet(i, { 모델명: v })} options={fuelcellOptions} />
              </Field>
              <Field label={i === 0 ? "설치수량" : ""} unit="대">
                <NumberInput value={s.설치수량} onChange={(v) => setSet(i, { 설치수량: v })} step={1} />
              </Field>
              <button
                onClick={() => removeSet(i)}
                className="mb-1.5 px-2 text-sm text-muted hover:text-cost"
                aria-label="연료전지 삭제"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <Field label="일일 중간부하 운전시간" unit="h">
              <NumberInput
                value={input.연료전지.일일_중간부하_운전시간}
                onChange={(v) =>
                  patch((p) => ({ ...p, 연료전지: { ...p.연료전지, 일일_중간부하_운전시간: v } }))
                }
              />
            </Field>
            <Field label="일일 최대부하 운전시간" unit="h">
              <NumberInput
                value={input.연료전지.일일_최대부하_운전시간}
                onChange={(v) =>
                  patch((p) => ({ ...p, 연료전지: { ...p.연료전지, 일일_최대부하_운전시간: v } }))
                }
              />
            </Field>
          </div>
          <div>
            <Button variant="outline" onClick={addSet}>
              + 연료전지 추가
            </Button>
          </div>
        </div>
      </Card>

      {/* 경제성 */}
      <Card title="경제성 입력">
        <div className="grid grid-cols-2 gap-4">
          <Field label="분석기간" unit="년">
            <NumberInput
              value={input.경제성.분석기간}
              onChange={(v) => patch((p) => ({ ...p, 경제성: { ...p.경제성, 분석기간: v } }))}
            />
          </Field>
          <Field label="할인율" unit="%">
            <NumberInput
              value={input.경제성.할인율 * 100}
              onChange={(v) =>
                patch((p) => ({ ...p, 경제성: { ...p.경제성, 할인율: v / 100 } }))
              }
              step={0.5}
            />
          </Field>
        </div>
      </Card>
    </div>
  );
}
