import { canRequestLiveAds } from "./liveAds";

export const GA_MEASUREMENT_ID = "G-EZ8GT7RPEZ";
const ADSENSE_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873403048341290";
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

/** Client effect only: no SSR script/preload can escape the runtime decision. */
export function installLiveServices(): boolean {
  if (!canRequestLiveAds()) return false;

  if (!document.getElementById("msy-ga-loader")) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function (...args: unknown[]) {
      void args;
      // gtag consumes arguments objects, not ordinary arrays.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: true });
    if (!appendLoader("msy-ga-loader", GA_SRC)) return false;
  }
  return appendLoader("msy-adsense-loader", ADSENSE_SRC);
}

function appendLoader(id: string, src: string): boolean {
  // Recheck immediately before src assignment/insertion, including repeat calls.
  if (!canRequestLiveAds()) return false;
  if (document.getElementById(id)) return true;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  if (id === "msy-adsense-loader") script.crossOrigin = "anonymous";
  script.dataset.html2canvasIgnore = "true";
  script.src = src;
  document.head.appendChild(script);
  return true;
}
