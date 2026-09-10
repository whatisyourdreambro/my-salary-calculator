"use client";

// 모바일 전용 떠있는 공유 pill — 계산기 그룹(calc·tools·홈) 한정 주입.
// "결과 보고 자랑하고 싶은 순간"에 공유 버튼이 눈앞에 있도록 스크롤 후 하단에 등장.
//
// 광고 안전장치 (AdSense Auto Ads 켜진 사이트 — 절대 광고를 가리면 안 됨):
// 1) Google 앵커 광고가 표시 중이면 즉시 숨김 (광고 수익 우선)
// 2) InstallPwaBanner(하단 고정)가 떠 있으면 숨김
// 3) 페이지 인라인 공유 섹션([data-share-root])이 화면에 보이면 숨김 (중복 방지)
// 닫기(X) 시 세션 동안 다시 나타나지 않음.

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import ShareButtons from "./ShareButtons";
import { useSharePageContext } from "@/hooks/useSharePageContext";
import { resolveShareLocale, shareAnalyticsPath } from "@/lib/sharePolicy";
// 하단 광고 3중 감지는 공유 유틸로 이동(2026-09-05, §12-2 ⑪) — InstallPwaBanner·BottomSheet 와 공용.
// 로직·상수(4초 유예·1초 재평가)는 동일. 여기서 정의하던 함수를 되살리지 말 것(이중 관리).
import {
  BOTTOM_AD_CHECK_INTERVAL_MS as CHECK_INTERVAL_MS,
  BOTTOM_AD_GRACE_MS as INITIAL_GRACE_MS,
  isAdInBottomBand,
  isBottomAdPresent,
} from "@/lib/bottomAdDetect";

const DISMISS_KEY = "msy_sharebar_dismissed";
const SCROLL_THRESHOLD = 400;
const CONTENT_TYPE = "float_bar";

function isPwaBannerShown(): boolean {
  return !!document.querySelector('[data-pwa-install-banner]');
}

function isInlineShareVisible(): boolean {
  const roots = document.querySelectorAll<HTMLElement>("[data-share-root]");
  for (const el of roots) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) return true;
  }
  return false;
}

export default function FloatingShareBar() {
  const pathname = usePathname();
  const { context } = useSharePageContext();
  const en = resolveShareLocale(pathname ?? "/") === "en";
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const impressionSent = useRef(false);

  useEffect(() => {
    setVisible(false);
    impressionSent.current = false;
    if (!context) return;
    // 데스크톱은 CSS(md:hidden)로도 가려지지만, 관찰 비용 자체를 아끼기 위해 스킵
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {}

    let raf = 0;
    const loadedAt = Date.now();
    let bottomAdSeen = false; // 한 번이라도 하단 광고를 보면 이 페이지뷰에선 영구 양보

    const evaluate = () => {
      if (Date.now() - loadedAt < INITIAL_GRACE_MS) {
        setVisible(false);
        return;
      }
      if (!bottomAdSeen && isBottomAdPresent()) bottomAdSeen = true;
      const show =
        !bottomAdSeen &&
        window.scrollY > SCROLL_THRESHOLD &&
        !isInlineShareVisible() &&
        !isPwaBannerShown() &&
        // 인플로 광고(결과 직하·인아티클)가 하단 band 를 지나는 동안은 가리지 않는다 (2026-09-11)
        !isAdInBottomBand();
      setVisible(show);
      if (show && !impressionSent.current) {
        impressionSent.current = true;
        trackEvent("share_bar_impression", {
          page_path: shareAnalyticsPath(window.location.pathname),
        });
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(evaluate);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // 앵커 광고·PWA 배너는 스크롤 없이도 등장하므로 주기 재평가
    const interval = setInterval(evaluate, CHECK_INTERVAL_MS);
    evaluate();

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(interval);
      cancelAnimationFrame(raf);
    };
  }, [pathname, context]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (dismissed || !visible || !context) return null;
  return (
    <div role="region" aria-label={en ? "Quick sharing" : "빠른 공유"}
      className="md:hidden fixed left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-1rem)] share-bar-in"
      style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
      <div className="flex items-start gap-2 rounded-2xl border border-slate-300 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-600 dark:bg-slate-900/95">
        <ShareButtons variant="floating" register={false} contentType={CONTENT_TYPE} />
        <button type="button" onClick={handleDismiss} aria-label={en ? "Close quick sharing" : "공유 바 닫기"} className="flex min-w-11 min-h-11 items-center justify-center rounded-full text-slate-600 focus-visible:ring-2 focus-visible:ring-electric dark:text-slate-200"><X className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
