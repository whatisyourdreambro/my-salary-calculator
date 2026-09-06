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

 // 실현 가능성 선검사 — 제외가 너무 많으면 6개를 만들 수 없다.
 // (호출부가 사용자 입력을 그대로 넘기므로 여기서 막아야 한다)
 const preExclude = new Set(excludeNumbers);
 const preInclude = new Set(includeNumbers.filter((n) => !preExclude.has(n)));
 if (45 - preExclude.size < 6) {
 throw new Error(
 `제외할 숫자가 너무 많아 6개를 만들 수 없습니다 (최대 ${45 - 6}개까지 제외 가능).`
 );
 }
 if (preInclude.size > 6) {
 throw new Error("반드시 포함할 숫자는 6개까지만 지정할 수 있습니다.");
 }

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

 // 재시도 횟수 초과 시 랜덤 전략으로 1회만 폴백한다.
 // 종전에는 조건 없이 자기 자신을 재호출해, 제외 숫자가 40개 이상이면
 // ("random" 도 6개를 못 채우므로) 종료 조건 없이 무한 재귀 → 탭이 수 초
 // 멈춘 뒤 스택오버플로로 죽었다 (2026-09-06 전수검사).
 // 실현 불가능한 입력은 아래 선검사에서 이미 걸러지므로, 여기서는 전략만 낮춘다.
 if (strategy === "random") {
 // 이미 최하위 전략인데도 실패 — 더 낮출 전략이 없으므로 마지막 조합을 그대로 돌려준다.
 return Array.from({ length: 45 }, (_, i) => i + 1)
 .filter((n) => !new Set(excludeNumbers).has(n))
 .slice(0, 6)
 .sort((a, b) => a - b);
 }
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
