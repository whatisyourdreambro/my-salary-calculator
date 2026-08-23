// 머니샐러리 서비스워커 — PWA 설치 요건(fetch 핸들러) + 정적 자산 캐시.
//
// 설계 원칙 (2026-08-23, 유입 100배 기둥 4):
// - Chrome은 fetch 핸들러 있는 SW가 있어야 beforeinstallprompt를 발화한다
//   → InstallPwaBanner(루트 레이아웃)가 이 파일 배포 후에야 실제로 작동.
// - 캐시는 same-origin 불변 자산만: /_next/static/(콘텐츠 해시 포함 = 영원히 안전),
//   /fonts/, 아이콘·매니페스트. HTML은 절대 캐시하지 않는다 (CF 배포 즉시 반영 유지).
// - 광고·GA·카카오 등 cross-origin 요청은 일절 가로채지 않는다 (respondWith 미호출
//   → 브라우저 기본 네트워크 동작). ★광고 코드 불가침 원칙.

const CACHE_NAME = "msy-static-v1";

const STATIC_PATH_PREFIXES = ["/_next/static/", "/fonts/"];
const STATIC_EXACT = ["/manifest.webmanifest", "/favicon.ico"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
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

  // cache-first (해시 자산이라 무효화 불필요), 실패 시 네트워크
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
      )
    )
  );
});
