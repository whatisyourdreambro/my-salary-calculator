/** Public page sharing policy. Result data must be explicitly approved by its caller. */
export const SHARE_ORIGIN = "https://www.moneysalary.com";
export type ShareLocale = "ko" | "en";
export type ShareMode = "page" | "result";

export function resolveShareLocale(path: string, explicit?: ShareLocale): ShareLocale {
  return explicit ?? (/^\/en(?:\/|$)/.test(path) ? "en" : "ko");
}

export function isShareExcludedPath(path: string): boolean {
  return /^\/(?:api|_next|_not-found|contact|dashboard|report|favorites|widget)(?:\/|$)/.test(path);
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

export function resolvePublicShare(
  context: SharePageContext,
  overrides: { url?: string; title?: string; description?: string; imageUrl?: string; locale?: ShareLocale } = {},
) {
  const locale = resolveShareLocale(context.pathname, overrides.locale);
  const legacy = isLegacyResultPath(context.pathname);
  const currentUrl = publicShareUrl(context.pathname) ?? `${SHARE_ORIGIN}/`;
  const resolvedUrl = (overrides.url ? publicShareUrl(overrides.url) : null) ?? currentUrl;
  const title = (overrides.title ?? (!legacy && resolvedUrl === currentUrl ? context.title.trim() : "")) || defaultShareTitle(locale);
  const description = overrides.description ?? (locale === "en" ? "Explore salary tools and practical guides." : "연봉 계산기와 생활에 필요한 가이드를 확인하세요.");
  const imageUrl = overrides.imageUrl ?? `${SHARE_ORIGIN}/api/og?path=${encodeURIComponent(new URL(resolvedUrl).pathname)}&title=${encodeURIComponent(title)}&lang=${locale}`;
  return { url: resolvedUrl, title, description, imageUrl, locale };
}

/** Result URLs may preserve legacy data only after explicit result approval. */
export function approvedResultUrl(input: string | undefined, pageUrl: string): string {
  if (!input) return pageUrl;
  try {
    const url = new URL(input, SHARE_ORIGIN);
    if (url.origin !== SHARE_ORIGIN || url.username || url.password || /[\\\u0000-\u001f\u007f]/.test(input) || isShareExcludedPath(url.pathname)) return pageUrl;
    return url.href;
  } catch {
    return pageUrl;
  }
}

export function shareAnalyticsPath(path: string): string {
  return new URL(publicShareUrl(path) ?? `${SHARE_ORIGIN}/`).pathname;
}
