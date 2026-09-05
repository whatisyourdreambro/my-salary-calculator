"use client";

// SNS 공유 버튼 v2 — 핵심 채널 1열 + "더보기" 펼침 + 모바일 시스템 공유.
// - 기존 v1 호출부(74곳)와 props 완전 하위호환 (url/title/description/imageUrl/contentType/getShareImage/className)
// - 카카오: SDK 초기화 시 진짜 공유창(KakaoScript.tsx 참고), 미초기화 시 링크 복사 폴백
// - url/title/imageUrl 미지정 시 canonical(pathname)·document.title·동적 OG로 자동 도출
// - layout 주입 fallback(AutoShareSection)과의 중복 방지를 위해 shareRegistry에 등록

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Link as LinkIcon,
  Facebook,
  Instagram,
  Share2,
  Send,
  AtSign,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { trackShare, trackEvent } from "@/lib/analytics";
import { SITE_CONFIG } from "@/lib/seo";
import {
  SHARE_CHANNELS,
  channelLabel,
  openShareWindow,
  tryKakaoFeedShare,
  withUtm,
  type ShareChannelId,
} from "@/lib/shareChannels";
import { registerPrimary } from "@/lib/shareRegistry";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  /** 카카오 공유 카드 썸네일. 미지정 시 페이지별 동적 OG(/api/og) 사용 */
  imageUrl?: string;
  /** 공유 콘텐츠 종류 (예: salary_result, company, guide, fun) — GA4에서 어떤 결과가 가장 많이 공유되는지 측정 */
  contentType?: string;
  /**
   * 결과 이미지를 가진 페이지(FUN 결과 카드 등)는 이 캡처 함수를 넘긴다.
   * 넘기면 인스타그램 버튼이 모바일 Web Share API 로 이미지 파일을 직접 공유한다.
   * (인스타그램은 웹 링크 공유 API 가 없어 이미지 공유가 유일한 정식 경로)
   */
  getShareImage?: () => Promise<Blob | null>;
  className?: string;
  /** 영문 페이지(/en/*)는 "en" — 라벨·토스트 영어화 */
  locale?: "ko" | "en";
  /**
   * shareRegistry 등록 여부. 페이지의 대표 공유 UI면 true(기본) —
   * 카테고리 layout의 AutoShareSection fallback이 자동으로 숨는다.
   * fallback 자신과 보조 UI(compact)는 false.
   */
  register?: boolean;
  /** "compact": 시스템 공유(불가 시 링크 복사) 아이콘 버튼 1개만 렌더 */
  variant?: "row" | "compact";
}

const DEFAULT_TITLE = "머니샐러리 - 2026년 연봉 실수령액 계산기";
const DEFAULT_TITLE_EN = "Moneysalary - Korea Salary Calculator";

const STRINGS = {
  ko: {
    copied: "🔗 링크가 복사됐어요!",
    copyFail: "복사에 실패했습니다.",
    kakaoCopied: "💬 링크 복사 완료! 카카오톡에 붙여넣기 하세요",
    kakaoCopyFail: "링크를 복사해 카카오톡으로 공유하세요",
    instaCopied: "📷 링크 복사 완료! 인스타그램 프로필·스토리에 붙여넣으세요",
    instaCopyFail: "링크를 복사해 인스타그램에 공유하세요",
    more: "더 많은 공유 옵션",
    close: "공유 옵션 접기",
    defaultDesc: "내 연봉의 실제 수령액을 확인해보세요!",
  },
  en: {
    copied: "🔗 Link copied!",
    copyFail: "Copy failed.",
    kakaoCopied: "💬 Link copied! Paste it in KakaoTalk",
    kakaoCopyFail: "Copy the link to share on KakaoTalk",
    instaCopied: "📷 Link copied! Paste it in your Instagram story",
    instaCopyFail: "Copy the link to share on Instagram",
    more: "More share options",
    close: "Hide share options",
    defaultDesc: "Check your real take-home pay!",
  },
} as const;

// 원형 버튼 공통 (44px 터치 타깃)
const CIRCLE =
  "w-11 h-11 rounded-full flex items-center justify-center shadow-lg " +
  "transition-transform hover:scale-110 hover:-translate-y-0.5 active:scale-95 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2";

const INSTAGRAM_STYLE = {
  background: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)",
  boxShadow: "0 10px 15px -3px rgba(221,42,123,0.3)",
} as const;

