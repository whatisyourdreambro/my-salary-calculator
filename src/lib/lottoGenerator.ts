/**
 * 로또 번호 세트를 생성하는 함수
 * @param count 생성할 세트의 개수
 * @param includeNumbers 반드시 포함할 숫자 배열
 * @returns 2차원 배열 형태의 로또 번호 세트
 */
export function generateLottoSets(
  count: number,
  includeNumbers: number[]
): number[][] {
  const finalSets: number[][] = [];
  if (count <= 0) return [];

  for (let i = 0; i < count; i++) {
    const numbers = new Set<number>(includeNumbers);

    while (numbers.size < 6) {
      const randomNumber = Math.floor(Math.random() * 45) + 1;
      numbers.add(randomNumber);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
    finalSets.push(sortedNumbers);
  }

  return finalSets;
}
