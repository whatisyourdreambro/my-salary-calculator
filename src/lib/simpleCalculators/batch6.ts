// src/lib/simpleCalculators/batch6.ts
// Phase 8 long-tail 30개 — 보험·부채·부동산·자녀·비즈니스·노후 심화.

import type { CalculatorDef } from "./types";

const make = (slug: string, title: string, desc: string, cat: CalculatorDef["category"], catLabel: string, kw: string[], fields: any[], compute: any, exp?: string): CalculatorDef => ({
 slug, title, description: desc, category: cat, categoryLabel: catLabel, keywords: kw, fields, compute, explanation: exp,
});

export const batch6Calculators: CalculatorDef[] = [
 // ── 보험 (5) ────────────────────────────────────────
 make("driver-insurance-cost", "운전자 보험료 추정", "운전 경력·연령 기반 운전자보험 월 보험료", "insurance", "보험", ["운전자 보험"],
 [{ name: "age", label: "연령", defaultValue: 35 }, { name: "yearsExp", label: "운전 경력 (년)", defaultValue: 5 }],
 ({ age, yearsExp }: any) => {
 let base = 15_000;
 if (age < 30) base = 25_000;
 if (age >= 50) base = 12_000;
 const expDiscount = Math.min(0.4, yearsExp * 0.05);
 const monthly = Math.round(base * (1 - expDiscount));
 return { primary: { label: "월 보험료", value: monthly, suffix: "원" }, secondary: [{ label: "연 보험료", value: monthly * 12, suffix: "원" }], note: "교통사고처리지원금·벌금·변호사비·자동차보험 자기부담 보장." };
 }
 ),
 make("dental-insurance", "치과보험 가입 한도", "치과 임플란트·교정 보장 보험료", "insurance", "보험", ["치과보험"],
 [{ name: "age", label: "연령", defaultValue: 40 }],
 ({ age }: any) => {
 const monthly = Math.max(20_000, Math.round((age - 20) * 1_000 + 20_000));
 return { primary: { label: "월 보험료 (추정)", value: monthly, suffix: "원" }, secondary: [{ label: "연 보험료", value: monthly * 12, suffix: "원" }], note: "임플란트 1개 100~150만 보장. 보험금 vs 자비 비교 권장." };
 }
 ),
 make("pet-insurance", "펫보험료 추정", "강아지·고양이 의료비 보험", "insurance", "보험", ["펫보험", "반려동물 보험"],
 [{ name: "petAge", label: "반려동물 연령", defaultValue: 3 }, { name: "petType", label: "1=소형견 2=대형견 3=고양이", defaultValue: 1 }],
 ({ petAge, petType }: any) => {
 const baseMap: Record<number, number> = { 1: 30_000, 2: 50_000, 3: 25_000 };
 const base = baseMap[petType] || 30_000;
 const ageFactor = 1 + Math.max(0, petAge - 3) * 0.1;
 const monthly = Math.round(base * ageFactor);
 return { primary: { label: "월 보험료", value: monthly, suffix: "원" }, secondary: [{ label: "연 보험료", value: monthly * 12, suffix: "원" }], note: "수술·통원 70% 보장. 노령일수록 보험료 인상. 슬개골탈구 등 유전질환 면책 가능." };
 }
 ),
 make("kid-insurance", "어린이 보험료", "신생아~만 18세 종합 보장", "insurance", "보험", ["어린이 보험"],
 [{ name: "kidAge", label: "자녀 연령", defaultValue: 5 }],
 ({ kidAge }: any) => {
 const monthly = Math.max(30_000, 50_000 - kidAge * 1_000);
 return { primary: { label: "월 보험료 (추정)", value: monthly, suffix: "원" }, secondary: [{ label: "30년 납입", value: monthly * 12 * 30, suffix: "원" }], note: "어릴수록 가입 유리 (보험료 ↓ + 면책기간 짧음). 30세까지 갱신 가능." };
 }
 ),
 make("group-insurance-savings", "단체보험 활용", "회사 단체보험 vs 개인 보험 절약", "insurance", "보험", ["단체보험"],
 [{ name: "groupCoverage", label: "단체 보장 (월)", defaultValue: 30_000 }, { name: "personalCoverage", label: "개인 보험 (월)", defaultValue: 100_000 }],
 ({ groupCoverage, personalCoverage }: any) => {
 const yearlyPersonal = personalCoverage * 12;
 const yearlySaving = (personalCoverage - groupCoverage) * 12;
 return { primary: { label: "연 절약액", value: Math.round(yearlySaving), suffix: "원" }, secondary: [{ label: "퇴사 시 갱신 권장", value: 1, suffix: "" }], note: "단체보험은 퇴사 시 종료. 갱신형 개인 보험으로 즉시 전환 권장." };
 }
 ),

 // ── 부채 관리 (5) ─────────────────────────────────────
 make("credit-loan-limit", "신용대출 한도", "연봉·신용점수 기반 추정", "loan", "대출", ["신용대출 한도"],
 [{ name: "annualIncome", label: "연 소득", defaultValue: 50_000_000 }, { name: "creditScore", label: "신용점수 (300~1000)", defaultValue: 800 }],
 ({ annualIncome, creditScore }: any) => {
 let multiplier = 1.5;
 if (creditScore >= 850) multiplier = 2.0;
 if (creditScore < 750) multiplier = 1.0;
 if (creditScore < 650) multiplier = 0.5;
 const limit = Math.min(150_000_000, Math.round(annualIncome * multiplier));
 return { primary: { label: "신용대출 한도 (추정)", value: limit, suffix: "원" }, secondary: [{ label: "DSR 적용 한도", value: Math.round(annualIncome * 0.4 * 4), suffix: "원" }], note: "1금융권 기준. 2금융권은 더 높지만 금리 ↑." };
 }
 ),
 make("debt-refinance-saving", "대출 갈아타기 절약", "기존 vs 신규 대출 이자 차액", "loan", "대출", ["대출 갈아타기", "대환대출"],
 [{ name: "principal", label: "잔여 원금", defaultValue: 50_000_000 }, { name: "oldRate", label: "기존 금리 (%)", defaultValue: 7 }, { name: "newRate", label: "신규 금리 (%)", defaultValue: 5 }, { name: "yearsLeft", label: "잔여 기간 (년)", defaultValue: 5 }],
 ({ principal, oldRate, newRate, yearsLeft }: any) => {
 const oldInterest = principal * (oldRate / 100) * yearsLeft;
 const newInterest = principal * (newRate / 100) * yearsLeft;
 const saving = oldInterest - newInterest;
 return { primary: { label: "예상 절약액", value: Math.round(saving), suffix: "원" }, secondary: [{ label: "기존 이자", value: Math.round(oldInterest), suffix: "원" }, { label: "신규 이자", value: Math.round(newInterest), suffix: "원" }], note: "중도상환 수수료 차감 후 실 절약액 산정." };
 }
 ),
 make("debt-payoff-snowball", "부채 눈덩이 상환", "부채 합계·월 가용 → 완전 상환 기간", "loan", "대출", ["부채 상환", "눈덩이 방식"],
 [{ name: "totalDebt", label: "총 부채", defaultValue: 50_000_000 }, { name: "avgRate", label: "평균 금리 (%)", defaultValue: 8 }, { name: "monthlyPayoff", label: "월 상환 가능액", defaultValue: 1_500_000 }],
 ({ totalDebt, avgRate, monthlyPayoff }: any) => {
 const r = avgRate / 100 / 12;
 const months = Math.ceil(Math.log(monthlyPayoff / (monthlyPayoff - totalDebt * r)) / Math.log(1 + r));
 const totalInterest = monthlyPayoff * months - totalDebt;
 return { primary: { label: "상환 기간", value: months, suffix: "개월" }, secondary: [{ label: "약 년수", value: months / 12, suffix: "년" }, { label: "총 이자", value: Math.round(totalInterest), suffix: "원" }], note: "고금리 부채부터 상환 (Avalanche) 또는 작은 부채부터 (Snowball)." };
 }
 ),
 make("credit-score-impact", "신용점수 등급 영향", "점수별 대출 금리·한도 차이", "loan", "대출", ["신용점수"],
 [{ name: "creditScore", label: "신용점수", defaultValue: 800 }, { name: "loanAmount", label: "대출 희망액", defaultValue: 50_000_000 }],
 ({ creditScore, loanAmount }: any) => {
 let rate = 5.0;
 if (creditScore >= 900) rate = 3.5;
 else if (creditScore >= 800) rate = 4.5;
 else if (creditScore >= 700) rate = 6.0;
 else if (creditScore >= 600) rate = 9.0;
 else rate = 14.0;
 const yearlyInterest = loanAmount * (rate / 100);
 return { primary: { label: "예상 금리", value: rate, suffix: "%" }, secondary: [{ label: "연 이자 부담", value: Math.round(yearlyInterest), suffix: "원" }], note: "1금융권 신용대출 평균. 점수 100점 ↑ 시 약 1~2%p 절감." };
 }
 ),
 make("personal-rehabilitation", "개인회생 자격·변제액", "총 채무·소득 → 5년 변제액", "loan", "대출", ["개인회생", "채무조정"],
 [{ name: "totalDebt", label: "총 채무", defaultValue: 80_000_000 }, { name: "monthlyIncome", label: "월 가처분 소득", defaultValue: 1_500_000 }],
 ({ totalDebt, monthlyIncome }: any) => {
 const isEligible = totalDebt <= 1_500_000_000 && monthlyIncome > 0;
 const monthlyPay = Math.min(monthlyIncome * 0.5, totalDebt / 60);
 const totalRepay = monthlyPay * 60;
 return { primary: { label: "월 변제액", value: Math.round(monthlyPay), suffix: "원" }, secondary: [{ label: "5년 총 변제", value: Math.round(totalRepay), suffix: "원" }, { label: "탕감액", value: Math.round(totalDebt - totalRepay), suffix: "원" }, { label: "자격 충족", value: isEligible ? 1 : 0, suffix: "" }], note: "개인회생: 5년 일정 변제 후 잔여 채무 면책. 신용점수 회복 약 7년 소요." };
 }
 ),

 // ── 부동산 심화 (5) ───────────────────────────────────
 make("property-tax-progressive", "재산세 누진 시뮬", "공시가격·1주택·다주택별 차등", "tax", "세금", ["재산세 누진"],
 [{ name: "publicPrice", label: "공시가격", defaultValue: 800_000_000 }, { name: "isMulti", label: "다주택자 (1=네)", defaultValue: 0 }],
 ({ publicPrice, isMulti }: any) => {
 const base = publicPrice * 0.6;
 const rate = isMulti ? 0.0035 : 0.0025;
 const tax = Math.round(base * rate);
 return { primary: { label: "연 재산세", value: tax + Math.round(tax * 0.2), suffix: "원" }, secondary: [{ label: "본세", value: tax, suffix: "원" }, { label: "지방교육세", value: Math.round(tax * 0.2), suffix: "원" }] };
 }
 ),
 make("long-term-capital-gains", "장기 양도세 (10년+)", "보유 10년 이상 80% 공제", "tax", "세금", ["장기 양도세", "장기보유공제"],
 [{ name: "gain", label: "양도차익", defaultValue: 500_000_000 }, { name: "holdYears", label: "보유 년수", defaultValue: 10 }],
 ({ gain, holdYears }: any) => {
 const deduction = Math.min(0.8, holdYears * 0.04);
 const taxable = gain * (1 - deduction);
 const tax = Math.round(taxable * 0.35);
 return { primary: { label: "장기보유공제 후 세금", value: tax, suffix: "원" }, secondary: [{ label: "공제율", value: deduction * 100, suffix: "%" }, { label: "공제 후 과표", value: Math.round(taxable), suffix: "원" }], note: "10년 보유 + 거주 시 80% 공제. 1주택자는 추가 비과세 적용." };
 }
 ),
 make("apartment-management-fee", "아파트 관리비 분석", "평형·전용면적별 평균 월 관리비", "real-estate", "부동산", ["관리비"],
 [{ name: "size", label: "전용면적 (평)", defaultValue: 25 }, { name: "type", label: "1=신축, 2=구축", defaultValue: 1 }],
 ({ size, type }: any) => {
 const ratePerPyeong = type === 1 ? 12_000 : 9_000;
 const monthly = Math.round(size * ratePerPyeong);
 return { primary: { label: "월 관리비 (추정)", value: monthly, suffix: "원" }, secondary: [{ label: "연 관리비", value: monthly * 12, suffix: "원" }], note: "신축 + 대규모 단지 일수록 관리비 ↑. 난방비·수도세 별도 계산." };
 }
 ),
 make("pre-sale-installment", "분양 중도금 이자", "분양가·중도금 비율·기간 → 총 이자", "real-estate", "부동산", ["분양 중도금"],
 [{ name: "salePrice", label: "분양가", defaultValue: 600_000_000 }, { name: "ratio", label: "중도금 비율 (%)", defaultValue: 60 }, { name: "rate", label: "이자율 (%)", defaultValue: 5 }],
 ({ salePrice, ratio, rate }: any) => {
 const middlePayment = salePrice * (ratio / 100);
 const yearlyInterest = middlePayment * (rate / 100);
 const twoYearTotal = yearlyInterest * 2;
 return { primary: { label: "2년 총 이자 (추정)", value: Math.round(twoYearTotal), suffix: "원" }, secondary: [{ name: "월 이자", value: Math.round(yearlyInterest / 12), suffix: "원" } as any] };
 }
 ),
 make("rental-yield", "임대 수익률 (Cap Rate)", "월세 × 12 / 매매가 = 표면 수익률", "real-estate", "부동산", ["임대 수익률"],
 [{ name: "salePrice", label: "매매가", defaultValue: 400_000_000 }, { name: "monthlyRent", label: "월세", defaultValue: 1_500_000 }],
 ({ salePrice, monthlyRent }: any) => {
 const yearlyRent = monthlyRent * 12;
 const capRate = (yearlyRent / salePrice) * 100;
 return { primary: { label: "표면 수익률", value: capRate, suffix: "%" }, secondary: [{ label: "연 임대료", value: yearlyRent, suffix: "원" }], note: "관리비·재산세·공실 제외 표면 수익률. 실 수익률은 70~80% 수준." };
 }
 ),

 // ── 자녀·가족 (5) ─────────────────────────────────────
 make("child-tuition-savings", "자녀 대학 등록금 적립", "자녀 나이·목표 → 월 적립", "family", "가족", ["자녀 등록금"],
 [{ name: "kidAge", label: "자녀 연령", defaultValue: 5 }, { name: "targetTuition", label: "총 등록금 목표", defaultValue: 32_000_000 }, { name: "rate", label: "적금 금리 (%)", defaultValue: 4 }],
 ({ kidAge, targetTuition, rate }: any) => {
 const yearsLeft = Math.max(1, 19 - kidAge);
 const months = yearsLeft * 12;
 const r = rate / 100 / 12;
 const monthly = Math.round((targetTuition * r) / (Math.pow(1 + r, months) - 1));
 return { primary: { label: "월 적립 필요액", value: monthly, suffix: "원" }, secondary: [{ label: "총 적립", value: monthly * months, suffix: "원" }, { label: "기간", value: yearsLeft, suffix: "년" }] };
 }
 ),
 make("daycare-government-subsidy", "어린이집 정부 지원금", "연령·소득별 보육료 지원", "family", "가족", ["어린이집 지원"],
 [{ name: "kidAge", label: "자녀 연령 (만)", defaultValue: 2 }],
 ({ kidAge }: any) => {
 const support = kidAge < 3 ? 600_000 : 400_000;
 return { primary: { label: "월 정부 지원금", value: support, suffix: "원" }, secondary: [{ label: "연 지원", value: support * 12, suffix: "원" }], note: "기본 보육료 정부 부담. 만 3세+ 누리과정 무상교육." };
 }
 ),
 make("birth-allowance", "출산·아동수당 합산", "출생 후 0~7세 정부 수당 합", "family", "가족", ["아동수당", "출산지원금"],
 [{ name: "kids", label: "자녀 수", defaultValue: 1 }],
 ({ kids }: any) => {
 const firstYear = 12_000_000; // 첫돌까지 200만 + 영아 100만 등 합산 추정
 const monthlyChildAllowance = 100_000; // 만 8세 미만
 const total8years = monthlyChildAllowance * 12 * 8;
 const perKid = firstYear + total8years;
 const totalAllSupport = perKid * kids;
 return { primary: { label: "자녀당 8년 누적 지원", value: perKid, suffix: "원" }, secondary: [{ label: "전체 자녀 합산", value: totalAllSupport, suffix: "원" }], note: "출산축하금 + 첫만남이용권 + 아동수당 + 영아수당 합산 추정." };
 }
 ),
 make("after-school-care", "방과 후 학원 비용", "학원·교습소 월 평균 비용", "family", "가족", ["방과 후 학원"],
 [{ name: "subjectCount", label: "과목 수", defaultValue: 3 }, { name: "perSubject", label: "과목당 월 비용", defaultValue: 200_000 }],
 ({ subjectCount, perSubject }: any) => {
 const monthly = subjectCount * perSubject;
 return { primary: { label: "월 학원비", value: monthly, suffix: "원" }, secondary: [{ label: "연 학원비", value: monthly * 12, suffix: "원" }], note: "수학·영어·과학 + 음악·체육. 평균 자녀 1명당 3~5과목." };
 }
 ),
 make("family-trip-budget", "가족 여행 예산", "인원·기간·국내외별 추정", "family", "가족", ["여행 예산"],
 [{ name: "people", label: "인원", defaultValue: 4 }, { name: "days", label: "기간 (일)", defaultValue: 5 }, { name: "type", label: "1=국내, 2=동남아, 3=유럽/미국", defaultValue: 1 }],
 ({ people, days, type }: any) => {
 const perDayMap: Record<number, number> = { 1: 100_000, 2: 200_000, 3: 350_000 };
 const perDay = perDayMap[type] || 100_000;
 const total = perDay * days * people;
 return { primary: { label: "예상 여행 비용", value: total, suffix: "원" }, secondary: [{ label: "1인 1일 평균", value: perDay, suffix: "원" }], note: "교통·숙박·식비·관광 합산. 명절·여름휴가는 1.3~1.5배." };
 }
 ),

 // ── 비즈니스 (5) ─────────────────────────────────────
 make("restaurant-margin", "음식점 손익 분석", "월 매출·고정비·변동비 → 마진", "business", "사업자", ["음식점 마진", "외식업 손익"],
 [{ name: "monthlyRevenue", label: "월 매출", defaultValue: 25_000_000 }, { name: "rent", label: "월 임대료", defaultValue: 3_000_000 }, { name: "labor", label: "월 인건비", defaultValue: 5_000_000 }],
 ({ monthlyRevenue, rent, labor }: any) => {
 const variable = monthlyRevenue * 0.35; // 식자재 35%
 const totalCost = rent + labor + variable + 1_500_000; // 기타 150만
 const profit = monthlyRevenue - totalCost;
 const margin = (profit / monthlyRevenue) * 100;
 return { primary: { label: "월 순이익", value: Math.round(profit), suffix: "원" }, secondary: [{ label: "이익률", value: margin, suffix: "%" }, { label: "월 총 비용", value: Math.round(totalCost), suffix: "원" }], note: "외식업 평균 마진 10~20%. 5% 미만은 위험." };
 }
 ),
 make("freelance-day-rate", "프리랜서 일당 환산", "연 소득 목표 → 일당·시급", "business", "사업자", ["프리랜서 일당"],
 [{ name: "yearlyTarget", label: "연 목표 소득", defaultValue: 80_000_000 }, { name: "workDaysPerYear", label: "연 근무일", defaultValue: 200 }],
 ({ yearlyTarget, workDaysPerYear }: any) => {
 const dayRate = Math.round(yearlyTarget / workDaysPerYear);
 const hourlyRate = Math.round(dayRate / 8);
 return { primary: { label: "일당", value: dayRate, suffix: "원" }, secondary: [{ label: "시급", value: hourlyRate, suffix: "원" }], note: "프리랜서는 휴가·세금·연금 등 고려해 직장인 시급 × 1.5~2배 권장." };
 }
 ),
 make("ecommerce-fee-rate", "이커머스 수수료 분석", "플랫폼별 수수료 + 결제수수료", "business", "사업자", ["이커머스 수수료", "쿠팡 수수료"],
 [{ name: "salesPrice", label: "판매가", defaultValue: 50_000 }, { name: "platform", label: "1=쿠팡, 2=네이버, 3=11번가", defaultValue: 1 }],
 ({ salesPrice, platform }: any) => {
 const platformFeeMap: Record<number, number> = { 1: 0.1, 2: 0.06, 3: 0.08 };
 const fee = platformFeeMap[platform] || 0.08;
 const platformFee = Math.round(salesPrice * fee);
 const paymentFee = Math.round(salesPrice * 0.025);
 const totalFee = platformFee + paymentFee;
 return { primary: { label: "총 수수료", value: totalFee, suffix: "원" }, secondary: [{ label: "수령액", value: salesPrice - totalFee, suffix: "원" }], note: "결제 수수료 2.5% + 플랫폼 수수료 6~10%. 광고비·반품수수료 별도." };
 }
 ),
 make("franchise-roi", "프랜차이즈 ROI", "초기 자본·월 순익 → 회수 기간", "business", "사업자", ["프랜차이즈"],
 [{ name: "initialCapital", label: "초기 자본 (가맹비+인테리어)", defaultValue: 100_000_000 }, { name: "monthlyProfit", label: "월 순이익", defaultValue: 4_000_000 }],
 ({ initialCapital, monthlyProfit }: any) => {
 const months = monthlyProfit > 0 ? Math.ceil(initialCapital / monthlyProfit) : 999;
 return { primary: { label: "회수 기간", value: months, suffix: "개월" }, secondary: [{ label: "약 년수", value: months / 12, suffix: "년" }, { label: "5년 누적 순익", value: monthlyProfit * 60, suffix: "원" }], note: "프랜차이즈 평균 회수 3~5년. 5년 후 폐업률 50% — 신중 검토." };
 }
 ),
 make("biz-vat-vs-cit", "법인사업자 vs 개인사업자", "매출 1억 기준 세 부담 비교", "business", "사업자", ["법인 vs 개인사업자"],
 [{ name: "yearlyProfit", label: "연 순이익", defaultValue: 100_000_000 }],
 ({ yearlyProfit }: any) => {
 // 개인사업자: 누진세율
 let personal = 0;
 if (yearlyProfit <= 50_000_000) personal = yearlyProfit * 0.15 - 1_260_000;
 else if (yearlyProfit <= 88_000_000) personal = yearlyProfit * 0.24 - 5_760_000;
 else personal = yearlyProfit * 0.35 - 15_440_000;
 // 법인: 9% (2억 이하)
 const corporate = yearlyProfit * 0.09;
 const diff = personal - corporate;
 return { primary: { label: "법인 절세 효과", value: Math.round(diff), suffix: "원" }, secondary: [{ label: "개인사업자 세금", value: Math.round(personal), suffix: "원" }, { label: "법인세 (9%)", value: Math.round(corporate), suffix: "원" }], note: "법인은 배당세 별도. 법인이 항상 유리한 건 아님 — 세무사 상담." };
 }
 ),

 // ── 노후·자산 (5) ────────────────────────────────────
 make("safe-withdrawal-rate", "안전 인출률 시뮬", "자산 × 인출률 → 평생 인출", "investment", "노후", ["안전 인출률", "4% 룰"],
 [{ name: "totalAssets", label: "은퇴 자산", defaultValue: 1_000_000_000 }, { name: "withdrawRate", label: "인출률 (%)", defaultValue: 4 }],
 ({ totalAssets, withdrawRate }: any) => {
 const yearlyWithdraw = totalAssets * (withdrawRate / 100);
 const monthlyWithdraw = Math.round(yearlyWithdraw / 12);
 return { primary: { label: "월 인출액", value: monthlyWithdraw, suffix: "원" }, secondary: [{ label: "연 인출액", value: Math.round(yearlyWithdraw), suffix: "원" }], note: "4% 룰: 30년 안전. 한국은 3~3.5% 권장 (인플레+의료비 부담)." };
 }
 ),
 make("housing-pension", "주택연금 수령액 추정", "주택 가격·연령 → 평생 월 수령", "investment", "노후", ["주택연금", "역모기지"],
 [{ name: "housePrice", label: "주택 시가", defaultValue: 600_000_000 }, { name: "age", label: "가입 연령", defaultValue: 65 }],
 ({ housePrice, age }: any) => {
 // 단순 추정: 65세 6억 주택 → 약 월 150만
 const baseRate = age >= 75 ? 0.0035 : age >= 70 ? 0.003 : age >= 65 ? 0.0025 : 0.002;
 const monthly = Math.round(housePrice * baseRate);
 return { primary: { label: "월 평생 수령액", value: monthly, suffix: "원" }, secondary: [{ label: "20년 누적", value: monthly * 12 * 20, suffix: "원" }], note: "한국주택금융공사 정확한 시뮬은 hf.go.kr. 평생 거주 + 사망 후 정산." };
 }
 ),
 make("ltc-insurance", "장기요양보험 등급", "등급별 월 본인부담", "insurance", "보험", ["장기요양보험", "노인요양"],
 [{ name: "grade", label: "등급 (1~5)", defaultValue: 3 }, { name: "type", label: "1=재가, 2=시설", defaultValue: 1 }],
 ({ grade, type }: any) => {
 const baseMap: Record<number, number> = { 1: 1_500_000, 2: 1_300_000, 3: 1_100_000, 4: 900_000, 5: 700_000 };
 const base = baseMap[grade] || 1_100_000;
 const burden = type === 2 ? 0.2 : 0.15; // 시설 20%, 재가 15%
 const personal = Math.round(base * burden);
 return { primary: { label: "월 본인부담 (추정)", value: personal, suffix: "원" }, secondary: [{ label: "정부 지원", value: base - personal, suffix: "원" }], note: "장기요양 1~5등급 + 인지지원. 본인부담 15~20%. 등급 판정은 국민건강보험공단." };
 }
 ),
 make("inheritance-prep-tools", "증여 vs 상속 비교", "자산 1억 기준 어느 게 유리?", "tax", "세금", ["증여 vs 상속"],
 [{ name: "amount", label: "이전 금액", defaultValue: 100_000_000 }, { name: "heirs", label: "수증자 수", defaultValue: 1 }],
 ({ amount, heirs }: any) => {
 const giftBase = Math.max(0, amount / heirs - 50_000_000);
 const giftTax = giftBase <= 100_000_000 ? giftBase * 0.1 : giftBase * 0.2 - 10_000_000;
 const totalGiftTax = giftTax * heirs;
 // 상속세는 일괄공제 5억
 const inheritBase = Math.max(0, amount - 500_000_000);
 const inheritTax = inheritBase <= 100_000_000 ? inheritBase * 0.1 : inheritBase * 0.2 - 10_000_000;
 const advantage = totalGiftTax < inheritTax ? "증여 유리" : "상속 유리";
 return { primary: { label: "절세 방법", value: totalGiftTax < inheritTax ? 1 : 0, suffix: " (1=증여)" }, secondary: [{ label: "증여세 (분할)", value: Math.round(totalGiftTax), suffix: "원" }, { label: "상속세", value: Math.round(inheritTax), suffix: "원" }], note: "10년 단위 분할 증여 + 결혼증여 1억 비과세 활용으로 절세." };
 }
 ),
 make("retirement-3-pillar", "3층 연금 합산", "국민·퇴직·개인연금 합산 노후 자금", "investment", "노후", ["3층 연금"],
 [{ name: "nationalMonthly", label: "국민연금 월", defaultValue: 1_200_000 }, { name: "retirementMonthly", label: "퇴직연금 월", defaultValue: 800_000 }, { name: "personalMonthly", label: "개인연금 월", defaultValue: 500_000 }],
 ({ nationalMonthly, retirementMonthly, personalMonthly }: any) => {
 const total = nationalMonthly + retirementMonthly + personalMonthly;
 const yearlyTotal = total * 12;
 return { primary: { label: "월 합산 수령", value: total, suffix: "원" }, secondary: [{ label: "연 합산", value: yearlyTotal, suffix: "원" }, { label: "30년 누적", value: yearlyTotal * 30, suffix: "원" }], note: "한국 평균 노후 월 350만 권장. 3층 연금만으로 부족 시 자산 인출 추가." };
 }
 ),
];
