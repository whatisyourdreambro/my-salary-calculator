// src/lib/shareChannels.ts
//
// SNS 공유 채널 정의 — 공유 인텐트 URL 빌더 + 라벨/브랜드 색.
// React 무관 순수 모듈 (ShareButtons·FloatingShareBar·ShareTermButton 공용).
// 채널 id는 GA4 trackShare의 method 값과 1:1 대응.

export interface SharePayload {
  url: string;
  title: string;
  description?: string;
}

export type ShareChannelId =
  | "kakao"
  | "webshare"
  | "copy"
  | "naver_blog"
  | "facebook"
  | "x"
  | "band"
  | "line"
  | "telegram"
  | "threads"
  | "instagram";

interface ChannelMeta {
  label: string;
  labelEn: string;
  /** 원형 버튼 배경색 (브랜드 고정 hex — 라이트/다크 공통) */
  bg?: string;
  /** 인텐트 URL 빌더 — 없는 채널(kakao/webshare/copy/instagram)은 컴포넌트의 커스텀 핸들러 */
  intentUrl?: (p: SharePayload) => string;
}

const enc = encodeURIComponent;

export const SHARE_CHANNELS: Record<ShareChannelId, ChannelMeta> = {
  kakao: { label: "카카오톡", labelEn: "KakaoTalk", bg: "#FEE500" },
  webshare: { label: "공유하기", labelEn: "Share", bg: "#0145F2" },
  copy: { label: "링크 복사", labelEn: "Copy link" },
  naver_blog: {
    label: "네이버 블로그",
    labelEn: "Naver Blog",
    bg: "#03C75A",
    intentUrl: (p) =>
      `https://share.naver.com/web/shareView?url=${enc(p.url)}&title=${enc(p.title)}`,
  },
  facebook: {
    label: "페이스북",
    labelEn: "Facebook",
    bg: "#1877F2",
    intentUrl: (p) =>
      `https://www.facebook.com/sharer/sharer.php?u=${enc(p.url)}`,
  },
  x: {
    label: "X",
    labelEn: "X",
    bg: "#000000",
    intentUrl: (p) =>
      `https://twitter.com/intent/tweet?text=${enc(p.title)}&url=${enc(p.url)}`,
  },
  band: {
    label: "밴드",
    labelEn: "BAND",
    bg: "#00C73C",
    intentUrl: (p) =>
      `https://band.us/plugin/share?body=${enc(`${p.title}\n${p.url}`)}&route=${enc(p.url)}`,
  },
  line: {
    label: "라인",
    labelEn: "LINE",
    bg: "#06C755",
    intentUrl: (p) =>
      `https://social-plugins.line.me/lineit/share?url=${enc(p.url)}&text=${enc(p.title)}`,
  },
  telegram: {
    label: "텔레그램",
    labelEn: "Telegram",
    bg: "#229ED9",
    intentUrl: (p) =>
      `https://t.me/share/url?url=${enc(p.url)}&text=${enc(p.title)}`,
  },
  threads: {
    label: "스레드",
    labelEn: "Threads",
    bg: "#000000",
    intentUrl: (p) =>
      `https://www.threads.net/intent/post?text=${enc(`${p.title}\n${p.url}`)}`,
  },
  instagram: { label: "인스타그램", labelEn: "Instagram" },
};

export function channelLabel(id: ShareChannelId, locale: "ko" | "en"): string {
  const meta = SHARE_CHANNELS[id];
  return locale === "en" ? meta.labelEn : meta.label;
}

/** 데스크톱 공유 팝업 — 새 탭 대신 작은 창으로 열어 이탈 최소화 */
export function openShareWindow(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=560");
}
