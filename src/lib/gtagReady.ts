// src/lib/gtagReady.ts
//
// 마운트 시점 GA4 이벤트가 착지(하드 로드) 페이지에서 사라지던 문제의 국소 수정 (2026-09-25 감사 B3 · CLIENT-03/CON-09).
//
// 배경: layout.tsx 의 ga4-init(<Script strategy="afterInteractive">)은 페이지보다 뒤 형제의 useEffect 에서
// 삽입된다. 페이지 트래커의 마운트 effect 가 먼저 돌면 window.gtag 가 아직 없어 trackEvent 의
// window.gtag?.() 가 조용히 버려졌다(실측: 하드 로드 dataLayer 에 salary_lookup 없음, 클라 전환에서만 기록).
//
// ★ 전역 trackEvent·ga4-init 전략은 10/10 판정(ad_filled/ad_unfilled 기준선) 전이라 바꾸지 않는다.
//   이 헬퍼는 호출한 트래커만 gtag 가 생길 때까지 짧게 기다린다.
//   - 첫 확인은 setTimeout(0): 같은 effect flush 에서 삽입되는 ga4-init 뒤로 밀린다.
//   - 없으면 250ms 간격 최대 40회(약 10초) 재확인 후 포기한다(블로커 등 — 원래도 전송 불가).

type GtagWindow = { gtag?: unknown };

/** window.gtag 가 함수가 되면 send 를 1회 호출한다. 반환값은 취소 함수(effect cleanup 용). */
export function runWhenGtagReady(
  send: () => void,
  { intervalMs = 250, maxRetries = 40 }: { intervalMs?: number; maxRetries?: number } = {},
): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let retries = 0;
  const attempt = () => {
    timer = undefined;
    const w = typeof window === "undefined" ? undefined : (window as unknown as GtagWindow);
    if (w && typeof w.gtag === "function") {
      send();
      return;
    }
    if (retries >= maxRetries) return;
    retries += 1;
    timer = setTimeout(attempt, intervalMs);
  };
  timer = setTimeout(attempt, 0);
  return () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
}
