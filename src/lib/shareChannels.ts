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

export interface KakaoFeedPayload extends SharePayload {
  imageUrl: string;
  buttonTitle?: string;
}

interface KakaoSdkGlobal {
  isInitialized?: () => boolean;
  Share?: { sendDefault: (settings: Record<string, unknown>) => void };
}

const HOME_URL = "https://www.moneysalary.com";

/**
 * Kakao SDK 초기화 시 피드 공유창 오픈 (ShareButtons·FloatingShareBar 공용).
 * false 반환 시 호출측이 폴백(링크 복사) 처리한다.
 * 버튼 2개: [자세히 보기 → 공유 페이지] + [내 연봉 계산하기 → 홈]
 * — 공유 1건당 유입 접점을 2배로 (홈 공유 시엔 중복이라 1개만).
 */
export function tryKakaoFeedShare(p: KakaoFeedPayload): boolean {
  if (typeof window === "undefined") return false;
  const kakao = (window as unknown as { Kakao?: KakaoSdkGlobal }).Kakao;
  if (!kakao?.isInitialized?.()) return false;
  try {
    const buttons: Record<string, unknown>[] = [
      {
        title: p.buttonTitle ?? "자세히 보기",
        link: { mobileWebUrl: p.url, webUrl: p.url },
      },
    ];
    const isHome = p.url.replace(/\/+$/, "") === HOME_URL;
    if (!isHome) {
      buttons.push({
        title: "내 연봉 계산하기",
        link: { mobileWebUrl: HOME_URL, webUrl: HOME_URL },
      });
    }
    kakao.Share?.sendDefault({
      objectType: "feed",
      content: {
        title: p.title,
        description: p.description ?? "",
        imageUrl: p.imageUrl,
        link: { mobileWebUrl: p.url, webUrl: p.url },
      },
      buttons,
    });
    return true;
  } catch {
    return false;
  }
}