function ChannelIcon({ id }: { id: ShareChannelId }) {
  switch (id) {
    case "kakao":
      // KakaoTalk speech bubble
      return (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#371D1E" aria-hidden>
          <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.394 1.36 4.514 3.445 5.882L4.5 20l4.094-2.182A11.3 11.3 0 0 0 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3Z" />
        </svg>
      );
    case "naver_blog":
      // Naver "N"
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FFFFFF" aria-hidden>
          <path d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845Z" />
        </svg>
      );
    case "facebook":
      return <Facebook className="w-5 h-5 text-white" fill="white" />;
    case "x":
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#FFFFFF" aria-hidden>
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      );
    case "band":
      return <Users className="w-5 h-5 text-white" />;
    case "line":
      return (
        <span className="text-[9px] font-black text-white tracking-tight" aria-hidden>
          LINE
        </span>
      );
    case "telegram":
      return <Send className="w-4 h-4 text-white -translate-x-px" />;
    case "threads":
      return <AtSign className="w-5 h-5 text-white" />;
    case "instagram":
      return <Instagram className="w-5 h-5 text-white" />;
    case "webshare":
      return <Share2 className="w-5 h-5 text-white" />;
    case "copy":
      return <LinkIcon className="w-4 h-4 text-faint-blue" />;
  }
}

