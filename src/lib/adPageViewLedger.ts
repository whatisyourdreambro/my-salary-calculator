// src/lib/adPageViewLedger.ts
//
// 페이지뷰당 수동 광고 슬롯별 요청(adsbygoogle.push) 1회 장부 (2026-11, 무효 트래픽 제한 후속).
// 같은 경로에서 AdSlot 이 언마운트됐다가 다시 마운트되면(게임 '다시 하기', 목록 검색·필터, 768px 회전,
// ?v= 공유 토큰 재마운트 등) 종전에는 새 인스턴스가 같은 슬롯을 또 push 했다 — 사용자가 광고 새로고침을
// 요청하지 않았는데 같은 페이지뷰에서 광고 요청이 반복되는 경로. 이 장부는 경로(pathname)가 바뀔 때만
// 비워지고, 이미 요청한 슬롯의 새 인스턴스는 아무것도 렌더하지 않는다(빈 광고 상자도 남기지 않음).
// 서버에서는 push 가 일어나지 않으므로 장부가 비어 있다(SSR 결과 불변).

let currentPagePath: string | null = null;
const requestedSlots = new Set<string>();

/** 새 페이지뷰 시작 — 경로가 바뀐 경우에만 장부를 비운다(같은 경로의 쿼리·해시 변경은 같은 페이지뷰). */
export function beginAdPageView(pathname: string): void {
  if (currentPagePath === pathname) return;
  currentPagePath = pathname;
  requestedSlots.clear();
}

/** 이 페이지뷰에서 이미 이 슬롯을 요청했는가. */
export function hasRequestedInPageView(pathname: string, slot: string): boolean {
  return currentPagePath === pathname && requestedSlots.has(slot);
}

/** push 직전에 기록 — 다른 경로의 기록이 남아 있으면 새 페이지뷰로 본다. */
export function markRequestedInPageView(pathname: string, slot: string): void {
  beginAdPageView(pathname);
  requestedSlots.add(slot);
}
