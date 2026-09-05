// src/lib/bottomAdDetect.ts
//
// 화면 하단 고정 구글 광고(앵커 등) 감지 — 하단 고정 UI 공용 유틸 (2026-09-05, §12-2 ⑪).
// 출처: FloatingShareBar 의 3중 감지(2026-08-16 수익 급락 대응)를 그대로 옮겼다.
// 사용처: FloatingShareBar(공유 바) · InstallPwaBanner(앱 설치 배너) · BottomSheet(바텀 시트).
// 원칙: 앵커 광고가 자리를 잡으면 사이트 UI 가 양보한다(광고 가림·우발 클릭 정책 회피).
//       감지가 실패(예외)하면 "광고 있음"으로 취급하는 fail-closed 가 호출부 책임이다.
//
// 마크업 변형에 대비한 3중 감지:
// 1) ins.adsbygoogle 중 data-anchor-* 속성 보유 (값 무관 — displayed 외 상태 변형 대비)
// 2) ins.adsbygoogle / adsbygoogle-noablate 가 fixed + 높이 보유
// 3) googlesyndication/doubleclick iframe 의 fixed 조상이 뷰포트 하단 160px 안에 위치

/** 페이지 로드 직후 유예 — 앵커 광고가 먼저 자리를 잡게 양보 (FloatingShareBar 와 동일 값) */
export const BOTTOM_AD_GRACE_MS = 4000;
/** 재평가 주기 — 앵커 광고는 스크롤 없이도 등장하므로 주기 확인 */
export const BOTTOM_AD_CHECK_INTERVAL_MS = 1000;

const BOTTOM_ZONE_PX = 160;

const AD_FRAME_SELECTOR =
  'iframe[src*="googlesyndication"], iframe[src*="doubleclick"], iframe[id^="google_ads_iframe"]';

/** 하단 고정 광고의 높이(px). 없으면 0. 속성만으로 감지된(높이 0) 앵커는 0 을 돌려주므로
 *  "존재 여부"는 isBottomAdPresent() 로, "여백 확보"는 이 값으로 판단한다. */
export function getBottomAdHeight(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  const vh = window.innerHeight;
  let height = 0;
  const insList = document.querySelectorAll<HTMLElement>(
    "ins.adsbygoogle, ins.adsbygoogle-noablate"
  );
  for (const el of insList) {
    if (getComputedStyle(el).position !== "fixed") continue;
    const rect = el.getBoundingClientRect();
    if (rect.height > 0 && vh - rect.bottom < BOTTOM_ZONE_PX) {
      height = Math.max(height, rect.height);
    }
  }
  const adFrames = document.querySelectorAll<HTMLIFrameElement>(AD_FRAME_SELECTOR);
  for (const frame of adFrames) {
    let node: HTMLElement | null = frame;
    while (node && node !== document.body) {
      if (getComputedStyle(node).position === "fixed") {
        const rect = node.getBoundingClientRect();
        if (rect.height > 0 && vh - rect.bottom < BOTTOM_ZONE_PX) {
          height = Math.max(height, rect.height);
        }
        break;
      }
      node = node.parentElement;
    }
  }
  return Math.round(height);
}

/** 화면 하단에 고정된 구글 광고(앵커 등)가 하나라도 있으면 true. */
export function isBottomAdPresent(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  const vh = window.innerHeight;
  const insList = document.querySelectorAll<HTMLElement>(
    "ins.adsbygoogle, ins.adsbygoogle-noablate"
  );
  for (const el of insList) {
    if (
      el.hasAttribute("data-anchor-status") ||
      el.hasAttribute("data-anchor-shown")
    ) {
      return true;
    }
    const rect = el.getBoundingClientRect();
    if (rect.height > 0 && getComputedStyle(el).position === "fixed") return true;
  }
  const adFrames = document.querySelectorAll<HTMLIFrameElement>(AD_FRAME_SELECTOR);
  for (const frame of adFrames) {
    let node: HTMLElement | null = frame;
    while (node && node !== document.body) {
      if (getComputedStyle(node).position === "fixed") {
        const rect = node.getBoundingClientRect();
        if (rect.height > 0 && vh - rect.bottom < BOTTOM_ZONE_PX) return true;
        break;
      }
      node = node.parentElement;
    }
  }
  return false;
}
