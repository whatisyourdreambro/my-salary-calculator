// src/lib/coupangContextMap.ts
//
// 쿠팡 파트너스 subId에 카테고리 접두사를 붙이기 위한 추론 함수.
// traceId는 그대로 사용 (쿠팡 정책 — 변조 금지).
// subId 만 카테고리화해서 쿠팡 대시보드에서 카테고리별 성과 분리 측정.

export type CoupangCategory =
  | "tax"
  | "salary"
  | "fire"
  | "loan"
  | "real-estate"
  | "calc"
  | "guide"
  | "company"
  | "fun"
  | "season"
  | "general";

/**
 * 페이지 경로(pathname)로부터 어울리는 쿠팡 카테고리를 추론.
 * 가장 구체적인 패턴부터 매칭 (early return).
 */
export function inferCoupangCategory(pathname: string | null | undefined): CoupangCategory {
  if (!pathname) return "general";
  const p = pathname.toLowerCase();

  // 시즌성 페이지(11~3월·5월 트래픽 핫스팟) — season 카테고리로 분리해
  // 쿠팡 대시보드에서 시즌 콘텐츠 RPM을 일반 tax 페이지와 분리 측정.
  if (
    p.includes("year-end-tax") ||
    p.includes("january-bonus") ||
    p.includes("year-end-bonus") ||
    p.includes("incentive-tax") ||
    p.includes("samsung-negotiation") ||
    p.includes("new-employee")
  ) {
    return "season";
  }
  // 통상 세금 — 시즌 아님 (건보/4대보험 요율 페이지도 세금성 주제라 tax 로 분류)
  if (
    p.includes("severance") ||
    p.includes("income-tax") ||
    p.includes("tax-rates") ||
    p.includes("tax-changes") ||
    p.includes("auto-tax") ||
    p.includes("property-holding-tax") ||
    p.includes("minimum-wage") ||
    p.includes("savings-interest") ||
    p.includes("/health-insurance") ||
    p.includes("/social-insurance")
  ) {
    return "tax";
  }

  if (p.includes("/fire") || p.includes("asset-allocator") || p.includes("/retirement")) {
    return "fire";
  }

  if (
    p.includes("home-loan") ||
    p.includes("car-loan") ||
    p.includes("/jeonse") ||
    p.includes("/dsr") ||
    p.includes("/ltv")
  ) {
    return "loan";
  }

  if (
    p.includes("real-estate") ||
    p.includes("/acquisition-tax") ||
    p.includes("/gift-tax") ||
    p.includes("housing-subscription")
  ) {
    return "real-estate";
  }

  if (p.startsWith("/guides") || p.startsWith("/en/guides")) return "guide";
  if (p.startsWith("/salary-db") || p.startsWith("/company")) return "company";
  if (p.startsWith("/salary")) return "salary";
  if (p.startsWith("/calc") || p.startsWith("/tools")) return "calc";
  if (p.startsWith("/fun") || p.includes("mbti-salary")) return "fun";

  return "general";
}

/**
 * 카테고리 + raw path를 60자 이내 subId로 압축.
 */
export function buildCoupangSubId(
  category: CoupangCategory,
  pathname: string | null | undefined
): string {
  const rawPath = pathname
    ? pathname.replace(/[^a-zA-Z0-9-/]/g, "").slice(0, 50)
    : "";
  return `cat-${category}-${rawPath}`.slice(0, 60);
}
