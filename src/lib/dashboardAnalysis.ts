// src/lib/dashboardAnalysis.ts

import type { StoredFinancialData } from "@/app/types";

// 1. DTI (총부채원리금상환비율) 계산
export const calculateDTI = (data: StoredFinancialData): number | null => {
  if (!data.salary || !data.homeLoan || data.salary.monthlyNet <= 0) {
    return null;
  }
  const monthlyDebt = data.homeLoan.monthlyPayment;
  // 월 실수령액이 아닌 세전 소득 기준으로 DTI를 계산하는 것이 일반적입니다.
  const monthlyGrossIncome = data.salary.annualSalary / 12;
  if (monthlyGrossIncome <= 0) return null;

  return Math.round((monthlyDebt / monthlyGrossIncome) * 100);
};

// 2. 저축률 계산
export const calculateSavingRate = (
  data: StoredFinancialData
): number | null => {
  if (
    !data.salary ||
    data.salary.monthlyExpenses === undefined ||
    data.salary.monthlyNet <= 0
  ) {
    return null;
  }
  const savings = data.salary.monthlyNet - data.salary.monthlyExpenses;
  return Math.round((savings / data.salary.monthlyNet) * 100);
};

// 3. 금융 건강 점수 계산 로직
export const calculateHealthScore = (
  data: StoredFinancialData
): { score: number; rating: string } => {
  let score = 0;
  const MAX_POINTS = {
    rank: 25,
    savingRate: 35,
    dti: 25,
    future: 15,
  };

  // 연봉 순위 점수 (최대 25점)
  if (data.rank && data.rank.rank) {
    // 상위 50% = 0점, 상위 1% = 24.5점
    score += Math.max(0, (50 - data.rank.rank) / 2);
  }

  // 저축률 점수 (최대 35점)
  const savingRate = calculateSavingRate(data);
  if (savingRate !== null) {
    if (savingRate >= 50) score += MAX_POINTS.savingRate;
    else if (savingRate >= 30) score += MAX_POINTS.savingRate * 0.7;
    else if (savingRate >= 10) score += MAX_POINTS.savingRate * 0.4;
    else if (savingRate > 0) score += MAX_POINTS.savingRate * 0.1;
  }

  // DTI 점수 (최대 25점)
  const dti = calculateDTI(data);
  if (dti !== null) {
    if (dti < 20) score += MAX_POINTS.dti;
    else if (dti < 30) score += MAX_POINTS.dti * 0.6;
    else if (dti < 40) score += MAX_POINTS.dti * 0.2;
  } else {
    // 부채가 없으면 만점
    score += MAX_POINTS.dti;
  }

  // 미래 성장성 점수 (최대 15점)
  if (data.futureSalary && data.salary && data.futureSalary.years > 0) {
    const growthRate =
      ((data.futureSalary.finalSalary - data.salary.annualSalary) /
        data.salary.annualSalary /
        data.futureSalary.years) *
      100;
    if (growthRate > 7) score += MAX_POINTS.future;
    else if (growthRate > 5) score += MAX_POINTS.future * 0.7;
    else if (growthRate > 3) score += MAX_POINTS.future * 0.4;
  }

  const finalScore = Math.round(Math.min(100, Math.max(0, score)));

  let rating = "개선 필요";
  if (finalScore >= 80) rating = "매우 우수";
  else if (finalScore >= 60) rating = "우수";
  else if (finalScore >= 40) rating = "보통";

  return { score: finalScore, rating };
};

// 4. 맞춤형 조언 생성
export const getFinancialAdvice = (
  data: StoredFinancialData
): { title: string; message: string; link: string; linkText: string }[] => {
  const advice = [];
  const savingRate = calculateSavingRate(data);
  const dti = calculateDTI(data);

  // 저축률 기반 조언
  if (savingRate !== null) {
    if (savingRate < 20) {
      advice.push({
        title: "저축 습관 개선",
        message:
          "저축률이 낮습니다. 소비 습관을 점검하고 '선저축 후지출'을 실천하여 미래를 위한 씨앗을 심어야 합니다.",
        link: "/guides/first-job-investment",
        linkText: "사회초년생 재테크 가이드 보기",
      });
    } else if (savingRate < 50) {
      advice.push({
        title: "투자 시작하기",
        message:
          "안정적인 저축 습관을 가지고 있습니다. 이제 S&P 500 ETF 등 우량 자산에 투자하여 자산 증식 속도를 높여보세요.",
        link: "/guides/road-to-100m-part3-invest",
        linkText: "투자 파이프라인 구축 가이드 보기",
      });
    } else {
      advice.push({
        title: "소득 파이 키우기",
        message:
          "훌륭한 저축률입니다! 이제 N잡, 부수입 등을 통해 소득의 파이 자체를 키워 경제적 자유를 앞당길 차례입니다.",
        link: "/guides/road-to-100m-part2-sidejob",
        linkText: "N잡으로 월 100만원 더 벌기",
      });
    }
  }

  // DTI 기반 조언
  if (dti !== null && dti >= 40) {
    advice.push({
      title: "부채 관리",
      message:
        "소득 대비 부채 비율(DTI)이 높은 편입니다. 추가 대출에 신중하고, 기존 부채 상환 계획을 세워 재정적 안정성을 확보해야 합니다.",
      link: "/home-loan",
      linkText: "주택담보대출 계산기 바로가기",
    });
  }

  // 연봉 순위 기반 조언
  if (data.rank && data.rank.rank > 30) {
    advice.push({
      title: "몸값 올리기",
      message:
        "나의 시장 가치를 파악하고, 성공적인 이직과 협상을 통해 연봉을 높여 소득 수준을 한 단계 업그레이드할 수 있습니다.",
      link: "/guides/salary-negotiation",
      linkText: "연봉 협상 전략 가이드 보기",
    });
  }

  return advice.slice(0, 2); // 최대 2개의 조언만 노출
};
