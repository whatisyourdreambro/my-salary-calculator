"use client";

import { useEffect, useRef, useState } from "react";

const CLIENT_ID = "ca-pub-2873403048341290";

type AdSlotProps = {
  slot: string | undefined;
  format?: string;
  layoutKey?: string;
  layout?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
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
  minHeight = 90,
  fullWidthResponsive = true,
}: AdSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pushed = useRef(false);
  const [visible, setVisible] = useState(false);

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
  }, [slot]);

  useEffect(() => {
    if (!visible || pushed.current || !slot) return;
    pushed.current = true;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense push errors are non-fatal
    }
  }, [visible, slot]);

  if (!slot) return null;

  return (
    <div
      ref={containerRef}
      className={containerClassName ?? "ad-container"}
      style={{
        width: "100%",
        margin: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
      minHeight={120}
    />
  );
}

export function CalcResultAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALC_RESULT}
      format="auto"
      minHeight={250}
    />
  );
}

export function GuideMidAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID}
      format="auto"
      minHeight={250}
    />
  );
}

export function SidebarAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
      format="auto"
      style={{ maxWidth: "300px" }}
      minHeight={600}
    />
  );
}

// Phase A-6: 인아티클(콘텐츠 사이) fluid 광고 — 가독성↑ CTR↑
export function InArticleAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID}
      format="fluid"
      layoutKey="-fb+5w+4e-db+86"
      minHeight={200}
      containerClassName="ad-container ad-in-article"
    />
  );
}

export const ResultAd = CalcResultAd;
