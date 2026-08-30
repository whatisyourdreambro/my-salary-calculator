// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// CSP — AdSense + 쿠팡 파트너스 + Cloudflare Insights 만 허용 (메모리 수익 정책 준수).
// 카카오 Adfit(*.adfit.kakao.com, t1.daumcdn.net) 은 실제 사용 코드가 없어 2026-05-24
// 제거. 운영자 명시 지시 시에만 재추가.
// 카카오 공유 SDK(t1.kakaocdn.net script / sharer.kakao.com form / kapi.kakao.com)는
// 운영자가 JS 키를 발급·제공(2026-08-16)하여 허용 — 광고 아닌 공유 전용.
// fundingchoicesmessages.google.com — AdSense CMP(EEA 동의 메시지). 운영자가 콘솔에서
// CMP 게시 시 이 도메인의 스크립트·iframe 이 로드됨 — CMP 게시 전에 반드시 이 CSP 가
// 먼저 배포돼 있어야 유럽 방문자 화면에서 동의창이 차단되지 않는다 (2026-08-23).
// 2026-08-24 점검(운영자 승인): 쿠팡 배너 이미지 CDN(*.coupangcdn.com)·AdSense 무결성
// 픽셀(*.adtrafficquality.google)을 img-src에, 구글 앵커 프레임(www.google.com)을
// frame-src에 추가 — CSP 적용 환경에서 광고 리소스가 차단되던 누락분.
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://static.cloudflareinsights.com https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://t1.kakaocdn.net https://fundingchoicesmessages.google.com;
  frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.googletagmanager.com https://www.google.com https://ep2.adtrafficquality.google https://fundingchoicesmessages.google.com;
  frame-ancestors 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.googleusercontent.com https://www.google-analytics.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.coupang.com https://ads-partners.coupang.com https://link.coupang.com https://*.coupangcdn.com https://*.adtrafficquality.google;
  media-src 'none';
  connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://stats.g.doubleclick.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.googlesyndication.com https://*.doubleclick.net https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google https://*.cloudflareinsights.com https://kapi.kakao.com;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://sharer.kakao.com;
