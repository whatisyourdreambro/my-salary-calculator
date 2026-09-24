// 머니샐러리 서비스워커 — PWA 설치 요건(fetch 핸들러) + 정적 자산 캐시.
//
// 설계 원칙 (2026-08-23, 유입 100배 기둥 4):
// - Chrome은 fetch 핸들러 있는 SW가 있어야 beforeinstallprompt를 발화한다
//   → InstallPwaBanner(루트 레이아웃)가 이 파일 배포 후에야 실제로 작동.
// - 캐시는 same-origin 불변 자산만: /_next/static/(콘텐츠 해시 포함 = 영원히 안전),
//   아이콘·매니페스트. HTML은 절대 캐시하지 않는다 (CF 배포 즉시 반영 유지).
// - 광고·GA·카카오 등 cross-origin 요청은 일절 가로채지 않는다 (respondWith 미호출
//   → 브라우저 기본 네트워크 동작). ★광고 코드 불가침 원칙.

const CACHE_NAME = "msy-static-v3"; // ★sw 수정 시 버전 올릴 것 (activate가 구 캐시 삭제)
// v2 (2026-09-05): manifest 수정(start_url utm·연말정산 바로가기 /year-end-tax) 반영 —
// /manifest.webmanifest 는 cache-first 라 버전을 올려야 설치된 클라이언트가 새 manifest 를 받는다.
// v3 (2026-09-25): manifest 문구 정리(개수 주장 삭제) 반영 + 탐색 요청 SW 우회(Static Routing)
// + 캐시 상한(MAX_ENTRIES). 구 v2 캐시(배포마다 쌓인 해시 청크)는 activate 에서 한 번 비운다.

// /fonts/ 프리픽스는 제거(2026-08-30) — 폰트는 /_next/static/media 로 서빙되어
// /fonts/ 는 실존하지 않는 죽은 경로였다 (next/font 로컬 폰트 파이프라인).
const STATIC_PATH_PREFIXES = ["/_next/static/"];
const STATIC_EXACT = ["/manifest.webmanifest", "/favicon.ico"];

// 캐시 상한 — 배포마다 청크 해시가 바뀌어 cache-first 캐시가 끝없이 커지던 문제 대응.
// cache.keys() 는 삽입 순서라 앞쪽(오래 전에 넣은 것)부터 지운다. 지워진 청크가 다시
// 필요하면 네트워크에서 받아 맨 뒤에 다시 넣을 뿐이라 안전하다.
const MAX_ENTRIES = 300;

let trimming = null;
function trimCache(cache) {
  // 동시에 여러 put 이 끝나도 keys() 순회는 한 번만 (다음 put 이 남은 초과분을 정리)
  if (trimming) return trimming;
  trimming = cache
    .keys()
    .then((keys) => {
      const excess = keys.length - MAX_ENTRIES;
      if (excess <= 0) return undefined;
      return Promise.all(keys.slice(0, excess).map((k) => cache.delete(k)));
    })
    .catch(() => {})
    .then(() => {
      trimming = null;
    });
  return trimming;
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  // 탐색(HTML) 요청은 SW 를 거치지 않고 곧장 네트워크로 — Static Routing API (Chrome 123+).
  // fetch 핸들러가 HTML 에는 respondWith 를 하지 않아도, 핸들러가 있는 한 브라우저는
  // 매 탐색마다 SW 기동을 기다린다(재방문자 TTFB 지연). 라우터 규칙이 그 대기를 없앤다.
  // 미지원 브라우저는 addRoutes 가 없어 그대로 통과하고, 실패해도 설치는 막지 않는다.
  // navigationPreload 는 켜지 않는다 — fetch 핸들러가 탐색에 preloadResponse 를 쓰지 않아 낭비.
  if (typeof event.addRoutes === "function") {
    try {
      event.waitUntil(
        event
          .addRoutes([{ condition: { requestMode: "navigate" }, source: "network" }])
          .catch(() => {})
      );
    } catch {
      // 구현 차이로 동기 예외가 나도 설치는 계속 (optional catch binding — 미사용 변수 lint 회피)
    }
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => trimCache(cache))
      .catch(() => {})
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // same-origin 정적 자산만 처리 — 그 외(HTML·API·광고·외부 스크립트)는 손대지 않음
  if (url.origin !== self.location.origin) return;
  const isStatic =
    STATIC_PATH_PREFIXES.some((p) => url.pathname.startsWith(p)) ||
    STATIC_EXACT.includes(url.pathname);
  if (!isStatic) return;

  // cache-first (해시 자산이라 무효화 불필요), 캐시 미스·캐시 저장소 오류 시 네트워크
  event.respondWith(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.match(req).then((hit) => ({ cache, hit })))
      .catch(() => ({ cache: null, hit: undefined }))
      .then(
        ({ cache, hit }) =>
          hit ||
          fetch(req).then((res) => {
            if (cache && res.ok) {
              // 저장 실패(용량 초과 등)는 응답과 무관 — 삼켜서 SW 미처리 거부를 막는다
              cache
                .put(req, res.clone())
                .then(() => trimCache(cache))
                .catch(() => {});
            }
            return res;
          })
      )
  );
});
