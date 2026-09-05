"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  trackAdFillStatus,
  trackAdImpression,
  trackAdUnitClick,
} from "@/lib/analytics";

const CLIENT_ID = "ca-pub-2873403048341290";

// 페이지별로 이미 렌더된 슬롯 ID 추적 — AdSense "페이지당 동일 슬롯 1회" 정책 강제.
// SLOT_IN_ARTICLE 미설정 시 InArticleAd 가 GUIDE_MID fallback 했을 때,
// 같은 페이지의 GuideMidAd 와 동시 노출되면 정책 위반이라 두 번째 호출을 자동 skip.
// pathname 변경 시 cleanup 으로 다른 페이지에 영향 없음.
const renderedSlotsByPath = new Map<string, Set<string>>();

type AdSlotKind =
  | "home-top"
  | "result"
  | "sidebar"
  | "fluid"
  | "guide-mid"
  | "multiplex"
  | "display-2";

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
  const [allowed, setAllowed] = useState(true);
  const [unfilled, setUnfilled] = useState(false);

  // 페이지 이동(pathname 변경) 시 광고 상태 reset → 뒤로가기로 돌아왔을 때도 광고 정상 표시
  // (이전: pushed.current 영구 true 가 되어 뒤로가기 시 viewability 0% — 매출 손실)
  useEffect(() => {
    pushed.current = false;
    setVisible(false);
    setAllowed(true);
    setUnfilled(false);
  }, [pathname]);

  // 페이지별 슬롯 dedup — 같은 페이지에 동일 슬롯 ID 두 번째 호출은 자동 skip
  // (AdSense 정책 + GUIDE_MID 같은 fallback 슬롯이 두 컴포넌트에 쓰일 때 안전망)
  useEffect(() => {
    if (!slot || !pathname) return;
    const seen = renderedSlotsByPath.get(pathname) ?? new Set<string>();
    if (seen.has(slot)) {
      setAllowed(false);
      return;
    }
    seen.add(slot);
    renderedSlotsByPath.set(pathname, seen);
    return () => {
      seen.delete(slot);
      if (seen.size === 0) renderedSlotsByPath.delete(pathname);
    };
  }, [slot, pathname]);

  // Lazy load: viewport 진입 시에만 광고 마운트 → CLS↓ viewability↑
  useEffect(() => {
    if (!slot || !containerRef.current || !allowed) return;
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
  }, [slot, pathname, allowed]);

  // 광고 클릭 감지 — iframe 내부 클릭은 이벤트가 버블되지 않으므로
  // window blur 시점에 activeElement 가 이 슬롯의 iframe 인지로 판별 (페이지당 슬롯별 1회)
  const clickTracked = useRef(false);
  useEffect(() => {
    clickTracked.current = false;
  }, [pathname]);
  useEffect(() => {
    if (!visible || !slot) return;
    const onBlur = () => {
      if (clickTracked.current) return;
      const el = containerRef.current;
      const active = document.activeElement;
      if (el && active && active.tagName === "IFRAME" && el.contains(active)) {
        clickTracked.current = true;
        trackAdUnitClick(slotKind ?? "unknown", slot);
      }
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [visible, slot, slotKind, pathname]);

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

  // 미충족(unfilled) 광고 감지 → 컨테이너째 접기.
  // 이전에는 unfilled 여도 "광고 (Sponsored)" 라벨 + minHeight 공백이 남아 UX·정책 양쪽 손해.
  // + 채움 결과 계측(2026-09-05, 운영자 승인): data-ad-status 가 filled/unfilled 로 전이될 때
  //   슬롯당 1회 ad_filled / ad_unfilled 이벤트를 보낸다. ad_impression 은 push 시점 "요청 수"라
  //   실노출·채움률을 답하지 못했고, 실험 판정 기준 'unfilled 급증 없음'이 AdSense CSV(운영자 제공)에만
  //   의존하던 공백을 메운다. 광고 요청·렌더 로직·슬롯·스타일은 무변경 — 계측 호출만 추가.
  const fillReported = useRef<string | null>(null);
  useEffect(() => {
    fillReported.current = null;
  }, [pathname]);
  useEffect(() => {
    if (!visible || !slot) return;
    // 레이아웃 상주 슬롯(calc/tools/table/fun layout 의 HomeTop·InArticle)은 형제 라우트 이동에도
    // 언마운트되지 않는다. pathname 변경 커밋에서는 위 reset effect 가 pushed.current=false 로 먼저
    // 내리므로, 이 가드가 이전 페이지의 stale <ins>(data-ad-status 잔존)를 읽는 경로를 막는다 —
    // 이전 결과가 새 경로로 오귀속되거나(계측), 이전 unfilled 가 새 페이지 컨테이너를 display:none 으로
    // 굳혀 광고 요청이 영영 안 나가던 경로(2026-09-05 리뷰 발견) 둘 다 차단. 새 ins 는 push effect 가
    // pushed.current=true 로 만든 뒤 이 effect 가 재실행되며 정상 관찰된다.
    if (!pushed.current) return;
    const container = containerRef.current;
    if (!container) return;
    const ins = container.querySelector("ins.adsbygoogle");
    if (!ins) return;
    const check = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "unfilled") setUnfilled(true);
      if (
        (status === "filled" || status === "unfilled") &&
        fillReported.current !== status
      ) {
        fillReported.current = status;
        trackAdFillStatus(slotKind ?? "unknown", slot, status, pathname);
      }
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    return () => mo.disconnect();
  }, [visible, pathname, slot, slotKind]);

  if (!slot || !allowed) return null;

  const baseClass = containerClassName ?? "ad-container";
  const composedClass = slotKind ? `${baseClass} ad-slot-${slotKind}` : baseClass;
  const isInArticle = layout === "in-article";

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
        minHeight: `${minHeight}px`,
        ...style,
        ...(unfilled ? { display: "none" } : {}),
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
            // in-article fluid 광고도 width 100% 를 반드시 명시할 것 (2026-09-04 수정).
            // Google 권장 스니펫은 display:block; text-align:center; 뿐이지만 그 전제는 일반 블록 흐름 부모다.
            // 이 컨테이너는 flexDirection:column + alignItems:center 라(위 컨테이너 style 참조)
            // 교차축 크기를 명시하지 않은 자식이 내용에 맞춰 축소된다. 빈 <ins> 는 내용이 없어 width 가 0px 이 되고,
            // AdSense 가 슬롯 크기를 결정하지 못해 광고 요청 자체를 하지 않는다
            // (data-adsbygoogle-status=done 이지만 data-ad-status 는 null, iframe 0개 — 프로덕션 실측).
            // 바로 위 라벨 span 이 width:"100%" 를 명시하는 것과 같은 이유. 이 width 를 제거하지 말 것.
            // 일반 display 광고는 full-width-responsive 활용을 위해 width 100% 명시 + minHeight 로 CLS 방지.
            ...(isInArticle
              ? { width: "100%", textAlign: "center" }
              : { width: "100%", minHeight: `${minHeight}px` }),
          }}
          data-ad-client={CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format={format}
          {...(!isInArticle && {
            "data-full-width-responsive": fullWidthResponsive ? "true" : "false",
          })}
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
// AdSense "인아티클 광고 단위" 전용: data-ad-layout="in-article" + format="fluid" 필수.
// 이전 코드는 multiplex 광고용 data-ad-layout-key 사용 → 광고 미노출 위험이었음.
// SLOT_IN_ARTICLE 미설정 시 GUIDE_MID 로 fallback. dedup 로직이 정책 위반 방지.
export function InArticleAd() {
  return (
    <AdSlot
      slot={
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE ||
        process.env.NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID
      }
      format="fluid"
      layout="in-article"
      slotKind="fluid"
      minHeight={200}
      containerClassName="ad-container ad-in-article"
    />
  );
}

// 멀티플렉스(관련 콘텐츠형) — 콘솔에서 유닛 발급 후 .env 에
// NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX 추가 시 자동 활성화. 미설정 시 렌더 안 함.
// 가이드 본문 하단·목록 페이지 하단 전용(체류 이탈 지점에서 CTR 가장 높은 포맷).
export function MultiplexAd() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_MULTIPLEX}
      format="autorelaxed"
      slotKind="multiplex"
      minHeight={280}
    />
  );
}

// 범용 디스플레이 2번 유닛 — 기존 5슬롯의 페이지당 1회 dedup 상한을 넘어
// 같은 페이지에 디스플레이 광고를 하나 더 배치할 때 사용.
// 콘솔 발급 후 NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2 추가 시 자동 활성화.
export function Display2Ad() {
  return (
    <AdSlot
      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY_2}
      format="auto"
      slotKind="display-2"
      minHeight={250}
    />
  );
}

export const ResultAd = CalcResultAd;
