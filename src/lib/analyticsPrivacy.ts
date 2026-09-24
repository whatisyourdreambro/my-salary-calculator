import { getStaticMonthlyAmounts } from "./monthlyStaticParams";

/** Keep campaign attribution, never input/share payloads, in custom GA events. */
const ATTRIBUTION_KEYS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content",
  "gclid", "dclid", "gbraid", "wbraid", "msclkid",
]);
const PRIVATE_KEYS = new Set([
  "annual_salary", "monthly_net", "annual_salary_band", "monthly_net_band",
  "salary", "salary_input", "annualSalary", "monthlyNet", "amount", "net",
  "non_taxable_amount", "nonTaxableAmount", "dependents", "children", "inputs", "result",
]);
const CALC_KEYS = new Set(["calc_type", "page_path", "measurement_version", "result_origin"]);
const COMPARE_KEYS = new Set(["comparison_mode", "section", "measurement_version"]);
/**
 * gtag event parameters GA4 reads as the session's traffic source (utm_* equivalents).
 * A custom event sending `source: "add"` restarted attribution as "add / (not set)" —
 * GA4 28d (2026-08-27..09-23) had 484 sessions under add·remove·compare-page·header_badge·
 * toast_dashboard, exactly the bookmark_click/compare_view `source` values. Such keys are
 * renamed to `ui_<key>` so UI context survives without overwriting the real channel.
 */
export const RESERVED_TRAFFIC_SOURCE_PARAMS = new Set([
  "source", "medium", "campaign", "term", "content",
  "campaign_id", "campaign_source", "campaign_medium", "campaign_name", "campaign_term", "campaign_content",
]);

/**
 * Page-scoped ad/affiliate measurement events. Their only use is "which page earned/showed what",
 * so they must land on the same Page path as page_view/ad_impression. The default amount redaction
 * turned every /monthly/N and /salary/N row into the literal "/monthly/[amount]"·"/salary/[amount]"
 * (GA4 28d: 3,811 + 1,837 ad_request_attempt that could not be joined to any real page).
 * Calculation, share and all other events keep the redaction.
 */
export const PAGE_SCOPED_MEASUREMENT_EVENTS = new Set([
  "ad_request_attempt", "ad_request_error", "ad_filled", "ad_unfilled", "ad_unit_click",
  "affiliate_impression", "affiliate_click", "coupang_impression", "coupang_click",
]);

const AMOUNT_PATH = /^\/(salary|monthly)\/(\d+(?:-manwon)?)(?=\/|$)/;

/**
 * True only for a public, pre-rendered report page — never an arbitrary amount a visitor typed.
 * - /monthly/N: dynamicParams=false, so only the static grid renders (off-grid N is a 404 → stays redacted).
 * - /salary/N: middleware resolveSalaryRedirect 308s every off-grid, legacy (-manwon/-eok) or
 *   leading-zero amount to the nearest static page before render, so a rendered /salary/N is a grid page.
 * The auto page_view already carries these public paths; this adds no new amount to analytics.
 */
function isPublicAmountPage(kind: string, segment: string): boolean {
  if (!/^[1-9]\d{0,9}$/.test(segment)) return false;
  if (kind === "monthly") return getStaticMonthlyAmounts().includes(Number(segment));
  return kind === "salary";
}

export function sanitizeAnalyticsUrl(
  value: string,
  base = "https://www.moneysalary.com",
  options: { keepPublicAmountPath?: boolean } = {},
): string {
  if (!value.trim()) return "";
  try {
    const url = new URL(value, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    const path = url.pathname
      .replace(/^\/share\/[^/]+/, "/share/[redacted]")
      .replace(AMOUNT_PATH, (match, kind: string, segment: string) =>
        options.keepPublicAmountPath && isPublicAmountPage(kind, segment) ? match : `/${kind}/[amount]`);
    const params = new URLSearchParams();
    for (const [key, item] of url.searchParams) {
      if (ATTRIBUTION_KEYS.has(key)) params.append(key, item);
    }
    const query = params.toString();
    return `${value.startsWith("/") ? "" : url.origin}${path}${query ? `?${query}` : ""}`;
  } catch {
    return "";
  }
}

export function sanitizeAnalyticsParams(name: string, params: Record<string, unknown>): Record<string, unknown> {
  const isCalculation = name === "calc_start" || name === "calc_success" || name === "result_view" || name === "calc_submit";
  const urlOptions = { keepPublicAmountPath: PAGE_SCOPED_MEASUREMENT_EVENTS.has(name) };
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PRIVATE_KEYS.has(key) || (isCalculation && !CALC_KEYS.has(key))) continue;
    if ((name === "offer_compare_complete" || name === "offer_compare_explanation_view") && !COMPARE_KEYS.has(key)) continue;
    const safeKey = RESERVED_TRAFFIC_SOURCE_PARAMS.has(key) ? `ui_${key}` : key;
    safe[safeKey] = typeof value === "string" &&
      (key === "page_location" || key === "page_referrer" || value.startsWith("/") || /^https?:\/\//.test(value))
      ? sanitizeAnalyticsUrl(value, undefined, urlOptions)
      : value;
  }
  return safe;
}
