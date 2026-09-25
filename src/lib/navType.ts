// src/lib/navType.ts
//
// 소프트 내비게이션 광고 계측 1단계 — 측정 전용 (2026-09-25, 수익 추천 #1 '링크 이동 광고 회수').
//
// 가설: 28일 GA4 page_view 124,965 대 애드센스 집계 PV 93,664. 약 25% 가 Next.js 클라이언트 전환(소프트) 뷰라
// 애드센스 PV 로 잡히지 않고 자동광고도 다시 돌지 않는다. 7일 안에 확인하도록 "지금 보이는 뷰가 어떻게 도달했나"를
// 값 하나로 둔다.
//   landing = 이 문서의 첫 로드(검색·외부 유입, 새 탭, 새로고침, 하드 링크) — 애드센스가 PV 로 세는 뷰
//   soft    = 같은 문서 안에서 URL(경로·쿼리)이 바뀐 뒤의 뷰(AppLink·router.push·뒤로가기).
//             한 번 soft 가 되면 문서가 끝날 때까지 soft 다(뒤로가기로 첫 경로에 돌아와도 새 문서 로드가 아니다).
//
// 전달 경로 두 가지:
//  1) GA4 page_view 는 자동 수집이다(첫 뷰는 ga4-init 의 config, 이후는 향상된 측정 '브라우저 기록 이벤트' —
//     pushState·replaceState·popstate 를 듣는다). 이벤트 인자를 붙일 수 없어 gtag('set', { nav_type }) 전역값으로 싣는다.
//     page_view 를 새로 보내지 않으므로 중복 집계는 없다.
//     - 'landing' 은 ga4-init 의 config(첫 page_view)보다 먼저 큐에 들어가야 한다. 그래서 NavTypeTracker 를 layout 에서
//       <Script id="ga4-init"> 보다 앞 형제로 둔다(같은 커밋의 effect 는 트리 순서로 돈다 — navType.test.ts 가 순서를 고정).
//     - 'soft' 는 history.pushState/replaceState 가 URL 을 실제로 바꾸기 '직전'에 넣는다. 향상된 측정은 그 호출 자리에서
//       page_view 를 만들므로, 경로가 바뀐 뒤 React effect(usePathname)에서 넣으면 첫 소프트 page_view 가 landing 으로 찍힌다.
//  2) 광고 계측 이벤트(ad_request_attempt·ad_request_error·ad_filled·ad_unfilled·ad_unit_click)는 analytics.ts 가
//     getNavType() 을 이벤트 인자로 명시한다. gtag 우선순위가 event > config > set 이라 전역값이 어긋나도 이벤트 값이 이긴다.
//
// 광고 요청·렌더·dedup·접힘 로직과 DOM 은 건드리지 않는다. ga4-init 스크립트·전역 trackEvent 도 그대로다(10/10 판정 전).
// 해석·콘솔 등록·판정 규칙은 docs/analytics-measurement.md '소프트 내비게이션 계측' 절.

export type NavType = "landing" | "soft";

type HistoryMethod = (data: unknown, unused: string, url?: string | URL | null) => void;

/** 테스트에서 가짜 window 를 넘길 수 있게 필요한 면만 적는다. */
export type NavTypeWindow = {
  location: { href: string };
  history: { pushState: HistoryMethod; replaceState: HistoryMethod };
  addEventListener: (type: "popstate", listener: () => void) => void;
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __msyNavTypeInstalled?: boolean;
};

let current: NavType = "landing";

/** 지금 보이는 뷰의 도달 방식. SSR·설치 전에는 'landing'. */
export function getNavType(): NavType {
  return current;
}

/**
 * 뷰 비교 키 = origin + 경로 + 쿼리. 해시는 뺀다 — 해시 이동과 같은 URL replaceState(Next 하이드레이션·
 * samsung-bonus 공유 해시)는 새 뷰가 아니다. 해석할 수 없으면 null(비교하지 않음).
 */
export function documentUrlKey(url: string | URL, base?: string): string | null {
  try {
    const parsed = new URL(String(url), base);
    return `${parsed.origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function setGtagNavType(win: NavTypeWindow, value: NavType): void {
  try {
    if (typeof win.gtag === "function") {
      win.gtag("set", { nav_type: value });
      return;
    }
    // ga4-init 이전: ga4-init 의 gtag(){dataLayer.push(arguments)} 와 같은 모양으로 큐에 쌓는다.
    // gtag.js 는 배열이 아닌 arguments 객체만 명령으로 읽는다. ga4-init 은 기존 dataLayer 를 보존한다.
    const queue = (win.dataLayer = win.dataLayer || []);
    const enqueue = function (...commandArgs: unknown[]) {
      void commandArgs;
      // eslint-disable-next-line prefer-rest-params
      queue.push(arguments);
    };
    enqueue("set", { nav_type: value });
  } catch {
    // 계측 실패는 무해하다(블로커 등).
  }
}

function markSoft(win: NavTypeWindow | undefined): void {
  if (current === "soft") return;
  current = "soft";
  if (win) setGtagNavType(win, "soft");
}

/** 폴백: 설치가 실패했어도 경로 변경을 본 컴포넌트가 광고 이벤트 값만은 바로잡는다(page_view 는 이미 나간 뒤). */
export function markSoftNavigation(win?: NavTypeWindow): void {
  markSoft(win ?? (typeof window === "undefined" ? undefined : (window as unknown as NavTypeWindow)));
}

/**
 * 문서당 1회 설치. ① 현재 값('landing')을 gtag 큐에 넣고 ② pushState/replaceState 를 감싸 URL 이 바뀌기 직전에
 * 'soft' 로 바꾸고 ③ popstate 로 첫 URL 과 다른 항목에 도착하면 'soft' 로 바꾼다.
 * 감싼 함수는 인자·this·반환값을 그대로 넘기고, 판정 중 예외는 삼킨다(내비게이션을 절대 막지 않는다).
 * Next 의 AppRouter 도 같은 두 메서드를 감싸지만(외부 pushState 지원) 서로를 호출하는 사슬이 되어 순서와 무관하게 동작한다.
 */
export function installNavTypeTracking(win: NavTypeWindow): void {
  if (win.__msyNavTypeInstalled) return;
  win.__msyNavTypeInstalled = true;

  setGtagNavType(win, current);
  const landingKey = documentUrlKey(win.location.href);

  const wrap = (name: "pushState" | "replaceState") => {
    const original = win.history[name];
    if (typeof original !== "function") return;
    win.history[name] = function navTypeHistoryWrapper(this: unknown, ...args: Parameters<HistoryMethod>) {
      try {
        const url = args[2];
        if (current === "landing" && url != null) {
          const from = documentUrlKey(win.location.href);
          const to = documentUrlKey(url, win.location.href);
          if (from && to && from !== to) markSoft(win);
        }
      } catch {
        // 판정 실패는 무시하고 원래 호출을 그대로 진행한다.
      }
      return original.apply(this, args);
    };
  };
  wrap("pushState");
  wrap("replaceState");

  try {
    win.addEventListener("popstate", () => {
      if (current === "soft") return;
      const now = documentUrlKey(win.location.href);
      if (landingKey && now && now !== landingKey) markSoft(win);
    });
  } catch {
    // 이벤트 등록 실패도 무해하다.
  }
}

/** 테스트 전용 — 모듈 상태를 첫 로드 값으로 되돌린다. */
export function resetNavTypeForTests(): void {
  current = "landing";
}
