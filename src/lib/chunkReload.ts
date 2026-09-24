// src/lib/chunkReload.ts
//
// 배포 직후 옛 청크 해시가 404 가 되어 페이지 오류 화면(src/app/error.tsx)까지 올라온 경우의 1회 새로고침
// (2026-09-25 감사 B3 · CLIENT-01).
//  - React.lazy 는 거부된 import 를 캐시하므로 reset()/router.refresh() 로는 같은 청크 오류가 다시 난다.
//    새 HTML(새 청크 해시)을 받는 전체 새로고침만 회복 경로다.
//  - 무한 새로고침 방지: sessionStorage 에 마지막 새로고침 시각을 두고 60초에 1회로 제한한다.
//    저장소를 쓸 수 없으면(차단·사파리 개인정보 모드 등) 새로고침하지 않는다 — 가드 없는 새로고침은 반복될 수 있다.
//  - 오류 화면 전용이다. 섬 오류 경계(IslandBoundary)는 정상 페이지의 광고 재요청을 막으려고 자동 새로고침하지 않는다.

export const CHUNK_RELOAD_KEY = "msy_chunk_reload";
export const CHUNK_RELOAD_WINDOW_MS = 60_000;

const CHUNK_MESSAGE_RE = /Loading (CSS )?chunk|dynamically imported module/;

/** webpack ChunkLoadError·CSS 청크 실패·브라우저 dynamic import 실패 판별. 일반 fetch 실패는 제외. */
export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { name, message } = error as { name?: unknown; message?: unknown };
  if (name === "ChunkLoadError") return true;
  return typeof message === "string" && CHUNK_MESSAGE_RE.test(message);
}

type SessionStore = Pick<Storage, "getItem" | "setItem">;

/**
 * 청크 오류면 60초에 1회만 reload 를 호출한다. 호출했으면 true.
 * storage·reload·now 는 테스트 주입용 — 기본값은 브라우저 sessionStorage·location.reload·Date.now.
 */
export function reloadOnceForChunkError(
  error: unknown,
  {
    storage,
    reload,
    now = Date.now(),
  }: { storage?: SessionStore; reload?: () => void; now?: number } = {},
): boolean {
  if (!isChunkLoadError(error)) return false;
  try {
    const store = storage ?? window.sessionStorage;
    const last = Number(store.getItem(CHUNK_RELOAD_KEY));
    if (Number.isFinite(last) && last > 0 && now - last >= 0 && now - last < CHUNK_RELOAD_WINDOW_MS) return false;
    store.setItem(CHUNK_RELOAD_KEY, String(now));
    (reload ?? (() => window.location.reload()))();
    return true;
  } catch {
    return false;
  }
}
