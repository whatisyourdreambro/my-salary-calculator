// src/lib/chunkReload.ts
//
// 배포 직후 옛 청크 해시가 404 가 되어 페이지 오류 화면(src/app/error.tsx)까지 올라온 경우의 1회 새로고침
// (2026-09-25 감사 B3 · CLIENT-01).
//  - React.lazy 는 거부된 import 를 캐시하므로 reset()/router.refresh() 로는 같은 청크 오류가 다시 난다.
//    새 HTML(새 청크 해시)을 받는 전체 새로고침만 회복 경로다.
//  - 무한 새로고침 방지: sessionStorage 에 마지막 새로고침 시각을 두고 60초에 1회로 제한한다.
//    저장소를 쓸 수 없으면(차단·사파리 개인정보 모드 등) 새로고침하지 않는다 — 가드 없는 새로고침은 반복될 수 있다.
//  - 오류 화면 전용이다. 섬 오류 경계(IslandBoundary)는 정상 페이지의 광고 재요청을 막으려고 자동 새로고침하지 않는다.
//    섬 쪽 회복은 retryChunkImport(로더 재시도) + 대체 화면의 사용자 새로고침 버튼이다(2026-09-26 A14).

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

/** 청크 import 재시도 기본값 — 1회, 1초 뒤 (A14, 2026-09-26). */
export const CHUNK_IMPORT_RETRIES = 1;
export const CHUNK_IMPORT_RETRY_DELAY_MS = 1_000;

/**
 * next/dynamic 로더용 청크 import 재시도 (2026-09-26 승인 #10 A14 · CLIENT-01).
 *  - 청크 오류(isChunkLoadError)만 delayMs 뒤 retries 번 다시 import 한다. 그 밖의 오류는 곧바로 그대로 던진다.
 *  - webpack 은 실패한 청크를 installedChunks 에서 지우므로 다시 import 하면 같은 URL 을 새로 요청한다
 *    → 순간적인 네트워크 끊김은 여기서 회복된다. 배포로 옛 해시가 404 인 경우는 재시도로 안 풀리고
 *    마지막 오류가 섬 오류 경계(IslandBoundary)로 올라간다 — 페이지 새로고침은 하지 않는다(광고 재요청 방지).
 *  - 성공 경로는 import 결과를 그대로 돌려준다(렌더·DOM 동일). SWC next/dynamic 변환은 감싼 import 도 찾는다
 *    (서버 번들의 ssr:false 제거·loadableGenerated 동일 — 2026-09-26 변환 출력으로 확인).
 * wait 는 테스트 주입용 — 기본값은 setTimeout.
 */
export function retryChunkImport<T>(
  loader: () => Promise<T>,
  {
    retries = CHUNK_IMPORT_RETRIES,
    delayMs = CHUNK_IMPORT_RETRY_DELAY_MS,
    wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)),
  }: { retries?: number; delayMs?: number; wait?: (ms: number) => Promise<void> } = {},
): Promise<T> {
  return loader().catch((error: unknown) => {
    if (retries <= 0 || !isChunkLoadError(error)) throw error;
    return wait(delayMs).then(() => retryChunkImport(loader, { retries: retries - 1, delayMs, wait }));
  });
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
