// src/lib/mediaQueryListener.ts
//
// MediaQueryList 'change' 구독 — 구형 사파리 호환 (2026-09-25 감사 B3 · CLIENT-06).
// MediaQueryList.addEventListener 는 Safari 14 부터다. 그 이전(iOS 13 이하·미갱신 인앱 WebView)에서는
// 루트 레이아웃 Header 의 effect 가 TypeError 를 던져 global-error 가 문서 전체를 대체했다.
// addEventListener 가 없으면 (deprecated 지만 유일한) addListener 로 폴백하고, 해제도 같은 짝으로 한다.

/** mq 변경 시 listener 호출. 반환값은 구독 해제 함수(effect cleanup 용). */
export function subscribeMediaQuery(mq: MediaQueryList, listener: () => void): () => void {
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }
  mq.addListener(listener);
  return () => mq.removeListener(listener);
}
