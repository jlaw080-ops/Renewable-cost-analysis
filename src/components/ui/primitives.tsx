// 공용 UI 프리미티브. UI_GUIDE 준수 — 1px 회색 테두리, 작은 라운드, 그림자 최소.
"use client";

import type { ReactNode } from "react";

export function Card({
  title,
  desc,
  children,
  className = "",
}: {
  title?: string;
  desc?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-card border border-line bg-bg p-5 ${className}`}>
      {title && (
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          {desc && <p className="mt-0.5 text-xs text-muted">{desc}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

/** 라벨 위 + 단위 우측 입력 필드 */
export function Field({
  label,
  unit,
  children,
  hint,
}: {
  label: string;
  unit?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex-1">{children}</div>
        {unit && <span className="shrink-0 text-xs text-muted">{unit}</span>}
      </div>
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      className="num w-full rounded border border-line bg-bg px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
      value={Number.isFinite(value) ? value : ""}
      min={min}
      step={step}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="w-full rounded border border-line bg-bg px-2 py-1.5 text-sm focus:border-ink focus:outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** 강조 지표 (절감/생산 = 그린, 비용 = 무채/적색) */
export function Stat({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string;
  value: string;
  tone?: "accent" | "neutral" | "cost";
  sub?: string;
}) {
  const color =
    tone === "accent"
      ? "text-accent"
      : tone === "cost"
        ? "text-cost"
        : "text-ink";
  return (
    <div className="rounded-card border border-line p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={`num mt-1 text-xl font-semibold ${color}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "solid",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const cls =
    variant === "solid"
      ? "bg-ink text-white hover:bg-black disabled:opacity-40"
      : "border border-line text-ink hover:bg-surface disabled:opacity-40";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}
