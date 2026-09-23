import { EN_GUIDE_SLUGS } from "./enGuideSlugs";
import { ENGLISH_TOOLS } from "./englishTools";

const toolSlugs: ReadonlySet<string> = new Set(ENGLISH_TOOLS.map(tool => tool.slug));

/** The Pages adapter otherwise serves its Korean static fallback for missing SSG details. */
export function isMissingEnglishDetail(pathname: string) {
  const match = pathname.match(/^\/en\/(guides|tools)\/([^/]+)\/?$/);
  if (!match) return false;
  let slug: string;
  try { slug = decodeURIComponent(match[2]); } catch { return true; }
  return !(match[1] === "guides" ? EN_GUIDE_SLUGS : toolSlugs).has(slug);
}

/**
 * Every prerendered English page (src/app/en/** page.tsx, excluding the dynamic and catch-all
 * segments). src/lib/__tests__/englishUnknownPath.test.ts derives the same list from the file
 * system so a new /en page must be added here or the test fails.
 */
export const ENGLISH_STATIC_PATHS: ReadonlySet<string> = new Set([
  "/en",
  "/en/about",
  "/en/bonus",
  "/en/calculators",
  "/en/contact",
  "/en/dashboard",
  "/en/flat-tax",
  "/en/fun",
  "/en/guides",
  "/en/help",
  "/en/privacy",
  "/en/salary-converter",
  "/en/salary-db",
  "/en/season",
  "/en/terms",
  "/en/tools",
]);

/** The one path the [...missing] catch-all prerenders (build-time 404 inside the English layout). */
export const ENGLISH_UNAVAILABLE_PATH = "/en/page-unavailable";

/**
 * 2026-09-23 CPU 한도(1102) 대응: /en/[...missing] 이 edge 캐치올에서 정적 404 한 장으로 바뀌면서
 * 존재하지 않는 /en/* 직접 요청은 어댑터의 전역(한국어) 정적 404 로 떨어진다 — 그 HTML 은
 * usePathname()="/_not-found" 로 프리렌더된 한국어 헤더라 /en 경로에서 하이드레이션 불일치가 난다.
 * 그래서 미들웨어가 알 수 없는 /en/* 전부를 프리렌더된 영어 404(/en/page-unavailable)로 rewrite 한다.
 * 알려진 경로 = 정적 페이지 집합 + 유효한 guides/tools 상세 + page-unavailable 자신.
 */
export function isUnknownEnglishPath(pathname: string) {
  if (pathname !== "/en" && !pathname.startsWith("/en/")) return false;
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (normalized === ENGLISH_UNAVAILABLE_PATH || ENGLISH_STATIC_PATHS.has(normalized)) return false;
  if (/^\/en\/(guides|tools)\/[^/]+$/.test(normalized)) return isMissingEnglishDetail(normalized);
  return true;
}
