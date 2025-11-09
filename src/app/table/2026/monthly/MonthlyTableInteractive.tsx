"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { calculateNetSalary2026 } from "@/lib/calculator";
import type { SalaryData } from "@/lib/generateData";
import { AdvancedSettings } from "@/app/types";
import SalaryTable from "@/components/SalaryTable";
import TableInteraction from "@/components/TableInteraction";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface MonthlyTableInteractiveProps {
  allData: SalaryData[];
  tableHeaders: { key: string; label: string }[];
  highlightRows: number[];
  totalPages: number;
  paginatedData: SalaryData[];
}

export default function MonthlyTableInteractive({
  allData,
  tableHeaders,
  highlightRows,
  totalPages,
  paginatedData,
}: MonthlyTableInteractiveProps) {
  const [monthlySalary, setMonthlySalary] = useState(4000000);
  const [dependents, setDependents] = useState(1);
  const [nonTaxableAmount, setNonTaxableAmount] = useState(200000);
  const [isSmeYouth, setIsSmeYouth] = useState(false);

  const advancedSettings: AdvancedSettings = {
    isSmeYouth,
    disabledDependents: 0,
    seniorDependents: 0,
  };

  const result = calculateNetSalary2026(
    monthlySalary * 12,
    nonTaxableAmount,
    dependents,
    0,
    advancedSettings
  );

  const chartData = [
    { name: "실수령액", value: result.monthlyNet },
    { name: "국민연금", value: result.pension },
    { name: "건강보험", value: result.health },
    { name: "고용보험", value: result.employment },
    { name: "소득세", value: result.incomeTax + result.localTax },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border">
            <h2 className="text-2xl font-bold mb-6">월급별 실수령액 시뮬레이터 (2026년 예상)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="monthly-salary" className="text-lg">월급: {monthlySalary.toLocaleString()}원</Label>
                    <Slider
                      id="monthly-salary"
                      min={1000000}
                      max={20000000}
                      step={100000}
                      value={[monthlySalary]}
                      onValueChange={(value) => setMonthlySalary(value[0])}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dependents" className="text-lg">부양가족 수: {dependents}명</Label>
                    <Slider
                      id="dependents"
                      min={1}
                      max={10}
                      step={1}
                      value={[dependents]}
                      onValueChange={(value) => setDependents(value[0])}
                    />
                  </div>
                  <div>
                    <Label htmlFor="non-taxable" className="text-lg">비과세액 (월): {nonTaxableAmount.toLocaleString()}원</Label>
                     <Slider
                      id="non-taxable"
                      min={0}
                      max={1000000}
                      step={100000}
                      value={[nonTaxableAmount]}
                      onValueChange={(value) => setNonTaxableAmount(value[0])}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sme-youth" checked={isSmeYouth} onCheckedChange={setIsSmeYouth} />
                    <Label htmlFor="sme-youth">중소기업 취업 청년 감면</Label>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
            <div className="bg-card p-6 rounded-2xl shadow-xl border border-border">
                <h3 className="text-xl font-bold mb-4">월 예상 실수령액</h3>
                <p className="text-4xl font-bold text-primary">{result.monthlyNet.toLocaleString()}원</p>
                <div className="mt-4 space-y-2 text-muted-foreground">
                    <div className="flex justify-between"><span>세전 월급</span><span>{(monthlySalary).toLocaleString()}원</span></div>
                    <div className="flex justify-between text-red-500"><span>총 공제액</span><span>- {result.totalDeduction.toLocaleString()}원</span></div>
                </div>
            </div>
             <div className="bg-card p-6 rounded-2xl shadow-xl border border-border">
                <h3 className="text-xl font-bold mb-4">상세 공제 내역</h3>
                 <div className="space-y-2 text-muted-foreground">
                    <div className="flex justify-between"><span>국민연금</span><span>- {result.pension.toLocaleString()}원</span></div>
                    <div className="flex justify-between"><span>건강보험</span><span>- {result.health.toLocaleString()}원</span></div>
                    <div className="flex justify-between"><span>장기요양</span><span>- {result.longTermCare.toLocaleString()}원</span></div>
                    <div className="flex justify-between"><span>고용보험</span><span>- {result.employment.toLocaleString()}원</span></div>
                    <div className="flex justify-between"><span>소득세</span><span>- {result.incomeTax.toLocaleString()}원</span></div>
                    <div className="flex justify-between"><span>지방소득세</span><span>- {result.localTax.toLocaleString()}원</span></div>
                </div>
            </div>
        </div>
      </div>
      <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-xl border border-border mt-8">
        <TableInteraction
          totalPages={totalPages}
          basePath="/table/2026/monthly"
          searchPlaceholder="월급으로 검색..."
        />
        <div className="overflow-hidden mt-8">
          <SalaryTable
            headers={tableHeaders}
            data={paginatedData}
            highlightRows={highlightRows}
            unit="원"
          />
        </div>
      </div>
    </div>
  );
}