`
  .replace(/\s{2,}/g, " ")
  .trim();

// /widget/* 임베드 위젯 전용 CSP — 외부 블로그 iframe 허용(frame-ancestors *).
// 정본은 라우트 핸들러(src/app/widget/salary/route.ts)가 직접 세팅하는 응답 헤더다
// (next-on-pages가 headers()를 정적 라우트에 안 내보내는 실측 2026-08-16).
// 이 값은 dev 패리티용 — 핸들러와 반드시 동일 값 유지 (다르면 CSP 중복 시 교집합 강제).
const widgetCsp =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; frame-ancestors *; base-uri 'none'; form-action 'none'";

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
      // 회사 중복 정본화 (2026-08-30): 동일 회사 2중 등재 5쌍 병합(hd-korea-shipbuilding 포함) — 제거 id → 정본 id
      {
        source: "/salary-db/toss-viva",
        destination: "/salary-db/toss",
        permanent: true,
      },
      {
        source: "/salary-db/bucketplace",
        destination: "/salary-db/ohou",
        permanent: true,
      },
      {
        source: "/salary-db/posco-holdings",
        destination: "/salary-db/posco",
        permanent: true,
      },
      {
        source: "/salary-db/olive-young",
        destination: "/salary-db/cj-oliveyoung",
        permanent: true,
      },
      {
        source: "/salary-db/hd-korea-shipbuilding",
        destination: "/salary-db/hd-ksoe",
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
      {
        // /salary-db/compare 인덱스(슬러그 없음)는 page 미존재 404였음 —
        // 가이드 2곳(company-salary-deepdive-2026)이 링크 중이라 DB 허브로 흡수.
        // /salary-db/compare/[slug] 상세 413쌍에는 영향 없음 (정확 경로만 매칭).
        source: "/salary-db/compare",
        destination: "/salary-db",
        permanent: true,
      },
      // ─────────────────────────────────────────────────────────────────
      // 레거시 가이드 90건 301 (2026-08-15 수익 개선 Phase 2):
      // 과거 삭제된 /guides/* URL(빈 디렉터리 잔재 91개 중 살아있는
      // nurse-salary 1건 제외)을 주제 일치 페이지로 영구 리디렉션.
      // 전 타깃은 .next 빌드 산출물로 실존 검증 완료. 페이지 내
      // permanentRedirect는 CF Pages 정적 라우트에서 미동작(실측)이라
      // 반드시 이 config 경로만 사용한다.
      // ─────────────────────────────────────────────────────────────────
      {
        source: "/guides/2025-changing-tax-laws-what-s-favorable-for-me",
        destination: "/tax-changes-2026",
        permanent: true,
      },
      {
        source: "/guides/2025-large-corp-new-hire-salary-top10",
        destination: "/new-employee-salary-2026",
        permanent: true,
      },
      {
        source: "/guides/2025-promising-jobs-top-10",
        destination: "/guides/industry-best-jobs-2026",
        permanent: true,
      },
      {
        source: "/guides/2025-salary-guide",
        destination: "/guides/salary-guide-2026",
        permanent: true,
      },
      {
        source: "/guides/4-day-week",
        destination: "/hub/career",
        permanent: true,
      },
      {
        source: "/guides/bitcoin-crypto-investment-is-now-the-time",
        destination: "/guides/bitcoin-halving-strategy",
        permanent: true,
      },
      {
        source: "/guides/bonus-payment-criteria-why-is-my-company-s-low",
        destination: "/guides/performance-pay-complete-2026",
        permanent: true,
      },
      {
        source: "/guides/bonus-tax",
        destination: "/guides/bonus-tax-rate",
        permanent: true,
      },
      {
        source: "/guides/burnout-syndrome-what-office-workers-must-know",
        destination: "/guides/burnout-syndrome",
        permanent: true,
      },
      {
        source: "/guides/car-tax-how-much-can-i-save-by-paying-annually",
        destination: "/guides/car-tax-annual-payment",
        permanent: true,
      },
      {
        source: "/guides/career-change-can-non-majors-become-it-developers",
        destination: "/guides/career-change-mid-level",
        permanent: true,
      },
      {
        source: "/guides/career-description-key-to-job-change-success",
        destination: "/guides/resume-writing-tips",
        permanent: true,
      },
      {
        source: "/guides/child-tax-credit-benefits-not-to-miss",
        destination: "/calc/child-deduction",
        permanent: true,
      },
      {
        source: "/guides/civil-servant-salary",
        destination: "/job/civil-servant-9",
        permanent: true,
      },
      {
        source: "/guides/compound-interest",
        destination: "/tools/finance/compound",
        permanent: true,
      },
      {
        source: "/guides/comprehensive-income-tax-filing-complete-guide-for-n-jobbers",
        destination: "/guides/n-job-tax-2026",
        permanent: true,
      },
      {
        source: "/guides/contract-worker-salary-negotiation-for-permanent-conversion",
        destination: "/guides/salary-negotiation-script-2026",
        permanent: true,
      },
      {
        source: "/guides/didimdol-vs-bogeumjari",
        destination: "/guides/newlywed-didimdol-bomgijari-2026",
        permanent: true,
      },
      {
        source: "/guides/dividend-stock-investment-how-to-receive-regularly-like-rent",
        destination: "/guides/dividend-vs-growth-tax-2026",
        permanent: true,
      },
      {
        source: "/guides/dollar-cost-averaging-how-to-maximize-compound-interest",
        destination: "/calc/dollar-cost-average",
        permanent: true,
      },
      {
        // 비ASCII source는 인코딩 필수 — Next redirects()는 요청 경로를 퍼센트 인코딩 상태로
        // 매칭하므로 한글 리터럴 source는 영원히 매칭되지 않는다 (효자 → %ED%9A%A8%EC%9E%90)
        source: "/guides/donation-tax-credit-year-end-tax-settlement-%ED%9A%A8%EC%9E%90-item",
        destination: "/guides/donation-tax-credit",
        permanent: true,
      },
      {
        source: "/guides/education-expense-tax-credit-are-student-loans-deductible",
        destination: "/guides/child-education-deduction-limit-2026",
        permanent: true,
      },
      {
        source: "/guides/etf-investment-from-stock-selection-to-trading-strategy",
        destination: "/guides/etf-investment-starter",
        permanent: true,
      },
      {
        source: "/guides/exchange-rate-deep-dive",
        destination: "/guides/currency-exchange-2026",
        permanent: true,
      },
      {
        source: "/guides/exchange-rate-impact",
        destination: "/calc/exchange-impact-quick",
        permanent: true,
      },
      {
        source: "/guides/first-job-investment",
        destination: "/guides/first-job-financial-setup",
        permanent: true,
      },
      {
        source: "/guides/foreign-company-salary-how-different-from-domestic",
        destination: "/guides/foreign-company-korea-2026",
        permanent: true,
      },
      {
        source: "/guides/four-major-insurances",
        destination: "/guides/four-major-insurance-complete",
        permanent: true,
      },
      {
        source: "/guides/freelancer-hourly-rate-guide-to-setting-fair-price",
        destination: "/calc/hourly-billing-rate",
        permanent: true,
      },
      {
        source: "/guides/gold-investment-charm-and-methods-of-safe-haven-assets",
        destination: "/guides/gold-investment-methods",
        permanent: true,
      },
      {
        source: "/guides/holiday-allowance",
        destination: "/weekly-holiday-allowance-2026",
        permanent: true,
      },
      {
        source: "/guides/housing-subscription-savings-how-to-make-a-1st-priority-account",
        destination: "/guides/subscription-account-tips",
        permanent: true,
      },
      {
        source: "/guides/housing-subscription-savings-priority",
        destination: "/calc/housing-subscription",
        permanent: true,
      },
      {
        source: "/guides/how-to-find-a-company-with-good-work-life-balance",
        destination: "/guides/employer-blacklist-check-2026",
        permanent: true,
      },
      {
        source: "/guides/how-to-read-economic-indicators-utilizing-for-investment",
        destination: "/hub/invest",
        permanent: true,
      },
      {
        source: "/guides/hyundai-salary",
        destination: "/salary-db/hyundai",
        permanent: true,
      },
      {
        source: "/guides/industry-trends-2025",
        destination: "/industry",
        permanent: true,
      },
      {
        source: "/guides/inheritance-tax-vs-gift-tax-preparing-for-asset-transfer",
        destination: "/guides/inheritance-tax-2026",
        permanent: true,
      },
      {
        source: "/guides/investment-psychology-how-to-overcome-fear-and-greed",
        destination: "/hub/invest",
        permanent: true,
      },
      {
        source: "/guides/isa-account-all-about-the-all-purpose-tax-saving-account",
        destination: "/guides/isa-account-guide",
        permanent: true,
      },
      {
        source: "/guides/it-developer-salary-comparison-by-role",
        destination: "/job/software-engineer",
        permanent: true,
      },
      {
        source: "/guides/jeonse-deposit-return-guarantee-should-i-join",
        destination: "/guides/rent-deposit-protection",
        permanent: true,
      },
      {
        source: "/guides/job-change-success-strategy-200-percent-use-of-headhunters",
        destination: "/guides/job-change-salary-jump-2026",
        permanent: true,
      },
      {
        source: "/guides/job-competency-enhancement-online-courses-vs-study-groups",
        destination: "/hub/career",
        permanent: true,
      },
      {
        source: "/guides/linkedin-profile-how-to-make-headhunters-contact-you",
        destination: "/guides/linkedin-networking",
        permanent: true,
      },
      {
        source: "/guides/medical-expense-tax-credit-how-to-keep-receipts-carefully",
        destination: "/medical-tax-credit-2026",
        permanent: true,
      },
      {
        source: "/guides/minimum-wage",
        destination: "/minimum-wage-2026",
        permanent: true,
      },
      {
        source: "/guides/naver-vs-kakao",
        // compare 슬러그는 데이터 의존(페어 목록 변경 시 404 위험) — 안정 URL로 교체
        destination: "/salary-db/naver",
        permanent: true,
      },
      {
        source: "/guides/nekarakubae-salary",
        destination: "/guides/nekarakubae-salary-truth",
        permanent: true,
      },
      {
        source: "/guides/non-salary-allowances-benefits-not-to-miss",
        destination: "/guides/tax-free-meal-commute-2026",
        permanent: true,
      },
      {
        source: "/guides/nurse-5yr-salary",
        destination: "/job/nurse",
        permanent: true,
      },
      {
        source: "/guides/office-worker-self-development-time-management-know-how",
        destination: "/hub/career",
        permanent: true,
      },
      {
        source: "/guides/overseas-bond-investment-pursuing-stable-returns",
        destination: "/guides/us-treasury-bond",
        permanent: true,
      },
      {
        source: "/guides/p2p-investment-temptation-and-risk-of-high-returns",
        destination: "/guides/p2p-investment-risk",
        permanent: true,
      },
      {
        source: "/guides/pension-savings-fund-vs-irp-which-is-right-for-me",
        destination: "/guides/irp-pension-isa-comparison-2026",
        permanent: true,
      },
      {
        source: "/guides/portfolio-construction-creating-my-own-investment-strategy",
        destination: "/calc/portfolio-allocation",
        permanent: true,
      },
      {
        source: "/guides/portfolio-secret-to-increasing-acceptance-rate",
        destination: "/guides/resume-writing-tips",
        permanent: true,
      },
      {
        source: "/guides/property-tax-relationship-between-public-housing-price-and-tax",
        destination: "/property-holding-tax-2026",
        permanent: true,
      },
      {
        source: "/guides/public-enterprise-salary-reality-in-blind-recruitment-era",
        destination: "/guides/public-company-salary-ranking-2026",
        permanent: true,
      },
      {
        source: "/guides/re-employment-after-resignation-unemployment-benefits-and-career-management",
        destination: "/unemployment-benefit",
        permanent: true,
      },
      {
        source: "/guides/real-estate-investment-apartment-vs-officetel-vs-commercial",
        destination: "/guides/officetel-investment",
        permanent: true,
      },
      {
        source: "/guides/retirement-pension-dc-vs-db-which-is-better-for-me",
        destination: "/retirement-pension-2026",
        permanent: true,
      },
      {
        source: "/guides/road-to-100m-part1-tax",
        destination: "/hub/tax-saving",
        permanent: true,
      },
      {
        source: "/guides/road-to-100m-part2-sidejob",
        destination: "/guides/side-project-income",
        permanent: true,
      },
      {
        source: "/guides/road-to-100m-part3-invest",
        destination: "/hub/invest",
        permanent: true,
      },
      {
        source: "/guides/salary-100m-net-income-how-to-avoid-tax-bomb",
        destination: "/salary/100000000",
        permanent: true,
      },
      {
        source: "/guides/salary-30m-net-income-and-financial-strategy",
        destination: "/salary/30000000",
        permanent: true,
      },
      {
        source: "/guides/salary-4500",
        destination: "/salary/45000000",
        permanent: true,
      },
      {
        source: "/guides/salary-60m-net-income-and-tax-reduction",
        destination: "/salary/60000000",
        permanent: true,
      },
      {
        source: "/guides/salary-80m-net-income-and-asset-growth-strategy",
        destination: "/salary/80000000",
        permanent: true,
      },
      {
        source: "/guides/salary-negotiation-in-interview-how-to-succeed",
        destination: "/guides/salary-negotiation-real-scripts-2026",
        permanent: true,
      },
      {
        source: "/guides/salary-negotiation",
        destination: "/guides/salary-negotiation-secret",
        permanent: true,
      },
      {
        source: "/guides/sales-salary-secret-to-earning-100m-plus-with-incentives",
        destination: "/guides/performance-pay-complete-2026",
        permanent: true,
      },
      {
        source: "/guides/samsung-vs-hynix",
        destination: "/guides/samsung-vs-hynix-employee-comparison",
        permanent: true,
      },
      {
        source: "/guides/severance-pay",
        destination: "/tools/finance/severance",
        permanent: true,
      },
      {
        source: "/guides/severance-tax",
        destination: "/calc/retirement-income-tax-quick",
        permanent: true,
      },
      {
        source: "/guides/side-projects-shortcut-to-career-growth",
        destination: "/guides/side-project-income",
        permanent: true,
      },
      {
        source: "/guides/sme-salary-how-to-earn-as-much-as-large-corps",
        destination: "/guides/big-corp-vs-mid-2026",
        permanent: true,
      },
      {
        source: "/guides/startup-salary-dream-of-stock-option-jackpot",
        destination: "/guides/stock-options-rsu-valuation",
        permanent: true,
      },
      {
        source: "/guides/stock-investment-first-steps-for-beginners",
        destination: "/guides/stock-investment-beginner-2026",
        permanent: true,
      },
      {
        source: "/guides/stock-transfer-income-tax-must-read-for-overseas-investors",
        destination: "/guides/capital-gains-tax-stock",
        permanent: true,
      },
      {
        source: "/guides/subscription-lottery-winning-strategy-secret-to-increasing-points",
        destination: "/guides/youth-subscription-60points-2026",
        permanent: true,
      },
      {
        source: "/guides/unemployment-benefits",
        destination: "/unemployment-benefit",
        permanent: true,
      },
      {
        source: "/guides/us-stock-investment-how-to-deal-with-exchange-rate-fluctuations",
        destination: "/guides/dollar-investment",
        permanent: true,
      },
      {
        source: "/guides/value-investing-vs-growth-investing-which-style-is-right-for-me",
        destination: "/hub/invest",
        permanent: true,
      },
      {
        source: "/guides/vat-what-sole-proprietors-must-know",
        destination: "/guides/vat-filing-2026",
        permanent: true,
      },
      {
        source: "/guides/workplace-bullying-how-to-deal-with-it-wisely",
        destination: "/guides/sexual-harassment-protection-2026",
        permanent: true,
      },
      {
        source: "/guides/year-end-tax-monthly-rent",
        destination: "/guides/monthly-rent-tax-credit",
        permanent: true,
      },
      {
        source: "/guides/year-end-tax-settlement",
        destination: "/year-end-tax",
        permanent: true,
      },
      {
        source: "/guides/yef-2026-preview",
        destination: "/guides/hometax-year-end-preview-2026",
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
        // 모든 경로에 보안 헤더 및 기본 캐시 정책 적용.
        // [2026-08-10] s-maxage=1 → 3600: 사실상 무캐시였던 전역 정책이 매 요청을
        // Worker로 보내 무료 플랜 일 10만 요청 한도 초과의 주범이었음. 콘텐츠는
        // 배포 시에만 바뀌고(개인화는 전부 클라이언트 localStorage) Pages가 배포
        // 시 캐시를 퍼지하므로 1시간 엣지 캐시는 안전. max-age=0으로 브라우저는
        // 항상 재검증(엣지에서 즉시 응답).
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          }
        ],
      },
      // 임베드 위젯 — 전역 CSP(frame-ancestors 'self')·XFO(SAMEORIGIN)를 교체해
      // 외부 블로그 iframe 삽입 허용. 전역 규칙 뒤에 있어야 같은 키를 이긴다.
      // XFO는 allow-all 표현이 없어 무효값(ALLOWALL)으로 덮음 — 모던 브라우저는
      // CSP frame-ancestors가 있으면 XFO를 무시하므로 무해.
      {
        source: "/widget/:path*",
        headers: [
          { key: "Content-Security-Policy", value: widgetCsp },
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      },
      // GSC 5xx 대응 (2026-08): 세법 고정 콘텐츠 3종은 엣지 6시간 캐시로
      // 구글봇 크롤을 Worker 실행 없이 CDN에서 흡수 (edge SSR CPU 한도 초과 방지).
      // headers()는 매칭되는 모든 규칙을 적용하되 같은 키는 나중 규칙이 이기므로,
      // 아래 규칙들은 반드시 전역 규칙(/:path*) 뒤에 있어야 s-maxage=1을 오버라이드한다.
      // (보안 헤더는 전역 규칙에서 그대로 상속됨 — Cache-Control 키만 교체)
      {
        source: "/salary/:amount*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/glossary/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/qna/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
          },
        ],
      },
      // [2026-08-10] 요청 한도 대응 — 배포 시에만 변하는 고트래픽 정적 콘텐츠
      // 라우트군을 기존 3종과 동일한 6시간 엣지 캐시로 확대. 크롤러·프리페치·
      // 재방문 요청을 CDN에서 흡수해 Worker 호출을 줄인다.
      ...[
        // 홈(+/?tab= 쿼리 변형 6종 — CF 캐시 키는 쿼리 포함이라 변형별 캐시)
        "/",
        "/table/:path*",
        "/calc/:path*",
        "/job/:slug*",
        "/region/:slug*",
        "/industry/:slug*",
        "/salary-db/:path*",
        "/hub/:path*",
        "/guides/:slug*",
        // [2026-08-24 점검] 동일 성격인데 전역 1시간만 적용되던 라우트군 확대 —
        // 시즌 피크(추석·연말정산) 트래픽을 CDN에서 흡수해 Worker 호출 방어.
        "/monthly/:amount*",
        "/tools/:path*",
        "/fun/:path*",
        "/insights/:path*",
        "/en/:path*",
        // 시즌·정책 단독 페이지 36종 (src/app의 *-2026|*-2027|year-end-tax* 디렉터리와 동기)
        "/auto-tax-2026",
        "/basic-pension-2026",
        "/career-stages-2026",
        "/chuseok-bonus-2026",
        "/civil-servant-pay-2026",
        "/civil-servant-pay-2027",
        "/credit-card-deduction-2026",
        "/fortune-2026",
        "/health-checkup-2026",
        "/health-insurance-2026",
        "/health-insurance-fee-2026",
        "/income-tax-2026",
        "/medical-tax-credit-2026",
        "/minimum-wage-2026",
        "/minimum-wage-2027",
        "/national-pension-estimate-2026",
        "/new-employee-2026",
        "/new-employee-salary-2026",
        "/property-holding-tax-2026",
        "/rent-tax-credit-2026",
        "/retirement-pension-2026",
        "/salary-raise-2026",
        "/samsung-negotiation-2026",
        "/savings-interest-2026",
        "/social-insurance-rates-2026",
        "/tax-changes-2026",
        "/tax-rates-2026",
        "/tax-reform-2026",
        "/weekly-holiday-allowance-2026",
        "/year-end-tax",
        "/year-end-tax-2026",
        "/year-end-tax-2027",
        "/year-end-tax-checklist",
        "/year-end-tax-mid-resign",
        "/year-end-tax-preview",
        "/year-end-tax-settlement-2026",
      ].map((source) => ({
        source,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
          },
        ],
      })),
      // 크롤러가 고빈도로 가져가는 메타 파일·생성 이미지 라우트 — 내용이 사실상
      // 고정이므로 길게 캐시해 Worker 호출을 차단.
      ...[
        "/sitemap.xml",
        "/rss.xml",
        "/rss-companies.xml",
        "/robots.txt",
        "/icon",
        "/apple-icon",
        "/opengraph-image",
        "/api/og",
        "/api/salary-table",
      ].map((source) => ({
        source,
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      })),
    ];
  },
};

export default withBundleAnalyzer(nextConfig);