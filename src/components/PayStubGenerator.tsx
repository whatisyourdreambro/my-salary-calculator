"use client";

import { useState, useRef, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import { calculateNetSalary } from "@/lib/calculator";
import type { CalculationResult } from "@/lib/calculator";
import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

const formatNumber = (num: number) => num.toLocaleString();
const parseNumber = (str: string) => Number(str.replace(/,/g, ""));

export default function PayStubGenerator() {
  const [salaryInput, setSalaryInput] = useState("50,000,000");
  const payStubRef = useRef<HTMLDivElement>(null);

  const result: CalculationResult = useMemo(() => {
    const annualSalary = parseNumber(salaryInput);
    if (annualSalary <= 0) {
      return { monthlyNet: 0, totalDeduction: 0, pension: 0, health: 0, longTermCare: 0, employment: 0, incomeTax: 0, localTax: 0 };
    }
    return calculateNetSalary(annualSalary, 2400000, 1, 0, { isSmeYouth: false, disabledDependents: 0, seniorDependents: 0 });
  }, [salaryInput]);

  const annualSalary = useMemo(() => parseNumber(salaryInput), [salaryInput]);
  const monthlyGross = useMemo(() => Math.round(annualSalary / 12), [annualSalary]);

  const handleDownload = () => {
    const element = payStubRef.current;
    if (!element) return;

    html2canvas(element, { backgroundColor: null, scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `급여명세서_${salaryInput}원_Moneysalary.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>급여명세서 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyInput
              label="세전 연봉 입력"
              value={salaryInput}
              onValueChange={setSalaryInput}
              quickAmounts={[10000000, 1000000]}
            />
            <Button onClick={handleDownload} className="w-full mt-6">
              <Download className="mr-2 h-4 w-4" />
              PNG 이미지로 다운로드
            </Button>
          </CardContent>
        </Card>

        <Card ref={payStubRef} className="p-6">
          <CardHeader className="text-center p-2">
            <CardTitle className="text-2xl">급 여 명 세 서</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><strong>성명:</strong> 홍길동</div>
              <div><strong>지급일:</strong> 2025-10-25</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>지급내역</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                  <TableHead className="pl-4">공제내역</TableHead>
                  <TableHead className="text-right">금액</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow><TableCell>기본급</TableCell><TableCell className="text-right">{formatNumber(monthlyGross)}</TableCell><TableCell className="pl-4">국민연금</TableCell><TableCell className="text-right">{formatNumber(result.pension)}</TableCell></TableRow>
                <TableRow><TableCell></TableCell><TableCell></TableCell><TableCell className="pl-4">건강보험</TableCell><TableCell className="text-right">{formatNumber(result.health)}</TableCell></TableRow>
                <TableRow><TableCell></TableCell><TableCell></TableCell><TableCell className="pl-4">장기요양</TableCell><TableCell className="text-right">{formatNumber(result.longTermCare)}</TableCell></TableRow>
                <TableRow><TableCell></TableCell><TableCell></TableCell><TableCell className="pl-4">고용보험</TableCell><TableCell className="text-right">{formatNumber(result.employment)}</TableCell></TableRow>
                <TableRow><TableCell></TableCell><TableCell></TableCell><TableCell className="pl-4">소득세</TableCell><TableCell className="text-right">{formatNumber(result.incomeTax)}</TableCell></TableRow>
                <TableRow><TableCell></TableCell><TableCell></TableCell><TableCell className="pl-4">지방소득세</TableCell><TableCell className="text-right">{formatNumber(result.localTax)}</TableCell></TableRow>
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold">
                  <TableCell>지급총액</TableCell>
                  <TableCell className="text-right">{formatNumber(monthlyGross)}</TableCell>
                  <TableCell className="pl-4">공제총액</TableCell>
                  <TableCell className="text-right">{formatNumber(result.totalDeduction)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <div className="mt-4 p-4 border-t-2 text-right">
              <span className="font-bold text-lg">실 지급액: {formatNumber(result.monthlyNet)} 원</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}