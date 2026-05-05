// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// 카카오 애드핏 및 구글 애드센스 광고 로딩에 필요한 모든 도메인을 적용한 CSP
// connect-src 화이트리스트로 타이트닝 (이전: '*' → 광고/분석 도메인만 명시)
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn-cookieyes.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://t1.daumcdn.net *.kakao.com *.adfit.kakao.com https://static.cloudflareinsights.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google;
  frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagmanager.com https://t1.daumcdn.net *.kakao.com *.adfit.kakao.com https://ep2.adtrafficquality.google;
  frame-ancestors 'self';
  style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  img-src 'self' data: blob: https://*.googleusercontent.com https://www.google-analytics.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.kakao.com https://*.adfit.kakao.com https://*.daumcdn.net;
  media-src 'none';
  connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.cloudflareinsights.com https://*.adfit.kakao.com https://*.kakao.com;
  font-src 'self' https://cdn.jsdelivr.net data:;
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
  // 트리쉐이킹 강화 — lucide/recharts/lib들의 사용분만 번들에 포함
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "framer-motion",
      "@radix-ui/react-label",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
    ],
  },
  // 빌드 시 production 소스맵 비활성 (번들 크기 감소)
  productionBrowserSourceMaps: false,
  // 중복 라우트 통합 (Phase 2):
  // - /table/* (구버전) → /table/2026/* (2026 세법 정답)
  // - /fun/mbti-salary → /mbti-salary (독립 페이지가 더 풍부)
  // 위험: 일시적 GSC "Page with redirect" 카운트 증가 (정상). 시즌 직전 배포 주의.
  async redirects() {
    return [
      {
        source: "/table/annual",
        destination: "/table/2026/annual",
        permanent: true,
      },
      {
        source: "/table/monthly",
        destination: "/table/2026/monthly",
        permanent: true,
      },
      {
        source: "/table/weekly",
        destination: "/table/2026/weekly",
        permanent: true,
      },
      {
        source: "/table/hourly",
        destination: "/table/2026/hourly",
        permanent: true,
      },
      {
        source: "/fun/mbti-salary",
        destination: "/mbti-salary",
        permanent: true,
      },
      {
        source: "/battle",
        destination: "/fun/salary-battle",
        permanent: true,
      },
    ];
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