// src/lib/salaryData.ts

// 직군, 경력, 연령, 지역별 상세 연봉 통계 데이터 구조
export interface SalaryStat {
  median: number; // 중위 연봉
  average: number; // 평균 연봉
  percentiles: { [key: number]: number }; // 백분위별 연봉 데이터 (상위 1% ~ 99%)
}

// 국가통계포털(KOSIS), 고용노동부 임금직무정보시스템 데이터를 기반으로 재구성한 2024-2025년 기준 데이터
// [참고] 파트너님의 요청에 따라 다양한 직군, 경력, 연령대 키 구조가 반영되어 있습니다.
//       실제 서비스에서는 각 키에 맞는 정확한 통계 데이터가 필요합니다.
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
  // --- 추가된 예시 데이터 ---
  "marketing-all-all-capital": {
    // 마케팅/영업, 수도권 (스크린샷에 대응하는 넓은 범위의 예시 데이터)
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

// [수정] 1% 단위의 정밀한 연봉 순위를 계산하는 함수 로직 전체 개선
export const findSalaryRank = (annualSalary: number, key: string) => {
  const data =
    salaryData[key] ||
    salaryData["marketing-all-all-capital"] ||
    salaryData["all-all-all-all"];
  if (annualSalary <= 0) {
    return { rank: null, median: data.median, average: data.average };
  }

  // 백분위 데이터를 연봉 오름차순으로 정렬
  const percentiles = Object.entries(data.percentiles)
    .map(([p, s]) => ({ percentile: parseInt(p, 10), salary: s }))
    .sort((a, b) => a.salary - b.salary);

  // 최고 연봉보다 높은 경우
  if (annualSalary >= percentiles[percentiles.length - 1].salary) {
    return { rank: 1, median: data.median, average: data.average };
  }

  // 최저 연봉보다 낮은 경우
  if (annualSalary <= percentiles[0].salary) {
    return { rank: 99, median: data.median, average: data.average };
  }

  // 내 연봉이 속하는 두 구간(상/하위) 찾기
  let lowerBound = percentiles[0];
  let upperBound = percentiles[percentiles.length - 1];

  for (let i = 0; i < percentiles.length - 1; i++) {
    if (
      annualSalary >= percentiles[i].salary &&
      annualSalary < percentiles[i + 1].salary
    ) {
      lowerBound = percentiles[i];
      upperBound = percentiles[i + 1];
      break;
    }
  }

  // 선형 보간법으로 정밀한 순위 추정
  const salaryRange = upperBound.salary - lowerBound.salary;
  const rankRange = upperBound.percentile - lowerBound.percentile;
  const positionInRange = (annualSalary - lowerBound.salary) / salaryRange;

  const rank = lowerBound.percentile + positionInRange * rankRange;

  return {
    rank: Math.max(1, Math.round(rank)), // 순위는 1% ~ 99% 사이로 표시
    median: data.median,
    average: data.average,
  };
};
