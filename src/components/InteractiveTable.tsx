"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const CustomBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y} fill="#94a3b8" dy={-6} textAnchor="middle" fontSize={12} fontWeight="bold">
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

  const filteredData = searchTerm
    ? allData.filter((row) =>
      row.preTax.toString().includes(searchTerm.replace(/,/g, ""))
    )
    : allData;

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

  const result = calculationFn(
    salary,
    nonTaxableAmount,
    dependents,
    0,
    advancedSettings
  );

  const totalDeductions = result.totalDeduction;
  const chartData = [
    { name: "국민연금", value: parseFloat(((result.pension / totalDeductions) * 100).toFixed(1)), color: "#8b5cf6" },
    { name: "건강보험", value: parseFloat(((result.health / totalDeductions) * 100).toFixed(1)), color: "#ec4899" },
    { name: "고용보험", value: parseFloat(((result.employment / totalDeductions) * 100).toFixed(1)), color: "#06b6d4" },
    { name: "소득세", value: parseFloat((((result.incomeTax + result.localTax) / totalDeductions) * 100).toFixed(1)), color: "#ef4444" },
  ];

  return (
    <div className="w-full mx-auto px-0 sm:px-4 lg:px-0 py-12 sm:py-16 -mt-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Helper/Control Panel */}
        <motion.div
          className="lg:col-span-2 relative overflow-hidden bg-zinc-900/60 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

          <h2 className="text-3xl font-black tracking-tight mb-10 text-white relative z-10 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
            {pageConfig.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label htmlFor="salary" className="text-sm font-bold text-slate-400 uppercase tracking-wider">{pageConfig.salaryLabel}</Label>
                  <span className="text-2xl font-black text-white tabular-nums">{salary.toLocaleString()}원</span>
                </div>
                <Slider
                  id="salary"
                  min={pageConfig.salaryMin}
                  max={pageConfig.salaryMax}
                  step={pageConfig.salaryStep}
                  value={[salary]}
                  onValueChange={(value) => setSalary(value[0])}
                  className="py-2"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label htmlFor="dependents" className="text-sm font-bold text-slate-400 uppercase tracking-wider">부양가족 수</Label>
                  <span className="text-2xl font-black text-white tabular-nums">{dependents}명</span>
                </div>
                <Slider
                  id="dependents"
                  min={1}
                  max={10}
                  step={1}
                  value={[dependents]}
                  onValueChange={(value) => setDependents(value[0])}
                  className="py-2"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <Label htmlFor="non-taxable" className="text-sm font-bold text-slate-400 uppercase tracking-wider">비과세액 (월)</Label>
                  <span className="text-2xl font-black text-white tabular-nums">{nonTaxableAmount.toLocaleString()}원</span>
                </div>
                <Slider
                  id="non-taxable"
                  min={0}
                  max={1000000}
                  step={100000}
                  value={[nonTaxableAmount]}
                  onValueChange={(value) => setNonTaxableAmount(value[0])}
                  className="py-2"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <Label htmlFor="sme-youth" className="text-base font-bold text-slate-200">중소기업 취업 청년 감면</Label>
                <Switch id="sme-youth" checked={isSmeYouth} onCheckedChange={setIsSmeYouth} />
              </div>
            </div>

            <div className="h-80 bg-zinc-950/50 rounded-3xl p-6 border border-white/5 shadow-inner">
              <h4 className="text-sm font-bold text-slate-500 mb-4 text-center uppercase tracking-wider">공제 항목 비중</h4>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={40}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: '#09090b',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, '비중']}
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
        </motion.div>

        {/* Results Panel */}
        <div className="space-y-6">
          <motion.div
            className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] border border-indigo-400/30 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <h3 className="text-sm font-bold mb-2 text-indigo-200 uppercase tracking-widest">월 예상 실수령액</h3>
            <p className="text-5xl lg:text-4xl xl:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
              {result.monthlyNet.toLocaleString()}
              <span className="text-2xl text-indigo-200 ml-1 font-bold">원</span>
            </p>

            <div className="mt-8 pt-6 border-t border-indigo-500/30 space-y-3 text-sm font-medium text-indigo-100">
              <div className="flex justify-between items-baseline">
                <span className="opacity-70">세전 월급</span>
                <span className="text-lg font-bold">{(salary / 12).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-70">총 공제액</span>
                <span className="text-lg font-bold text-indigo-200">- {result.totalDeduction.toLocaleString()}원</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-zinc-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              상세 공제 내역
            </h3>
            <div className="space-y-4 text-sm font-medium text-slate-300">
              {[
                { label: "국민연금", val: result.pension },
                { label: "건강보험", val: result.health },
                { label: "장기요양", val: result.longTermCare },
                { label: "고용보험", val: result.employment },
                { label: "소득세", val: result.incomeTax },
                { label: "지방소득세", val: result.localTax },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center group">
                  <span className="text-slate-500 group-hover:text-slate-400 transition-colors">{item.label}</span>
                  <span className="tabular-nums text-slate-200 group-hover:text-white transition-colors">- {item.val.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-8">
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
        />
      </motion.div>
    </div>
  );
}
