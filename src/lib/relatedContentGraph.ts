/** Alternate nearby entries in the category's existing editorial order instead
 * of recommending its first few entries on every page. */
export function categoryNeighbours<T>(items: readonly T[], current: T, limit: number): T[] {
  const index = items.indexOf(current);
  if (index < 0 || limit <= 0) return [];
  const result: T[] = [];
  for (let distance = 1; distance < items.length && result.length < limit; distance++) {
    for (const offset of [-distance, distance]) {
      const item = items[(index + offset + items.length) % items.length];
      if (item !== current && !result.includes(item)) result.push(item);
      if (result.length === limit) break;
    }
  }
  return result;
}

// IDs are tie-breakers, not display text. Code-unit order is identical across
// Windows/Cloudflare build locales; localeCompare changed entire Q&A graphs.
const compareId = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;

/** Fill existing cards with relevant recommendations. Only positive relevance
 * scores are eligible. Preserve primary links and give less-connected articles
 * a turn before repeating popular ones; never create extra cards or use an
 * unrelated fallback to conceal insufficient relevant sources. */
export function buildRelatedContentGraph<T>(items: readonly T[], options: {
  id: (item: T) => string;
  limit: (item: T) => number;
  score: (source: T, target: T) => number;
  existing?: (item: T) => readonly string[];
  minimumSources?: number;
}): Map<string, T[]> {
  const { id, limit, score, existing = () => [], minimumSources = 3 } = options;
  const sources = [...items].sort((a, b) => compareId(id(a), id(b)));
  const incoming = new Map(sources.map((item) => [id(item), new Set<string>()]));
  const output = new Map(sources.map((item) => [id(item), [] as T[]]));
  const prior = new Map(sources.map((item) => [id(item), new Set(existing(item))]));
  for (const source of sources) for (const target of prior.get(id(source))!) {
    if (target !== id(source)) incoming.get(target)?.add(id(source));
  }
  const candidates = new Map(sources.map((source) => [id(source), sources
    .filter((target) => id(target) !== id(source) && !prior.get(id(source))!.has(id(target)))
    .map((target) => ({ target, weight: score(source, target) }))
    .filter(({ weight }) => Number.isFinite(weight) && weight > 0)
    .sort((a, b) => b.weight - a.weight || compareId(id(a.target), id(b.target)))]));
  const add = (source: T, target: T) => {
    output.get(id(source))!.push(target);
    incoming.get(id(target))!.add(id(source));
  };
  // Topics with fewer eligible sources go first, without weakening relevance.
  const sourceCounts = new Map(sources.map((target) => [id(target), sources.filter((source) =>
    limit(source) > 0 && candidates.get(id(source))!.some((candidate) => id(candidate.target) === id(target))).length]));
  const targets = [...sources].sort((a, b) => sourceCounts.get(id(a))! - sourceCounts.get(id(b))! || compareId(id(a), id(b)));
  for (let round = 1; round <= minimumSources; round++) {
    for (const target of targets) {
      if (incoming.get(id(target))!.size >= round) continue;
      const possible = sources.filter((source) => output.get(id(source))!.length < limit(source) &&
        !incoming.get(id(target))!.has(id(source)) &&
        candidates.get(id(source))!.some((candidate) => id(candidate.target) === id(target)));
      possible.sort((a, b) => score(b, target) - score(a, target) ||
        output.get(id(a))!.length - output.get(id(b))!.length || compareId(id(a), id(b)));
      if (possible[0]) add(possible[0], target);
    }
  }
  for (const source of sources) {
    const selected = output.get(id(source))!;
    for (const { target } of candidates.get(id(source))!) {
      if (selected.length >= limit(source)) break;
      if (!selected.some((item) => id(item) === id(target))) add(source, target);
    }
  }
  // Reassign a filled card only after its old target has another eligible source.
  // A bounded augmenting path handles narrow topics without taking away their
  // last route, increasing any page's card count, or weakening relevance.
  const connect = (target: T, visited: Set<string>): boolean => {
    const possible = sources.filter((source) => !visited.has(id(source)) &&
      !incoming.get(id(target))!.has(id(source)) &&
      candidates.get(id(source))!.some((candidate) => id(candidate.target) === id(target)))
      .sort((a, b) => score(b, target) - score(a, target) || compareId(id(a), id(b)));
    for (const source of possible) {
      visited.add(id(source));
      const selected = output.get(id(source))!;
      if (selected.length < limit(source)) { add(source, target); return true; }
      const replaceable = [...selected].sort((a, b) => score(source, a) - score(source, b) || compareId(id(a), id(b)));
      for (const old of replaceable) {
        if (incoming.get(id(old))!.size <= minimumSources && !connect(old, visited)) continue;
        selected[selected.indexOf(old)] = target;
        incoming.get(id(old))!.delete(id(source));
        incoming.get(id(target))!.add(id(source));
        return true;
      }
    }
    return false;
  };
  for (const target of targets) while (incoming.get(id(target))!.size < minimumSources) {
    if (!connect(target, new Set())) break;
  }
  for (const source of sources) output.get(id(source))!.sort((a, b) =>
    score(source, b) - score(source, a) || compareId(id(a), id(b)));
  return output;
}
