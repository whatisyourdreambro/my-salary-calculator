"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 ResponsiveContainer,
 LabelList,
 Cell,
} from "recharts";
import type { SalaryData } from "@/lib/generateData";
import { AdvancedSettings } from "@/app/types";
import SalaryTable from "@/components/SalaryTable";
import TableInteraction from "@/components/TableInteraction";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Calculator, CheckCircle2, TrendingDown } from "lucide-react";

const CustomBarLabel = (props: any) => {
 const { x, y, width, value } = props;
 return (
 <text
 x={x + width / 2}
 y={y}
 fill="#7A9AB5"
 dy={-6}
 textAnchor="middle"
 fontSize={11}
 fontWeight="700"
 >
 {`${value}%`}
 </text>
 );
};

interface InteractiveTableProps {
 allData: SalaryData[];
 tableHeaders: { key: string; label: string }[];
 highlightRows: number[];
 totalPages: number;
 paginatedData: SalaryData[];
 calculationFn: (
 salary: number,
 nonTaxable: number,
 dependents: number,
 children: number,
 settings: AdvancedSettings
 ) => any;
 pageConfig: {
 title: string;
 basePath: string;
 searchPlaceholder: string;
 salaryLabel: string;
 salaryMin: number;
 salaryMax: number;
 salaryStep: number;
 defaultSalary: number;
 };
}

