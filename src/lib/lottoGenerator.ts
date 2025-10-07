// src/lib/lottoGenerator.ts

export type GenerationStrategy =
  | "random"
  | "balancedOddEven"
  | "balancedHighLow";

/**
 * 주어진 조건에 맞는 로또 번호 한 세트를 생성합니다.
 * @param includeNumbers 반드시 포함할 숫자 배열
 * @param excludeNumbers 반드시 제외할 숫자 배열
 * @param strategy 생성 전략
 * @returns 6개의 숫자로 이루어진 배열
 */
const generateSingleSet = (
  includeNumbers: number[],
  excludeNumbers: number[],
  strategy: GenerationStrategy
): number[] => {
  const MAX_RETRY = 100; // 무한 루프 방지를 위한 재시도 횟수 제한
  let attempts = 0;

  while (attempts < MAX_RETRY) {
    const includeSet = new Set(includeNumbers);
    const excludeSet = new Set(excludeNumbers);
    const numbers = new Set<number>(includeSet);

    // 사용 가능한 전체 숫자 풀
    const availableNumbers = Array.from({ length: 45 }, (_, i) => i + 1).filter(
      (n) => !excludeSet.has(n) && !includeSet.has(n)
    );

    while (numbers.size < 6) {
      if (availableNumbers.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const randomNum = availableNumbers.splice(randomIndex, 1)[0];
      numbers.add(randomNum);
    }

    const finalSet = Array.from(numbers).sort((a, b) => a - b);

    if (finalSet.length !== 6) {
      attempts++;
      continue;
    }

    if (strategy === "random") {
      return finalSet;
    }

    if (strategy === "balancedOddEven") {
      const oddCount = finalSet.filter((n) => n % 2 !== 0).length;
      // 홀수가 2~4개인 경우만 유효한 조합으로 인정
      if (oddCount >= 2 && oddCount <= 4) {
        return finalSet;
      }
    }

    if (strategy === "balancedHighLow") {
      const highCount = finalSet.filter((n) => n > 22).length;
      // 고수가 2~4개인 경우만 유효한 조합으로 인정
      if (highCount >= 2 && highCount <= 4) {
        return finalSet;
      }
    }

    attempts++;
  }

  // 재시도 횟수 초과 시, 마지막으로 생성된 번호 또는 기본 랜덤 번호를 반환
  // 이 경우는 매우 드물게 발생합니다 (예: 포함/제외 숫자가 너무 많을 때)
  return generateSingleSet(includeNumbers, excludeNumbers, "random");
};

/**
 * 로또 번호 세트를 생성합니다.
 * @param count 생성할 세트의 개수
 * @param includeNumbers 반드시 포함할 숫자 배열
 * @param excludeNumbers 반드시 제외할 숫자 배열
 * @param strategy 생성 전략
 * @returns 2차원 배열 형태의 로또 번호 세트
 */
export function generateLottoSets(
  count: number,
  includeNumbers: number[],
  excludeNumbers: number[],
  strategy: GenerationStrategy
): number[][] {
  if (count <= 0) return [];

  const includeSet = new Set(includeNumbers);
  const excludeSet = new Set(excludeNumbers);

  // 포함/제외 숫자가 서로 겹치는지 확인
  for (const num of includeSet) {
    if (excludeSet.has(num)) {
      throw new Error("포함할 숫자와 제외할 숫자는 서로 겹칠 수 없습니다.");
    }
  }

  if (includeSet.size > 5) {
    throw new Error("포함할 숫자는 5개를 초과할 수 없습니다.");
  }

  const finalSets: number[][] = [];
  for (let i = 0; i < count; i++) {
    finalSets.push(generateSingleSet(includeNumbers, excludeNumbers, strategy));
  }

  return finalSets;
}
