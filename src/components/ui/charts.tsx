// Recharts 래퍼. UI_GUIDE: 막대/선 위주, 액센트 1~2색.
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ACCENT = "#2F855A";
const NEUTRAL = "#9CA3AF";
const COST = "#B91C1C";

const axis = { fontSize: 11, fill: "#6B7280" };

function compact(n: number): string {
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(1)}억`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(0)}만`;
  return n.toLocaleString("ko-KR");
}

export function BarChartCard({
  data,
  xKey,
  bars,
  height = 240,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  bars: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} />
        <YAxis tick={axis} tickLine={false} tickFormatter={compact} width={48} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("ko-KR")}
          contentStyle={{ fontSize: 12, borderColor: "#E5E7EB" }}
        />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color ?? ACCENT} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 단일 막대 + 0 기준선 (현금흐름 등 음수 포함) */
export function SignedBarChart({
  data,
  xKey,
  dataKey,
  height = 240,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  dataKey: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} />
        <YAxis tick={axis} tickLine={false} tickFormatter={compact} width={48} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("ko-KR")}
          contentStyle={{ fontSize: 12, borderColor: "#E5E7EB" }}
        />
        <ReferenceLine y={0} stroke="#6B7280" />
        <Bar dataKey={dataKey}>
          {data.map((d, i) => (
            <Cell key={i} fill={Number(d[dataKey]) >= 0 ? ACCENT : COST} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartCard({
  data,
  xKey,
  dataKey,
  height = 240,
}: {
  data: Record<string, number | string>[];
  xKey: string;
  dataKey: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <CartesianGrid stroke="#E5E7EB" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} />
        <YAxis tick={axis} tickLine={false} tickFormatter={compact} width={48} />
        <Tooltip
          formatter={(v: number) => v.toLocaleString("ko-KR")}
          contentStyle={{ fontSize: 12, borderColor: "#E5E7EB" }}
        />
        <ReferenceLine y={0} stroke={NEUTRAL} strokeDasharray="3 3" />
        <Line type="monotone" dataKey={dataKey} stroke={ACCENT} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
