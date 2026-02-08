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
import { Calculator, CheckCircle2 } from "lucide-react";

const CustomBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text x={x + width / 2} y={y} fill="#a8a29e" dy={-6} textAnchor="middle" fontSize={12} fontFamily="var(--font-serif)" fontWeight="bold">
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
    { name: "국민연금", value: parseFloat(((result.pension / totalDeductions) * 100).toFixed(1)), color: "#78716c" }, // Stone-500
    { name: "건강보험", value: parseFloat(((result.health / totalDeductions) * 100).toFixed(1)), color: "#a8a29e" }, // Stone-400
    { name: "고용보험", value: parseFloat(((result.employment / totalDeductions) * 100).toFixed(1)), color: "#d6d3d1" }, // Stone-300
    { name: "소득세", value: parseFloat((((result.incomeTax + result.localTax) / totalDeductions) * 100).toFixed(1)), color: "#cc9254" }, // Gold Accent
  ];

  return (
    <div className="w-full mx-auto px-0 sm:px-4 lg:px-0 py-12 sm:py-20 -mt-10">

      {/* Simulation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
        {/* Helper/Control Panel */}
        <motion.div
          className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-[#1C1917] p-8 sm:p-12 rounded-[2.5rem] shadow-xl border border-stone-200 dark:border-stone-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Marble Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold tracking-tight mb-12 text-foreground flex items-center gap-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                <Calculator className="w-6 h-6" />
              </span>
              {pageConfig.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
              <div className="space-y-12">
                {/* Salary Slider */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-stone-100 dark:border-stone-800 pb-2">
                    <Label htmlFor="salary" className="text-xs font-bold text-stone-400 uppercase tracking-widest">{pageConfig.salaryLabel}</Label>
                    <span className="text-3xl font-serif font-bold text-foreground tabular-nums">{salary.toLocaleString()}<span className="text-lg text-stone-400 font-normal ml-1">원</span></span>
                  </div>
                  <Slider
                    id="salary"
                    min={pageConfig.salaryMin}
                    max={pageConfig.salaryMax}
                    step={pageConfig.salaryStep}
                    value={[salary]}
                    onValueChange={(value) => setSalary(value[0])}
                    className="py-2 cursor-pointer"
                  />
                </div>

                {/* Dependents Slider */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-stone-100 dark:border-stone-800 pb-2">
                    <Label htmlFor="dependents" className="text-xs font-bold text-stone-400 uppercase tracking-widest">부양가족 수</Label>
                    <span className="text-3xl font-serif font-bold text-foreground tabular-nums">{dependents}<span className="text-lg text-stone-400 font-normal ml-1">명</span></span>
                  </div>
                  <Slider
                    id="dependents"
                    min={1}
                    max={10}
                    step={1}
                    value={[dependents]}
                    onValueChange={(value) => setDependents(value[0])}
                    className="py-2 cursor-pointer"
                  />
                </div>

                {/* Non-Taxable Slider */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-stone-100 dark:border-stone-800 pb-2">
                    <Label htmlFor="non-taxable" className="text-xs font-bold text-stone-400 uppercase tracking-widest">비과세액 (월)</Label>
                    <span className="text-3xl font-serif font-bold text-foreground tabular-nums">{nonTaxableAmount.toLocaleString()}<span className="text-lg text-stone-400 font-normal ml-1">원</span></span>
                  </div>
                  <Slider
                    id="non-taxable"
                    min={0}
                    max={1000000}
                    step={100000}
                    value={[nonTaxableAmount]}
                    onValueChange={(value) => setNonTaxableAmount(value[0])}
                    className="py-2 cursor-pointer"
                  />
                </div>

                {/* Toggle */}
                <div className="flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800">
                  <Label htmlFor="sme-youth" className="text-sm font-bold text-stone-600 dark:text-stone-300">중소기업 취업 청년 감면</Label>
                  <Switch id="sme-youth" checked={isSmeYouth} onCheckedChange={setIsSmeYouth} />
                </div>
              </div>

              {/* Chart */}
              <div className="h-full min-h-[300px] bg-stone-50 dark:bg-stone-900 rounded-3xl p-8 border border-stone-100 dark:border-stone-800 flex flex-col justify-center">
                <h4 className="text-xs font-bold text-stone-400 mb-8 text-center uppercase tracking-widest">Deduction Breakdown</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }} barSize={32}>
                      <XAxis dataKey="name" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} dy={10} fontFamily="var(--font-sans)" />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderColor: '#e7e5e4',
                          borderRadius: '12px',
                          color: '#44403c',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                        formatter={(value: number) => [`${value}%`, '비중']}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
          </div>
        </motion.div>

        {/* Results Panel (Sticky) */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <motion.div
            className="bg-primary text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Texture */}
            <div className="absolute inset-0 opacity-[0.1] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

            <h3 className="text-xs font-bold mb-4 text-emerald-200 uppercase tracking-widest relative z-10">Estimated Net Income</h3>
            <p className="text-5xl lg:text-4xl xl:text-5xl font-serif font-bold text-white tracking-tight tabular-nums relative z-10">
              {result.monthlyNet.toLocaleString()}
              <span className="text-2xl text-emerald-200 ml-2 font-normal">원</span>
            </p>

            <div className="mt-10 pt-8 border-t border-emerald-500/30 space-y-4 text-sm font-medium text-emerald-50 relative z-10">
              <div className="flex justify-between items-baseline">
                <span className="opacity-80">세전 {pageConfig.salaryLabel} (월환산)</span>
                <span className="text-lg font-serif">{(salary / 12).toLocaleString()}원</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-80">총 공제액</span>
                <span className="text-lg font-serif text-emerald-200">- {result.totalDeduction.toLocaleString()}원</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-[#1C1917] p-8 rounded-[2.5rem] shadow-lg border border-stone-200 dark:border-stone-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-serif font-bold mb-6 text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              상세 공제 내역
            </h3>
            <div className="space-y-4 text-sm font-medium text-stone-500">
              {[
                { label: "국민연금", val: result.pension },
                { label: "건강보험", val: result.health },
                { label: "장기요양", val: result.longTermCare },
                { label: "고용보험", val: result.employment },
                { label: "소득세", val: result.incomeTax },
                { label: "지방소득세", val: result.localTax },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center group py-1 border-b border-stone-50 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-900 px-2 rounded-lg transition-colors">
                  <span className="text-stone-400">{item.label}</span>
                  <span className="tabular-nums text-foreground">- {item.val.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Full Table Section */}
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
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
