"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import CurrencyInput from "./CurrencyInput";
import type { StoredFinancialData, StoredSeveranceData } from "@/app/types";
import { Save, RotateCcw } from "lucide-react";
import CountUp from "react-countup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const toInputDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SeveranceCalculator() {
  const router = useRouter();

  const today = useMemo(() => new Date(), []);
  const oneYearAgo = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  }, []);

  const [startDate, setStartDate] = useState<string>(
    toInputDateString(oneYearAgo)
  );
  const [endDate, setEndDate] = useState<string>(toInputDateString(today));

  const [salaries, setSalaries] = useState(["", "", ""]);
  const [annualBonus, setAnnualBonus] = useState("");
  const [annualLeavePay, setAnnualLeavePay] = useState("");

  const result = useMemo(() => {
    const numericSalaries = salaries.map((s) => Number(s.replace(/,/g, "")));
    return calculateSeverancePay(
      startDate,
      endDate,
      numericSalaries,
      Number(annualBonus.replace(/,/g, "")),
      Number(annualLeavePay.replace(/,/g, ""))
    );
  }, [startDate, endDate, salaries, annualBonus, annualLeavePay]);

  const handleSalaryChange = (index: number, value: string) => {
    const newSalaries = [...salaries];
    newSalaries[index] = value;
    setSalaries(newSalaries);
  };

  const handleReset = useCallback(() => {
    setStartDate(toInputDateString(oneYearAgo));
    setEndDate(toInputDateString(today));
    setSalaries(["", "", ""]);
    setAnnualBonus("");
    setAnnualLeavePay("");
  }, [oneYearAgo, today]);

  const handleSaveData = () => {
    if (result.estimatedSeverancePay <= 0) {
      alert("퇴직금이 계산되지 않았습니다. 정보를 먼저 입력해주세요.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };
      const severanceDataToStore: StoredSeveranceData = {
        estimatedSeverancePay: result.estimatedSeverancePay,
      };
      const updatedData: StoredFinancialData = {
        ...existingData,
        severance: severanceDataToStore,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(
        "moneysalary-financial-data",
        JSON.stringify(updatedData)
      );
      alert("예상 퇴직금 정보가 대시보드에 저장되었습니다!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>근무 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">입사일</Label>
                <Input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">퇴사일 (마지막 근무일)</Label>
                <Input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>급여 정보 (퇴사일 이전 3개월)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[2, 1, 0].map((i) => (
                <CurrencyInput
                  key={i}
                  label={`퇴사 ${i + 1}개월 전 급여`}
                  value={salaries[2 - i]}
                  onValueChange={(v) => handleSalaryChange(2 - i, v)}
                  quickAmounts={[1000000, 100000]}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>상여금, 연차수당 등 추가 입력 (선택)</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <CurrencyInput label="연간 상여금 총액" value={annualBonus} onValueChange={setAnnualBonus} quickAmounts={[1000000, 500000]} />
                <CurrencyInput label="미사용 연차수당" value={annualLeavePay} onValueChange={setAnnualLeavePay} quickAmounts={[500000, 100000]} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="sticky top-24">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>💰 예상 퇴직금 결과</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm font-semibold text-muted-foreground">총 재직일수</p>
                <p className="text-xl font-bold">
                  <CountUp end={result.totalDaysOfEmployment} separator="," />일 ({result.yearsOfService.years}년 {result.yearsOfService.months}개월)
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-baseline"><span className="text-md font-semibold text-muted-foreground">세전 퇴직금</span><p className="text-2xl font-bold"><CountUp end={result.estimatedSeverancePay} separator="," /> 원</p></div>
                <div className="flex justify-between items-baseline"><span className="text-md font-semibold text-destructive">퇴직 소득세</span><p className="text-2xl font-bold text-destructive">- <CountUp end={result.incomeTax + result.localTax} separator="," /> 원</p></div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-dashed">
                <div className="flex justify-between items-center"><span className="text-lg font-bold">세후 실수령액</span><p className="text-4xl font-bold text-primary"><CountUp end={result.netSeverancePay} separator="," /> 원</p></div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button onClick={handleReset} variant="outline"><RotateCcw size={16} className="mr-2" /> 초기화</Button>
                <Button onClick={handleSaveData}><Save size={16} className="mr-2" /> 대시보드 저장</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}