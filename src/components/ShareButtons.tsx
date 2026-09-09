"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Link as LinkIcon, Facebook, Instagram, Share2, Send, AtSign, Users, MoreHorizontal } from "lucide-react";
import { trackShare, trackShareOutcome, trackEvent } from "@/lib/analytics";
import { SHARE_CHANNELS, channelLabel, openShareWindow, tryKakaoFeedShare, type ShareChannelId } from "@/lib/shareChannels";
import { registerPrimary } from "@/lib/shareRegistry";
import { useSharePageContext } from "@/hooks/useSharePageContext";
import { approvedResultUrl, resolvePublicShare, type ShareMode } from "@/lib/sharePolicy";
import { createShareRequestGuard, sendShare } from "@/lib/shareTransport";

export interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  contentType?: string;
  shareMode?: ShareMode;
  /** Local-only snapshot identity. Never sent to analytics, storage or a URL. */
  resultKey?: string;
  getShareImage?: () => Promise<Blob | null>;
  /** Prepared locally during preview, before the native-share user gesture. */
  imageBlob?: Blob | null;
  className?: string;
  locale?: "ko" | "en";
  register?: boolean;
  variant?: "row" | "compact" | "floating";
}
const CIRCLE = "w-11 h-11 shrink-0 rounded-full flex items-center justify-center shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-50";
const INSTAGRAM_STYLE = { background: "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)" };

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
  url, title, description, imageUrl, getShareImage, imageBlob, resultKey,
  contentType = "page", className = "", locale: explicitLocale,
  register, variant = "row", shareMode = "page",
}: ShareButtonsProps) {
  const { pathname, context } = useSharePageContext();
  const panelId = useId();
  const [toast, setToast] = useState<string | null>(null);
  const [manual, setManual] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [canWebShare, setCanWebShare] = useState(false);
  const guard = useRef(createShareRequestGuard());
  const inFlight = useRef(false);
  const latest = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const shouldRegister = register ?? variant === "row";
  const page = context ? resolvePublicShare(context, shareMode === "page" ? { url, title, description, imageUrl, locale: explicitLocale } : { locale: explicitLocale }) : null;
  const locale = page?.locale ?? explicitLocale ?? (/^\/en(?:\/|$)/.test(pathname) ? "en" : "ko");
  const en = locale === "en";
  const payload = page && shareMode === "result" ? {
    ...page, url: approvedResultUrl(url, page.url), title: title ?? page.title,
    description: description ?? page.description, imageUrl: imageUrl ?? page.imageUrl,
  } : page;
  // Deliberately local only; never place this equality key in events or URLs.
  const identity = JSON.stringify([pathname, !!context, shareMode, resultKey, payload?.url, payload?.title, payload?.description, payload?.imageUrl]);
  guard.current.syncIdentity(identity);
  latest.current = identity;

  useEffect(() => {
    setCanWebShare(typeof navigator.share === "function");
    const requestGuard = guard.current;
    return () => { requestGuard.invalidate(); clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    guard.current.invalidate();
    inFlight.current = false;
    setBusy(false); setManual(null); setToast(null); setExpanded(false);
  }, [identity]);
  useEffect(() => {
    if (shouldRegister && context) return registerPrimary(pathname);
  }, [shouldRegister, pathname, context]);

  function showToast(message: string) {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(null), 3500);
  }

  async function handleShare(channel: ShareChannelId) {
    if (!payload || !context || inFlight.current) return;
    inFlight.current = true;
    setBusy(true); setManual(null);
    const validRequest = guard.current.begin();
    const isCurrent = () => validRequest() && latest.current === identity;
    trackShare(channel, contentType, pathname, shareMode);
    let prepared = shareMode === "result" ? imageBlob : undefined;
    try {
      // Panel callers pass a prepared Blob; native-share clicks do not await screenshots.
      if (!prepared && shareMode === "result" && getShareImage && (channel === "webshare" || channel === "instagram")) {
        prepared = await getShareImage();
        if (!isCurrent()) return;
        if (!prepared) {
          trackShareOutcome(channel, contentType, "error", pathname, shareMode, "unavailable");
          showToast(en ? "The image could not be prepared. Try the preview again." : "이미지를 준비하지 못했습니다. 미리보기를 다시 열어 주세요.");
          return;
        }
      }
      if (!isCurrent()) return;
      const result = await sendShare(channel, { ...payload, imageBlob: prepared, shareMode }, {
        copy: navigator.clipboard?.writeText ? (text) => navigator.clipboard.writeText(text) : undefined,
        native: navigator.share ? (data) => navigator.share(data) : undefined,
        canShareFiles: navigator.canShare ? (data) => navigator.canShare(data) : undefined,
        makeFile: (blob) => new File([blob], "moneysalary-result.png", { type: blob.type || "image/png" }),
        kakao: tryKakaoFeedShare, openIntent: openShareWindow, isCurrent,
      });
      if (!isCurrent() || result.outcome === "discarded") return;
      trackShareOutcome(channel, contentType, result.outcome, pathname, shareMode, result.errorKind);
      if (result.outcome === "clipboard_success") showToast(shareMode === "result" ? (en ? "Result text and link copied." : "결과 문구와 링크가 복사됐어요.") : channel === "instagram" ? (en ? "Link copied. Paste it in Instagram." : "링크를 복사했습니다. 인스타그램에 붙여 넣으세요.") : channel === "kakao" ? (en ? "Link copied. Paste it in KakaoTalk." : "링크를 복사했습니다. 카카오톡에 붙여 넣으세요.") : (en ? "Link copied." : "링크가 복사됐어요."));
      else if (result.outcome === "aborted") showToast(en ? "Sharing was cancelled or no target was available." : "공유를 취소했거나 사용할 공유 앱이 없습니다.");
      else if (result.outcome === "native_handoff") showToast(en ? "Handed to your device's share dialog." : "기기의 공유 기능으로 전달했습니다.");
      else if (result.outcome === "sdk_requested" || result.outcome === "intent_requested") showToast(en ? "Share window requested. Complete it in the other app." : "공유 창을 요청했습니다. 해당 앱에서 마무리해 주세요.");
      else if (result.outcome === "error") showToast(en ? "Sharing was unavailable. You can copy the link below." : "공유를 실행하지 못했습니다. 아래 링크를 직접 복사할 수 있어요.");
      if (result.manualText) {
        setManual(result.manualText);
        trackShareOutcome(channel, contentType, "manual_copy_shown", pathname, shareMode);
      }
    } catch {
      if (isCurrent()) {
        trackShareOutcome(channel, contentType, "error", pathname, shareMode, "unavailable");
        showToast(en ? "Sharing failed. Please try again." : "공유를 실행하지 못했습니다. 다시 시도해 주세요.");
      }
    } finally {
      if (isCurrent()) { inFlight.current = false; setBusy(false); }
    }
  }

  if (!context || !payload || (shareMode === "result" && !resultKey)) return null;
  const status = <>
    {toast && <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-700 dark:text-slate-200">{toast}</p>}
    {manual && <div className="mt-3 w-full rounded-xl border border-slate-300 p-3 dark:border-slate-600">
      <label htmlFor={`${panelId}-copy`} className="block text-sm font-semibold mb-2">{en ? "Select and copy the content below" : "아래 내용을 선택해 직접 복사하세요"}</label>
      <textarea id={`${panelId}-copy`} readOnly value={manual} onFocus={(event) => event.currentTarget.select()} rows={3} className="w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:bg-slate-900 dark:text-white" />
      <button type="button" className="min-h-11 px-3 underline" onClick={() => setManual(null)}>{en ? "Close" : "닫기"}</button>
    </div>}
  </>;
  if (variant === "compact") return <div className={className}>
    <button type="button" disabled={busy} onClick={() => void handleShare(canWebShare ? "webshare" : "copy")} aria-label={en ? "Share page link" : "페이지 링크 공유"} title={en ? "Share page link" : "페이지 링크 공유"} className="inline-flex min-w-11 min-h-11 items-center justify-center rounded-full border border-canvas bg-canvas-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric disabled:opacity-50"><Share2 className="w-5 h-5 text-faint-blue" /></button>
    {status}
  </div>;
  const primary: ShareChannelId[] = variant === "floating" ? (en ? (canWebShare ? ["webshare", "copy"] : ["copy"]) : (canWebShare ? ["kakao", "webshare", "copy"] : ["kakao", "copy"])) : en ? (canWebShare ? ["webshare", "copy", "x"] : ["copy", "x", "facebook"]) : (canWebShare ? ["kakao", "webshare", "copy"] : ["kakao", "copy", "naver_blog", "x"]);
  const more = (Object.keys(SHARE_CHANNELS) as ShareChannelId[]).filter((id) => !primary.includes(id) && (id !== "webshare" || canWebShare));
  const label = (id: ShareChannelId) => id === "copy" && shareMode === "result" ? (en ? "Copy result text and link" : "결과 문구·링크 복사") : id === "webshare" && shareMode === "result" && (imageBlob || getShareImage) ? (en ? "Share result image" : "결과 이미지 공유") : channelLabel(id, locale);
  const button = (id: ShareChannelId) => <button key={id} type="button" disabled={busy} onClick={() => void handleShare(id)} aria-label={label(id)} title={label(id)} className={`${CIRCLE} ${id === "copy" ? "bg-canvas-dark border border-canvas" : ""}`} style={id === "instagram" ? INSTAGRAM_STYLE : { backgroundColor: SHARE_CHANNELS[id].bg }}><ChannelIcon id={id} /></button>;
  return <div className={className} data-share-root={variant === "floating" ? undefined : shouldRegister ? "primary" : "fallback"} data-share-mode={shareMode}>
    <div className="flex flex-wrap items-center gap-3">
      {primary.map(button)}
      {variant !== "floating" && <button type="button" aria-expanded={expanded} aria-controls={panelId} aria-label={en ? (expanded ? "Hide share options" : "More share options") : (expanded ? "공유 옵션 접기" : "더 많은 공유 옵션")} onClick={() => { if (!expanded) trackEvent("share_expand", { content_type: "page", share_mode: shareMode, event_version: 2 }); setExpanded(!expanded); }} className={`${CIRCLE} border border-canvas bg-canvas-dark`}><MoreHorizontal className="w-5 h-5 text-faint-blue" /></button>}
    </div>
    {expanded && <div id={panelId} className="flex flex-wrap gap-3 mt-3">{more.map((id) => <div key={id} className="flex flex-col items-center gap-1">{button(id)}<span className="text-xs text-faint-blue">{label(id)}</span></div>)}</div>}
    {status}
  </div>;
}
