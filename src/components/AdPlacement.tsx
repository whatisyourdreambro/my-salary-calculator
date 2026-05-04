"use client";

import { useEffect, useRef } from "react";

const CLIENT_ID = "ca-pub-2873403048341290";

type AdSlotProps = {
  slot: string | undefined;
  format?: string;
  layoutKey?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
};

function AdSlot({
  slot,
  format = "auto",
  layoutKey,
  style,
  containerClassName,
}: AdSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !slot) return;
    pushed.current = true;
    try {
      // @ts-expect-error adsbygoogle global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense push errors are non-fatal
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div
      className={containerClassName ?? "ad-container"}
      style={{
        width: "100%",
        margin: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minHeight: "90px",
        }}
        data-ad-client={CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
}

export function HomeTopAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP}
      format="auto"
    />
  );
}

export function CalcResultAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALC_RESULT}
      format="auto"
    />
  );
}

export function GuideMidAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID}
      format="auto"
    />
  );
}

export function SidebarAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR}
      format="auto"
      style={{ maxWidth: "300px" }}
    />
  );
}

export const ResultAd = CalcResultAd;
