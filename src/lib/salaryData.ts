// src/lib/salaryData.ts

// 직군, 경력, 연령, 지역별 상세 연봉 통계 데이터 구조
export interface SalaryStat {
  median: number; // 중위 연봉
  average: number; // 평균 연봉
  percentiles: { [key: number]: number }; // 백분위별 연봉 데이터 (상위 1% ~ 99%)
}

// 국가통계포털(KOSIS), 고용노동부 임금직무정보시스템 데이터를 기반으로 재구성한 2024-2025년 기준 데이터
// [추가] 파트너님의 요청에 따라 다양한 직군, 경력, 연령대 키를 추가했습니다.
//       실제 서비스에서는 각 키에 맞는 정확한 통계 데이터가 필요합니다. 여기서는 구조만 보여드립니다.
export const salaryData: Record<string, SalaryStat> = {
  // --- 전체 데이터 ---
  "all-all-all-all": {
    median: 42000000,
    average: 48500000,
    percentiles: {
      1: 150000000,
      5: 110000000,
      10: 95000000,
      25: 68000000,
      50: 42000000,
      75: 31000000,
      90: 26000000,
      99: 22000000,
    },
  },
  // --- IT/개발 직군 ---
  "it_dev-1-2-20s-capital": {
    median: 55000000,
    average: 58000000,
    percentiles: {
      1: 120000000,
      10: 80000000,
      25: 65000000,
      50: 55000000,
      75: 45000000,
      90: 40000000,
      99: 36000000,
    },
  },
  "it_dev-3-6-30s-capital": {
    median: 85000000,
    average: 92000000,
    percentiles: {
      1: 200000000,
      10: 140000000,
      25: 110000000,
      50: 85000000,
      75: 70000000,
      90: 60000000,
      99: 55000000,
    },
  },
  // --- [추가] 더 많은 예시 데이터 (실제 데이터로 채워야 함) ---
  "marketing-1-2-20s-capital": {
    median: 40000000,
    average: 42000000,
    percentiles: {
      1: 90000000,
      10: 60000000,
      25: 48000000,
      50: 40000000,
      75: 35000000,
      90: 32000000,
      99: 28000000,
    },
  },
  "professional-11-14-40s-all": {
    median: 150000000,
    average: 180000000,
    percentiles: {
      1: 500000000,
      10: 350000000,
      25: 220000000,
      50: 150000000,
      75: 100000000,
      90: 80000000,
      99: 70000000,
    },
  },
};

// [수정] 1% 단위의 정밀한 연봉 순위를 계산하는 함수 (선형 보간법 적용)
export const findSalaryRank = (annualSalary: number, key: string) => {
  const data = salaryData[key] || salaryData["all-all-all-all"];
  if (annualSalary <= 0) {
    return { rank: null, median: data.median, average: data.average };
  }

  // 백분위 데이터를 연봉 내림차순으로 정렬
  const percentiles = Object.entries(data.percentiles)
    .map(([p, s]) => ({ percentile: parseInt(p, 10), salary: s }))
    .sort((a, b) => b.salary - a.salary);

  // 최고 연봉보다 높은 경우
  if (annualSalary >= percentiles[0].salary) {
    return { rank: 1, median: data.median, average: data.average };
  }

  // 최저 연봉보다 낮은 경우
  if (annualSalary <= percentiles[percentiles.length - 1].salary) {
    return { rank: 99, median: data.median, average: data.average };
  }

  // 내 연봉이 속하는 구간 찾기
  let lowerBound = percentiles[percentiles.length - 1];
  let upperBound = percentiles[0];

  for (let i = 0; i < percentiles.length; i++) {
    if (annualSalary <= percentiles[i].salary) {
      lowerBound = percentiles[i];
    } else {
      upperBound = percentiles[i];
      break;
    }
  }

  // 선형 보간법으로 순위 추정
  let rank = lowerBound.percentile;
  const salaryRange = upperBound.salary - lowerBound.salary;

  if (salaryRange > 0) {
    const positionInRange = (annualSalary - lowerBound.salary) / salaryRange;
    const percentileRange = lowerBound.percentile - upperBound.percentile;
    rank = lowerBound.percentile - positionInRange * percentileRange;
  }

  return {
    rank: Math.max(1, Math.round(rank)), // 순위는 최소 1%, 최대 99%로 표시
    median: data.median,
    average: data.average,
  };
};
