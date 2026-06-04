// 수치 표. UI_GUIDE: 숫자 우측정렬·고정폭·콤마, 합계 행 굵게.
"use client";

import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function THead({ cols }: { cols: string[] }) {
  return (
    <thead>
      <tr className="border-b border-line text-xs text-muted">
        {cols.map((c, i) => (
          <th
            key={c}
            className={`px-3 py-2 font-medium ${i === 0 ? "text-left" : "text-right"}`}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function Tr({
  cells,
  total = false,
}: {
  cells: ReactNode[];
  total?: boolean;
}) {
  return (
    <tr
      className={`border-b border-line ${total ? "border-t-2 border-t-ink font-semibold" : ""}`}
    >
      {cells.map((c, i) => (
        <td
          key={i}
          className={`px-3 py-1.5 ${i === 0 ? "text-left" : "num"}`}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}
