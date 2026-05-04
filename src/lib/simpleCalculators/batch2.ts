// src/lib/simpleCalculators/batch2.ts
// 부동산 10 + 보험 8 + 사업자 8 + 일상 14 + 건강 5 + 결혼육아 5 = 50개

import type { CalculatorDef } from "./types";

const REAL_ESTATE: CalculatorDef[] = [
 {
 slug: "mortgage-monthly-quick",
 title: "주택담보대출 월 상환",
 description: "원리금균등 방식 주담대 월 상환액",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["주담대", "주택담보대출 월"],
 fields: [
 { name: "amount", label: "대출액", defaultValue: 300000000, suffix: "원" },
 { name: "rate", label: "금리", defaultValue: 4, suffix: "%" },
 { name: "years", label: "기간", defaultValue: 30, suffix: "년" },
 ],
 compute: ({ amount, rate, years }) => {
 const r = rate / 100 / 12;
 const n = years * 12;
 const monthly = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
 return {
 primary: { label: "월 상환액", value: Math.round(monthly), suffix: "원" },
 secondary: [{ label: "총 이자", value: Math.round(monthly * n - amount), suffix: "원" }],
 };
 },
 },
 {
 slug: "jeonse-loan-cost",
 title: "전세대출 월 이자",
 description: "전세금 + 이자율 → 월 이자 부담",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["전세대출", "전세 이자"],
 fields: [
 { name: "amount", label: "전세대출", defaultValue: 200000000, suffix: "원" },
 { name: "rate", label: "금리", defaultValue: 3.5, suffix: "%" },
 ],
 compute: ({ amount, rate }) => {
 const monthly = (amount * rate) / 100 / 12;
 return {
 primary: { label: "월 이자", value: Math.round(monthly), suffix: "원" },
 secondary: [{ label: "연 이자", value: Math.round(monthly * 12), suffix: "원" }],
 };
 },
 },
 {
 slug: "monthly-rent-tax-credit-quick",
 title: "월세 세액공제 환급",
 description: "월세 × 12 × 17% (총급여 7천만 이하)",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["월세 세액공제", "월세 환급"],
 fields: [
 { name: "monthly", label: "월세", defaultValue: 600000, suffix: "원" },
 ],
 compute: ({ monthly }) => {
 const yearly = monthly * 12;
 const cap = Math.min(yearly, 7500000);
 const credit = cap * 0.17;
 return {
 primary: { label: "예상 환급액", value: Math.round(credit), suffix: "원" },
 secondary: [{ label: "공제 한도 적용", value: cap, suffix: "원" }],
 note: "총급여 7천만 이하 무주택 세대주. 한도 750만 × 17%.",
 };
 },
 },
 {
 slug: "housing-affordability-quick",
 title: "내가 살 수 있는 집값",
 description: "자기자본 + DSR 한도 → 매수 가능 가격",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["집값 한도", "내 연봉 집"],
 fields: [
 { name: "yearly", label: "연봉", defaultValue: 60000000, suffix: "원" },
 { name: "savings", label: "자기자본", defaultValue: 100000000, suffix: "원" },
 { name: "rate", label: "금리", defaultValue: 4, suffix: "%" },
 ],
 compute: ({ yearly, savings, rate }) => {
 const monthlyLimit = (yearly * 0.4) / 12;
 const r = rate / 100 / 12;
 const n = 30 * 12;
 const loan = (monthlyLimit * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n));
 const totalAffordable = loan + savings;
 return {
 primary: { label: "매수 가능 가격", value: Math.round(totalAffordable), suffix: "원" },
 secondary: [
 { label: "대출 한도 (DSR 40%)", value: Math.round(loan), suffix: "원" },
 { label: "자기자본", value: savings, suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "rental-yield",
 title: "임대 수익률",
 description: "월세 × 12 ÷ 매수가 = 연 수익률",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["임대 수익률", "월세 수익률"],
 fields: [
 { name: "price", label: "매수가", defaultValue: 100000000, suffix: "원" },
 { name: "monthly", label: "월세", defaultValue: 500000, suffix: "원" },
 ],
 compute: ({ price, monthly }) => {
 const yearly = monthly * 12;
 const rate = (yearly / price) * 100;
 return {
 primary: { label: "연 임대 수익률", value: rate, suffix: "%" },
 secondary: [{ label: "연 월세 수입", value: yearly, suffix: "원" }],
 };
 },
 },
 {
 slug: "area-conversion",
 title: "평·제곱미터 변환",
 description: "1평 ≈ 3.3058㎡",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["평수 계산", "평 제곱미터"],
 fields: [{ name: "pyeong", label: "평", defaultValue: 25, suffix: "평" }],
 compute: ({ pyeong }) => {
 const sqm = pyeong * 3.3058;
 return {
 primary: { label: "제곱미터", value: sqm, suffix: "㎡" },
 secondary: [{ label: "1평", value: 3.3058, suffix: "㎡" }],
 };
 },
 },
 {
 slug: "moving-cost-quick",
 title: "이사 비용 추정",
 description: "거주 평수·이사 종류 → 평균 이사비",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["이사 비용", "이사 견적"],
 fields: [
 { name: "pyeong", label: "거주 평수", defaultValue: 25, suffix: "평" },
 { name: "perPyeong", label: "평당 이사비", defaultValue: 100000, suffix: "원" },
 ],
 compute: ({ pyeong, perPyeong }) => {
 const moving = pyeong * perPyeong;
 const cleaning = pyeong * 20000;
 return {
 primary: { label: "예상 총 비용", value: Math.round(moving + cleaning + 200000), suffix: "원" },
 secondary: [
 { label: "이사 (포장이사)", value: moving, suffix: "원" },
 { label: "입주 청소", value: cleaning, suffix: "원" },
 { label: "기타 (등기·인터넷 이전)", value: 200000, suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "real-estate-flip-cost",
 title: "단기 매매 부대비용",
 description: "부동산 매매 시 발생하는 모든 부대비용 합산",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["부동산 부대비용", "취득세 등기"],
 fields: [
 { name: "price", label: "매수가", defaultValue: 500000000, suffix: "원" },
 ],
 compute: ({ price }) => {
 const acquisitionTax = price * 0.013; // 1주택 1.3%
 const brokerage = Math.min(price * 0.005, 9000000);
 const registration = price * 0.002;
 const total = acquisitionTax + brokerage + registration + 1000000;
 return {
 primary: { label: "총 부대비용", value: Math.round(total), suffix: "원" },
 secondary: [
 { label: "취득세 (1주택 기준)", value: Math.round(acquisitionTax), suffix: "원" },
 { label: "중개수수료", value: Math.round(brokerage), suffix: "원" },
 { label: "등기비용", value: Math.round(registration), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "jeonse-vs-monthly-cost",
 title: "전세 vs 월세 월 비용",
 description: "전세대출 이자 + 기회비용 vs 월세 비교",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["전세 월세 비교", "전세 vs 월세"],
 fields: [
 { name: "jeonse", label: "전세금", defaultValue: 200000000, suffix: "원" },
 { name: "loanRate", label: "전세대출 금리", defaultValue: 4, suffix: "%" },
 { name: "loanRatio", label: "대출 비율", defaultValue: 70, suffix: "%" },
 { name: "monthly", label: "월세 (비교)", defaultValue: 800000, suffix: "원" },
 ],
 compute: ({ jeonse, loanRate, loanRatio, monthly }) => {
 const loan = jeonse * (loanRatio / 100);
 const ownEquity = jeonse - loan;
 const interest = (loan * loanRate) / 100 / 12;
 const opportunity = (ownEquity * 5) / 100 / 12;
 const totalJeonse = interest + opportunity;
 return {
 primary: { label: "전세 월 실비용", value: Math.round(totalJeonse), suffix: "원" },
 secondary: [
 { label: "월세", value: monthly, suffix: "원" },
 { label: "전세가 유리한 차이", value: monthly - totalJeonse, suffix: "원" },
 ],
 note: "기회비용 5% 가정. 자기자본을 ETF 투자 시 수익률 적용.",
 };
 },
 },
 {
 slug: "deposit-equivalent",
 title: "월세 → 전세금 환산",
 description: "월세를 전세로 바꾸면 보증금은 얼마?",
 category: "real-estate",
 categoryLabel: "부동산",
 keywords: ["월세 전세 환산", "전월세 변환"],
 fields: [
 { name: "monthly", label: "월세", defaultValue: 800000, suffix: "원" },
 { name: "deposit", label: "현재 보증금", defaultValue: 50000000, suffix: "원" },
 { name: "rate", label: "전월세 전환율", defaultValue: 5, suffix: "%" },
 ],
 compute: ({ monthly, deposit, rate }) => {
 const additionalJeonse = (monthly * 12) / (rate / 100);
 return {
 primary: { label: "환산 전세금", value: Math.round(deposit + additionalJeonse), suffix: "원" },
 secondary: [{ label: "월세 → 전세 추가분", value: Math.round(additionalJeonse), suffix: "원" }],
 note: "정부 고시 전월세 전환율 5% 기준 (지역·시기별 변동).",
 };
 },
 },
];

const INSURANCE: CalculatorDef[] = [
 {
 slug: "auto-insurance-quick",
 title: "자동차보험 견적 추정",
 description: "차종·연령·운전경력 → 평균 보험료 추정",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["자동차보험", "자동차 보험료"],
 fields: [
 { name: "carPrice", label: "차량가", defaultValue: 30000000, suffix: "원" },
 { name: "age", label: "운전자 나이", defaultValue: 35, suffix: "세" },
 ],
 compute: ({ carPrice, age }) => {
 const base = carPrice * 0.025;
 const ageFactor = age < 26 ? 1.6 : age < 30 ? 1.3 : age < 50 ? 1.0 : 1.1;
 const yearly = base * ageFactor;
 return {
 primary: { label: "예상 연 보험료", value: Math.round(yearly), suffix: "원" },
 secondary: [{ label: "월 환산", value: Math.round(yearly / 12), suffix: "원" }],
 note: "다이렉트 가입 시 -20~30% 절약 가능.",
 };
 },
 },
 {
 slug: "life-insurance-needs",
 title: "생명보험 필요 보장액",
 description: "부양가족 비용 합계 → 종신보험 적정 보장액",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["생명보험", "사망보험금"],
 fields: [
 { name: "income", label: "연 소득", defaultValue: 60000000, suffix: "원" },
 { name: "years", label: "부양 기간", defaultValue: 10, suffix: "년" },
 ],
 compute: ({ income, years }) => {
 const target = income * 0.7 * years;
 return {
 primary: { label: "권장 보장액", value: Math.round(target), suffix: "원" },
 note: "소득의 70% × 부양 기간. 자녀 교육·주거비 별도 추가.",
 };
 },
 },
 {
 slug: "medical-expense-coverage",
 title: "실손보험 청구 가능액",
 description: "본인부담금 - 면책금 = 청구 가능액",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["실손보험 청구", "병원비 환급"],
 fields: [
 { name: "expense", label: "본인부담 의료비", defaultValue: 1000000, suffix: "원" },
 { name: "deductible", label: "면책금", defaultValue: 30000, suffix: "원" },
 { name: "coverage", label: "보장률", defaultValue: 90, suffix: "%" },
 ],
 compute: ({ expense, deductible, coverage }) => {
 const claimable = Math.max(0, (expense - deductible) * (coverage / 100));
 return {
 primary: { label: "예상 환급액", value: Math.round(claimable), suffix: "원" },
 };
 },
 },
 {
 slug: "cancer-insurance-needs",
 title: "암보험 권장 보장액",
 description: "암 진단·수술·항암치료 비용 추정",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["암보험", "암 진단 보장"],
 fields: [{ name: "monthly", label: "현재 월 생활비", defaultValue: 3000000, suffix: "원" }],
 compute: ({ monthly }) => {
 const target = monthly * 36 + 30000000;
 return {
 primary: { label: "권장 보장액", value: target, suffix: "원" },
 note: "치료기간 3년 생활비 + 의료비 3천만 가정.",
 };
 },
 },
 {
 slug: "fire-insurance-quick",
 title: "화재보험 보장 한도",
 description: "주택 가격 × 80% = 보장 한도",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["화재보험", "주택 화재"],
 fields: [{ name: "home", label: "주택 평가액", defaultValue: 500000000, suffix: "원" }],
 compute: ({ home }) => {
 const target = home * 0.8;
 const monthly = (target * 0.0008) / 12;
 return {
 primary: { label: "권장 보장액", value: Math.round(target), suffix: "원" },
 secondary: [{ label: "월 보험료 추정", value: Math.round(monthly), suffix: "원" }],
 };
 },
 },
 {
 slug: "travel-insurance-quick",
 title: "여행자 보험 권장",
 description: "여행 일수·국가 → 보험료 추정",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["여행자보험", "여행 보험"],
 fields: [
 { name: "days", label: "여행 일수", defaultValue: 7, suffix: "일" },
 { name: "rate", label: "1일 보험료", defaultValue: 3000, suffix: "원" },
 ],
 compute: ({ days, rate }) => {
 const total = days * rate;
 return {
 primary: { label: "예상 보험료", value: total, suffix: "원" },
 note: "선진국 일 1,500~3,000원, 위험국 5,000원+.",
 };
 },
 },
 {
 slug: "pet-insurance-quick",
 title: "반려동물 보험료",
 description: "강아지·고양이 보험 월 보험료 추정",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["반려동물 보험", "펫보험"],
 fields: [
 { name: "age", label: "반려동물 나이", defaultValue: 3, suffix: "세" },
 ],
 compute: ({ age }) => {
 const base = 30000;
 const ageFactor = age < 5 ? 1 : age < 10 ? 1.5 : 2.5;
 const monthly = base * ageFactor;
 return {
 primary: { label: "월 보험료 추정", value: Math.round(monthly), suffix: "원" },
 note: "보장 범위·동물 종류·과거 병력에 따라 차이 큼.",
 };
 },
 },
 {
 slug: "child-insurance-needs",
 title: "어린이보험 권장",
 description: "0~30세 보장 어린이종합보험 보험료 추정",
 category: "insurance",
 categoryLabel: "보험",
 keywords: ["어린이보험", "자녀 보험"],
 fields: [{ name: "age", label: "자녀 나이", defaultValue: 5, suffix: "세" }],
 compute: ({ age }) => {
 const monthly = age < 5 ? 70000 : age < 10 ? 80000 : 100000;
 return {
 primary: { label: "월 보험료 추정", value: monthly, suffix: "원" },
 note: "보장형 + 저축형 결합 상품 평균. 30세 만기 권장.",
 };
 },
 },
];

const BUSINESS: CalculatorDef[] = [
 {
 slug: "business-margin-quick",
 title: "사업 마진율 계산",
 description: "(매출 - 원가) ÷ 매출 = 마진율",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["마진율", "이익률"],
 fields: [
 { name: "revenue", label: "매출", defaultValue: 100000000, suffix: "원" },
 { name: "cost", label: "원가", defaultValue: 60000000, suffix: "원" },
 ],
 compute: ({ revenue, cost }) => {
 const profit = revenue - cost;
 const margin = (profit / revenue) * 100;
 return {
 primary: { label: "마진율", value: margin, suffix: "%" },
 secondary: [{ label: "순이익", value: profit, suffix: "원" }],
 };
 },
 },
 {
 slug: "hourly-billing-rate",
 title: "프리랜서 시간당 청구가",
 description: "목표 연봉 ÷ 가능 근무시간 = 시간당 단가",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["프리랜서 시간당", "시급 청구"],
 fields: [
 { name: "target", label: "목표 연 수입", defaultValue: 80000000, suffix: "원" },
 { name: "hours", label: "주 가능 시간", defaultValue: 30, suffix: "시간" },
 ],
 compute: ({ target, hours }) => {
 const yearlyHours = hours * 48;
 const rate = target / yearlyHours;
 return {
 primary: { label: "시간당 청구가", value: Math.round(rate), suffix: "원" },
 secondary: [{ label: "연 가능 작업시간", value: yearlyHours, suffix: "시간" }],
 note: "휴가·세금·운영비 등 30% 마진 추가 권장.",
 };
 },
 },
 {
 slug: "employee-cost-quick",
 title: "직원 인건비 (회사 부담)",
 description: "월 급여 + 4대보험 회사 부담분 + 퇴직금 적립",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["인건비", "직원 비용"],
 fields: [{ name: "monthly", label: "월 급여", defaultValue: 3000000, suffix: "원" }],
 compute: ({ monthly }) => {
 const insurance = monthly * 0.105;
 const severance = monthly / 12;
 const total = monthly + insurance + severance;
 return {
 primary: { label: "월 총 인건비", value: Math.round(total), suffix: "원" },
 secondary: [
 { label: "월 급여", value: monthly, suffix: "원" },
 { label: "4대보험 회사부담", value: Math.round(insurance), suffix: "원" },
 { label: "퇴직금 월 적립", value: Math.round(severance), suffix: "원" },
 ],
 };
 },
 },
 {
 slug: "business-cashflow-runway",
 title: "사업 자금 runway",
 description: "보유 자금 ÷ 월 burn rate = 유지 개월수",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["스타트업 runway", "자금 유지"],
 fields: [
 { name: "cash", label: "보유 현금", defaultValue: 50000000, suffix: "원" },
 { name: "burn", label: "월 지출", defaultValue: 5000000, suffix: "원" },
 ],
 compute: ({ cash, burn }) => {
 const months = cash / burn;
 return {
 primary: { label: "Runway", value: months, suffix: "개월" },
 note: "12개월+ 유지 권장. 6개월 이하면 긴급 자금 조달 필요.",
 };
 },
 },
 {
 slug: "freelancer-yearly-quick",
 title: "프리랜서 연 수입 시뮬",
 description: "월 수입 변동 → 연 평균",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["프리랜서 연봉", "프리랜서 수입"],
 fields: [
 { name: "good", label: "성수기 월 수입", defaultValue: 8000000, suffix: "원" },
 { name: "low", label: "비수기 월 수입", defaultValue: 3000000, suffix: "원" },
 { name: "goodMonths", label: "성수기 개월", defaultValue: 6, suffix: "개월" },
 ],
 compute: ({ good, low, goodMonths }) => {
 const yearly = good * goodMonths + low * (12 - goodMonths);
 const monthlyAvg = yearly / 12;
 return {
 primary: { label: "연 수입", value: yearly, suffix: "원" },
 secondary: [{ label: "평균 월 수입", value: Math.round(monthlyAvg), suffix: "원" }],
 };
 },
 },
 {
 slug: "simple-vs-general-vat",
 title: "간이과세자 vs 일반과세자",
 description: "매출별 부담 부가세 비교",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["간이과세", "일반과세"],
 fields: [
 { name: "revenue", label: "연 매출", defaultValue: 60000000, suffix: "원" },
 { name: "purchase", label: "연 매입", defaultValue: 20000000, suffix: "원" },
 { name: "simpleRate", label: "간이세율 (업종)", defaultValue: 3, suffix: "%" },
 ],
 compute: ({ revenue, purchase, simpleRate }) => {
 const simpleVat = revenue * (simpleRate / 100);
 const generalVat = revenue * 0.1 - purchase * 0.1;
 return {
 primary: { label: "간이 부가세", value: Math.round(simpleVat), suffix: "원" },
 secondary: [
 { label: "일반 부가세", value: Math.round(generalVat), suffix: "원" },
 { label: "간이 절감액", value: Math.round(generalVat - simpleVat), suffix: "원" },
 ],
 note: "매출 8천만 미만 간이과세 가능. 매입 비중 작으면 간이가 유리.",
 };
 },
 },
 {
 slug: "corporate-tax-quick",
 title: "법인세 간편 계산",
 description: "과세표준 4단계 누진",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["법인세", "법인세 계산"],
 fields: [{ name: "base", label: "과세표준", defaultValue: 100000000, suffix: "원" }],
 compute: ({ base }) => {
 let tax = 0;
 if (base <= 200000000) tax = base * 0.09;
 else if (base <= 20000000000) tax = 18000000 + (base - 200000000) * 0.19;
 else if (base <= 300000000000)
 tax = 18000000 + 19800000000 * 0.19 + (base - 20000000000) * 0.21;
 else tax = base * 0.24 - 9420000000;
 return {
 primary: { label: "법인세", value: Math.round(tax), suffix: "원" },
 secondary: [{ label: "지방소득세 (10%)", value: Math.round(tax * 0.1), suffix: "원" }],
 };
 },
 },
 {
 slug: "side-business-net",
 title: "부업 순수입",
 description: "총수입 - 필요경비 - 종소세 = 순수입",
 category: "business",
 categoryLabel: "사업자",
 keywords: ["부업 순수입", "N잡 세후"],
 fields: [
 { name: "revenue", label: "연 부업 수입", defaultValue: 12000000, suffix: "원" },
 { name: "expense", label: "필요경비", defaultValue: 3000000, suffix: "원" },
 ],
 compute: ({ revenue, expense }) => {
 const taxable = revenue - expense;
 const tax = taxable > 14000000 ? taxable * 0.15 - 1260000 : taxable * 0.06;
 return {
 primary: { label: "예상 순수입", value: Math.round(taxable - tax), suffix: "원" },
 secondary: [
 { label: "예상 세금", value: Math.round(Math.max(0, tax)), suffix: "원" },
 { label: "월 평균", value: Math.round((taxable - tax) / 12), suffix: "원" },
 ],
 };
 },
 },
];

const LIFE: CalculatorDef[] = [
 {
 slug: "tip-calculator",
 title: "팁 계산기",
 description: "음식값 × 팁 비율",
 category: "life",
 categoryLabel: "생활",
 keywords: ["팁 계산", "tip"],
 fields: [
 { name: "bill", label: "음식값", defaultValue: 50000, suffix: "원" },
 { name: "tipPct", label: "팁 비율", defaultValue: 15, suffix: "%" },
 ],
 compute: ({ bill, tipPct }) => {
 const tip = bill * (tipPct / 100);
 return {
 primary: { label: "팁", value: Math.round(tip), suffix: "원" },
 secondary: [{ label: "총 결제", value: Math.round(bill + tip), suffix: "원" }],
 };
 },
 },
 {
 slug: "discount-percent",
 title: "할인율 계산",
 description: "원가 + 할인가 → 할인율 %",
 category: "life",
 categoryLabel: "생활",
 keywords: ["할인율 계산", "할인가"],
 fields: [
 { name: "original", label: "원가", defaultValue: 100000, suffix: "원" },
 { name: "discount", label: "할인가", defaultValue: 70000, suffix: "원" },
 ],
 compute: ({ original, discount }) => {
 const pct = ((original - discount) / original) * 100;
 return {
 primary: { label: "할인율", value: pct, suffix: "%" },
 secondary: [{ label: "할인 금액", value: original - discount, suffix: "원" }],
 };
 },
 },
 {
 slug: "split-bill",
 title: "더치페이",
 description: "총액 ÷ 인원 = 1인당",
 category: "life",
 categoryLabel: "생활",
 keywords: ["더치페이", "n분의 1"],
 fields: [
 { name: "total", label: "총 금액", defaultValue: 120000, suffix: "원" },
 { name: "people", label: "인원", defaultValue: 4, suffix: "명" },
 ],
 compute: ({ total, people }) => {
 const each = total / people;
 return {
 primary: { label: "1인당", value: Math.round(each), suffix: "원" },
 };
 },
 },
 {
 slug: "currency-converter",
 title: "환율 환산",
 description: "원화 ↔ 외화 (USD/JPY/EUR/CNY)",
 category: "currency",
 categoryLabel: "환율",
 keywords: ["환율 계산", "달러 환산"],
 fields: [
 { name: "krw", label: "원화", defaultValue: 1000000, suffix: "원" },
 { name: "rate", label: "환율 (1USD = ?원)", defaultValue: 1380, suffix: "원" },
 ],
 compute: ({ krw, rate }) => {
 const usd = krw / rate;
 return {
 primary: { label: "달러 환산", value: usd, suffix: "USD" },
 secondary: [{ label: "1 USD", value: rate, suffix: "원" }],
 };
 },
 },
 {
 slug: "fuel-cost-trip",
 title: "주유비 계산",
 description: "거리 ÷ 연비 × 유가",
 category: "life",
 categoryLabel: "생활",
 keywords: ["주유비", "기름값"],
 fields: [
 { name: "km", label: "주행 거리", defaultValue: 300, suffix: "km" },
 { name: "mileage", label: "연비 (km/L)", defaultValue: 12, suffix: "km/L" },
 { name: "price", label: "유가 (원/L)", defaultValue: 1700, suffix: "원" },
 ],
 compute: ({ km, mileage, price }) => {
 const liters = km / mileage;
 const cost = liters * price;
 return {
 primary: { label: "주유비", value: Math.round(cost), suffix: "원" },
 secondary: [{ label: "필요 연료", value: liters, suffix: "L" }],
 };
 },
 },
 {
 slug: "subscription-monthly",
 title: "구독 월 비용 합산",
 description: "여러 구독 월비 합계",
 category: "life",
 categoryLabel: "생활",
 keywords: ["구독료", "월 구독"],
 fields: [
 { name: "ott", label: "OTT (넷플릭스 등)", defaultValue: 17000, suffix: "원" },
 { name: "music", label: "음악 (멜론 등)", defaultValue: 10000, suffix: "원" },
 { name: "etc", label: "기타", defaultValue: 20000, suffix: "원" },
 ],
 compute: ({ ott, music, etc }) => {
 const monthly = ott + music + etc;
 return {
 primary: { label: "월 구독료", value: monthly, suffix: "원" },
 secondary: [{ label: "연 구독료", value: monthly * 12, suffix: "원" }],
 };
 },
 },
 {
 slug: "electricity-bill",
 title: "전기료 추정",
 description: "kWh × 요금 (누진제 단순)",
 category: "life",
 categoryLabel: "생활",
 keywords: ["전기료", "전기세"],
 fields: [{ name: "kwh", label: "월 사용량", defaultValue: 300, suffix: "kWh" }],
 compute: ({ kwh }) => {
 let charge = 0;
 if (kwh <= 200) charge = kwh * 120;
 else if (kwh <= 400) charge = 200 * 120 + (kwh - 200) * 215;
 else charge = 200 * 120 + 200 * 215 + (kwh - 400) * 308;
 const tax = charge * 0.137;
 return {
 primary: { label: "예상 전기료", value: Math.round(charge + tax + 1900), suffix: "원" },
 note: "한국전력 주택용 누진제 단순 적용. 계절·정확한 단가는 한전 공식 안내 확인.",
 };
 },
 },
 {
 slug: "water-bill",
 title: "수도료 추정",
 description: "월 사용량(㎥) × 단가",
 category: "life",
 categoryLabel: "생활",
 keywords: ["수도료", "수도세"],
 fields: [{ name: "cubic", label: "월 사용량", defaultValue: 20, suffix: "㎥" }],
 compute: ({ cubic }) => {
 const charge = cubic * 580 + 5000;
 return { primary: { label: "예상 수도료", value: charge, suffix: "원" } };
 },
 },
 {
 slug: "delivery-fee-split",
 title: "배달비 1인당",
 description: "주문금액 + 배달비를 인원으로 나누기",
 category: "life",
 categoryLabel: "생활",
 keywords: ["배달비", "더치페이"],
 fields: [
 { name: "order", label: "주문 금액", defaultValue: 30000, suffix: "원" },
 { name: "delivery", label: "배달비", defaultValue: 4000, suffix: "원" },
 { name: "people", label: "인원", defaultValue: 3, suffix: "명" },
 ],
 compute: ({ order, delivery, people }) => {
 const each = (order + delivery) / people;
 return { primary: { label: "1인당", value: Math.round(each), suffix: "원" } };
 },
 },
 {
 slug: "time-zone-converter",
 title: "시차 계산기",
 description: "한국 시간 + 시차 → 현지 시간",
 category: "life",
 categoryLabel: "생활",
 keywords: ["시차", "타임존"],
 fields: [
 { name: "korea", label: "한국 시간 (24시간)", defaultValue: 14, suffix: "시" },
 { name: "diff", label: "시차 (한국 기준 ±)", defaultValue: -14, suffix: "시간" },
 ],
 compute: ({ korea, diff }) => {
 let local = (korea + diff) % 24;
 if (local < 0) local += 24;
 return { primary: { label: "현지 시간", value: local, suffix: "시" } };
 },
 },
 {
 slug: "percent-of",
 title: "X%의 N",
 description: "전체값의 X% 계산",
 category: "life",
 categoryLabel: "생활",
 keywords: ["퍼센트 계산", "비율"],
 fields: [
 { name: "value", label: "전체 값", defaultValue: 1000000, suffix: "" },
 { name: "pct", label: "비율", defaultValue: 30, suffix: "%" },
 ],
 compute: ({ value, pct }) => {
 const result = (value * pct) / 100;
 return { primary: { label: `${pct}%`, value: result, suffix: "" } };
 },
 },
 {
 slug: "what-percent",
 title: "A는 B의 몇 %?",
 description: "두 값 비율 계산",
 category: "life",
 categoryLabel: "생활",
 keywords: ["비율 계산", "퍼센트"],
 fields: [
 { name: "a", label: "분자 (A)", defaultValue: 30, suffix: "" },
 { name: "b", label: "분모 (B)", defaultValue: 100, suffix: "" },
 ],
 compute: ({ a, b }) => {
 const pct = (a / b) * 100;
 return { primary: { label: "비율", value: pct, suffix: "%" } };
 },
 },
 {
 slug: "increase-decrease-percent",
 title: "증감률 계산",
 description: "(신값 - 구값) ÷ 구값 = 증감률",
 category: "life",
 categoryLabel: "생활",
 keywords: ["증감률", "변동률"],
 fields: [
 { name: "old", label: "이전 값", defaultValue: 100, suffix: "" },
 { name: "newVal", label: "현재 값", defaultValue: 130, suffix: "" },
 ],
 compute: ({ old, newVal }) => {
 const change = ((newVal - old) / old) * 100;
 return { primary: { label: "증감률", value: change, suffix: "%" } };
 },
 },
 {
 slug: "unit-converter-length",
 title: "길이 단위 변환 (m·km·mi)",
 description: "기본 m → km/mi/yd/ft 환산",
 category: "life",
 categoryLabel: "생활",
 keywords: ["단위 변환", "길이 변환"],
 fields: [{ name: "meters", label: "미터", defaultValue: 1000, suffix: "m" }],
 compute: ({ meters }) => {
 return {
 primary: { label: "킬로미터", value: meters / 1000, suffix: "km" },
 secondary: [
 { label: "마일", value: meters / 1609.34, suffix: "mi" },
 { label: "야드", value: meters / 0.9144, suffix: "yd" },
 ],
 };
 },
 },
];

const HEALTH: CalculatorDef[] = [
 {
 slug: "bmi-quick",
 title: "BMI 비만도",
 description: "체중(kg) ÷ 신장(m)² = BMI",
 category: "health",
 categoryLabel: "건강",
 keywords: ["BMI", "비만도"],
 fields: [
 { name: "weight", label: "체중", defaultValue: 70, suffix: "kg" },
 { name: "height", label: "신장", defaultValue: 170, suffix: "cm" },
 ],
 compute: ({ weight, height }) => {
 const bmi = weight / (height / 100) ** 2;
 const status =
 bmi < 18.5 ? "저체중" : bmi < 23 ? "정상" : bmi < 25 ? "과체중" : bmi < 30 ? "비만" : "고도비만";
 return {
 primary: { label: "BMI", value: bmi, suffix: "" },
 secondary: [{ label: status, value: 0, suffix: "" }],
 };
 },
 },
 {
 slug: "bmr-quick",
 title: "기초대사량 (BMR)",
 description: "Mifflin-St Jeor 공식",
 category: "health",
 categoryLabel: "건강",
 keywords: ["BMR", "기초대사량"],
 fields: [
 { name: "weight", label: "체중", defaultValue: 70, suffix: "kg" },
 { name: "height", label: "신장", defaultValue: 170, suffix: "cm" },
 { name: "age", label: "나이", defaultValue: 30, suffix: "세" },
 ],
 compute: ({ weight, height, age }) => {
 const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
 return {
 primary: { label: "BMR (남성)", value: Math.round(bmr), suffix: "kcal" },
 secondary: [{ label: "BMR (여성)", value: Math.round(bmr - 166), suffix: "kcal" }],
 };
 },
 },
 {
 slug: "daily-calorie-quick",
 title: "일일 권장 칼로리",
 description: "BMR × 활동지수",
 category: "health",
 categoryLabel: "건강",
 keywords: ["일일 칼로리", "TDEE"],
 fields: [
 { name: "bmr", label: "BMR", defaultValue: 1700, suffix: "kcal" },
 { name: "activity", label: "활동지수 (1.2~1.9)", defaultValue: 1.5, suffix: "" },
 ],
 compute: ({ bmr, activity }) => {
 const tdee = bmr * activity;
 return {
 primary: { label: "일일 권장", value: Math.round(tdee), suffix: "kcal" },
 secondary: [
 { label: "다이어트 (-500)", value: Math.round(tdee - 500), suffix: "kcal" },
 { label: "벌크업 (+500)", value: Math.round(tdee + 500), suffix: "kcal" },
 ],
 };
 },
 },
 {
 slug: "water-intake-quick",
 title: "권장 물 섭취량",
 description: "체중 × 30~35ml",
 category: "health",
 categoryLabel: "건강",
 keywords: ["물 섭취", "수분"],
 fields: [{ name: "weight", label: "체중", defaultValue: 70, suffix: "kg" }],
 compute: ({ weight }) => {
 const minWater = weight * 30;
 const maxWater = weight * 35;
 return {
 primary: { label: "일일 권장 (ml)", value: minWater, suffix: "ml" },
 secondary: [{ label: "최대 권장", value: maxWater, suffix: "ml" }],
 };
 },
 },
 {
 slug: "sleep-cycle-quick",
 title: "수면 주기 계산",
 description: "기상 시간 → 잠들 시간 추천",
 category: "health",
 categoryLabel: "건강",
 keywords: ["수면 주기", "잠자는 시간"],
 fields: [{ name: "wakeHour", label: "기상 시간", defaultValue: 7, suffix: "시" }],
 compute: ({ wakeHour }) => {
 const cycles = [4, 5, 6];
 return {
 primary: { label: "5사이클 (7.5시간)", value: ((wakeHour - 7.5 + 24) % 24), suffix: "시" },
 secondary: cycles.map((c) => ({
 label: `${c}사이클 (${c * 1.5}시간)`,
 value: (wakeHour - c * 1.5 + 24) % 24,
 suffix: "시",
 })),
 note: "1사이클 = 90분. 사이클 끝에 깨면 개운함.",
 };
 },
 },
];

const FAMILY: CalculatorDef[] = [
 {
 slug: "wedding-cost-quick",
 title: "결혼 평균 비용",
 description: "예식·예단·신혼여행·신혼집 합산",
 category: "family",
 categoryLabel: "결혼육아",
 keywords: ["결혼 비용", "결혼식 비용"],
 fields: [
 { name: "wedding", label: "예식 비용", defaultValue: 30000000, suffix: "원" },
 { name: "honeymoon", label: "신혼여행", defaultValue: 5000000, suffix: "원" },
 { name: "home", label: "신혼집 비용", defaultValue: 200000000, suffix: "원" },
 ],
 compute: ({ wedding, honeymoon, home }) => {
 const total = wedding + honeymoon + home;
 return {
 primary: { label: "총 결혼 비용", value: total, suffix: "원" },
 note: "결혼정보회사 평균 약 2.5~3억. 신혼집 비중 가장 큼.",
 };
 },
 },
 {
 slug: "baby-yearly-cost",
 title: "자녀 양육비 1년차",
 description: "출산비·기저귀·분유·예방접종 합산",
 category: "family",
 categoryLabel: "결혼육아",
 keywords: ["육아 비용", "자녀 양육비"],
 fields: [{ name: "monthly", label: "월 평균 비용", defaultValue: 800000, suffix: "원" }],
 compute: ({ monthly }) => {
 const yearly = monthly * 12 + 3000000;
 return {
 primary: { label: "1년차 양육비", value: yearly, suffix: "원" },
 note: "출산비·기저귀·분유·예방접종 등 평균 1,200만원/년 (영아).",
 };
 },
 },
 {
 slug: "education-cost-cumulative",
 title: "교육비 18년 누적",
 description: "유치원~대학 18년 교육비 누적",
 category: "family",
 categoryLabel: "결혼육아",
 keywords: ["교육비", "자녀 교육비"],
 fields: [
 { name: "kindergarten", label: "유치원/년", defaultValue: 3000000, suffix: "원" },
 { name: "elementary", label: "초등/년", defaultValue: 5000000, suffix: "원" },
 { name: "secondary", label: "중·고등/년", defaultValue: 8000000, suffix: "원" },
 { name: "college", label: "대학/년", defaultValue: 10000000, suffix: "원" },
 ],
 compute: ({ kindergarten, elementary, secondary, college }) => {
 const total = kindergarten * 3 + elementary * 6 + secondary * 6 + college * 4;
 return { primary: { label: "총 교육비 (자녀 1)", value: total, suffix: "원" } };
 },
 },
 {
 slug: "childcare-fee",
 title: "어린이집 보육료",
 description: "유형·시간 → 월 보육료",
 category: "family",
 categoryLabel: "결혼육아",
 keywords: ["어린이집 비용", "보육료"],
 fields: [
 { name: "monthly", label: "월 보육료", defaultValue: 500000, suffix: "원" },
 { name: "subsidy", label: "정부 지원", defaultValue: 250000, suffix: "원" },
 ],
 compute: ({ monthly, subsidy }) => {
 const out = Math.max(0, monthly - subsidy);
 return {
 primary: { label: "본인 부담", value: out, suffix: "원" },
 secondary: [{ label: "정부 지원분", value: subsidy, suffix: "원" }],
 };
 },
 },
 {
 slug: "alimony-quick",
 title: "양육비 산정",
 description: "양육비 산정기준표 평균값 참고",
 category: "family",
 categoryLabel: "결혼육아",
 keywords: ["양육비", "이혼 양육비"],
 fields: [
 { name: "income", label: "비양육친 월 소득", defaultValue: 4000000, suffix: "원" },
 { name: "age", label: "자녀 평균 나이", defaultValue: 10, suffix: "세" },
 ],
 compute: ({ income, age }) => {
 const factor = age < 6 ? 0.18 : age < 12 ? 0.22 : age < 15 ? 0.25 : 0.28;
 const child = income * factor;
 return {
 primary: { label: "예상 월 양육비", value: Math.round(child), suffix: "원" },
 note: "가정법원 양육비 산정기준표 단순 추정. 정확한 금액은 변호사·조정 통해 결정.",
 };
 },
 },
];

export const batch2Calculators: CalculatorDef[] = [
 ...REAL_ESTATE,
 ...INSURANCE,
 ...BUSINESS,
 ...LIFE,
 ...HEALTH,
 ...FAMILY,
];
