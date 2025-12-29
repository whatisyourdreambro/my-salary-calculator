"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
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
    <text x={x + width / 2} y={y} fill="#888" dy={-4} textAnchor="middle">
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
  totalPages,
  paginatedData,
  calculationFn,
  pageConfig,
}: InteractiveTableProps) {
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
    { name: "국민연금", value: parseFloat(((result.pension / totalDeductions) * 100).toFixed(1)) },
    { name: "건강보험", value: parseFloat(((result.health / totalDeductions) * 100).toFixed(1)) },
    { name: "고용보험", value: parseFloat(((result.employment / totalDeductions) * 100).toFixed(1)) },
    { name: "소득세", value: parseFloat((((result.incomeTax + result.localTax) / totalDeductions) * 100).toFixed(1)) },
  ];

  return (
    <div className="w-full mx-auto px-0 sm:px-4 lg:px-0 py-12 sm:py-16 -mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-foreground">{pageConfig.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <div>
                <Label htmlFor="salary" className="text-lg font-medium text-foreground/80">{pageConfig.salaryLabel}: {salary.toLocaleString()}원</Label>
                <Slider
                  id="salary"
                  min={pageConfig.salaryMin}
                  max={pageConfig.salaryMax}
                  step={pageConfig.salaryStep}
                  value={[salary]}
                  onValueChange={(value) => setSalary(value[0])}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="dependents" className="text-lg font-medium text-foreground/80">부양가족 수: {dependents}명</Label>
                <Slider
                  id="dependents"
                  min={1}
                  max={10}
                  step={1}
                  value={[dependents]}
                  onValueChange={(value) => setDependents(value[0])}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="non-taxable" className="text-lg font-medium text-foreground/80">비과세액 (월): {nonTaxableAmount.toLocaleString()}원</Label>
                <Slider
                  id="non-taxable"
                  min={0}
                  max={1000000}
                  step={100000}
                  value={[nonTaxableAmount]}
                  onValueChange={(value) => setNonTaxableAmount(value[0])}
                  className="mt-2"
                />
              </div>
              <div className="flex items-center space-x-3">
                <Switch id="sme-youth" checked={isSmeYouth} onCheckedChange={setIsSmeYouth} />
                <Label htmlFor="sme-youth" className="text-base font-medium text-foreground/80">중소기업 취업 청년 감면</Label>
              </div>
            </div>
            <div className="h-80 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value}%`} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" content={<CustomBarLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
        <div className="space-y-8">
          <motion.div
            className="bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-4 text-foreground">월 예상 실수령액</h3>
            <p className="text-5xl font-bold text-primary">{result.monthlyNet.toLocaleString()}원</p>
            <div className="mt-6 space-y-3 text-base text-foreground/70">
              <div className="flex justify-between"><span>세전 월급</span><span>{(salary / 12).toLocaleString()}원</span></div>
              <div className="flex justify-between text-red-500 font-medium"><span>총 공제액</span><span>- {result.totalDeduction.toLocaleString()}원</span></div>
            </div>
          </motion.div>
          <motion.div
            className="bg-zinc-900/40 backdrop-blur-2xl p-6 rounded-2xl shadow-xl border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4 text-foreground">상세 공제 내역</h3>
            <div className="space-y-3 text-base text-foreground/70">
              <div className="flex justify-between"><span>국민연금</span><span>- {result.pension.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span>건강보험</span><span>- {result.health.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span>장기요양</span><span>- {result.longTermCare.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span>고용보험</span><span>- {result.employment.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span>소득세</span><span>- {result.incomeTax.toLocaleString()}원</span></div>
              <div className="flex justify-between"><span>지방소득세</span><span>- {result.localTax.toLocaleString()}원</span></div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="bg-zinc-900/40 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl shadow-xl border border-white/10 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TableInteraction
          totalPages={totalPages}
          basePath={pageConfig.basePath}
          searchPlaceholder={pageConfig.searchPlaceholder}
        />
        <div className="overflow-hidden mt-8">
          <SalaryTable
            headers={tableHeaders}
            data={paginatedData}
            highlightRows={highlightRows}
            unit="원"
          />
        </div>
      </motion.div>
    </div>
  );
}
