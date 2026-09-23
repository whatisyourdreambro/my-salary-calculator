import { NextResponse, type NextRequest } from "next/server";
import { isGuideSearchVariant } from "@/lib/guideDiscovery";
import { ENGLISH_UNAVAILABLE_PATH, isUnknownEnglishPath } from "@/lib/englishRouteGuard";
import { resolveSalaryRedirect } from "@/lib/salaryRedirect";
import { cloudflareAssets, type AssetFetcher } from "@/lib/server/cloudflareAssets";

// Edge runtime — Cloudflare Pages 호환 (Web API만 사용)
// Node.js 전용 API 절대 금지: fs, crypto.randomBytes 등

// 차단할 봇 (SEO 분석 봇 + 무단 스크래퍼)
// ⚠️ ClaudeBot·PerplexityBot·cohere-ai는 AI 검색 유입 통로 → 허용 (robots.ts 정책과 통일)
const BAD_BOTS = /(SemrushBot|AhrefsBot|MJ12bot|Bytespider|DotBot|PetalBot|SeznamBot|YandexBot|BLEXBot|DataForSeoBot|SerpstatBot|MegaIndex|Barkrowler|ZoominfoBot|ImagesiftBot|MauiBot|SerendeputyBot)/i;

// 의심 User-Agent (보통 사용자가 쓰지 않는 라이브러리/CLI)
const SUSPICIOUS_UA = /^(curl|python-requests|Go-http-client|libwww-perl|Java\/|node-fetch|axios|okhttp|aiohttp|HTTrack|wget|scrapy|httpx)/i;

// 절대 차단하면 안 되는 화이트리스트 (정상 검색·광고 봇 + AI 검색 크롤러)
// AI 크롤러(ChatGPT·Perplexity·Claude 등)는 AI 검색 유입 통로 → 화이트리스트
const ALLOWED_BOTS = /(Googlebot|AdsBot-Google|Mediapartners-Google|Google-InspectionTool|Bingbot|NaverBot|Yeti|Daum|DuckDuckBot|Applebot|FacebookExternalHit|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|KakaoTalk-scrap|ClaudeBot|PerplexityBot|GPTBot|Google-Extended|cohere-ai|anthropic-ai|Amazonbot)/i;

// 영어 404 응답 헤더 — 색인 제외 + 캐시 금지 (rewrite 경로와 직접 응답 경로 공통)
const ENGLISH_404_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "private, no-store",
} as const;

// next dev/start 용: /en/page-unavailable 은 [...missing] 이 빌드 시 프리렌더한 영어 404 이며
// Node 서버는 .meta 의 404 상태를 존중한다. A rewrite preserves the requested URL.
function rewriteToEnglishUnavailable(req: NextRequest): NextResponse {
  const missing = NextResponse.rewrite(new URL(ENGLISH_UNAVAILABLE_PATH, req.url));
  for (const [key, value] of Object.entries(ENGLISH_404_HEADERS)) missing.headers.set(key, value);
  return missing;
}

// Cloudflare Pages 용: next-on-pages 는 프리렌더 페이지의 initialStatus(404)를 버리고 200 으로
// 서빙한다(정적 라우트의 프리렌더 308 이 200 으로 나오던 실측과 같은 층, 2026-09-23 리뷰 확인).
// 그래서 프리렌더된 영어 404 HTML 을 ASSETS 바인딩에서 직접 읽어 상태 404 로 응답한다.
// 자산을 못 읽으면 rewrite 로 폴백(상태는 어댑터가 주는 대로, noindex 헤더는 유지).
async function serveEnglishNotFound(assets: AssetFetcher, req: NextRequest): Promise<NextResponse> {
  try {
    for (const path of [`${ENGLISH_UNAVAILABLE_PATH}.html`, ENGLISH_UNAVAILABLE_PATH]) {
      const asset = await assets.fetch(new URL(path, req.url));
      const type = asset.headers.get("content-type") || "";
      if (asset.status === 200 && type.includes("text/html")) {
        return new NextResponse(asset.body, {
          status: 404,
          headers: { "Content-Type": type, ...ENGLISH_404_HEADERS },
        });
      }
    }
  } catch {
    // 바인딩 장애 — 아래 rewrite 폴백
  }
  return rewriteToEnglishUnavailable(req);
}

