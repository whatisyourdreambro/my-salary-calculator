/** Public URLs only. Explicit result approval permits text/local files, never URL-encoded inputs. */
export const SHARE_ORIGIN = "https://www.moneysalary.com";
export type ShareLocale = "ko" | "en";
export type ShareMode = "page" | "result";

export function resolveShareLocale(path: string, explicit?: ShareLocale): ShareLocale {
  return explicit ?? (/^\/en(?:\/|$)/.test(path) ? "en" : "ko");
}

export function isShareExcludedPath(path: string): boolean {
  return /^\/(?:en\/)?(?:api|_next|_not-found|contact|dashboard|report|favorites|widget)(?:\/|$)/.test(path);
}

export function isLegacyResultPath(path: string): boolean {
  return /^\/share(?:\/|$)/.test(path);
}

/** Same-site public paths only; never carry search, fragment, credentials or result tokens. */
export function publicShareUrl(input: string): string | null {
  try {
    if (/[\\\u0000-\u001f\u007f]/.test(input)) return null;
    const url = new URL(input, SHARE_ORIGIN);
    if (!/^https?:$/.test(url.protocol) || !["www.moneysalary.com", "moneysalary.com"].includes(url.hostname) || url.port || url.username || url.password) return null;
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const decoded = decodeURIComponent(path);
    if (/[\\\u0000-\u001f\u007f]/.test(decoded) || /\/\//.test(path) || /%2f|%5c|%25/i.test(path) || isShareExcludedPath(decoded)) return null;
    if (isLegacyResultPath(decoded)) return `${SHARE_ORIGIN}/`;
    return `${SHARE_ORIGIN}${path}`;
  } catch {
    return null;
  }
}

export function defaultShareTitle(locale: ShareLocale): string {
  return locale === "en" ? "Moneysalary — Korea Salary Calculator" : "머니샐러리 — 연봉 실수령액 계산기";
}

export interface SharePageContext {
  pathname: string;
  canonical: string | null;
  title: string;
  notFound: boolean;
  /**
   * The head's og:image (build-time page metadata). Only safePageOgImage() lets it leave the page (B38).
   * Optional: the favorites action-boundary snapshot has none, and none means the path-only card.
   */
  ogImage?: string | null;
}

const PAGE_OG_DEFAULT = `${SHARE_ORIGIN}/og-default.png`;
const PAGE_OG_ENDPOINT = `${SHARE_ORIGIN}/api/og`;
// Page-level card keys only. Result keys (amount, net, netPay) and anything else are refused.
const PAGE_OG_KEYS = new Set(["path", "title", "name", "type", "lang", "v"]);
// Same limit as the OG renderer (ogImageCache MAX_TEXT_CHARACTERS).
const PAGE_OG_TEXT_MAX = 120;

/**
 * B38 (owner approval 2026-11-01, item 8): a page's own og:image may become its Kakao card only when it is
 * one of our public build-time cards: exactly the static default PNG, or /api/og with page-level keys and a
 * title/name of at most 120 characters. Anything else (result values, unknown or repeated keys, another
 * host/scheme/port, a fragment, whitespace or control characters) returns null, and callers keep the path-only card.
 */
export function safePageOgImage(value: string | null | undefined): string | null {
  if (typeof value !== "string" || !value || value.length > 2048 || /[\s\\\u0000-\u001f\u007f]/.test(value)) return null;
  if (value === PAGE_OG_DEFAULT) return value;
  if (value !== PAGE_OG_ENDPOINT && !value.startsWith(`${PAGE_OG_ENDPOINT}?`)) return null;
  try {
    const url = new URL(value);
    if (url.hash) return null;
    const seen = new Set<string>();
    for (const [key, text] of url.searchParams) {
      if (!PAGE_OG_KEYS.has(key) || seen.has(key)) return null;
      seen.add(key);
      if ((key === "title" || key === "name") && Array.from(text).length > PAGE_OG_TEXT_MAX) return null;
    }
    return value;
  } catch {
    return null;
  }
}

/** A previous route's head must not become the next route's share title. */
export function isSharePageReady(context: SharePageContext | null, pathname: string): boolean {
  if (!context || context.notFound || isShareExcludedPath(pathname)) return false;
  // Next/router and DOM can represent a Korean reference slug decoded or URL-encoded.
  try {
    if (new URL(context.pathname, SHARE_ORIGIN).pathname !== new URL(pathname, SHARE_ORIGIN).pathname) return false;
  } catch {
    return false;
  }
  if (isLegacyResultPath(pathname)) return true; // Page mode maps this to home, never its personal title.
  const pageUrl = publicShareUrl(pathname);
  const canonicalUrl = context.canonical ? publicShareUrl(context.canonical) : null;
  return !!pageUrl && !!canonicalUrl && canonicalUrl === pageUrl;
}

/**
 * head 를 아직 한 번도 읽지 못한 상태 — SSR·하이드레이션 첫 렌더(스냅숏 null).
 * 인라인 공유·즐겨찾기 버튼이 이 동안 같은 크기의 보이지 않는 자리만 잡는 데 쓴다(OPP-21, 화면 밀림 방지).
 * 스냅숏이 한 번이라도 생기면(클라이언트 구독 직후) 대기가 아니다 — 경로·정본이 끝내 안 맞는 쪽에
 * 보이지 않는 자리가 남지 않고 종전처럼 '없음'이 된다. 결과가 항상 '없음'인 경로(공유 제외·공개 URL 불가)도 대기가 아니다.
 */
export function isSharePageContextPending(context: SharePageContext | null, pathname: string): boolean {
  if (context || isShareExcludedPath(pathname) || !publicShareUrl(pathname)) return false;
  return true;
}

export function resolvePublicShare(
  context: SharePageContext,
  overrides: { url?: string; title?: string; description?: string; imageUrl?: string; locale?: ShareLocale } = {},
) {
  const locale = resolveShareLocale(context.pathname, overrides.locale);
  const legacy = isLegacyResultPath(context.pathname);
  const pageUrl = publicShareUrl(context.pathname);
  const currentUrl = pageUrl ?? `${SHARE_ORIGIN}/`;
  const resolvedUrl = (overrides.url ? publicShareUrl(overrides.url) : null) ?? currentUrl;
  const title = (overrides.title ?? (!legacy && resolvedUrl === currentUrl ? context.title.trim() : "")) || defaultShareTitle(locale);
  const description = overrides.description ?? (locale === "en" ? "Explore salary tools and practical guides." : "연봉 계산기와 생활에 필요한 가이드를 확인하세요.");
  // Caller titles/image URLs can contain approved result text. Never turn that text into a remote image request.
  // Only this page's own public og:image may replace the path-only card, and only for this page's link (B38);
  // legacy /share paths and cross-page links keep the path-only card.
  const imageUrl = (!legacy && pageUrl !== null && resolvedUrl === pageUrl && safePageOgImage(context.ogImage)) || publicShareImageUrl(resolvedUrl, locale);
  return { url: resolvedUrl, title, description, imageUrl, locale };
}

/**
 * Result mode: the approved link stays a public page URL, and its card describes that same link. This page's
 * card is used only when the link is this page; a link to another page gets that page's path-only card (B38).
 */
export function resolveResultShareTarget(page: { url: string; imageUrl: string; locale: ShareLocale }, input: string | undefined): { url: string; imageUrl: string } {
  const url = approvedResultUrl(input, page.url);
  return { url, imageUrl: url === page.url ? page.imageUrl : publicShareImageUrl(url, page.locale) };
}

/** The approval covers visible text/local images, not personal data hidden in links. */
export function approvedResultUrl(input: string | undefined, pageUrl: string): string {
  return (input ? publicShareUrl(input) : null) ?? publicShareUrl(pageUrl) ?? `${SHARE_ORIGIN}/`;
}

/** Public path/language with the OG renderer's default title; no caller title or personal result data. */
export function publicShareImageUrl(pageUrl: string, locale: ShareLocale): string {
  const path = new URL(publicShareUrl(pageUrl) ?? `${SHARE_ORIGIN}/`).pathname;
  return `${SHARE_ORIGIN}/api/og?path=${encodeURIComponent(path)}&lang=${locale === "en" ? "en" : "ko"}`;
}

export function shareAnalyticsPath(path: string): string {
  return new URL(publicShareUrl(path) ?? `${SHARE_ORIGIN}/`).pathname;
}
