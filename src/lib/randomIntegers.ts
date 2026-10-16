export const MAX_RANDOM_INTEGER_COUNT = 1_000;

/** Bounded sampling without replacement; rejection loops can hang on huge ranges. */
export function sampleUniqueIntegers(min: number, max: number, count: number, random = Math.random): number[] {
  const size = max - min + 1;
  if (![min, max, count, size].every(Number.isSafeInteger) || size < 1 || count < 1 ||
      count > size || count > MAX_RANDOM_INTEGER_COUNT) {
    throw new RangeError("안전한 정수 범위와 1~1,000개의 개수를 입력해 주세요. 개수는 범위보다 클 수 없습니다.");
  }
  const picked = new Set<number>();
  // Floyd's algorithm uses exactly count draws, even with a constant RNG.
  for (let index = size - count; index < size; index++) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new RangeError("난수 값이 올바르지 않습니다.");
    const candidate = Math.floor(value * (index + 1));
    picked.add(picked.has(candidate) ? index : candidate);
  }
  return [...picked].map((offset) => min + offset).sort((a, b) => a - b);
}
