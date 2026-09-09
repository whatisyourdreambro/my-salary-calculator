import { SHARE_CHANNELS, withUtm, type ShareChannelId, type KakaoFeedPayload } from "./shareChannels";

export type ShareOutcome = "native_handoff" | "sdk_requested" | "intent_requested" | "clipboard_success" | "aborted" | "error" | "manual_copy_shown";
export type ShareErrorKind = "permission" | "unsupported" | "invalid" | "busy" | "unavailable";
export type ShareTransportResult = { outcome: ShareOutcome | "discarded"; errorKind?: ShareErrorKind; manualText?: string };
export interface TransportPayload {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  locale: "ko" | "en";
  shareMode?: "page" | "result";
  imageBlob?: Blob | null;
}
export interface ShareTransport {
  copy?: (text: string) => Promise<void>;
  native?: (data: ShareData) => Promise<void>;
  canShareFiles?: (data: ShareData) => boolean;
  makeFile: (blob: Blob) => File;
  kakao: (payload: KakaoFeedPayload) => boolean;
  openIntent: (url: string) => void;
  isCurrent: () => boolean;
}

function errorKind(error: unknown): ShareErrorKind {
  const name = typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
  if (name === "NotAllowedError") return "permission";
  if (name === "InvalidStateError") return "busy";
  if (name === "TypeError") return "invalid";
  return "unavailable";
}

/** Outcomes describe browser/API evidence, never a confirmed SNS post or recipient delivery. */
export async function sendShare(channel: ShareChannelId, payload: TransportPayload, transport: ShareTransport): Promise<ShareTransportResult> {
  if (!transport.isCurrent()) return { outcome: "discarded" };
  const url = withUtm(payload.url, channel);
  const copyText = payload.shareMode === "result" ? [payload.title, payload.description, url].filter(Boolean).join("\n") : url;
  const copy = async (text = copyText): Promise<ShareTransportResult> => {
    if (!transport.isCurrent()) return { outcome: "discarded" };
    try {
      if (!transport.copy) return { outcome: "error", errorKind: "unsupported", manualText: text };
      await transport.copy(text);
      return transport.isCurrent() ? { outcome: "clipboard_success" } : { outcome: "discarded" };
    } catch (error) {
      return transport.isCurrent() ? { outcome: "error", errorKind: errorKind(error), manualText: text } : { outcome: "discarded" };
    }
  };
  if (channel === "copy") return copy();
  if (channel === "kakao") {
    const invoked = transport.kakao({ ...payload, url, locale: payload.locale, buttonTitle: payload.locale === "en" ? "View" : "자세히 보기" });
    return invoked ? { outcome: "sdk_requested" } : copy(payload.shareMode === "result" ? copyText : `${payload.title}\n${url}`);
  }
  if (channel === "webshare" || channel === "instagram") {
    // Instagram has no web link-post intent. Copy is explicit and opens no unrelated tab.
    if (!transport.native || (channel === "instagram" && !payload.imageBlob)) return copy();
    try {
      let data: ShareData = { title: payload.title, text: payload.description, url };
      if (payload.imageBlob) {
        const files = [transport.makeFile(payload.imageBlob)];
        if (!transport.canShareFiles?.({ files })) return { outcome: "error", errorKind: "unsupported", manualText: copyText };
        data = { files, title: payload.title, text: `${payload.description}\n${url}` };
      }
      if (!transport.isCurrent()) return { outcome: "discarded" };
      await transport.native(data);
      return transport.isCurrent() ? { outcome: "native_handoff" } : { outcome: "discarded" };
    } catch (error) {
      if (!transport.isCurrent()) return { outcome: "discarded" };
      if (typeof error === "object" && error !== null && "name" in error && error.name === "AbortError") return { outcome: "aborted" };
      return { outcome: "error", errorKind: errorKind(error), manualText: copyText };
    }
  }
  try {
    const intent = SHARE_CHANNELS[channel].intentUrl;
    if (!intent) return { outcome: "error", errorKind: "unsupported", manualText: copyText };
    transport.openIntent(intent({ ...payload, url }));
    // noopener makes window.open return null even when a window opens.
    return { outcome: "intent_requested" };
  } catch (error) {
    return { outcome: "error", errorKind: errorKind(error), manualText: copyText };
  }
}

/** Invalidates pending preparation and delivery callbacks on route/result changes. */
export function createShareRequestGuard() {
  let version = 0;
  let identity: string | undefined;
  return {
    syncIdentity: (next: string) => { if (identity !== next) { identity = next; version += 1; } },
    invalidate: () => { version += 1; },
    begin: () => { const request = ++version; return () => request === version; },
  };
}
