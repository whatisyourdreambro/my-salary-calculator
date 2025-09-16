// next.config.mjs

import nextBundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * 보안 강화를 위한 HTTP 헤더 설정
 */
const securityHeaders = [
  // 브라우저가 콘텐츠 타입을 추측하지 않고 서버가 명시한 타입을 따르도록 하여 보안 강화
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // 클릭재킹 공격 방지: 다른 사이트에서 iframe으로 내 페이지를 로드하는 것을 막음
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  // XSS(크로스 사이트 스크립팅) 공격을 감지하고 차단하는 브라우저 기능을 활성화
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages와의 호환성을 높이기 위해 standalone 모드로 빌드합니다.
  output: "standalone",

  // [추가] 보안 헤더를 응답에 추가하는 설정
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
