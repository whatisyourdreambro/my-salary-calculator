// src/lib/autoAdsSeen.ts
//
// 자동광고 관측 이벤트 autoads_seen — 측정 버전 aa1 (2026-09-26 준비, 운영자 승인 뒤 배포. 측정 전용).
//
// 왜: 9/26 진단에서 애드센스 콘솔 미리보기는 페이지마다 인페이지 자동광고 12~17자리를 계획하는데,
//   실제 방문의 자동 인페이지 노출은 PV 당 0.6~0.8 이었다(9/10 에 가장 많이 잃은 곳은 회사 페이지).
//   실방문에서 구글이 자리를 몇 개 끼워 넣고(placed), 그중 몇 개를 요청하고(req), 몇 개가 채워지는지(filled)
//   재서 10/9 에스컬레이션 방향을 정한다. 자리가 3개 안팎이면 구글 설정 한도(애드센스 지원 문의),
//   12~17개인데 요청이 적으면 지연 로드·스크롤 문제다.
//
// snapshotAutoAds(doc, win) — 읽기 전용 스냅숏:
//   aa_placed    .google-auto-placed(자동 인페이지 자리 컨테이너) 수
//   aa_ins       그 안의 ins.adsbygoogle 수
//   aa_req       그중 data-adsbygoogle-status="done"(요청까지 간 것)
//   aa_filled    그중 data-ad-status="filled", aa_unfilled 는 "unfilled"
//   aa_first_top·aa_last_top  자리 컨테이너의 문서 기준 위치(rect.top + scrollY) 최소·최대, 100 단위 반올림.
//                크기가 0×0 인 자리(display:none)는 위치 계산에서만 뺀다. 위치를 잴 자리가 없으면 두 값을 싣지 않는다.
//   manual_ins   .google-auto-placed 밖의 ins.adsbygoogle[data-ad-slot] — 사이트가 직접 넣은 광고 칸
//   doc_h        documentElement.scrollHeight, 100 단위
//   ama_cfg      localStorage 에 google_ama_config(자동광고 설정 캐시) 키가 있으면 1, 없거나 읽을 수 없으면 0
//   앵커·전면(vignette) 광고는 .google-auto-placed 밖에 붙으므로 aa_* 에 들어가지 않는다.
//
// installAutoAdsSeen(win, send) — 문서당 1회(window 플래그), 지금 뷰가 착지(nav_type=landing)일 때만 설치:
//   - 5초마다 90초 동안 스냅숏을 떠서 항목별 최댓값을 유지하고, 보내기 직전에 한 번 더 뜬다.
//     위치(first/last_top)는 자리 수가 최대였던 가장 최근 스냅숏의 값이다.
//   - scroll_max = max(scrollY + innerHeight), 100 단위. 1초 스로틀 passive scroll 리스너.
//   - 뷰가 소프트로 바뀌면(사이트 안 링크 이동 등) 그 시점 값에서 멈춘다. 다음 뷰의 DOM 을 착지 뷰 수치에 섞지 않으며,
//     이때는 soft_nav_before_send=1, nav_type=soft 로 나간다.
//   - visibilitychange→hidden 또는 pagehide 중 먼저 온 것에서 정확히 1회, transport_type beacon 으로 보낸다.
//   - position = '<aa_ins>-<aa_req>-<aa_filled>' — 이미 등록된 맞춤 측정기준 position 을 재사용한다.
// 하지 않는 것: DOM 쓰기, DOM 변경 관찰자, 광고 요청·렌더·dedup 로직 접근. 모든 경로가 try/catch 라 계측 실패가
//   페이지나 광고를 막지 않는다. 개인정보: 경로는 첫 마디(page_group)만, 입력값·금액·쿼리는 싣지 않는다.
// 해석·GA4 등록·판독 절차는 docs/analytics-measurement.md '자동광고 관측 autoads_seen' 절.

import { getNavType, type NavType } from "./navType";
import { viewportBucket } from "./vitalsAttribution";

export const AUTOADS_SEEN_EVENT = "autoads_seen";
export const AUTOADS_SEEN_VERSION = "aa1";
export const AUTOADS_POLL_MS = 5_000;
export const AUTOADS_POLL_WINDOW_MS = 90_000;
export const AUTOADS_SCROLL_THROTTLE_MS = 1_000;
export const AMA_CONFIG_KEY = "google_ama_config";

