import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 상위 디렉터리 lockfile 오탐 방지 — 이 프로젝트를 추적 루트로 고정
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
