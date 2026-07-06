// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// CSP — AdSense + 쿠팡 파트너스 + Cloudflare Insights 만 허용 (메모리 수익 정책 준수).
// 카카오 Adfit(*.adfit.kakao.com, t1.daumcdn.net) 은 실제 사용 코드가 없어 2026-05-24
// 제거. 운영자 명시 지시 시에만 재추가.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://static.cloudflareinsights.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google;
  frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagmanager.com https://ep2.adtrafficquality.google;
  frame-ancestors 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.googleusercontent.com https://www.google-analytics.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.coupang.com https://ads-partners.coupang.com https://link.coupang.com;
  media-src 'none';
  connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.cloudflareinsights.com;
  font-src 'self' data:;
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
      // GSC 404 출혈 차단 (7차 점검, 2026-07-06 정정):
      // -2/-3 URL은 main 코드·데이터에서 생성된 적 없음(병합 안 된 브랜치 잔재 +
      // 외부 유입 추정 — git 전 이력 검증). 원본 슬러그로 영구 리디렉션(308)해 크롤 예산 회수.
      // 접미사 제거 후 base 슬러그가 실제 id와 다른 3사는 아래 명시 매핑이 먼저 잡는다(1홉).
      {
        source: "/salary-db/kia-motors-2",
        destination: "/salary-db/kia",
        permanent: true,
      },
      {
        source: "/salary-db/kia-motors-3",
        destination: "/salary-db/kia",
        permanent: true,
      },
      {
        source: "/salary-db/kia-motors",
        destination: "/salary-db/kia",
        permanent: true,
      },
      {
        source: "/salary-db/market-kurly-2",
        destination: "/salary-db/kurly",
        permanent: true,
      },
      {
        source: "/salary-db/market-kurly-3",
        destination: "/salary-db/kurly",
        permanent: true,
      },
      {
        source: "/salary-db/market-kurly",
        destination: "/salary-db/kurly",
        permanent: true,
      },
      {
        source: "/salary-db/pearl-abyss-2",
        destination: "/salary-db/pearlabyss",
        permanent: true,
      },
      {
        source: "/salary-db/pearl-abyss-3",
        destination: "/salary-db/pearlabyss",
        permanent: true,
      },
      {
        source: "/salary-db/pearl-abyss",
        destination: "/salary-db/pearlabyss",
        permanent: true,
      },
      {
        source: "/salary-db/:slug([a-z0-9-]+)-2",
        destination: "/salary-db/:slug",
        permanent: true,
      },
      {
        source: "/salary-db/:slug([a-z0-9-]+)-3",
        destination: "/salary-db/:slug",
        permanent: true,
      },
      // 연봉 제보(준비 중 화면+광고 정책 리스크) — 페이지 내 permanentRedirect는
      // 정적 라우트에서 CF가 .meta 308을 무시하고 200을 서빙함(2026-07-07 실측)
      // → 프로덕션 동작이 검증된 config 리다이렉트로 처리
      {
        source: "/salary-db/submit",
        destination: "/salary-db",
        permanent: true,
      },
      // 2025-09 리디렉션 없이 삭제된 구 영문 qna 4종 → 동일 주제의 살아있는 글로 통합
      {
        source: "/qna/interim-severance-pay",
        destination: "/qna/퇴직금-중간정산-아무-때나-받을-수-있나요",
        permanent: true,
      },
      {
        source: "/qna/year-end-tax-preview",
        destination: "/qna/연말정산-13월의-월급이라는데-왜-누구는-토해내나요",
        permanent: true,
      },
      {
        source: "/qna/health-insurance",
        destination: "/glossary/건강보험",
        permanent: true,
      },
      {
        source: "/qna/salary-allowance",
        destination: "/qna",
        permanent: true,
      },
      // 카니발 해소(전체 점검 2026-06): 레거시 /company 인덱스를 /salary-db로 통합.
      // /company/[id]는 이미 page에서 redirect, /company/compare(/[slug])는 noindex 처리,
      // /company/simulator(고유 시뮬레이터)는 유지.
      {
        source: "/company",
        destination: "/salary-db",
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