const PLACED_SELECTOR = ".google-auto-placed";
const AUTO_INS_SELECTOR = ".google-auto-placed ins.adsbygoogle";
const MANUAL_INS_SELECTOR = "ins.adsbygoogle[data-ad-slot]";
const MAX_POLLS = Math.floor(AUTOADS_POLL_WINDOW_MS / AUTOADS_POLL_MS);

export type AutoAdsSnapshot = {
  aa_placed: number;
  aa_ins: number;
  aa_req: number;
  aa_filled: number;
  aa_unfilled: number;
  aa_first_top?: number;
  aa_last_top?: number;
  manual_ins: number;
  doc_h: number;
  ama_cfg: 0 | 1;
};

type RectLike = { top?: unknown; width?: unknown; height?: unknown };
type ListenerOptions = boolean | { passive?: boolean; capture?: boolean };

/** DOM 요소의 덕타입 — 읽기 메서드만 적는다(테스트는 가짜 DOM 을 넘긴다. vitest 에 jsdom 없음). */
export type AutoAdsElement = {
  getAttribute?(name: string): string | null;
  closest?(selector: string): unknown;
  getBoundingClientRect?(): RectLike;
};

export type AutoAdsDocument = {
  querySelectorAll(selector: string): ArrayLike<AutoAdsElement>;
  documentElement?: { scrollHeight?: unknown } | null;
  visibilityState?: string;
  addEventListener?(type: string, listener: () => void, options?: ListenerOptions): void;
  removeEventListener?(type: string, listener: () => void, options?: ListenerOptions): void;
};

export type AutoAdsWindow = {
  document?: AutoAdsDocument | null;
  location?: { pathname?: string } | null;
  scrollY?: number;
  pageYOffset?: number;
  innerHeight?: number;
  innerWidth?: number;
  localStorage?: { getItem(key: string): string | null } | null;
  addEventListener?(type: string, listener: () => void, options?: ListenerOptions): void;
  removeEventListener?(type: string, listener: () => void, options?: ListenerOptions): void;
  __msyAutoAdsSeenInstalled?: boolean;
};

export type AutoAdsSend = (name: string, params: Record<string, unknown>) => void;

/** 100 단위 반올림. 음수·유효하지 않은 값은 0. */
export function roundTo100(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 100) * 100;
}

/** 경로의 첫 마디(소문자 영숫자·_·-, 40자 이하). 루트는 home, 그 밖(한글·퍼센트 인코딩 등)은 other. */
export function pageGroupOf(pathname: unknown): string {
  if (typeof pathname !== "string") return "other";
  const first = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)[0];
  if (!first) return "home";
  return /^[A-Za-z0-9][A-Za-z0-9_-]{0,39}$/.test(first) ? first.toLowerCase() : "other";
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function selectAll(doc: AutoAdsDocument, selector: string): AutoAdsElement[] {
  try {
    return Array.from(doc.querySelectorAll(selector) ?? []);
  } catch {
    return [];
  }
}

function attr(el: AutoAdsElement, name: string): string | null {
  try {
    return typeof el.getAttribute === "function" ? el.getAttribute(name) : null;
  } catch {
    return null;
  }
}

function readScrollY(win: AutoAdsWindow | null | undefined): number {
  if (!win) return 0;
  try {
    return finiteOr(win.scrollY, finiteOr(win.pageYOffset, 0));
  } catch {
    return 0;
  }
}

/** 문서 기준 위치. 0×0(display:none)·읽기 실패는 undefined. */
function documentTop(el: AutoAdsElement, scrollY: number): number | undefined {
  try {
    if (typeof el.getBoundingClientRect !== "function") return undefined;
    const rect = el.getBoundingClientRect();
    if (!rect) return undefined;
    if (rect.width === 0 && rect.height === 0) return undefined;
    const top = rect.top;
    if (typeof top !== "number" || !Number.isFinite(top)) return undefined;
    return top + scrollY;
  } catch {
    return undefined;
  }
}

function insideAutoPlaced(el: AutoAdsElement): boolean {
  try {
    return typeof el.closest === "function" && el.closest(PLACED_SELECTOR) != null;
  } catch {
    return false;
  }
}

function readAmaConfig(win: AutoAdsWindow | null | undefined): 0 | 1 {
  try {
    const storage = win ? win.localStorage : null;
    if (!storage || typeof storage.getItem !== "function") return 0;
    return storage.getItem(AMA_CONFIG_KEY) !== null ? 1 : 0;
  } catch {
    return 0;
  }
}

