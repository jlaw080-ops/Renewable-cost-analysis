// 숫자 포맷 — 천단위 콤마. UI_GUIDE: 숫자는 우측정렬·고정폭·콤마.

/** 원 단위 (반올림 + 콤마) */
export function won(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

/** 일반 숫자 (소수 자릿수 지정) */
export function num(n: number, digits = 0): string {
  return n.toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** 백분율 */
export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

/** 억원 환산 (큰 금액 요약 표시용) */
export function eok(n: number): string {
  return `${(n / 100_000_000).toLocaleString("ko-KR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}억`;
}
