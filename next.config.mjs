// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// [핵심 수정] 광고 서비스가 정상 작동하도록 보안 정책에 필요한 도메인을 추가합니다.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googletagmanager.com https://*.google-analytics.com https://*.googlesyndication.com https://t1.daumcdn.net https://cdn-cookieyes.com https://pagead2.googlesyndication.com https://www.google.com https://static.doubleclick.net https://ssl.google-analytics.com;
  frame-src 'self' https://*.google.com https://*.daum.net https://*.kakao.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com;
  frame-ancestors 'self';
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
`;

/**
 * 보안 강화를 위한 HTTP 헤더 설정
 */
const securityHeaders = [
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
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
