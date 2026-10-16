/**
 * One gate for advertising and measurement. A test can only turn it off.
 * Enable QA controls before the first navigation; this cannot revoke requests
 * from an external SDK that already ran in a previously eligible document.
 * Browser tests must additionally block network traffic before loading a page.
 */
export type LiveAdsContext = {
  production: boolean;
  protocol: string;
  hostname: string;
  topLevel: boolean;
  automated?: boolean;
  userAgent?: string;
  disabled?: boolean;
};

export const LIVE_SERVICES_DISABLED_KEY = "msy:disable-live-services";

export function isLiveAdsContext(context: LiveAdsContext): boolean {
  return context.production === true &&
    context.protocol === "https:" &&
    (context.hostname === "moneysalary.com" || context.hostname === "www.moneysalary.com") &&
    context.topLevel === true &&
    context.automated !== true &&
    context.disabled !== true &&
    !/headless|playwright|puppeteer|selenium|lighthouse|moneysalary-qa/i.test(context.userAgent ?? "");
}

export function hasLiveServicesOptOut(search: string): boolean {
  const query = new URLSearchParams(search);
  // Check all repeated values: ?ads=off&ads=on must remain disabled.
  return query.getAll("ads").some((value) => /^(off|0|false|disabled)$/i.test(value)) ||
    query.getAll("test_mode").some((value) => /^(1|true|on)$/i.test(value));
}

declare global {
  interface Window {
    __MSY_TEST_MODE__?: boolean;
    __MSY_ADS_DISABLED__?: boolean;
  }
}

export function canRequestLiveAds(): boolean {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "production" ||
      process.env.NEXT_PUBLIC_ADS_DISABLED === "1") return false;
  try {
    const explicitOff = window.__MSY_TEST_MODE__ === true ||
      window.__MSY_ADS_DISABLED__ === true || hasLiveServicesOptOut(window.location.search);
    // Preserve a QA opt-out when internal navigation drops its query parameter.
    if (explicitOff) window.sessionStorage.setItem(LIVE_SERVICES_DISABLED_KEY, "1");
    return isLiveAdsContext({
      production: true,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      // Do not read a cross-origin parent's URL. Any iframe, including same-origin
      // offscreen frames and html2canvas clones, is ineligible. Unknown => deny.
      topLevel: window.top === window && window.parent === window && window.frameElement === null,
      automated: window.navigator.webdriver,
      userAgent: window.navigator.userAgent,
      disabled: explicitOff || window.sessionStorage.getItem(LIVE_SERVICES_DISABLED_KEY) === "1",
    });
  } catch {
    // Sandbox, inaccessible frame/storage state, or a malformed browser facade.
    return false;
  }
}
