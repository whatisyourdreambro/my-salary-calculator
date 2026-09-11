// src/components/SalaryCalculator.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "@/components/AppLink";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { calculateSalary2026 } from "@/lib/TaxLogic";
import { calculatePartTimeSalary } from "@/lib/freelancerCalculator";
import MoneyInput from "./ui/MoneyInput"; // New UI Component
import SalaryResultCard from "./SalaryResultCard"; // New UI Component
import { motion } from "framer-motion";
import { CheckCircle, Calculator, Zap, Sparkles, ArrowRight } from "lucide-react";
import ResultSharePanel from "@/components/ResultSharePanel";
import { useCalculatorMeasurement } from "@/hooks/useCalculatorMeasurement";
import { isValidCalculationNumber } from "@/lib/calculationMeasurement";
import { trackEvent } from "@/lib/analytics";
import { canHandoffCurrentSalaryResult, writeOfferComparisonHandoff } from "@/lib/offerComparisonHandoff";
import { encodeSalarySharePayload, validateSalarySharePayload } from "@/lib/salarySharePayload";
import { isCurrentSalaryResult, mergeSalarySnapshot, parseSavedHomeInputs } from "@/lib/salaryResultSnapshot";
import type {
 StoredSalaryData,
} from "@/app/types";
import { ResultAd } from "./AdPlacement";
import RelatedCalculators from "./RelatedCalculators";
import NextActions from "./NextActions";
import { nextActionHrefs } from "@/lib/nextActionLinks";
// 무거운 recharts 컴포넌트는 동적 로드 — 초기 번들 절감
const WealthChart = dynamic(() => import("./WealthChart"), {
 ssr: false,
 loading: () => (
 <div className="w-full h-[400px] bg-canvas-100 dark:bg-canvas-800 rounded-3xl animate-pulse" />
 ),
});
// DetailedAnalysis도 recharts 포함 — 결과 표시 후에만 렌더되므로 위 차트들과
// 동일하게 dynamic 분리 (정적 import 시 recharts가 첫 로드에 실림, 2026-07-06 감사)
const DetailedAnalysis = dynamic(() => import("./DetailedAnalysis"), {
 ssr: false,
 loading: () => (
 <div className="w-full h-[300px] bg-canvas-100 dark:bg-canvas-800 rounded-3xl animate-pulse" />
 ),
});
import SalaryTierCard from "./SalaryTierCard"; // New Import
import LoadingInterstitial from "./LoadingInterstitial";
import BottomSheet from "./BottomSheet";

// 결과 아래 NextActions(category=salary)가 내는 3 href — 그 아래 RelatedCalculators 에서 제외(빈자리는 채움, S2-3)
const HOME_NEXT_ACTION_HREFS = nextActionHrefs("salary");

const formatNumber = (num: number) => num.toLocaleString('ko-KR');
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

// Unified Result Type
type CalculationResult = {
 monthlyNet: number;
 totalDeduction: number;
 pension: number;
 health: number;
 longTermCare: number;
 employment: number;
 incomeTax: number;
 localTax: number;
};

type IncomeType = "regular" | "freelancer" | "part_time";

