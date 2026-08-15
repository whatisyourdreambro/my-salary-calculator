// src/lib/shareRegistry.ts
//
// pathname별 "페이지 인라인 공유 버튼 존재" 레지스트리.
// 카테고리 layout이 주입하는 AutoShareSection(fallback)이 같은 페이지의
// 인라인 ShareButtons와 중복 노출되지 않도록 자기 억제하는 데 쓴다.
// AdPlacement의 renderedSlotsByPath(Map) 페이지당 1회 패턴을 차용하되,
// 늦게 마운트되는 인라인(fun 결과 카드 등)에도 반응하도록 구독 모델을 더했다.

const primariesByPath = new Map<string, Set<symbol>>();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

/**
 * 인라인 ShareButtons 마운트 등록. cleanup 함수를 반환하므로
 * useEffect에서 `return registerPrimary(pathname)` 형태로 쓰면
 * StrictMode 이중 실행·클라이언트 라우팅에도 누수 없이 대칭이 맞는다.
 */
export function registerPrimary(path: string): () => void {
  const id = Symbol();
  let set = primariesByPath.get(path);
  if (!set) {
    set = new Set();
    primariesByPath.set(path, set);
  }
  set.add(id);
  emit();
  return () => {
    const current = primariesByPath.get(path);
    if (!current) return;
    current.delete(id);
    if (current.size === 0) primariesByPath.delete(path);
    emit();
  };
}

/** useSyncExternalStore용 구독 */
export function subscribeShareRegistry(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hasPrimary(path: string): boolean {
  return (primariesByPath.get(path)?.size ?? 0) > 0;
}
