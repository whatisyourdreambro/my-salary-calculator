// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages와의 호환성을 높이기 위해 standalone 모드로 빌드합니다.
  output: "standalone",
};

export default withBundleAnalyzer(nextConfig);
