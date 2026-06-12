"use client";

// 실사용자 Core Web Vitals(LCP/CLS/INP/FCP/TTFB)를 GA4로 전송.
// 합성(lab) 점수가 아닌 실제 방문자 환경의 속도를 GA4에서 보고,
// 속도 개선 작업의 효과를 측정하기 위함 (SEO 순위 요소 + 광고 가시성).
import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    // GA4 권장 형식 — value는 정수로 (CLS는 1000배 스케일).
    trackEvent("web_vitals", {
      metric_name: metric.name,
      metric_value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      metric_rating: metric.rating, // good | needs-improvement | poor
      metric_id: metric.id,
      page_path:
        typeof location !== "undefined" ? location.pathname : "",
    });
  });

  return null;
}
