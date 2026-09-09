// src/lib/dashboardAnalysis.ts

import type { StoredFinancialData } from "@/app/types";

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

// Historical export name retained. This uses one saved loan, not a lender's DTI/DSR assessment.
export const calculateDTI = (data: StoredFinancialData): number | null => {
 if (!data.salary || !data.homeLoan || !finite(data.salary.annualSalary) || data.salary.annualSalary <= 0
   || !finite(data.homeLoan.monthlyPayment) || data.homeLoan.monthlyPayment < 0) {
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
 !finite(data.salary.monthlyExpenses) || data.salary.monthlyExpenses < 0 ||
 !finite(data.salary.monthlyNet) || data.salary.monthlyNet <= 0
 ) {
 return null;
 }
 const savings = data.salary.monthlyNet - data.salary.monthlyExpenses;
 return Math.round((savings / data.salary.monthlyNet) * 100);
};

// 3. 금융 건강 점수 계산 로직
export const calculateHealthScore = (
 data: StoredFinancialData
): { score: number | null; rating: string; missing: string[] } => {
 const missing: string[] = [];
 if (!data.salary || !finite(data.salary.annualSalary) || data.salary.annualSalary <= 0
   || !finite(data.salary.monthlyNet) || data.salary.monthlyNet <= 0) missing.push("유효한 연봉·실수령액");
 if (calculateSavingRate(data) === null) missing.push("월 지출액");
 if (calculateDTI(data) === null) missing.push("주택대출 월 상환액");
 if (!data.rank || !finite(data.rank.rank) || data.rank.rank < 0 || data.rank.rank > 100
   || data.rank.annualSalary !== data.salary?.annualSalary) missing.push("같은 연봉 기준의 순위 결과");
 if (!data.futureSalary || !finite(data.futureSalary.years) || data.futureSalary.years <= 0
   || !finite(data.futureSalary.finalSalary) || data.futureSalary.finalSalary <= 0) missing.push("미래 연봉 시나리오");
 if (missing.length > 0) return { score: null, rating: "정보 부족으로 점수 보류", missing };
 let score = 0;
 const MAX_POINTS = {
 rank: 25,
 savingRate: 35,
 dti: 25,
 future: 15,
 };

 // 연봉 순위 점수 (최대 25점)
 if (data.rank) {
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

 let rating = "참고 점수 낮음";
 if (finalScore >= 80) rating = "참고 점수 높음";
 else if (finalScore >= 60) rating = "참고 점수 중상";
 else if (finalScore >= 40) rating = "참고 점수 중간";

 return { score: finalScore, rating, missing: [] };
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
 title: "저장한 지출 내역 확인",
 message:
 "저장한 실수령액과 지출액으로 계산한 잔여 비율이 20% 미만입니다. 일시적인 지출이나 빠진 항목이 있는지 먼저 확인해 보세요.",
 link: "/guides/first-job-financial-setup",
 linkText: "사회초년생 재테크 가이드 보기",
 });
 } else if (savingRate < 50) {
 advice.push({
 title: "저축과 투자 조건 살펴보기",
 message:
 "저장한 실수령액 대비 지출 후 잔여 비율이 20~50%입니다. 이 비율만으로 투자 적합성을 판단할 수 없으므로 생활비·비상자금·손실 감수 범위를 함께 살펴보세요.",
 link: "/guides/etf-portfolio-2026",
 linkText: "ETF 비교 가이드 읽기",
 });
 } else {
 advice.push({
 title: "지출에 빠진 항목 확인",
 message:
 "저장한 값에서는 지출 후 잔여 비율이 50% 이상입니다. 비정기 지출이나 대출 상환액을 빠뜨리지 않았는지 확인해 보세요. 실제 저축 내역을 조회한 결과는 아닙니다.",
 link: "/guides/first-job-financial-setup",
 linkText: "생활비·저축 계획 가이드 보기",
 });
 }
 }

 // DTI 기반 조언
 if (dti !== null && dti >= 40) {
 advice.push({
 title: "부채 관리",
 message:
 "저장한 주택대출 월 상환액이 세전 월 소득의 40% 이상입니다. 다른 부채를 포함한 심사 지표가 아니므로 실제 상환 일정과 전체 지출을 함께 확인해 보세요.",
 link: "/home-loan",
 linkText: "주택담보대출 계산기 바로가기",
 });
 }

 // 연봉 순위 기반 조언
 if (data.rank && data.rank.rank > 30) {
 advice.push({
 title: "몸값 올리기",
 message:
 "저장된 순위는 특정 연봉 분포와 비교한 값입니다. 경력·직무·근무시간과 실제 제안 조건도 함께 비교해 보세요.",
 link: "/guides/salary-negotiation-secret",
 linkText: "연봉 협상 전략 가이드 보기",
 });
 }

 return advice.slice(0, 2); // 최대 2개의 조언만 노출
};
