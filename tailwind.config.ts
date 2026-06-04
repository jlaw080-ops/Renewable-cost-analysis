import type { Config } from "tailwindcss";

// UI_GUIDE.md 색상 토큰 — 그린 액센트 1색 + 중립 회색조. (보라/인디고/그라데이션 금지)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        surface: "#F7F7F8",
        ink: "#1F2328",
        muted: "#6B7280",
        line: "#E5E7EB",
        accent: "#2F855A", // 절감·생산·긍정
        "accent-weak": "#E6F2EB",
        cost: "#B91C1C", // 비용/경고 (절제)
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        card: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