export default function InteractiveTable({
 allData,
 tableHeaders,
 highlightRows,
 calculationFn,
 pageConfig,
}: Omit<InteractiveTableProps, "totalPages" | "paginatedData">) {
 const searchParams = useSearchParams();
 const page = parseInt(searchParams.get("page") || "1", 10);
 const searchTerm = searchParams.get("searchTerm") || "";
 const itemsPerPage = 100;

 const filteredData = useMemo(() =>
 searchTerm
 ? allData.filter((row) =>
 row.preTax.toString().includes(searchTerm.replace(/,/g, ""))
 )
 : allData,
 [allData, searchTerm]);

 const totalPages = Math.ceil(filteredData.length / itemsPerPage);
 const paginatedData = filteredData.slice(
 (page - 1) * itemsPerPage,
 page * itemsPerPage
 );

 const [salary, setSalary] = useState(pageConfig.defaultSalary);
 const [dependents, setDependents] = useState(1);
 const [nonTaxableAmount, setNonTaxableAmount] = useState(200000);
 const [isSmeYouth, setIsSmeYouth] = useState(false);

 const advancedSettings: AdvancedSettings = {
 isSmeYouth,
 disabledDependents: 0,
 seniorDependents: 0,
 };

 const result = useMemo(() =>
 calculationFn(salary, nonTaxableAmount, dependents, 0, advancedSettings),
 [salary, nonTaxableAmount, dependents, isSmeYouth]); // eslint-disable-line

 const totalDeductions = result.totalDeduction;

 const chartData = useMemo(() => [
 { name: "국민연금", value: parseFloat(((result.pension / totalDeductions) * 100).toFixed(1)), color: "#0145F2" },
 { name: "건강보험", value: parseFloat(((result.health / totalDeductions) * 100).toFixed(1)), color: "#3D7FF5" },
 { name: "고용보험", value: parseFloat(((result.employment / totalDeductions) * 100).toFixed(1)), color: "#7AADF5" },
 { name: "소득세", value: parseFloat((((result.incomeTax + result.localTax) / totalDeductions) * 100).toFixed(1)), color: "#A8BCCD" },
 ], [result, totalDeductions]);

 const deductionRate = totalDeductions / result.monthlyNet;

 return (
 <div className="w-full mx-auto py-12 sm:py-16 -mt-4">

 {/* 시뮬레이션 섹션 */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 px-0 sm:px-4 lg:px-0">

 {/* === 입력 패널 === */}
 <motion.div
 className="lg:col-span-2 toss-card p-7 sm:p-10"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.6 }}
 >
 <h2 className="text-2xl font-bold tracking-tight mb-8 text-navy flex items-center gap-3">
 <span className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-canvas 900/30 text-electric">
 <Calculator className="w-5 h-5" />
 </span>
 {pageConfig.title}
 </h2>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
 <div className="space-y-8">
 {/* 연봉 슬라이더 */}
 <div className="space-y-3">
 <div className="flex justify-between items-baseline">
 <Label htmlFor="salary" className="text-sm font-bold text-faint-blue uppercase tracking-wider">
 {pageConfig.salaryLabel}
 </Label>
 <span className="text-2xl font-black text-navy tabular-nums">
 {salary.toLocaleString('ko-KR')}
 <span className="text-base text-faint-blue font-semibold ml-1">원</span>
 </span>
 </div>
 <Slider
 id="salary"
 min={pageConfig.salaryMin}
 max={pageConfig.salaryMax}
 step={pageConfig.salaryStep}
 value={[salary]}
 onValueChange={(v) => setSalary(v[0])}
 className="py-2 cursor-pointer"
 />
 </div>

 {/* 부양가족 슬라이더 */}
 <div className="space-y-3">
 <div className="flex justify-between items-baseline">
 <Label htmlFor="dependents" className="text-sm font-bold text-faint-blue uppercase tracking-wider">
 부양가족
 </Label>
 <span className="text-2xl font-black text-navy tabular-nums">
 {dependents}
 <span className="text-base text-faint-blue font-semibold ml-1">명</span>
 </span>
 </div>
 <Slider
 id="dependents"
 min={1}
 max={10}
 step={1}
 value={[dependents]}
 onValueChange={(v) => setDependents(v[0])}
 className="py-2 cursor-pointer"
 />
 </div>

 {/* 비과세 슬라이더 */}
 <div className="space-y-3">
 <div className="flex justify-between items-baseline">
 <Label htmlFor="non-taxable" className="text-sm font-bold text-faint-blue uppercase tracking-wider">
 비과세 (월)
 </Label>
 <span className="text-2xl font-black text-navy tabular-nums">
 {nonTaxableAmount.toLocaleString('ko-KR')}
 <span className="text-base text-faint-blue font-semibold ml-1">원</span>
 </span>
 </div>
 <Slider
 id="non-taxable"
 min={0}
 max={1000000}
 step={100000}
 value={[nonTaxableAmount]}
 onValueChange={(v) => setNonTaxableAmount(v[0])}
 className="py-2 cursor-pointer"
 />
 </div>

 {/* 중소기업 토글 */}
 <div className="flex items-center justify-between p-5 bg-canvas /50 rounded-[16px] border border-canvas ">
 <Label htmlFor="sme-youth" className="text-sm font-bold text-muted-blue cursor-pointer">
 중소기업 청년 감면 적용
 </Label>
 <Switch id="sme-youth" checked={isSmeYouth} onCheckedChange={setIsSmeYouth} />
 </div>
 </div>

 {/* 차트 */}
 <div className="bg-canvas /40 rounded-[20px] p-6 border border-canvas flex flex-col justify-center">
 <h4 className="text-xs font-black text-faint-blue mb-5 text-center uppercase tracking-widest">
 공제 비율 분석
 </h4>
 <div className="h-56 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={28}>
 <XAxis
 dataKey="name"
 stroke="#cbd5e1"
 fontSize={11}
 tickLine={false}
 axisLine={false}
 dy={8}
 />
 <Tooltip
 cursor={{ fill: "rgba(0,0,0,0.03)" }}
 contentStyle={{
 backgroundColor: "#fff",
 borderColor: "#e2e8f0",
 borderRadius: "14px",
 color: "#3D5E78",
 fontSize: "13px",
 fontWeight: 600,
 boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
 }}
 formatter={(value: number) => [`${value}%`, "비중"]}
 />
 <Bar dataKey="value" radius={[6, 6, 0, 0]}>
 {chartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 <LabelList dataKey="value" content={<CustomBarLabel />} />
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </motion.div>

 {/* === 결과 패널 (스티키) === */}
 <div className="space-y-4 lg:sticky lg:top-24">
 {/* 실수령액 카드 */}
 <motion.div
 className="rounded-[24px] bg-primary p-8 shadow-primary-lg relative overflow-hidden"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, delay: 0.1 }}
 >
 {/* 내부 글로우 */}
 <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] pointer-events-none bg-white/10" />

 <p className="text-xs font-black uppercase tracking-widest mb-3 relative z-10 text-white/70">
 예상 월 실수령액
 </p>
 <p className="text-5xl font-black tracking-tight tabular-nums relative z-10 text-white">
 {result.monthlyNet.toLocaleString('ko-KR')}
 <span className="text-2xl ml-1 font-semibold text-white/70">원</span>
 </p>

 <div className="mt-6 pt-5 space-y-2.5 text-sm font-medium relative z-10 border-t border-white/20">
 <div className="flex justify-between items-center">
 <span className="text-white/70">세전 (월환산)</span>
 <span className="font-bold tabular-nums text-white">{Math.round(salary / 12).toLocaleString('ko-KR')}원</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-white/70">총 공제액</span>
 <span className="font-bold tabular-nums text-white/80">
 <TrendingDown className="inline w-3.5 h-3.5 mr-1" />
 {result.totalDeduction.toLocaleString('ko-KR')}원
 </span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-white/70">공제율</span>
 <span className="font-bold tabular-nums text-white">{(deductionRate * 100).toFixed(1)}%</span>
 </div>
 </div>
 </motion.div>

 {/* 상세 공제 내역 */}
 <motion.div
 className="toss-card p-6"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 >
 <h3 className="text-sm font-black text-navy 100 mb-4 flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 text-electric" />
 상세 공제 내역
 </h3>
 <div className="space-y-2">
 {[
 { label: "국민연금", val: result.pension, color: "#0145F2" },
 { label: "건강보험", val: result.health, color: "#3D7FF5" },
 { label: "장기요양", val: result.longTermCare, color: "#7AADF5" },
 { label: "고용보험", val: result.employment, color: "#A8BCCD" },
 { label: "소득세", val: result.incomeTax, color: "#3D5E78" },
 { label: "지방소득세", val: result.localTax, color: "#7A9AB5" },
 ].map((item) => (
 <div key={item.label} className="flex justify-between items-center py-2 border-b border-canvas last:border-0">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
 <span className="text-[13px] font-semibold text-faint-blue">{item.label}</span>
 </div>
 <span className="text-[13px] font-bold text-navy tabular-nums">
 -{item.val.toLocaleString('ko-KR')}원
 </span>
 </div>
 ))}
 </div>
 </motion.div>

 {/* 사이드 광고 */}
 </div>
 </div>

 {/* 테이블 중간 광고 */}
 

 {/* 전체 테이블 섹션 */}
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 whileInView={{ opacity: 1, y: 0 }}
 viewport={{ once: true }}
 transition={{ duration: 0.6 }}
 >
 <div className="mb-6">
 <TableInteraction
 totalPages={totalPages}
 basePath={pageConfig.basePath}
 searchPlaceholder={pageConfig.searchPlaceholder}
 />
 </div>

 <SalaryTable
 headers={tableHeaders}
 data={paginatedData}
 highlightRows={highlightRows}
 unit="원"
 adInterval={15}
 />
 </motion.div>
 </div>
 );
}
