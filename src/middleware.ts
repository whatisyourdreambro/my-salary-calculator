import { NextResponse, type NextRequest } from "next/server";

// Edge runtime — Cloudflare Pages 호환 (Web API만 사용)
// Node.js 전용 API 절대 금지: fs, crypto.randomBytes 등

// 차단할 봇 (SEO 분석 봇 + AI 학습 봇 + 스크래퍼)
const BAD_BOTS = /(SemrushBot|AhrefsBot|MJ12bot|Bytespider|DotBot|PetalBot|SeznamBot|YandexBot|BLEXBot|DataForSeoBot|SerpstatBot|MegaIndex|Barkrowler|ZoominfoBot|ImagesiftBot|Amazonbot|ClaudeBot|PerplexityBot|cohere-ai|MauiBot|SerendeputyBot|MJ12)/i;

// 의심 User-Agent (보통 사용자가 쓰지 않는 라이브러리/CLI)
const SUSPICIOUS_UA = /^(curl|python-requests|Go-http-client|libwww-perl|Java\/|node-fetch|axios|okhttp|aiohttp|HTTrack|wget|scrapy|httpx)/i;

// 절대 차단하면 안 되는 화이트리스트 (정상 검색·광고 봇)
// AdSense, GA, 검색엔진은 사이트 운영의 생명선
const ALLOWED_BOTS = /(Googlebot|AdsBot-Google|Mediapartners-Google|Google-InspectionTool|Bingbot|NaverBot|Yeti|Daum|DuckDuckBot|Applebot|FacebookExternalHit|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|KakaoTalk-scrap)/i;

export function middleware(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";

  // 1) 화이트리스트는 즉시 통과 (가장 먼저 체크)
  if (ALLOWED_BOTS.test(ua)) {
    return NextResponse.next();
  }

  // 2) UA 누락 또는 명백한 봇/스크래퍼 차단
  if (!ua || BAD_BOTS.test(ua) || SUSPICIOUS_UA.test(ua)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Next 내부 자산·robots·sitemap·OG 이미지·favicon은 미들웨어 통과
    // (Googlebot이 robots.txt와 sitemap을 받아야 정상 색인됨)
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api/og|opengraph-image|naver226c8e8c348e204e98efbcf23514d286.html).*)",
  ],
};
