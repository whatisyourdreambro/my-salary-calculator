// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// 카카오 애드핏 및 구글 애드센스 광고 로딩에 필요한 모든 도메인을 적용한 CSP
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn-cookieyes.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://t1.daumcdn.net *.kakao.com *.adfit.kakao.com https://static.cloudflareinsights.com https://ep2.adtrafficquality.google;
  frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagmanager.com https://t1.daumcdn.net *.kakao.com *.adfit.kakao.com;
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

const securityHeaders = [
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
  // [필수] Cloudflare 환경에서 이미지 최적화 충돌 및 비용 폭탄 방지
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // 정적 자산(폰트, 이미지 등)을 클라우드플레어 엣지 서버에 영구 캐싱하여 서버 비용 절감
        source: "/(.*).(woff2?|png|jpg|jpeg|svg|gif|ico|avif|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // 모든 경로에 보안 헤더 및 기본 캐시 정책 적용
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, s-maxage=1, stale-while-revalidate=59",
          }
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);