function nextResponse(req: NextRequest): NextResponse | Promise<NextResponse> {
  // /salary/* 격자 밖 금액·구형 {N}-manwon·{N}-eok 는 404 대신 가장 가까운 정적 페이지로 308
  // (GSC 404 312건의 예시가 전부 이 형태, 2026-09-11). 집합은 코드젠 상수(~5KB) — 무거운 import 금지.
  const salaryTarget = resolveSalaryRedirect(req.nextUrl.pathname);
  if (salaryTarget) {
    const url = req.nextUrl.clone();
    url.pathname = salaryTarget;
    return NextResponse.redirect(url, 308);
  }
  if (isUnknownEnglishPath(req.nextUrl.pathname)) {
    // 2026-09-23: edge 캐치올(/en/[...missing])을 정적으로 바꾸면서 guides/tools 상세만이 아니라
    // 알 수 없는 /en/* 전부를 영어 404 로 보낸다 — 전역 한국어 404 로 떨어지면 영어 헤더와
    // 하이드레이션 불일치가 나고 qa:english 게이트(404·영어 문구·noindex)도 깨진다.
    const assets = cloudflareAssets();
    return assets ? serveEnglishNotFound(assets, req) : rewriteToEnglishUnavailable(req);
  }
  const response = NextResponse.next();
  // q 검색은 허브와 같은 정적 HTML/canonical을 쓰는 탐색 화면이다.
  // 서버 searchParams로 정적 생성을 깨지 않고 응답에서만 색인을 제외한다.
  // 빈 q·정규 허브·카테고리 허브·개별 가이드는 해당하지 않는다.
  if (isGuideSearchVariant(req.nextUrl.pathname, req.nextUrl.searchParams)) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export function middleware(req: NextRequest): NextResponse | Promise<NextResponse> {
  // 0) non-www → www 301 redirect (canonical host 통합)
  // 두 호스트 모두 200 응답하면 Google이 중복 콘텐츠로 인식 → 권한 분산.
  // canonical 메타로도 처리되지만 301이 가장 강력한 신호.
  const host = req.headers.get("host") || "";
  if (host === "moneysalary.com") {
    const url = req.nextUrl.clone();
    url.host = "www.moneysalary.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  const ua = req.headers.get("user-agent") || "";

  // 1) 화이트리스트는 즉시 통과 (가장 먼저 체크)
  if (ALLOWED_BOTS.test(ua)) {
    return nextResponse(req);
  }

  // 2) UA 누락 또는 명백한 봇/스크래퍼 차단
  if (!ua || BAD_BOTS.test(ua) || SUSPICIOUS_UA.test(ua)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return nextResponse(req);
}

export const config = {
  matcher: [
    // Next 내부 자산·robots·sitemap·RSS·OG 이미지·favicon은 미들웨어 통과
    // (Googlebot이 robots.txt와 sitemap을 받아야 정상 색인됨.
    //  rss.xml은 RSS 수집기 UA가 SUSPICIOUS_UA에 걸려 403 나던 문제 해소.
    //  rss-companies.xml도 동일 — 네이버 서치어드바이저 수집 채널이 axios류
    //  UA로 접근하면 403이 나 피드 목적 자체가 무력화되던 비대칭 해소, 2026-08-24)
    //  insights/<slug>/data.csv·data.json 은 리포트 원본 데이터 내려받기 — curl·pandas·
    //  기자 도구 UA(SUSPICIOUS_UA)가 403 나면 재사용 통로 자체가 막히므로 rss 와 동일 제외, 2026-09-05)
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|rss.xml|rss-companies.xml|insights/[a-z0-9-]+/data.csv|insights/[a-z0-9-]+/data.json|api/og|opengraph-image|naver226c8e8c348e204e98efbcf23514d286.html).*)",
  ],
};