/** 지금 DOM 의 자동광고 자리·요청·채움 수. 읽기만 하고 절대 throw 하지 않는다. */
export function snapshotAutoAds(
  doc: AutoAdsDocument | null | undefined,
  win: AutoAdsWindow | null | undefined,
): AutoAdsSnapshot {
  const snap: AutoAdsSnapshot = {
    aa_placed: 0,
    aa_ins: 0,
    aa_req: 0,
    aa_filled: 0,
    aa_unfilled: 0,
    manual_ins: 0,
    doc_h: 0,
    ama_cfg: 0,
  };
  if (doc && typeof doc.querySelectorAll === "function") {
    const scrollY = readScrollY(win);
    const placed = selectAll(doc, PLACED_SELECTOR);
    snap.aa_placed = placed.length;
    let first: number | undefined;
    let last: number | undefined;
    for (const node of placed) {
      const top = documentTop(node, scrollY);
      if (top === undefined) continue;
      first = first === undefined ? top : Math.min(first, top);
      last = last === undefined ? top : Math.max(last, top);
    }
    if (first !== undefined && last !== undefined) {
      snap.aa_first_top = roundTo100(first);
      snap.aa_last_top = roundTo100(last);
    }

    for (const ins of selectAll(doc, AUTO_INS_SELECTOR)) {
      snap.aa_ins += 1;
      if (attr(ins, "data-adsbygoogle-status") === "done") snap.aa_req += 1;
      const status = attr(ins, "data-ad-status");
      if (status === "filled") snap.aa_filled += 1;
      else if (status === "unfilled") snap.aa_unfilled += 1;
    }

    for (const ins of selectAll(doc, MANUAL_INS_SELECTOR)) {
      if (!insideAutoPlaced(ins)) snap.manual_ins += 1;
    }

    try {
      snap.doc_h = roundTo100(doc.documentElement ? doc.documentElement.scrollHeight : 0);
    } catch {
      snap.doc_h = 0;
    }
  }
  snap.ama_cfg = readAmaConfig(win);
  return snap;
}

const COUNT_KEYS = ["aa_placed", "aa_ins", "aa_req", "aa_filled", "aa_unfilled", "manual_ins", "doc_h"] as const;

/** 항목별 최댓값 누적. 위치는 자리 수가 지금까지의 최대 이상인 스냅숏에서만 갱신한다. */
export function mergeAutoAdsSnapshots(acc: AutoAdsSnapshot, next: AutoAdsSnapshot): AutoAdsSnapshot {
  const merged: AutoAdsSnapshot = { ...acc };
  for (const key of COUNT_KEYS) merged[key] = Math.max(acc[key], next[key]);
  merged.ama_cfg = acc.ama_cfg === 1 || next.ama_cfg === 1 ? 1 : 0;
  if (next.aa_placed > 0 && next.aa_placed >= acc.aa_placed && next.aa_first_top !== undefined && next.aa_last_top !== undefined) {
    merged.aa_first_top = next.aa_first_top;
    merged.aa_last_top = next.aa_last_top;
  }
  return merged;
}

function emptySnapshot(): AutoAdsSnapshot {
  return snapshotAutoAds(null, null);
}

function safeNavType(): NavType {
  try {
    return getNavType();
  } catch {
    return "landing";
  }
}

/**
 * 착지 뷰의 자동광고 관측을 설치한다. 설치했으면 true, 이미 설치됐거나 착지 뷰가 아니거나 실패했으면 false.
 * send 는 이벤트를 1회 받는다(사이트의 trackEvent). 모든 콜백은 예외를 삼킨다.
 */
