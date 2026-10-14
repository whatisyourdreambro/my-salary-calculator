type LiveAdsContext = {
  production: boolean;
  protocol: string;
  hostname: string;
  automated?: boolean;
};

// Preview builds use production NODE_ENV too, so check the actual hostname.
// This prevents test impressions; it is not an invalid-traffic detector.
export function isLiveAdsContext(context: LiveAdsContext): boolean {
  return context.production &&
    context.protocol === "https:" &&
    (context.hostname === "moneysalary.com" || context.hostname === "www.moneysalary.com") &&
    context.automated !== true;
}

export function canRequestLiveAds(): boolean {
  if (typeof window === "undefined") return false;
  return isLiveAdsContext({
    production: process.env.NODE_ENV === "production",
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    automated: window.navigator.webdriver,
  });
}
