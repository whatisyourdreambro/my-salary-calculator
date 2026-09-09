// src/components/HomeLoanSimulator.tsx

"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import type { StoredFinancialData, StoredHomeLoanData } from "@/app/types";
import { useRouter } from "next/navigation";
import Link from "@/components/AppLink";
import { calculateHomeLoanRepayment, type HomeLoanRepaymentType } from "@/lib/homeLoanRepayment";

const formatNumber = (num: number) => num.toLocaleString('ko-KR');
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

type UserType = "none" | "newlywed" | "firstTimeBuyer";

export default function HomeLoanSimulator() {
 const [homePrice, setHomePrice] = useState("600,000,000");
 const [downPayment, setDownPayment] = useState("120,000,000");
 const [loanTerm, setLoanTerm] = useState(30);
 const [interestRate, setInterestRate] = useState(4.5);
 const [annualIncome, setAnnualIncome] = useState("60,000,000");

 const [userType, setUserType] = useState<UserType>("none");
 const [repaymentType, setRepaymentType] = useState<HomeLoanRepaymentType>(
 "equalPrincipalAndInterest"
 );

 const router = useRouter();

 const { monthlyPayment, totalInterest, totalPayment } = useMemo(
 () => calculateHomeLoanRepayment(
 parseNumber(homePrice) - parseNumber(downPayment), interestRate, loanTerm, repaymentType,
 ), [homePrice, downPayment, interestRate, loanTerm, repaymentType]);
 const loanSuggestion = monthlyPayment <= 0
 ? "주택 가격과 자기 자본을 확인해 주세요."
 : userType === "none"
 ? "입력한 대출금리를 전 기간 고정한 상환 예시입니다. 대출 승인·한도를 심사하지 않습니다."
 : `${userType === "newlywed" ? "신혼부부" : "생애최초"} 조건은 상품별 심사가 필요합니다. 선택만으로 우대금리를 적용하지 않습니다.`;
 const income = parseNumber(annualIncome);
 const paymentIncomeRatio = income > 0 ? monthlyPayment * 12 / income * 100 : null;

 const handleSaveData = () => {
 if (monthlyPayment <= 0) {
 alert("대출 정보가 올바르지 않습니다. 입력값을 확인해주세요.");
 return;
 }
 try {
 const existingDataJSON = localStorage.getItem(
 "moneysalary-financial-data"
 );
 const existingData: StoredFinancialData = existingDataJSON
 ? JSON.parse(existingDataJSON)
 : { lastUpdated: new Date().toISOString() };
 const homeLoanDataToStore: StoredHomeLoanData = {
 monthlyPayment,
 loanSuggestion,
 };
 const updatedData: StoredFinancialData = {
 ...existingData,
 homeLoan: homeLoanDataToStore,
 lastUpdated: new Date().toISOString(),
 };
 localStorage.setItem(
 "moneysalary-financial-data",
 JSON.stringify(updatedData)
 );
 alert("주택담보대출 정보가 대시보드에 저장되었습니다!");
 router.push("/dashboard");
 } catch (error) {
 console.error("Failed to save data to localStorage:", error);
 alert("데이터 저장에 실패했습니다.");
 }
 };

 return (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
 <div className="space-y-6 bg-card p-4 sm:p-6 rounded-xl border">
 <h2 className="text-xl sm:text-2xl font-bold">대출 정보 입력</h2>
 <CurrencyInput
 label="주택 가격"
 value={homePrice}
 onValueChange={setHomePrice}
 quickAmounts={[100000000, 50000000, 10000000]}
 />
 <CurrencyInput
 label="자기 자본"
 value={downPayment}
 onValueChange={setDownPayment}
 quickAmounts={[50000000, 10000000, 5000000]}
 />
 <div>
 <label htmlFor="home-loan-term" className="text-sm font-medium">
 대출 기간: <strong>{loanTerm}년</strong>
 </label>
 <input
 id="home-loan-term"
 type="range"
 min="5"
 max="40"
 value={loanTerm}
 onChange={(e) => setLoanTerm(Number(e.target.value))}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
 />
 </div>
 <div>
 <label htmlFor="home-loan-rate" className="text-sm font-medium">
 적용할 대출금리(연): <strong>{interestRate}%</strong>
 </label>
 <input
 id="home-loan-rate"
 type="range"
 min="0"
 max="20"
 step="0.1"
 value={interestRate}
 onChange={(e) => setInterestRate(Number(e.target.value))}
 className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
 />
 <p className="mt-2 text-xs text-muted-foreground">한국은행 기준금리가 아닌 은행에서 안내받은 실제 대출금리 또는 비교할 가정 금리를 입력하세요.</p>
 </div>
 <CurrencyInput
 label="나의 세전 연소득"
 value={annualIncome}
 onValueChange={setAnnualIncome}
 quickAmounts={[10000000, 5000000, 1000000]}
 />
 <div>
 <label className="text-sm font-medium">상환 방식</label>
 <div className="flex bg-secondary rounded-lg p-1 mt-1">
 <button
 aria-pressed={repaymentType === "equalPrincipalAndInterest"}
 onClick={() => setRepaymentType("equalPrincipalAndInterest")}
 className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${
 repaymentType === "equalPrincipalAndInterest"
 ? "bg-card shadow-sm text-primary"
 : "text-muted-foreground"
 }`}
 >
 원리금 균등
 </button>
 <button
 aria-pressed={repaymentType === "equalPrincipal"}
 onClick={() => setRepaymentType("equalPrincipal")}
 className={`flex-1 p-2 rounded-md text-sm font-semibold transition-colors ${
 repaymentType === "equalPrincipal"
 ? "bg-card shadow-sm text-primary"
 : "text-muted-foreground"
 }`}
 >
 원금 균등
 </button>
 </div>
 </div>
 <div>
 <p className="text-sm font-medium">확인할 정책상품 조건 · 금리 자동 변경 없음</p>
 <div className="flex flex-col sm:flex-row gap-3 mt-1">
 <button
 aria-pressed={userType === "newlywed"}
 onClick={() =>
 setUserType(userType === "newlywed" ? "none" : "newlywed")
 }
 className={`flex-1 p-2 rounded-md text-sm font-semibold border-2 transition-colors ${
 userType === "newlywed"
 ? "border-primary bg-primary/10 text-primary"
 : "bg-secondary text-muted-foreground"
 }`}
 >
 신혼부부
 </button>
 <button
 aria-pressed={userType === "firstTimeBuyer"}
 onClick={() =>
 setUserType(
 userType === "firstTimeBuyer" ? "none" : "firstTimeBuyer"
 )
 }
 className={`flex-1 p-2 rounded-md text-sm font-semibold border-2 transition-colors ${
 userType === "firstTimeBuyer"
 ? "border-primary bg-primary/10 text-primary"
 : "bg-secondary text-muted-foreground"
 }`}
 >
 생애최초
 </button>
 </div>
 <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
 소득·자산·주택·혼인 등 자격과 적용 금리를 공식 상품 안내에서 확인한 뒤 직접 입력하세요.{" "}
 <a href="https://www.hf.go.kr/ko/sub01/sub01_01_01.do" target="_blank" rel="noopener noreferrer" className="underline">한국주택금융공사 보금자리론</a>
 </p>
 </div>
 </div>
 <div className="space-y-6 bg-primary text-primary-foreground p-4 sm:p-6 rounded-xl shadow-lg flex flex-col">
 <h2 className="text-xl sm:text-2xl font-bold text-center">📊 시뮬레이션 결과</h2>
 <div className="bg-primary-foreground/10 p-3 rounded-lg text-center font-semibold text-sm">
 {loanSuggestion}
 </div>
 <div className="bg-primary-foreground/20 p-6 rounded-lg text-center flex-grow flex flex-col justify-center">
 <p className="font-semibold text-base sm:text-lg">
 {repaymentType === "equalPrincipal" ? "첫 달 " : ""}월 상환액
 </p>
 <p className="text-3xl sm:text-4xl lg:text-5xl font-bold my-2">
 {formatNumber(Math.round(monthlyPayment))} 원
 </p>
 </div>
 <div className="text-sm space-y-2 mt-4">
 <p>계산에 사용한 대출금리: <strong>연 {interestRate}%</strong></p>
 {paymentIncomeRatio !== null && monthlyPayment > 0 && (
 <p>세전 월소득 대비 {repaymentType === "equalPrincipal" ? "첫 달 " : ""}상환액: <strong>{paymentIncomeRatio.toFixed(1)}%</strong></p>
 )}
 <p className="text-xs leading-relaxed">다른 부채·스트레스 금리·규제상 만기를 제외한 참고 비율로, DSR 심사 결과가 아닙니다. 수수료·거치기간은 계산에 포함하지 않습니다.</p>
 <div className="flex justify-between">
 <span className="opacity-80">총 예상 이자</span>
 <strong>{formatNumber(totalInterest)} 원</strong>
 </div>
 <hr className="border-primary-foreground/30 my-2" />
 <div className="flex justify-between font-bold text-lg">
 <span>총 상환 금액</span>
 <span>{formatNumber(totalPayment)} 원</span>
 </div>
 </div>
 <div className="mt-auto pt-4">
 <Link href="/tools/real-estate/dsr" className="block text-center underline mb-4 text-sm font-semibold">소득·기존 부채를 넣어 DSR 한도 따로 계산</Link>
 <button
 onClick={handleSaveData}
 className="w-full py-3 border-2 border-white bg-transparent text-white font-bold rounded-lg hover:bg-white/10 transition"
 >
 대시보드에 저장
 </button>
 </div>
 </div>
 </div>
 );
}
