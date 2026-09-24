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

export function sanitizeAnalyticsUrl(value: string, base = "https://www.moneysalary.com"): string {
  if (!value.trim()) return "";
  try {
    const url = new URL(value, base);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    const path = url.pathname
      .replace(/^\/share\/[^/]+/, "/share/[redacted]")
      .replace(/^\/(salary|monthly)\/(?:\d+(?:-manwon)?)(?=\/|$)/, "/$1/[amount]");
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
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (PRIVATE_KEYS.has(key) || (isCalculation && !CALC_KEYS.has(key))) continue;
    if ((name === "offer_compare_complete" || name === "offer_compare_explanation_view") && !COMPARE_KEYS.has(key)) continue;
    const safeKey = RESERVED_TRAFFIC_SOURCE_PARAMS.has(key) ? `ui_${key}` : key;
    safe[safeKey] = typeof value === "string" &&
      (key === "page_location" || key === "page_referrer" || value.startsWith("/") || /^https?:\/\//.test(value))
      ? sanitizeAnalyticsUrl(value)
      : value;
  }
  return safe;
}
