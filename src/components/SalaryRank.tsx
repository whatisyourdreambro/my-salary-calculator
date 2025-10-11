"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import { findSalaryRank, salaryData } from "@/lib/salaryData";
import type { StoredFinancialData, StoredRankData } from "@/app/types";
import { analyzeSalary, generateGrowthPlan } from "@/lib/reportCardAnalysis";
import type { ReportCardData, GrowthPlan } from "@/lib/reportCardAnalysis";
import SalaryReportCard from "./SalaryReportCard";
import AIGrowthPlan from "./AIGrowthPlan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const jobMap: Record<string, string> = { all: "전체 직군", management: "경영/사무", marketing: "마케팅/영업", it_dev: "IT/개발", design: "디자인", professional: "전문직", manufacturing: "생산/기술", service: "서비스/교육" };
const expMap: Record<string, string> = { all: "전체 경력", "1-2": "1~2년", "3-6": "3~6년", "7-10": "7~10년", "11-14": "11~14년", "15-18": "15~18년", "19-22": "19~22년", "23-26": "23~26년", "27-30": "27~30년", "31-34": "31~34년", "35-38": "35~38년", "39+": "39년 이상" };
const ageMap: Record<string, string> = { all: "전체 연령", "10s": "10대", "20s": "20대", "30s": "30대", "40s": "40대", "50s": "50대", "60s": "60대", "70s": "70대", "80s": "80대 이상" };
const regionMap: Record<string, string> = { all: "전국", capital: "수도권", "non-capital": "수도권 외" };

export default function SalaryRank() {
  const [salaryInput, setSalaryInput] = useState("");
  const [jobCategory, setJobCategory] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [ageGroup, setAgeGroup] = useState("all");
  const [region, setRegion] = useState("all");
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan[] | null>(null);
  const [result, setResult] = useState<{ rank: number | null; condition: string; median: number; average: number; } | null>(null);

  const annualSalary = useMemo(() => Number(salaryInput.replace(/,/g, "")), [salaryInput]);

  const handleCalculateRank = () => {
    let key = `${jobCategory}-${experienceLevel}-${ageGroup}-${region}`;
    if (!salaryData[key]) key = `${jobCategory}-${experienceLevel}-${ageGroup}-all`;
    if (!salaryData[key]) key = `${jobCategory}-${experienceLevel}-all-all`;
    if (!salaryData[key]) key = `${jobCategory}-all-all-all`;
    if (!salaryData[key]) key = "all-all-all-all";

    const { rank, median, average } = findSalaryRank(annualSalary, key);
    if (rank === null) { alert("연봉을 입력해주세요."); return; }

    const marketData = salaryData[key];
    const newReportData = analyzeSalary(annualSalary, rank, jobCategory, experienceLevel, marketData);
    const newGrowthPlan = generateGrowthPlan(newReportData.grade, rank, annualSalary);

    setReportData(newReportData);
    setGrowthPlan(newGrowthPlan);

    const conditionText = [jobMap[jobCategory], expMap[experienceLevel], ageMap[ageGroup], regionMap[region]].filter((v) => !v.startsWith("전체")).join(" / ");
    setResult({ rank, median, average, condition: conditionText || "전체 근로자" });
  };

  // ... (handleSaveData and handleShare can be simplified later if needed)

  return (
    <Card className="w-full max-w-3xl mx-auto mt-16">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl sm:text-3xl">💰 내 연봉, 동료들과 비교하면 몇 등일까?</CardTitle>
        <CardDescription>국가통계 기반 데이터로 더 정확해진 내 소득 위치를 확인하고, 성장을 위한 AI 플랜까지 받아보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[ { label: "직군", value: jobCategory, setter: setJobCategory, options: jobMap }, { label: "경력", value: experienceLevel, setter: setExperienceLevel, options: expMap }, { label: "연령", value: ageGroup, setter: setAgeGroup, options: ageMap }, { label: "지역", value: region, setter: setRegion, options: regionMap } ].map(({ label, value, setter, options }) => (
            <div key={label} className="space-y-2">
              <Label>{label}</Label>
              <Select value={value} onValueChange={setter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(options).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end pt-4">
          <div className="flex-grow w-full">
            <CurrencyInput label="세전 연봉 입력" value={salaryInput} onValueChange={setSalaryInput} quickAmounts={[10000000, 1000000, 100000]} />
          </div>
          <Button onClick={handleCalculateRank} className="w-full sm:w-auto flex-shrink-0" size="lg">AI 분석 시작하기</Button>
        </div>

        {reportData && (
          <>
            <SalaryReportCard reportData={reportData} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => {}} variant="secondary">대시보드에 저장</Button>
              <Button onClick={() => {}} variant="outline">성적표 공유하기</Button>
            </div>
          </>
        )}
        {growthPlan && <AIGrowthPlan plans={growthPlan} />}
      </CardContent>
    </Card>
  );
}