// --- Mung Mascot Component ---
const MungMascot = ({ mood }: { mood: "normal" | "happy" | "shocked" | "cool" }) => {
 const getEmoji = () => {
 switch (mood) {
 case "happy": return "🥰"; // Loves money
 case "shocked": return "😱"; // High tax
 case "cool": return "😎"; // High income
 default: return "🥔"; // Normal Potato Mung
 }
 };

 const getColor = () => {
 switch (mood) {
 case "happy": return "bg-canvas border-primary";
 case "shocked": return "bg-canvas-deeper border-canvas";
 case "cool": return "bg-canvas-dark border-electric";
 default: return "bg-primary/5 border-primary";
 }
 };

 return (
 <div className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center text-5xl shadow-lg transition-all duration-500 transform hover:scale-110 ${getColor()}`}>
 {getEmoji()}
 {mood === "shocked" && (
 <div className="absolute -top-2 -right-2 bg-canvas-deeper text-navy text-xs font-bold px-2 py-1 rounded-full animate-bounce">
 세금?!
 </div>
 )}
 {mood === "cool" && (
 <div className="absolute -bottom-2 -left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
 FLEX
 </div>
 )}
 </div>
 );
};

export default function SalaryCalculator() {
 const router = useRouter();
 const pathname = usePathname();
 const [offerHandoffError, setOfferHandoffError] = useState(false);
 const [incomeType, setIncomeType] = useState<IncomeType>("regular");
 const [payBasis, setPayBasis] = useState<"annual" | "monthly">("annual");
 const [severanceType] = useState<"separate" | "included">("separate");
 const [salaryInput, setSalaryInput] = useState("50,000,000");
 const [nonTaxableAmount, setNonTaxableAmount] = useState("200000");
 const [dependents, setDependents] = useState(1);
 const [children, setChildren] = useState(0);
 const [monthlyExpenses] = useState("");

 // Phase 1: Interstitial State
 const [isCalculating, setIsCalculating] = useState(false);
 const [showResult, setShowResult] = useState(false);

 const [result, setResult] = useState<CalculationResult>({
 monthlyNet: 0,
 totalDeduction: 0,
 pension: 0,
 health: 0,
 longTermCare: 0,
 employment: 0,
 incomeTax: 0,
 localTax: 0,
 });

 // Mung's Mood State
 const [mungMood, setMungMood] = useState<"normal" | "happy" | "shocked" | "cool">("normal");

 // Load from Local Storage on Mount
 // getItem 자체도 try 안 — 프라이버시 모드/사이트 데이터 차단 브라우저는
 // localStorage 접근만으로 SecurityError 를 던진다 (FavoritesButton 패턴)
 useEffect(() => {
 try {
 const saved = localStorage.getItem("moneysalary-user-input");
 if (saved) {
 const parsed = parseSavedHomeInputs(saved);
 if (parsed) {
 setSalaryInput(parsed.salaryInput);
 setIncomeType(parsed.incomeType);
 setPayBasis(parsed.payBasis);
 setDependents(parsed.dependents);
 setChildren(parsed.children);
 setNonTaxableAmount(parsed.nonTaxableAmount);
 }
 }
 } catch {
 // Saved input text and parser errors can contain financial values. Do not log them.
 }
 }, []);

 // Save to Local Storage - DEBOUNCED to prevent constant write/re-render cycles
 useEffect(() => {
 const timer = setTimeout(() => {
 const dataToSave = {
 salaryInput,
 incomeType,
 payBasis,
 dependents,
 children,
 nonTaxableAmount,
 };
 try {
 localStorage.setItem("moneysalary-user-input", JSON.stringify(dataToSave));
 } catch {
 // 프라이버시 모드·용량 초과 등 저장 실패는 무시 (계산 기능과 무관)
 }
 }, 1000); // 1 second debounce
 return () => clearTimeout(timer);
 }, [salaryInput, incomeType, payBasis, dependents, children, nonTaxableAmount]);

 const annualSalary = useMemo(() => {
 const salary = parseNumber(salaryInput);
 // 프리랜서/알바 입력은 월 소득(freelancerCalculator 기준) — 연 환산해야
 // NextActions(DSR 한도)·티어카드·공유 문구가 연봉으로 올바르게 표시된다
 if (incomeType !== "regular") return salary * 12;

 let annual = payBasis === "annual" ? salary : salary * 12;
 if (severanceType === "included" && annual > 0) {
 annual = (annual / 13) * 12;
 }
 return annual;
 }, [salaryInput, payBasis, severanceType, incomeType]);

 // Pure Calculation Function (No side effects)
 const runCalculation = useCallback(() => {
 const salary = parseNumber(salaryInput);
 let newMood: "normal" | "happy" | "shocked" | "cool" = "normal";

 if (incomeType === "regular") {
 const taxResult = calculateSalary2026(annualSalary, parseNumber(nonTaxableAmount), dependents, children);
 const deductionRate = taxResult.totalDeductions / (annualSalary / 12);

 if (annualSalary >= 100_000_000) newMood = "cool";
 else if (deductionRate > 0.2) newMood = "shocked";
 else if (taxResult.netPay > 3_000_000) newMood = "happy";

 setResult({
 monthlyNet: taxResult.netPay,
 totalDeduction: taxResult.totalDeductions,
 pension: taxResult.nationalPension,
 health: taxResult.healthInsurance,
 longTermCare: taxResult.longTermCare,
 employment: taxResult.employmentInsurance,
 incomeTax: taxResult.incomeTax,
 localTax: taxResult.localIncomeTax,
 });
 } else {
 const partTimeResult = calculatePartTimeSalary(salary, incomeType);
 setResult({
 monthlyNet: partTimeResult.netPay,
 totalDeduction: partTimeResult.totalDeduction,
 pension: partTimeResult.nationalPension,
 health: partTimeResult.healthInsurance,
 longTermCare: partTimeResult.longTermCare,
 employment: partTimeResult.employmentInsurance,
 incomeTax: partTimeResult.incomeTax,
 localTax: partTimeResult.localTax,
 });
 if (partTimeResult.netPay > 2000000) newMood = "happy";
 }
 setMungMood(newMood);
 }, [annualSalary, nonTaxableAmount, dependents, children, incomeType, salaryInput]);

 // Snapshot stays local: editing inputs must not count an old visible result as success.
 const inputSnapshot = JSON.stringify([salaryInput, incomeType, payBasis, severanceType, nonTaxableAmount, dependents, children]);
 const [calculatedSnapshot, setCalculatedSnapshot] = useState<string | null>(null);
 // '결과 확인하기'를 눌렀는데 입력이 무효인 경우 — 종전에는 아무 반응이 없었다(안내문이 결과 뒤 비교기 블록 안에만 있어
 // 유효한 입력에서만 렌더되는 도달 불가 코드였음, 2026-09-11 감사). 클릭 이후에만 버튼 아래에 사유를 표시한다.
 const [invalidAttempt, setInvalidAttempt] = useState(false);
 const sharePayload = validateSalarySharePayload(incomeType === "regular"
 ? { v: 1, taxYear: 2026, incomeType, annualSalary, nonTaxableAmount: parseNumber(nonTaxableAmount), dependents, children }
 : { v: 1, taxYear: 2026, incomeType, monthlyIncome: parseNumber(salaryInput) });
 const inputsValid = isValidCalculationNumber(salaryInput, Number.MIN_VALUE) && Boolean(sharePayload) &&
 (incomeType !== "regular" || isValidCalculationNumber(nonTaxableAmount, 0));
 const currentResult = isCurrentSalaryResult({ showResult, isCalculating, inputsValid, calculatedSnapshot, inputSnapshot, result });
 const offerConditions = { annualGross: annualSalary, nonTaxableMonthly: parseNumber(nonTaxableAmount), dependents, children };
 const canHandoffOffer = canHandoffCurrentSalaryResult({ pathname, incomeType, severanceType,
 showResult, isCalculating, inputsValid, calculatedSnapshot, inputSnapshot, result, conditions: offerConditions });
 const handleOfferHandoff = () => {
 if (!canHandoffOffer) return;
 setOfferHandoffError(false);
 try {
 if (writeOfferComparisonHandoff(offerConditions, window.sessionStorage)) {
 router.push("/calc/offer-compare");
 return;
 }
 } catch { /* Accessing sessionStorage itself can fail in restricted browsers. */ }
 setOfferHandoffError(true);
 };
 const measurement = useCalculatorMeasurement({
 calcType: "salary",
 valid: currentResult,
 resultKey: result,
 onSuccess: () => {
 // Preserve configured Ads conversion, once on a real successful result, with no money values.
 const adsId = process.env.NEXT_PUBLIC_ADS_ID;
 const label = process.env.NEXT_PUBLIC_CONVERSION_LABEL_CALCULATION;
 if (adsId && label && typeof window.gtag === "function") {
 trackEvent("conversion", { send_to: `${adsId}/${label}` });
 }
 },
 });

 const invalidReason = !isValidCalculationNumber(salaryInput, Number.MIN_VALUE)
 ? "소득 금액을 0보다 크게 입력해 주세요 (연 환산 1조 원 이하)."
 : incomeType === "regular" && parseNumber(nonTaxableAmount) > annualSalary / 12
 ? "월 비과세액이 세전 월급보다 클 수 없습니다. 비과세액을 줄여 주세요."
 : incomeType === "regular" && children > dependents - 1
 ? "자녀 수는 본인을 뺀 부양가족 수를 넘을 수 없습니다. 부양가족 수를 먼저 늘려 주세요."
 : "양수 소득(연 환산 1조 원 이하)을 입력해 주세요. 직장인은 월 비과세가 세전 월급 이하여야 하며, 공제 대상 자녀를 본인 포함 부양가족 수에도 포함해 주세요.";
 const handleCalculateClick = () => {
 if (!inputsValid) { setInvalidAttempt(true); return; }
 setInvalidAttempt(false);
 setIsCalculating(true);
 setCalculatedSnapshot(inputSnapshot);
 runCalculation();
 };

 const handleInterstitialClose = () => {
 setIsCalculating(false);
 setShowResult(true);

 setTimeout(() => {
 const resultElement = document.getElementById("calculation-result");
 if (resultElement) {
 resultElement.scrollIntoView({ behavior: "smooth", block: "center" });
 import("canvas-confetti").then(({ default: confetti }) => {
 confetti({
 particleCount: 150,
 spread: 70,
 origin: { y: 0.7 },
 colors: ['#0145F2', '#EDF1F5', '#0145F280'], // Trust Blue & Gold
 zIndex: 9999,
 });
 });
 }
 }, 100);
 };

 // ... (Handlers for Seniors/Disabled omitted for brevity but logic remains in state if needed for future extension, keeping UI cleaner for now as per design)
 // Re-adding essential handlers if specific inputs are exposed
 const handleSaveData = () => {
 if (!currentResult) {
 alert("입력값이 바뀌었거나 올바르지 않습니다. 다시 계산한 뒤 저장해 주세요.");
 return;
 }
 if (incomeType !== "regular") {
 alert("정규직 소득만 대시보드에 저장할 수 있습니다.");
 return;
 }
 try {
 const existingDataJSON = localStorage.getItem("moneysalary-financial-data");
 const existingData: unknown = existingDataJSON
 ? JSON.parse(existingDataJSON)
 : { lastUpdated: new Date().toISOString() };
 const salaryDataToStore: StoredSalaryData = {
 annualSalary,
 monthlyNet: result.monthlyNet,
 payBasis,
 severanceType,
 nonTaxableAmount: parseNumber(nonTaxableAmount),
 dependents,
 children,
 };
 const updatedData = mergeSalarySnapshot(existingData, salaryDataToStore, new Date().toISOString());
 localStorage.setItem("moneysalary-financial-data", JSON.stringify(updatedData));
 alert("연봉 정보가 대시보드에 저장되었습니다!");
 router.push("/dashboard");
 } catch {
 alert("데이터 저장에 실패했습니다.");
 }
 };

 // The URL is only passed to the result opt-in panel. Its default page share is amount-free.
 const shareToken = currentResult ? encodeSalarySharePayload(sharePayload) : null;
 const shareUrl = shareToken ? `https://www.moneysalary.com/share/${shareToken}` : undefined;

 // 공유 카드 문구·썸네일 — 단톡방 클릭률을 높이는 호기심 훅 + 실제 금액 OG 이미지
 const shareMeta = useMemo(() => {
 const netManwon = Math.round(result.monthlyNet / 10000).toLocaleString("ko-KR");
 const annualManwon = Math.round(annualSalary / 10000).toLocaleString("ko-KR");
 const origin = typeof window !== "undefined" ? window.location.origin : "";
 return {
 title: `${incomeType === "regular" ? "연봉" : "월 소득의 연 환산"} ${annualManwon}만원 · 월 수령 추정 ${netManwon}만원`,
 description: incomeType === "freelancer" ? "월 사업소득 3.3% 원천징수 추정입니다. 최종 종합소득세와 다릅니다." : "2026년 계산 모델의 추정액입니다. 실제 급여명세서·최종 세액과 다를 수 있습니다.",
 imageUrl: `${origin}/api/og?type=salary&amount=${annualSalary}&net=${result.monthlyNet}`,
 };
 }, [annualSalary, result.monthlyNet, incomeType]);

 const [activeSheet, setActiveSheet] = useState<"dependents" | "children" | "nonTaxable" | null>(null);

 return (
 <div className="w-full space-y-6">
 <LoadingInterstitial isOpen={isCalculating} onClose={handleInterstitialClose} />

 {/* ── Row 1: 입력 + 실수령 결과 나란히 ──────────────────────── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

 {/* 왼쪽: 입력 패널 */}
 <div {...measurement.inputProps} className="bg-white rounded-3xl border border-canvas shadow-sm p-6 space-y-5">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <span className="bg-canvas text-primary text-xs font-bold px-3 py-1 rounded-full">2026 세법 적용</span>
 <Sparkles size={14} className="text-primary" />
 </div>
 <h2 className="text-xl font-black text-navy tracking-tight">얼마나 받으시나요?</h2>
 </div>

 <MoneyInput
 label={incomeType === "regular" ? (payBasis === "annual" ? "계약 연봉" : "세전 월급") : "지급 총액"}
 value={salaryInput}
 onValueChange={setSalaryInput}
 />

 {/* 직장인/프리랜서/알바 탭 */}
 <div className="p-1 bg-canvas-dark rounded-2xl flex">
 {(["regular", "freelancer", "part_time"] as const).map((type) => (
 <button
 key={type}
 onClick={() => setIncomeType(type)}
 className={cn(
 "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
 incomeType === type ? "bg-white text-navy shadow-sm" : "text-faint-blue hover:text-muted-blue"
 )}
 >
 {type === "regular" ? "직장인" : type === "freelancer" ? "프리랜서" : "알바"}
 </button>
 ))}
 </div>

 {incomeType === "regular" && (
 <>
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => setPayBasis(payBasis === "annual" ? "monthly" : "annual")}
 className="flex items-center justify-center gap-1.5 py-3 bg-canvas border border-canvas rounded-xl text-sm font-bold text-muted-blue hover:border-primary hover:text-primary transition-all"
 >
 <Calculator size={15} className="text-faint-blue" />
 {payBasis === "annual" ? "연봉 기준" : "월급 기준"}
 </button>
 <button
 onClick={() => setActiveSheet("nonTaxable")}
 className="flex items-center justify-center gap-1.5 py-3 bg-canvas border border-canvas rounded-xl text-sm font-bold text-muted-blue hover:border-primary hover:text-primary transition-all"
 >
 <Zap size={15} className="text-primary" />
 비과세 {formatNumber(parseNumber(nonTaxableAmount))}
 </button>
 </div>

 <div className="grid grid-cols-2 gap-3 bg-canvas rounded-2xl p-4">
 <div>
 <p className="text-xs font-bold text-faint-blue mb-2">부양가족 수 (본인 포함)</p>
 <div className="flex items-center gap-2">
 <button onClick={() => setDependents(Math.max(1, dependents - 1))} className="w-8 h-8 rounded-full bg-white border border-canvas text-muted-blue font-bold flex items-center justify-center hover:bg-canvas-dark transition-colors">−</button>
 <span className="font-bold text-navy text-base w-6 text-center">{dependents}</span>
 <button onClick={() => setDependents(Math.min(10, dependents + 1))} className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
 </div>
 </div>
 <div>
 <p className="text-xs font-bold text-faint-blue mb-2">8세~20세 자녀</p>
 <div className="flex items-center gap-2">
 <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full bg-white border border-canvas text-muted-blue font-bold flex items-center justify-center hover:bg-canvas-dark transition-colors">−</button>
 <span className="font-bold text-navy text-base w-6 text-center">{children}</span>
 <button onClick={() => setChildren(Math.min(10, children + 1))} className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center hover:bg-primary/90 transition-colors">+</button>
 </div>
 </div>
 </div>
 </>
 )}

 <button
 onClick={handleCalculateClick}
 aria-describedby={invalidAttempt && !inputsValid ? "salary-invalid-hint" : undefined}
 className="w-full h-13 py-3.5 bg-primary rounded-2xl text-base font-black hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
 >
 <Zap size={18} className="text-white" />
 <span className="text-white">결과 확인하기</span>
 </button>
 {invalidAttempt && !inputsValid && (
 <p id="salary-invalid-hint" role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">{invalidReason}</p>
 )}
 </div>

 {/* 오른쪽: 실수령액 결과 */}
 <div>
 {!showResult ? (
 <div className="bg-white rounded-3xl border border-canvas shadow-sm p-8 flex flex-col items-center justify-center min-h-[280px] text-center gap-4">
 <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-4xl">🥔</div>
 <div>
 <p className="font-bold text-muted-blue mb-1">연봉을 입력하세요</p>
 <p className="text-faint-blue text-sm">결과 확인하기를 누르면<br/>실수령액이 바로 계산됩니다</p>
 </div>
 </div>
 ) : (
 <motion.div
 id="calculation-result"
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.35 }}
 className="space-y-4"
 >
 {!currentResult && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">아래는 이전 계산 결과입니다. 입력값을 확인하고 다시 계산해 주세요.</p>}
 {/* 마스코트 + 결과 카드 */}
 <div ref={measurement.resultRef} className="relative pt-10">
 <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
 <MungMascot mood={mungMood} />
 </div>
 <SalaryResultCard
 monthlyNet={result.monthlyNet}
 totalDeduction={result.totalDeduction}
 breakdown={{
 pension: result.pension,
 health: result.health,
 longTermCare: result.longTermCare,
 employment: result.employment,
 incomeTax: result.incomeTax,
 localTax: result.localTax,
 }}
 />
 </div>

 {/* 다음 액션 3 CTA — 결과 컨텍스트 인식형 */}
 <NextActions annualSalary={currentResult ? annualSalary : undefined} category="salary" />

 {canHandoffOffer && (
 <div className="rounded-2xl border border-canvas bg-white p-4">
 <button type="button" onClick={handleOfferHandoff} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90">
 현재 조건을 비교기에 가져오기 <ArrowRight size={16} aria-hidden="true" />
 </button>
 <p className="mt-2 text-xs text-faint-blue">현재 연봉·비과세·가족 조건을 같은 탭에서 한 번 전달합니다. 비교기에서 확인 후 적용할 수 있어요.</p>
 {offerHandoffError && <p role="alert" className="mt-2 text-sm text-red-700">브라우저에서 조건을 전달하지 못했습니다. <Link href="/calc/offer-compare" className="underline">비교기에 직접 입력하기</Link></p>}
 </div>
 )}

 {/* 결과 직하 광고 — CTR 최고 구간 */}
 <ResultAd />

 {/* 관련 계산기 cross-link — 위 NextActions(salary 3종)와 같은 대상은 빼고 채움(4개 유지, S2-3) */}
 <RelatedCalculators currentPath="/" title="이런 계산기도 함께 보세요" exclude={HOME_NEXT_ACTION_HREFS} />

 {/* 공유/저장 */}
 <div className="bg-white border border-canvas rounded-2xl p-4 flex flex-col items-center gap-3">
 <p className="text-sm font-bold text-muted-blue">결과 공유하기</p>
 {currentResult && shareUrl ? <ResultSharePanel
 resultKey={inputSnapshot}
 pageUrl="https://www.moneysalary.com/"
 pageTitle="2026 연봉 실수령액 계산기 | 머니샐러리"
 pageDescription="소득 조건을 직접 입력해 월 수령액을 계산해 보세요."
 previewDescription={incomeType === "regular" ? `결과 링크에 연봉 ${formatNumber(annualSalary)}원, 월 비과세액 ${formatNumber(parseNumber(nonTaxableAmount))}원, 본인 포함 부양가족 ${dependents}명, 공제 대상 자녀 ${children}명이 포함됩니다. 받은 사람은 이를 복원할 수 있습니다. 공유 카드에는 연봉과 월 수령 추정액이 표시됩니다.` : `결과 링크에 ${incomeType === "freelancer" ? "프리랜서" : "알바"} 소득 유형과 세전 월 소득 ${formatNumber(parseNumber(salaryInput))}원이 포함됩니다. 받은 사람은 이를 복원할 수 있습니다. 공유 카드에는 연 환산 소득과 월 수령 추정액이 표시됩니다.`}
 url={shareUrl}
 title={shareMeta.title}
 description={shareMeta.description}
 imageUrl={shareMeta.imageUrl}
 contentType="salary_result"
 /> : <p role="status" className="text-sm text-muted-blue">현재 입력으로 다시 계산하면 결과 공유와 저장을 이용할 수 있습니다.</p>}
 <button onClick={handleSaveData} disabled={!currentResult || incomeType !== "regular"} className="w-full py-3 bg-white border border-canvas rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-canvas active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
 <CheckCircle size={16} className="text-navy" />
 <span className="text-navy">대시보드에 저장하기</span>
 </button>
 <p className="text-xs text-faint-blue">정규직의 현재 계산만 이 브라우저에 저장합니다. 입력하지 않은 지출은 미입력으로 저장됩니다.</p>
 {/* 공유(비교 심리) 맥락과 이어지는 다음 행동 */}
 <Link
 href="/company/compare"
 className="inline-flex items-center gap-1 text-xs font-bold text-electric hover:underline"
 >
 친구 회사 연봉은? 두 회사 비교하기
 <ArrowRight size={12} aria-hidden />
 </Link>
 </div>
 </motion.div>
 )}
 </div>
 </div>

 {/* ── Row 2+3: 보조 패널 (결과 있을 때만) ────────────────────── */}
 {currentResult && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 className="space-y-5"
 >
 {/* Row 2: 티어 카드(왼) + 자산 성장 시뮬레이션(오) */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 {/* 연봉 티어 카드 */}
 <div className="bg-white rounded-3xl border border-canvas shadow-sm p-5">
 <SalaryTierCard annualSalary={annualSalary} />
 {/* 티어 확인 직후 — 상위 % 심리를 회사 DB·순위로 연결 */}
 <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
 <Link
 href="/salary-db/ranking"
 className="inline-flex items-center gap-1 text-xs font-bold text-electric hover:underline"
 >
 이 티어 연봉 주는 회사 보기
 <ArrowRight size={12} aria-hidden />
 </Link>
 <Link
 href="/fun/salary-rank"
 className="inline-flex items-center gap-1 text-xs font-bold text-electric hover:underline"
 >
 또래 중 내 연봉 순위는?
 <ArrowRight size={12} aria-hidden />
 </Link>
 </div>
 </div>

 {/* 자산 성장 시뮬레이션 */}
 <div className="bg-white rounded-3xl border border-canvas shadow-sm p-5">
 <p className="text-sm font-black text-navy mb-4 flex items-center gap-2">
 <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
 자산 성장 시뮬레이션
 </p>
 <WealthChart monthlyNetSalary={result.monthlyNet} />
 </div>
 </div>

 {/* Row 3: 월급 상세 분석 — 전체 너비 */}
 <div className="bg-white rounded-3xl border border-canvas shadow-sm p-6">
 <p className="text-sm font-black text-navy mb-4 flex items-center gap-2">
 <span className="w-1.5 h-4 bg-primary rounded-full inline-block" />
 월급 상세 분석
 </p>
 <DetailedAnalysis
 annualSalary={annualSalary}
 result={result}
 monthlyExpenses={parseNumber(monthlyExpenses)}
 />
 </div>
 </motion.div>
 )}

 {/* Bottom Sheet: 비과세 설정 */}
 <BottomSheet isOpen={activeSheet === "nonTaxable"} onClose={() => setActiveSheet(null)} title="비과세액 설정">
 <div className="p-8 space-y-6">
 <MoneyInput label="월 비과세액" value={nonTaxableAmount} onValueChange={setNonTaxableAmount} />
 <button onClick={() => setActiveSheet(null)} className="w-full py-4 bg-primary font-black rounded-2xl flex items-center justify-center">
 <span className="text-white">저장 후 닫기</span>
 </button>
 </div>
 </BottomSheet>
 </div>
 );
}