export function installAutoAdsSeen(target: AutoAdsWindow | null | undefined, send: AutoAdsSend): boolean {
  if (!target) return false;
  const win: AutoAdsWindow = target;
  try {
    if (win.__msyAutoAdsSeenInstalled) return false;
    if (safeNavType() !== "landing") return false;
    win.__msyAutoAdsSeenInstalled = true;
  } catch {
    return false;
  }

  let doc: AutoAdsDocument | null = null;
  let pageGroup = "other";
  try {
    doc = win.document ?? null;
    pageGroup = pageGroupOf(win.location ? win.location.pathname : undefined);
  } catch {
    // 읽기 실패는 기본값으로 둔다.
  }

  let acc = emptySnapshot();
  let scrollMax = 0;
  let softBeforeSend = false;
  let frozen = false;
  let sent = false;
  let polls = 0;
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let lastScrollAt = Number.NEGATIVE_INFINITY;
  const scrollOptions = { passive: true };

  const stopPolling = () => {
    try {
      if (pollTimer !== null) clearInterval(pollTimer);
    } catch {
      // 무해
    }
    pollTimer = null;
  };

  const freeze = () => {
    if (frozen) return;
    frozen = true;
    stopPolling();
    try {
      if (trailingTimer !== null) clearTimeout(trailingTimer);
      trailingTimer = null;
      if (typeof win.removeEventListener === "function") win.removeEventListener("scroll", onScroll, scrollOptions);
    } catch {
      // 무해
    }
  };

  /** 소프트로 바뀌었으면 멈추고 false. */
  const stillLanding = (): boolean => {
    if (frozen) return false;
    if (safeNavType() !== "landing") {
      softBeforeSend = true;
      freeze();
      return false;
    }
    return true;
  };

  const readScroll = () => {
    try {
      if (!stillLanding()) return;
      const bottom = readScrollY(win) + finiteOr(win.innerHeight, 0);
      scrollMax = Math.max(scrollMax, roundTo100(bottom));
    } catch {
      // 무해
    }
  };

  const observe = () => {
    try {
      if (!stillLanding()) return;
      acc = mergeAutoAdsSnapshots(acc, snapshotAutoAds(doc, win));
      readScroll();
    } catch {
      // 무해
    }
  };

  function onScroll() {
    try {
      if (frozen) return;
      const now = Date.now();
      const wait = AUTOADS_SCROLL_THROTTLE_MS - (now - lastScrollAt);
      if (wait <= 0) {
        lastScrollAt = now;
        readScroll();
        return;
      }
      if (trailingTimer === null) {
        trailingTimer = setTimeout(() => {
          trailingTimer = null;
          lastScrollAt = Date.now();
          readScroll();
        }, wait);
      }
    } catch {
      // 무해
    }
  }

  const flush = () => {
    if (sent) return;
    sent = true;
    try {
      observe();
      freeze();
      detach();
      const aaIns = acc.aa_ins;
      const aaReq = acc.aa_req;
      const aaFilled = acc.aa_filled;
      const viewport = viewportBucket(win.innerWidth);
      send(AUTOADS_SEEN_EVENT, {
        aa_placed: acc.aa_placed,
        aa_ins: aaIns,
        aa_req: aaReq,
        aa_filled: aaFilled,
        aa_unfilled: acc.aa_unfilled,
        ...(acc.aa_first_top !== undefined && acc.aa_last_top !== undefined
          ? { aa_first_top: acc.aa_first_top, aa_last_top: acc.aa_last_top }
          : {}),
        manual_ins: acc.manual_ins,
        doc_h: acc.doc_h,
        ama_cfg: acc.ama_cfg,
        scroll_max: scrollMax,
        page_group: pageGroup,
        ...(viewport ? { viewport } : {}),
        nav_type: safeNavType(),
        soft_nav_before_send: softBeforeSend ? 1 : 0,
        measurement_version: AUTOADS_SEEN_VERSION,
        position: `${aaIns}-${aaReq}-${aaFilled}`,
        transport_type: "beacon",
      });
    } catch {
      // 전송 실패는 무해하다(블로커 등).
    }
  };

  const onVisibilityChange = () => {
    try {
      if (doc && doc.visibilityState === "hidden") flush();
    } catch {
      // 무해
    }
  };
  const onPageHide = () => flush();

  function detach() {
    try {
      if (doc && typeof doc.removeEventListener === "function") doc.removeEventListener("visibilitychange", onVisibilityChange);
      if (typeof win.removeEventListener === "function") win.removeEventListener("pagehide", onPageHide);
    } catch {
      // 무해
    }
  }

  try {
    if (doc && typeof doc.addEventListener === "function") doc.addEventListener("visibilitychange", onVisibilityChange);
    if (typeof win.addEventListener === "function") {
      win.addEventListener("pagehide", onPageHide);
      win.addEventListener("scroll", onScroll, scrollOptions);
    }
  } catch {
    // 등록 실패 — 보낼 수 없을 뿐 페이지에는 무해하다.
  }

  readScroll();
  try {
    pollTimer = setInterval(() => {
      polls += 1;
      observe();
      if (polls >= MAX_POLLS) stopPolling();
    }, AUTOADS_POLL_MS);
  } catch {
    pollTimer = null;
  }
  return true;
}