export default function ShareButtons({
  url,
  title,
  description,
  imageUrl,
  getShareImage,
  contentType = "page",
  className = "",
  locale = "ko",
  register,
  variant = "row",
}: ShareButtonsProps) {
  const pathname = usePathname();
  const panelId = useId();
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [canWebShare, setCanWebShare] = useState(false);
  const [docTitle, setDocTitle] = useState<string | null>(null);

  const S = STRINGS[locale];
  const shouldRegister = register ?? variant !== "compact";

  // 자동 도출: canonical URL(쿼리 없는 pathname 기준) / document.title / 동적 OG
  const shareUrl = url || `${SITE_CONFIG.url}${pathname ?? ""}`;
  // 채널별 귀속 URL — 실제로 밖으로 나가는 링크에만 utm 부여 (canonical/OG 는 shareUrl 그대로)
  const channelUrl = (id: ShareChannelId) => withUtm(shareUrl, id);
  const shareTitle =
    title ?? docTitle ?? (locale === "en" ? DEFAULT_TITLE_EN : DEFAULT_TITLE);
  const shareDesc = description ?? S.defaultDesc;
  const shareImage =
    imageUrl ??
    `${SITE_CONFIG.url}/api/og?path=${encodeURIComponent(
      pathname ?? "/"
    )}&title=${encodeURIComponent(shareTitle)}`;

  useEffect(() => {
    setCanWebShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (title) return;
    // "| 머니샐러리" 류 사이트명 접미 제거
    const t = document.title.replace(/\s*[|—-]\s*머니샐러리\s*$/, "").trim();
    if (t) setDocTitle(t);
  }, [title, pathname]);

  // layout fallback(AutoShareSection) 중복 방지 등록 — cleanup 대칭
  useEffect(() => {
    if (!shouldRegister || !pathname) return;
    return registerPrimary(pathname);
  }, [shouldRegister, pathname]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const copyToClipboard = async (text: string, ok: string, fail: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(ok);
    } catch {
      showToast(fail);
    }
  };

  const handleKakaoShare = async () => {
    trackShare("kakao", contentType);
    const kakaoUrl = channelUrl("kakao");
    // Kakao JS SDK 가 초기화돼 있으면 인앱 공유, 아니면 링크 복사로 폴백.
    const opened = tryKakaoFeedShare({
      url: kakaoUrl,
      title: shareTitle,
      description: shareDesc,
      imageUrl: shareImage,
      buttonTitle: locale === "en" ? "View" : "자세히 보기",
    });
    if (opened) return;
    await copyToClipboard(`${shareTitle}\n${kakaoUrl}`, S.kakaoCopied, S.kakaoCopyFail);
  };

  const handleWebShare = async () => {
    trackShare("webshare", contentType);
    const webShareUrl = channelUrl("webshare");
    try {
      // 결과 이미지가 있으면 이미지 파일까지 함께 공유 (카톡 사진·스토리 유입)
      if (getShareImage) {
        try {
          const blob = await getShareImage();
          if (blob) {
            const file = new File([blob], "moneysalary.png", { type: "image/png" });
            const nav = navigator as Navigator & {
              canShare?: (data: { files: File[] }) => boolean;
            };
            if (nav.canShare?.({ files: [file] })) {
              await nav.share({
                files: [file],
                title: shareTitle,
                text: `${shareDesc}\n${webShareUrl}`,
              });
              return;
            }
          }
        } catch {}
      }
      await navigator.share({ title: shareTitle, text: shareDesc, url: webShareUrl });
    } catch {
      // 사용자가 공유 시트를 닫은 경우(AbortError) — 무시
    }
  };

  const handleInstagramShare = async () => {
    trackShare("instagram", contentType);
    // 결과 이미지가 있으면 모바일 Web Share API 로 이미지 파일을 직접 공유
    // (사용자가 공유 시트에서 인스타그램 스토리/피드 선택 가능).
    if (getShareImage) {
      try {
        const blob = await getShareImage();
        if (blob) {
          const file = new File([blob], "moneysalary.png", { type: "image/png" });
          const nav = navigator as Navigator & {
            canShare?: (data: { files: File[] }) => boolean;
          };
          if (nav.canShare?.({ files: [file] })) {
            await nav.share({ files: [file], title: shareTitle, text: shareDesc });
            return;
          }
        }
      } catch {}
    }
    // 인스타그램은 웹 링크 공유 URL 이 없어 링크 복사 + 인스타 열기로 안내.
    await copyToClipboard(channelUrl("instagram"), S.instaCopied, S.instaCopyFail);
    window.open("https://www.instagram.com/", "_blank");
  };

  const handleCopyLink = () => {
    trackShare("copy", contentType);
    void copyToClipboard(channelUrl("copy"), S.copied, S.copyFail);
  };

  const handleShare = (id: ShareChannelId) => {
    if (id === "kakao") return void handleKakaoShare();
    if (id === "webshare") return void handleWebShare();
    if (id === "instagram") return void handleInstagramShare();
    if (id === "copy") return handleCopyLink();
    const meta = SHARE_CHANNELS[id];
    if (!meta.intentUrl) return;
    trackShare(id, contentType);
    openShareWindow(
      meta.intentUrl({ url: channelUrl(id), title: shareTitle, description: shareDesc })
    );
  };

  const toggleExpanded = () => {
    setExpanded((prev) => {
      if (!prev) trackEvent("share_expand", { content_type: contentType });
      return !prev;
    });
  };

  const buttonBg = (id: ShareChannelId) => {
    if (id === "instagram") return undefined;
    return SHARE_CHANNELS[id].bg;
  };

  const circleClass = (id: ShareChannelId) =>
    id === "copy"
      ? `${CIRCLE} bg-canvas-dark border border-canvas hover:bg-primary/10 hover:border-primary/30`
      : CIRCLE;

  const circleStyle = (id: ShareChannelId) => {
    if (id === "instagram") return INSTAGRAM_STYLE;
    const bg = buttonBg(id);
    return bg
      ? { backgroundColor: bg, boxShadow: `0 10px 15px -3px ${bg}4D` }
      : undefined;
  };

  const toastNode = toast && (
    <div
      role="status"
      aria-live="polite"
      className="share-toast fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl z-[100] whitespace-nowrap"
    >
      {toast}
    </div>
  );

  // ── compact: 아이콘 1개 (시스템 공유 → 불가 시 링크 복사) ──
  if (variant === "compact") {
    const handleCompact = () => {
      if (canWebShare) return void handleWebShare();
      trackShare("copy", contentType);
      void copyToClipboard(channelUrl("copy"), S.copied, S.copyFail);
    };
    return (
      <>
        <button
          type="button"
          onClick={handleCompact}
          aria-label={channelLabel("webshare", locale)}
          title={channelLabel("webshare", locale)}
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-canvas-dark border border-canvas hover:bg-primary/10 hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${className}`}
        >
          <Share2 className="w-4 h-4 text-faint-blue" />
        </button>
        {toastNode}
      </>
    );
  }

  // ── 1열 구성: 모바일(시스템 공유 지원)은 3개+더보기, 데스크톱은 5개+더보기 ──
  const primary: ShareChannelId[] = canWebShare
    ? ["kakao", "webshare", "copy"]
    : locale === "en"
      ? ["kakao", "facebook", "x", "copy"]
      : ["kakao", "naver_blog", "facebook", "x", "copy"];

  const ALL_MORE: ShareChannelId[] = [
    "naver_blog",
    "facebook",
    "x",
    "band",
    "line",
    "telegram",
    "threads",
    "instagram",
  ];
  const more = ALL_MORE.filter((id) => !primary.includes(id));

  return (
    <>
      <div
        data-share-root={shouldRegister ? "primary" : "fallback"}
        className={`flex flex-wrap gap-3 items-center ${className}`}
      >
        {primary.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleShare(id)}
            className={circleClass(id)}
            style={circleStyle(id)}
            aria-label={channelLabel(id, locale)}
            title={channelLabel(id, locale)}
          >
            <ChannelIcon id={id} />
          </button>
        ))}

        {/* 더보기 토글 */}
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? S.close : S.more}
          title={expanded ? S.close : S.more}
          className={`${CIRCLE} bg-canvas-dark border border-canvas hover:bg-primary/10 hover:border-primary/30`}
        >
          <MoreHorizontal
            className={`w-5 h-5 text-faint-blue transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* 더보기 패널 — flex-wrap의 w-full 자식이라 아랫줄로 내려감 (justify-* 호환) */}
        <div
          id={panelId}
          className={`w-full overflow-hidden transition-all duration-300 ease-out ${
            expanded ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-3 pt-3">
            {more.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleShare(id)}
                aria-label={channelLabel(id, locale)}
                className="group flex flex-col items-center gap-1.5 focus-visible:outline-none"
                tabIndex={expanded ? 0 : -1}
              >
                <span
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-electric ${
                    id === "copy" ? "bg-canvas-dark border border-canvas" : ""
                  }`}
                  style={circleStyle(id)}
                >
                  <ChannelIcon id={id} />
                </span>
                <span className="text-[11px] font-bold text-faint-blue group-hover:text-navy dark:group-hover:text-canvas-50 transition-colors">
                  {channelLabel(id, locale)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {toastNode}
    </>
  );
}
