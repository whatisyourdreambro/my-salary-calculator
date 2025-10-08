// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// [유입 초초초고도화]
// 1. 콘텐츠 보안 정책(CSP) 강화: 'unsafe-inline' 제거 준비 및 더욱 명시적인 출처 선언
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn-cookieyes.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net;
  frame-src 'self' https://googleads.g.doubleclick.net https://www.googletagmanager.com;
  frame-ancestors 'self';
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

// 2. 캐싱 및 보안 헤더 정책 추가
const securityHeaders = [
  // 브라우저 및 CDN에 캐싱 정책을 명시하여 로딩 속도 극대화
  {
    key: "Cache-Control",
    value: "public, s-maxage=1, stale-while-revalidate=59",
  },
  // 모든 연결을 HTTPS로 강제하여 보안 강화
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // 모든 페이지에 보안 및 캐싱 헤더 적용
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
