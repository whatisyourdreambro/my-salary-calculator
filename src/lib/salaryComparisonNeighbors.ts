/** Adjacent profiles in the supplied meaningful order (salary rank/category).
 * A bounded sliding window avoids recommending the same first profiles from
 * every page. No random rotation or unrelated global fallback is used.
 */
export function comparisonNeighbors<T extends { id: string }>(items: readonly T[], currentId: string, limit: number): T[] {
  const index = items.findIndex(item => item.id === currentId);
  if (index < 0 || limit <= 0) return [];
  const count = Math.min(Math.floor(limit), items.length - 1);
  const start = Math.max(0, Math.min(index - Math.floor(count / 2), items.length - count - 1));
  return items.slice(start, start + count + 1).filter(item => item.id !== currentId);
}
