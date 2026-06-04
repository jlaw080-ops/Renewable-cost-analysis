import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "신재생에너지 생산량·경제성 검토",
  description:
    "건물 전력·가스 소비량과 신재생(연료전지·태양광) 도입 시 절감액·경제성을 개략 검토",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
