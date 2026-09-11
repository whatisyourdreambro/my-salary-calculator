"use client";

// 실사용자 Core Web Vitals(LCP/CLS/INP/FCP/TTFB)를 GA4로 전송.
// 합성(lab) 점수가 아닌 실제 방문자 환경의 속도를 GA4에서 보고,
// 속도 개선 작업의 효과를 측정하기 위함 (SEO 순위 요소 + 광고 가시성).
//
// + 귀속(attribution) 20% 샘플 — S1-6 (2026-09-11, PERF-08: 데스크톱 LCP 108 URL 의 요소 미상).
//   next/web-vitals 공개 진입점은 web-vitals/attribution 빌드를 노출하지 않으므로(추가 의존성 금지)
//   PerformanceObserver 로 직접 관찰한다: largest-contentful-paint 마지막 항목의 element,
//   layout-shift 중 (hadRecentInput 이 아닌) 최대 단일 이동의 최대 면적 source 노드.
//   전송 값은 vitalsAttribution.describeNode 의 짧은 선택자(태그+#id+클래스≤2, 80자)뿐 —
//   텍스트·id/class 외 속성값·사용자 입력은 어떤 경로로도 담기지 않는다.
//   샘플 여부는 페이지 로드당 1회(Math.random) 결정하고, 비샘플 방문의 web_vitals 이벤트는 종전과
//   완전히 같은 형태다(기존 대시보드 불변). 샘플 방문에서만 LCP 에 lcp_element·lcp_load_state,
//   CLS 에 cls_target 이 붙는다. GA4 보고서에 보이려면 맞춤 측정기준(이벤트 범위)
//   lcp_element·cls_target(선택: lcp_load_state)을 콘솔에 등록해야 한다.
import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics";
import {
  describeNode,
  largestShiftSource,
  shouldSampleAttribution,
  type ShiftEntryLike,
} from "@/lib/vitalsAttribution";

type AttributionState = {
  sampled: boolean;
  lcpElement: string;
  lcpLoadState: string;
  clsTarget: string;
  clsValue: number;
};

// 페이지 로드당 1회 — 모듈 스코프 캐시라 컴포넌트가 재마운트돼도 샘플 결정이 바뀌지 않는다.
// 클라이언트 effect/콜백에서만 호출되므로 서버에서는 난수를 뽑지 않는다.
let attributionState: AttributionState | null = null;
function getAttributionState(): AttributionState {
  if (!attributionState) {
    let random = 1; // Math.random 을 쓸 수 없으면 비샘플(fail-closed)
    try {
      random = Math.random();
    } catch {
      random = 1;
    }
    attributionState = {
      sampled: shouldSampleAttribution(random),
      lcpElement: "",
      lcpLoadState: "",
      clsTarget: "",
      clsValue: 0,
    };
  }
  return attributionState;
}

/** 지원되는 항목 타입만 buffered 로 관찰. 미지원·예외 시 null — 절대 throw 하지 않는다. */
function observeEntryType(
  type: string,
  onEntries: (entries: PerformanceEntryList) => void,
): PerformanceObserver | null {
  try {
    if (typeof PerformanceObserver === "undefined") return null;
    const supported = (PerformanceObserver as unknown as { supportedEntryTypes?: unknown }).supportedEntryTypes;
    if (Array.isArray(supported) && !supported.includes(type)) return null;
    const observer = new PerformanceObserver((list) => {
      try {
        onEntries(list.getEntries());
      } catch {
        // 귀속은 best-effort — 지표 전송 자체에는 영향 없음
      }
    });
    observer.observe({ type, buffered: true });
    return observer;
  } catch {
    return null;
  }
}

export default function WebVitals() {
  // 귀속 관찰자는 useReportWebVitals 보다 먼저 선언해 같은 커밋의 effect 순서상 먼저 등록된다(둘 다 buffered).
  useEffect(() => {
    const state = getAttributionState();
    if (!state.sampled) return;
    const lcp = observeEntryType("largest-contentful-paint", (entries) => {
      const last = entries[entries.length - 1] as unknown as { element?: unknown } | undefined;
      if (!last) return;
      state.lcpElement = describeNode(last.element) || "unknown";
      // 마지막 LCP 후보를 관찰한 시점의 readyState(콜백은 비동기라 페인트 순간보다 늦을 수 있음).
      state.lcpLoadState =
        typeof document !== "undefined" && typeof document.readyState === "string" ? document.readyState : "";
    });
    const cls = observeEntryType("layout-shift", (entries) => {
      const picked = largestShiftSource(entries as unknown as ShiftEntryLike[], state.clsValue);
      if (!picked) return;
      state.clsValue = picked.value;
      state.clsTarget = describeNode(picked.node) || "unknown";
    });
    // bfcache 복원 시 web-vitals 는 CLS 를 0 부터 다시 세고 새 metric_id 로 보고하므로 귀속 창도 함께 리셋한다(2026-09-12 리뷰).
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        state.clsValue = 0;
        state.clsTarget = "";
      }
    };
    try {
      window.addEventListener("pageshow", onPageShow, true);
    } catch {
      // ignore
    }
    return () => {
      try {
        window.removeEventListener("pageshow", onPageShow, true);
        lcp?.disconnect();
        cls?.disconnect();
      } catch {
        // ignore
      }
    };
  }, []);

  useReportWebVitals((metric) => {
    const state = getAttributionState();
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
      // 귀속 필드는 샘플 방문의 해당 지표에만 붙는다 — 그 외 이벤트 형태는 종전과 동일.
      ...(state.sampled && metric.name === "LCP"
        ? { lcp_element: state.lcpElement || "unknown", lcp_load_state: state.lcpLoadState || "unknown" }
        : {}),
      ...(state.sampled && metric.name === "CLS" ? { cls_target: state.clsTarget || "unknown" } : {}),
    });
  });

  return null;
}
