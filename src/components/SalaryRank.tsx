"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import { findSalaryRank, salaryData } from "@/lib/salaryData";
import type { StoredFinancialData, StoredRankData } from "@/app/types";
import { analyzeSalary, generateGrowthPlan } from "@/lib/reportCardAnalysis";
import type { ReportCardData, GrowthPlan } from "@/lib/reportCardAnalysis";

// 새로 만든 컴포넌트들을 import 합니다.
import SalaryReportCard from "./SalaryReportCard";
import AIGrowthPlan from "./AIGrowthPlan";

const formatNumber = (num: number) => num.toLocaleString();

export default function SalaryRank() {
  const [salaryInput, setSalaryInput] = useState("");
  const [jobCategory, setJobCategory] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [ageGroup, setAgeGroup] = useState("all");
  const [region, setRegion] = useState("all");

  // 분석 결과를 담을 state 추가
  const [reportData, setReportData] = useState<ReportCardData | null>(null);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan[] | null>(null);
  const [result, setResult] = useState<{
    rank: number | null;
    condition: string;
    median: number;
    average: number;
  } | null>(null);

  const annualSalary = useMemo(
    () => Number(salaryInput.replace(/,/g, "")),
    [salaryInput]
  );

  const handleCalculateRank = () => {
    let key = `${jobCategory}-${experienceLevel}-${ageGroup}-${region}`;
    if (!salaryData[key])
      key = `${jobCategory}-${experienceLevel}-${ageGroup}-all`;
    if (!salaryData[key]) key = `${jobCategory}-${experienceLevel}-all-all`;
    if (!salaryData[key]) key = `${jobCategory}-all-all-all`;
    if (!salaryData[key]) key = "all-all-all-all";

    const { rank, median, average } = findSalaryRank(annualSalary, key);

    if (rank === null) {
      alert("연봉을 입력해주세요.");
      return;
    }

    const marketData = salaryData[key];
    const newReportData = analyzeSalary(
      annualSalary,
      rank,
      jobCategory,
      experienceLevel,
      marketData
    );
    const newGrowthPlan = generateGrowthPlan(
      newReportData.grade,
      rank,
      annualSalary
    );

    setReportData(newReportData);
    setGrowthPlan(newGrowthPlan);

    const jobMap: Record<string, string> = {
      all: "전체 직군",
      management: "경영/사무",
      marketing: "마케팅/영업",
      it_dev: "IT/개발",
      design: "디자인",
      professional: "전문직",
      manufacturing: "생산/기술",
      service: "서비스/교육",
    };
    const expMap: Record<string, string> = {
      all: "전체 경력",
      "1-2": "1~2년",
      "3-6": "3~6년",
      "7-10": "7~10년",
      "11-14": "11~14년",
      "15-18": "15~18년",
      "19-22": "19~22년",
      "23-26": "23~26년",
      "27-30": "27~30년",
      "31-34": "31~34년",
      "35-38": "35~38년",
      "39+": "39년 이상",
    };
    const ageMap: Record<string, string> = {
      all: "전체 연령",
      "10s": "10대",
      "20s": "20대",
      "30s": "30대",
      "40s": "40대",
      "50s": "50대",
      "60s": "60대",
      "70s": "70대",
      "80s": "80대 이상",
    };
    const regionMap: Record<string, string> = {
      all: "전국",
      capital: "수도권",
      "non-capital": "수도권 외",
    };
    const conditionText = [
      jobMap[jobCategory],
      expMap[experienceLevel],
      ageMap[ageGroup],
      regionMap[region],
    ]
      .filter((v) => !v.startsWith("전체"))
      .join(" / ");

    setResult({
      rank,
      median,
      average,
      condition: conditionText || "전체 근로자",
    });
  };

  const handleSaveData = () => {
    if (!result || result.rank === null) {
      alert("먼저 연봉 순위를 계산해주세요.");
      return;
    }
    try {
      const existingDataJSON = localStorage.getItem(
        "moneysalary-financial-data"
      );
      const existingData: StoredFinancialData = existingDataJSON
        ? JSON.parse(existingDataJSON)
        : { lastUpdated: new Date().toISOString() };

      const rankDataToStore: StoredRankData = {
        rank: result.rank,
        condition: result.condition,
        median: result.median,
        average: result.average,
      };

      const updatedData: StoredFinancialData = {
        ...existingData,
        rank: rankDataToStore,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(
        "moneysalary-financial-data",
        JSON.stringify(updatedData)
      );
      alert(
        "연봉 순위 정보가 대시보드에 저장되었습니다! 페이지를 새로고침하여 확인해보세요."
      );
      window.location.reload();
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      alert("데이터 저장에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (!result || result.rank === null || !reportData) return;

    const shareText = `💰 내 연봉 등급은 '${reportData.grade}'! "${result.condition}" 그룹에서 상위 ${result.rank}%래요! 여러분도 확인해보세요!`;
    const shareUrl =
      window.location.origin + `/?tab=rank&salary=${annualSalary}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "내 연봉 성적표 | Moneysalary",
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert(
          "결과가 클립보드에 복사되었습니다. 원하는 곳에 붙여넣어 공유하세요!"
        );
      }
    } catch (error) {
      console.error("Sharing failed:", error);
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert("공유 기능에 실패하여, 내용이 클립보드에 복사되었습니다.");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
        💰 내 연봉, 동료들과 비교하면 몇 등일까?
      </h2>
      <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">
        국가통계 기반 데이터로 더 정확해진 내 소득 위치를 확인하고, 성장을 위한
        AI 플랜까지 받아보세요.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <select
          value={jobCategory}
          onChange={(e) => setJobCategory(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card focus:ring-2 focus:ring-signature-blue"
        >
          <option value="all">전체 직군</option>
          <option value="management">경영/사무</option>
          <option value="marketing">마케팅/영업</option>
          <option value="it_dev">IT/개발</option>
          <option value="design">디자인</option>
          <option value="professional">전문직</option>
          <option value="manufacturing">생산/기술</option>
          <option value="service">서비스/교육</option>
        </select>
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card focus:ring-2 focus:ring-signature-blue"
        >
          <option value="all">전체 경력</option>
          <option value="1-2">1~2년</option>
          <option value="3-6">3~6년</option>
          <option value="7-10">7~10년</option>
          <option value="11-14">11~14년</option>
          <option value="15-18">15~18년</option>
          <option value="19-22">19~22년</option>
          <option value="23-26">23~26년</option>
          <option value="27-30">27~30년</option>
          <option value="31-34">31~34년</option>
          <option value="35-38">35~38년</option>
          <option value="39+">39년 이상</option>
        </select>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card focus:ring-2 focus:ring-signature-blue"
        >
          <option value="all">전체 연령</option>
          <option value="10s">10대</option>
          <option value="20s">20대</option>
          <option value="30s">30대</option>
          <option value="40s">40대</option>
          <option value="50s">50대</option>
          <option value="60s">60대</option>
          <option value="70s">70대</option>
          <option value="80s">80대 이상</option>
        </select>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card focus:ring-2 focus:ring-signature-blue"
        >
          <option value="all">전국</option>
          <option value="capital">수도권</option>
          <option value="non-capital">수도권 외</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end mt-6">
        <div className="flex-grow w-full">
          <CurrencyInput
            label="세전 연봉 입력"
            value={salaryInput}
            onValueChange={setSalaryInput}
            quickAmounts={[10000000, 1000000, 100000]}
          />
        </div>
        <button
          onClick={handleCalculateRank}
          className="w-full sm:w-auto px-8 py-4 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
        >
          AI 분석 시작하기
        </button>
      </div>

      {reportData && (
        <>
          <SalaryReportCard reportData={reportData} />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSaveData}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              대시보드에 저장
            </button>
            <button
              onClick={handleShare}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              성적표 공유하기
            </button>
          </div>
        </>
      )}
      {growthPlan && <AIGrowthPlan plans={growthPlan} />}
    </div>
  );
}
