// src/app/report/page.tsx

"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import PageFooterAds from "@/components/PageFooterAds";
import type { StoredFinancialData } from "@/app/types";
// [수정] findSalaryRank -> calculateRank 로 변경
import { calculateRank } from "@/lib/salaryData";
import Link from "next/link";
import CountUp from "react-countup";
import { Info, BarChart2, TrendingUp } from "lucide-react";

// 리포트 차트(recharts)는 지연 로드 — recharts가 무거워 First Load 에서 제외.
const chartLoading = () => (
 <div className="h-full w-full animate-pulse rounded-xl bg-canvas-100" />
);
const AnnualCompositionPieChart = dynamic(
 () => import("@/components/charts/ReportCharts").then((m) => m.AnnualCompositionPieChart),
 { ssr: false, loading: chartLoading }
);
const FutureProjectionBarChart = dynamic(
 () => import("@/components/charts/ReportCharts").then((m) => m.FutureProjectionBarChart),
 { ssr: false, loading: chartLoading }
);

const formatNumber = (num: number) => num.toLocaleString('ko-KR');

const Report = () => {
 const [data, setData] = useState<StoredFinancialData | null>(null);
 const [rank, setRank] = useState<number | null>(null);
 const reportRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 try {
 const savedData = localStorage.getItem("moneysalary-financial-data");
 if (savedData) {
 const parsedData = JSON.parse(savedData);
 setData(parsedData);
 if (parsedData.salary) {
 // [수정] findSalaryRank -> calculateRank 로 변경
 const { rank: calculatedRank } = calculateRank(
 parsedData.salary.annualSalary,
 "all-all-all-all"
 );
 setRank(calculatedRank);
 }
 }
 } catch (e) {
 console.error("Failed to load data from localStorage", e);
 }
 }, []);

 const handleDownload = async () => {
 if (reportRef.current) {
 const { default: html2canvas } = await import("html2canvas");
 html2canvas(reportRef.current, {
 backgroundColor: null,
 scale: 2,
 }).then((canvas) => {
 const link = document.createElement("a");
 link.download = `Moneysalary_종합금융리포트.png`;
 link.href = canvas.toDataURL("image/png");
 link.click();
 });
 }
 };

 if (!data) {
 return (
 <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
 <h1 className="text-3xl font-bold">리포트 데이터를 불러오는 중...</h1>
 <p className="mt-4">
 저장된 금융 정보가 없습니다.{" "}
 <Link href="/" className="text-primary font-bold">
 홈으로 돌아가
 </Link>{" "}
 계산 결과를 먼저 저장해주세요.
 </p>
 </main>
 );
 }

 const { salary, severance, homeLoan, futureSalary } = data;
 const netAnnual = salary ? salary.monthlyNet * 12 : 0;
 const totalDeduction = salary ? salary.annualSalary - netAnnual : 0;

 const financialRatios = {
 netToGrossRatio:
 salary && salary.annualSalary > 0
 ? ((netAnnual / salary.annualSalary) * 100).toFixed(1)
 : 0,
 debtToIncomeRatio:
 homeLoan && salary && salary.annualSalary > 0
 ? (
 ((homeLoan.monthlyPayment * 12) / salary.annualSalary) *
 100
 ).toFixed(1)
 : 0,
 };

 const annualCompositionData = [
 { name: "실수령액", value: netAnnual },
 { name: "세금/보험료", value: totalDeduction },
 ].filter((item) => item.value > 0);

 const futureProjectionData =
 futureSalary && salary && futureSalary.years > 0
 ? Array.from({ length: futureSalary.years + 1 }, (_, i) => {
 const year = new Date().getFullYear() + i;
 const baseSalary = salary.annualSalary;
 const finalSalary = futureSalary.finalSalary;
 const estimatedSalary =
 baseSalary + ((finalSalary - baseSalary) / futureSalary.years) * i;
 return { year, "내 연봉": Math.round(estimatedSalary) };
 })
 : [];

 return (
 <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
 <div
 ref={reportRef}
 className="bg-light-card p-8 rounded-2xl shadow-lg border"
 >
 <div className="text-center border-b pb-4 mb-6">
 <h1 className="text-4xl font-bold text-primary">종합 금융 리포트</h1>
 <p className="text-sm text-faint-blue">
 Moneysalary | 최종 업데이트:{" "}
 {new Date(data.lastUpdated).toLocaleString('ko-KR')}
 </p>
 </div>

 {/* Section 1: Key Metrics */}
 <section className="mb-8">
 <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
 <Info className="text-primary" />
 핵심 지표 요약
 </h2>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
 {salary && (
 <div className="p-3 bg-canvas/50 rounded-xl">
 <p className="text-sm font-semibold text-muted-blue ">
 월 실수령액
 </p>
 <p className="text-2xl font-bold text-primary">
 <CountUp end={salary.monthlyNet} separator="," />원
 </p>
 </div>
 )}
 {rank !== null && (
 <div className="p-3 bg-canvas/50 rounded-xl">
 <p className="text-sm font-semibold text-muted-blue ">
 연봉 순위
 </p>
 <p className="text-2xl font-bold">상위 {rank}%</p>
 </div>
 )}
 {severance && (
 <div className="p-3 bg-canvas/50 rounded-xl">
 <p className="text-sm font-semibold text-muted-blue ">
 예상 퇴직금
 </p>
 <p className="text-2xl font-bold">
 <CountUp
 end={severance.estimatedSeverancePay}
 separator=","
 />
 원
 </p>
 </div>
 )}
 {homeLoan && (
 <div className="p-3 bg-canvas/50 rounded-xl">
 <p className="text-sm font-semibold text-muted-blue ">
 월 상환액
 </p>
 <p className="text-2xl font-bold text-danger">
 <CountUp end={homeLoan.monthlyPayment} separator="," />원
 </p>
 </div>
 )}
 </div>
 </section>

 {/* Section 2: Annual Income Breakdown */}
 {salary && (
 <section className="mb-8">
 <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
 <BarChart2 className="text-primary" />
 연간 소득 분석 (세전 {formatNumber(salary.annualSalary)}원)
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
 <div className="h-56">
 <AnnualCompositionPieChart data={annualCompositionData} />
 </div>
 <div className="text-sm space-y-2">
 <div className="flex justify-between p-2 bg-canvas/50 rounded">
 <span>실수령액 비중:</span>
 <strong className="text-primary">
 {financialRatios.netToGrossRatio}%
 </strong>
 </div>
 {homeLoan && (
 <div className="flex justify-between p-2 bg-canvas/50 rounded">
 <span>소득 대비 부채 비율(DTI):</span>
 <strong className="text-danger">
 {financialRatios.debtToIncomeRatio}%
 </strong>
 </div>
 )}
 <p className="text-xs text-faint-blue p-2">
 소득 대비 부채 비율이 40%를 초과할 경우 재정적 위험이 높을 수
 있습니다.
 </p>
 </div>
 </div>
 </section>
 )}

 {/* Section 3: Future Projection */}
 {futureSalary && (
 <section>
 <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
 <TrendingUp className="text-primary" />
 {futureSalary.years}년 후 미래 연봉 예측
 </h2>
 <div className="h-64">
 <FutureProjectionBarChart data={futureProjectionData} />
 </div>
 </section>
 )}
 </div>
 <div className="mt-8 flex flex-col sm:flex-row gap-4">
 <button
 onClick={handleDownload}
 className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition"
 >
 리포트 이미지로 저장하기
 </button>
 <Link
 href="/dashboard"
 className="w-full text-center py-3 bg-canvas-deeper font-semibold rounded-lg hover:bg-gray-300 transition"
 >
 대시보드로 돌아가기
 </Link>
 </div>
 </main>
 );
};

export default function ReportPage() {
 return (
 <Suspense fallback={<div>Loading Report...</div>}>
 <Report />
 <PageFooterAds maxWidth="4xl" />
 </Suspense>
 );
}
