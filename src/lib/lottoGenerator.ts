// src/lib/lottoGenerator.ts

// 생성 모드 타입 정의
export type LottoGenerationMode = "random" | "statistical" | "salary";

// 생성 옵션 인터페이스 정의
export interface LottoGenerationOptions {
  count: number;
  mode: LottoGenerationMode;
  includeNumbers?: number[];
  excludeNumbers?: number[];
  salary?: number; // 월급 기반 모드용
}

// 가상의 통계 데이터 (실제 서비스에서는 DB나 API로 관리하면 더 좋아!)
const STATS = {
  hotNumbers: [1, 10, 13, 27, 34, 43], // 자주 나온 번호
  coldNumbers: [9, 11, 22, 30, 41, 42], // 오랫동안 안 나온 번호
};

// 숫자 풀 (1부터 45)
const FULL_NUMBER_SET = Array.from({ length: 45 }, (_, i) => i + 1);

/**
 * 단일 로또 번호 세트를 생성하는 내부 함수
 */
const generateSingleSet = (
  mode: LottoGenerationMode,
  include: Set<number>,
  exclude: Set<number>,
  salary?: number
): number[] => {
  const numbers = new Set<number>(include);

  // 제외할 숫자가 포함된 숫자 풀 생성
  const availableNumbers = FULL_NUMBER_SET.filter(
    (n) => !exclude.has(n) && !include.has(n)
  );

  if (mode === "salary" && salary) {
    // 월급 기반 조합 로직
    const salaryStr = salary.toString();
    for (let i = 0; i < salaryStr.length; i++) {
      let num = ((parseInt(salaryStr[i], 10) + i * 7) % 45) + 1;
      while (numbers.has(num)) {
        num = ((num + 1) % 45) + 1;
      }
      if (numbers.size < 6) numbers.add(num);
    }
  } else if (mode === "statistical") {
    // 통계 기반 조합 로직
    // hot, cold, random 숫자를 섞어서 조합
    const hot = STATS.hotNumbers.filter(
      (n) => !numbers.has(n) && !exclude.has(n)
    );
    const cold = STATS.coldNumbers.filter(
      (n) => !numbers.has(n) && !exclude.has(n)
    );
    if (hot.length > 0 && numbers.size < 6)
      numbers.add(hot[Math.floor(Math.random() * hot.length)]);
    if (cold.length > 0 && numbers.size < 6)
      numbers.add(cold[Math.floor(Math.random() * cold.length)]);
  }

  // 나머지 숫자는 랜덤하게 채우기
  while (numbers.size < 6) {
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNum = availableNumbers[randomIndex];
    if (!numbers.has(randomNum)) {
      numbers.add(randomNum);
      availableNumbers.splice(randomIndex, 1); // 중복 방지
    }
  }

  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * 초고도화된 로또 번호 세트 생성 함수
 */
export function generateLottoSets(options: LottoGenerationOptions): number[][] {
  const {
    count,
    mode,
    includeNumbers = [],
    excludeNumbers = [],
    salary,
  } = options;

  const finalSets: number[][] = [];
  if (count <= 0) return [];

  const includeSet = new Set(includeNumbers);
  const excludeSet = new Set(excludeNumbers);

  if (includeSet.size > 6) {
    throw new Error("포함할 숫자는 6개를 초과할 수 없습니다.");
  }

  for (let i = 0; i < count; i++) {
    const set = generateSingleSet(mode, includeSet, excludeSet, salary);
    finalSets.push(set);
  }

  return finalSets;
}
