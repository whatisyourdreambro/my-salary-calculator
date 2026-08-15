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
import { Link as LinkIcon, Share2, X } from "lucide-react";
import { trackShare, trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/seo";
import { tryKakaoFeedShare } from "@/lib/shareChannels";

const DISMISS_KEY = "msy_sharebar_dismissed";
const SCROLL_THRESHOLD = 400;
const CONTENT_TYPE = "float_bar";
const CHECK_INTERVAL_MS = 1500;

function isAnchorAdShown(): boolean {
  // Auto Ads 앵커 광고 컨테이너 — 표시 상태거나(dedicated attr),
  // noablate 컨테이너가 실제 높이를 갖고 fixed로 떠 있는 경우
  if (document.querySelector('ins.adsbygoogle[data-anchor-status="displayed"]')) {
    return true;
  }
  const noablate = document.querySelectorAll<HTMLElement>("ins.adsbygoogle-noablate");
  for (const el of noablate) {
    const rect = el.getBoundingClientRect();
    if (rect.height > 0 && getComputedStyle(el).position === "fixed") return true;
  }
  return false;
}

function isPwaBannerShown(): boolean {
  return !!document.querySelector('[role="dialog"][aria-label="홈 화면에 추가"]');
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
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const impressionSent = useRef(false);

  useEffect(() => {
    // 데스크톱은 CSS(md:hidden)로도 가려지지만, 관찰 비용 자체를 아끼기 위해 스킵
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {}

    let raf = 0;
    const evaluate = () => {
      const show =
        window.scrollY > SCROLL_THRESHOLD &&
        !isInlineShareVisible() &&
        !isAnchorAdShown() &&
        !isPwaBannerShown();
      setVisible(show);
      if (show && !impressionSent.current) {
        impressionSent.current = true;
        trackEvent("share_bar_impression", {
          page_path: window.location.pathname,
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
  }, [pathname]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const derive = () => {
    const url = `${SITE_CONFIG.url}${window.location.pathname}`;
    const title =
      document.title.replace(/\s*[|—-]\s*머니샐러리\s*$/, "").trim() ||
      "머니샐러리 - 2026년 연봉 실수령액 계산기";
    return { url, title };
  };

  const copyLink = async (url: string, title: string, kakaoHint: boolean) => {
    try {
      await navigator.clipboard.writeText(kakaoHint ? `${title}\n${url}` : url);
      showToast(
        kakaoHint ? "💬 링크 복사 완료! 카카오톡에 붙여넣기 하세요" : "🔗 링크가 복사됐어요!"
      );
    } catch {
      showToast("복사에 실패했습니다.");
    }
  };

  const handleKakao = () => {
    trackShare("kakao", CONTENT_TYPE);
    const { url, title } = derive();
    const opened = tryKakaoFeedShare({
      url,
      title,
      description: "내 연봉의 실제 수령액을 확인해보세요!",
      imageUrl: `${SITE_CONFIG.url}/api/og?path=${encodeURIComponent(
        window.location.pathname
      )}&title=${encodeURIComponent(title)}`,
    });
    if (!opened) void copyLink(url, title, true);
  };

  const handleWebShare = async () => {
    trackShare("webshare", CONTENT_TYPE);
    const { url, title } = derive();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // 시트 닫음(AbortError) — 무시
      }
    } else {
      void copyLink(url, title, false);
    }
  };

  const handleCopy = () => {
    trackShare("copy", CONTENT_TYPE);
    const { url, title } = derive();
    void copyLink(url, title, false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  if (dismissed || !visible) {
    return toast ? <ToastNode msg={toast} /> : null;
  }

  return (
    <>
      <div
        role="region"
        aria-label="빠른 공유"
        className="md:hidden fixed left-1/2 -translate-x-1/2 z-40 share-bar-in"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 rounded-full bg-navy/95 backdrop-blur border border-white/10 shadow-2xl">
          <span className="text-xs font-bold text-white mr-1">공유</span>
          <button
            type="button"
            onClick={handleKakao}
            aria-label="카카오톡 공유"
            className="w-9 h-9 rounded-full bg-[#FEE500] flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#371D1E" aria-hidden>
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.394 1.36 4.514 3.445 5.882L4.5 20l4.094-2.182A11.3 11.3 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleWebShare}
            aria-label="공유하기"
            className="w-9 h-9 rounded-full bg-electric flex items-center justify-center active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="링크 복사"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-95 transition-transform"
          >
            <LinkIcon className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="공유 바 닫기"
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      {toast && <ToastNode msg={toast} />}
    </>
  );
}

function ToastNode({ msg }: { msg: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="share-toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] whitespace-nowrap"
    >
      {msg}
    </div>
  );
}
