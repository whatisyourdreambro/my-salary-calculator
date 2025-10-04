// src/lib/lottoGenerator.ts

/**
 * [수정] 로또 번호 세트를 생성하는 함수 (단순 랜덤 방식으로 변경)
 * @param count 생성할 세트의 개수
 * @param includeNumbers 반드시 포함할 숫자 배열
 * @param excludeNumbers 반드시 제외할 숫자 배열
 * @returns 2차원 배열 형태의 로또 번호 세트
 */
export function generateLottoSets(
  count: number,
  includeNumbers: number[],
  excludeNumbers: number[]
): number[][] {
  const finalSets: number[][] = [];
  if (count <= 0) return [];

  const includeSet = new Set(includeNumbers);
  const excludeSet = new Set(excludeNumbers);

  if (includeSet.size > 6) {
    throw new Error("포함할 숫자는 6개를 초과할 수 없습니다.");
  }

  // 사용 가능한 전체 숫자 풀
  const fullNumberSet = Array.from({ length: 45 }, (_, i) => i + 1);
  const availableNumbers = fullNumberSet.filter(
    (n) => !excludeSet.has(n) && !includeSet.has(n)
  );

  for (let i = 0; i < count; i++) {
    const numbers = new Set<number>(includeSet);
    const currentAvailable = [...availableNumbers]; // 각 세트 생성 시마다 원본 배열 복사

    while (numbers.size < 6) {
      if (currentAvailable.length === 0) break; // 더 이상 뽑을 숫자가 없으면 중단

      const randomIndex = Math.floor(Math.random() * currentAvailable.length);
      const randomNum = currentAvailable[randomIndex];

      numbers.add(randomNum);
      currentAvailable.splice(randomIndex, 1); // 뽑은 숫자는 제거
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    finalSets.push(sortedNumbers);
  }

  return finalSets;
}
