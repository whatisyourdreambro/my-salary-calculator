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

/**
 * 공유 URL에 채널 귀속 utm 부여 (순수 함수, 2026-09-05 plan-gap-critic-3).
 * 카카오 인앱·클립보드 붙여넣기·PWA 실행은 referrer가 없어 GA4에서 전부 (direct)로
 * 떨어진다 — 채널별 utm_source(kakao|copy|webshare|…)+utm_medium=share 로 분해한다.
 * - `?` 유무 모두 처리, `#fragment`는 뒤로 보존, `/share/{base64}`·`?v=base64` 값은 손대지 않음
 * - 이미 utm_source/utm_medium 이 있으면 교체(멱등) — 상위에서 한 번 더 감싸도 안전
 * - canonical/OG는 pathname 기준(seo.ts)이라 색인 중복 없음. 광고 무접촉.
 * 주의: utm_medium=share 는 GA4 기본 채널 그룹에서 'Unassigned' — 소스/매체 행으로 읽는다.
 */
export function withUtm(
  url: string,
  source: ShareChannelId | string,
  medium = "share"
): string {
  const hashIdx = url.indexOf("#");
  const fragment = hashIdx >= 0 ? url.slice(hashIdx) : "";
  const noFrag = hashIdx >= 0 ? url.slice(0, hashIdx) : url;
  const qIdx = noFrag.indexOf("?");
  const base = qIdx >= 0 ? noFrag.slice(0, qIdx) : noFrag;
  const query = qIdx >= 0 ? noFrag.slice(qIdx + 1) : "";
  const kept = query
    .split("&")
    .filter((p) => p && !/^utm_(source|medium)=/.test(p));
  kept.push(`utm_source=${enc(source)}`, `utm_medium=${enc(medium)}`);
  return `${base}?${kept.join("&")}${fragment}`;
}

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
    // 쿼리(utm)·해시 제거 후 홈 판정 — p.url 은 withUtm 으로 감싸져 들어올 수 있음
    const isHome = p.url.replace(/[?#].*$/, "").replace(/\/+$/, "") === HOME_URL;
    if (!isHome) {
      // 홈 버튼도 카카오 귀속 utm — 공유 1건의 두 접점이 모두 kakao / share 로 잡히도록
      const homeUrl = withUtm(HOME_URL, "kakao");
      buttons.push({
        title: "내 연봉 계산하기",
        link: { mobileWebUrl: homeUrl, webUrl: homeUrl },
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
