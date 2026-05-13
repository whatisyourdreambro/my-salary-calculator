"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { trackAdImpression } from "@/lib/analytics";

const CLIENT_ID = "ca-pub-2873403048341290";

type AdSlotKind = "home-top" | "result" | "sidebar" | "fluid" | "guide-mid";

type AdSlotProps = {
  slot: string | undefined;
  format?: string;
  layoutKey?: string;
  layout?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
  slotKind?: AdSlotKind;
  minHeight?: number;
  fullWidthResponsive?: boolean;
};

function AdSlot({
  slot,
  format = "auto",
  layoutKey,
  layout,
  style,
  containerClassName,
  slotKind,
  minHeight = 90,
  fullWidthResponsive = true,
}: AdSlotProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pushed = useRef(false);
  const [visible, setVisible] = useState(false);

  // 페이지 이동(pathname 변경) 시 광고 상태 reset → 뒤로가기로 돌아왔을 때도 광고 정상 표시
  // (이전: pushed.current 영구 true 가 되어 뒤로가기 시 viewability 0% — 매출 손실)
  useEffect(() => {
    pushed.current = false;
    setVisible(false);
  }, [pathname]);

  // Lazy load: viewport 진입 시에만 광고 마운트 → CLS↓ viewability↑
  useEffect(() => {
    if (!slot || !containerRef.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const target = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [slot, pathname]);

  useEffect(() => {
    if (!visible || pushed.current || !slot) return;
    pushed.current = true;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense push errors are non-fatal
    }
    // 슬롯별 노출(impression) 카운트 → GA4 에서 슬롯별 실제 노출/RPM 분석
    trackAdImpression(slotKind ?? "unknown");
  }, [visible, slot, slotKind]);

  if (!slot) return null;

  const baseClass = containerClassName ?? "ad-container";
  const composedClass = slotKind ? `${baseClass} ad-slot-${slotKind}` : baseClass;

  return (
    <div
      ref={containerRef}
      className={composedClass}
      style={{
        width: "100%",
        margin: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        // 모든 슬롯에 minHeight 일관 적용 → CLS 방지
        // (이전: slotKind 있는 슬롯은 minHeight 누락되어 광고 로드 시 페이지 점프 발생)
        minHeight: `${minHeight}px`,
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#94A3B8",
          marginBottom: "4px",
          textAlign: "center",
          width: "100%",
        }}
      >
        광고 (Sponsored)
      </span>
      {visible && (
        <ins
          className="adsbygoogle"
          style={{
            display: "block",
            width: "100%",
            minHeight: `${minHeight}px`,
          }}
          data-ad-client={CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
          {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
          {...(layout ? { "data-ad-layout": layout } : {})}
        />
      )}
    </div>
  );
}

export function HomeTopAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP}
      format="auto"
      slotKind="home-top"
      minHeight={120}
    />
  );
}

export function CalcResultAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALC_RESULT}
      format="auto"
      slotKind="result"
      minHeight={250}
    />
  );
}

export function GuideMidAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID}
      format="auto"
      slotKind="guide-mid"
      minHeight={250}
    />
  );
}

export function SidebarAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
      format="auto"
      slotKind="sidebar"
      style={{ maxWidth: "300px" }}
      minHeight={600}
    />
  );
}

// 인아티클(콘텐츠 사이) fluid 광고 — 가독성↑ CTR↑
// 정책 안전: NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE 환경변수 미설정 시 null 반환 (광고 미노출).
// 과거 GUIDE_MID 로 fallback 했으나 같은 페이지에 GuideMidAd + InArticleAd 가 함께 있으면
// 동일 슬롯 ID 가 한 페이지에 중복 호출되어 AdSense 정책 위반 위험 ("페이지당 동일 슬롯 1회" 규칙).
// 운영자가 AdSense > 광고 단위 > 인아티클 광고 단위 신규 생성 후 슬롯 ID 를 환경변수에 추가하면 자동 활성.
export function InArticleAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE}
      format="fluid"
      layoutKey="-fb+5w+4e-db+86"
      slotKind="fluid"
      minHeight={200}
      containerClassName="ad-container ad-in-article"
    />
  );
}

export const ResultAd = CalcResultAd;
