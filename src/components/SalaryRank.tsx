// src/components/SalaryRank.tsx

"use client";

import { useState, useMemo } from "react";
import CurrencyInput from "./CurrencyInput";
import Link from "next/link";
import { findSalaryRank, salaryData } from "@/lib/salaryData";
// [추가] 타입 import
import type { StoredFinancialData, StoredRankData } from "@/app/types";

const formatNumber = (num: number) => num.toLocaleString();

export default function SalaryRank() {
  const [salaryInput, setSalaryInput] = useState("");
  const [jobCategory, setJobCategory] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [ageGroup, setAgeGroup] = useState("all");
  const [region, setRegion] = useState("all");

  const [result, setResult] = useState<{
    rank: number | null;
    median: number;
    average: number;
    condition: string;
    recommendedGuides: { title: string; href: string }[];
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

    const recommendedGuides = [
      {
        title: "연봉 1억을 위한 현실적인 절세 전략",
        href: "/guides/road-to-100m-part1-tax",
      },
      {
        title: "이직 시 연봉협상, 최소 OO%는 불러야 하는 이유",
        href: "/guides/salary-negotiation",
      },
    ];

    setResult({
      rank,
      median,
      average,
      condition: conditionText || "전체 근로자",
      recommendedGuides,
    });
  };

  // [추가] 대시보드 저장 핸들러
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
    if (!result || result.rank === null) return;

    const shareText = `💰 내 연봉 ${annualSalary.toLocaleString()}원은 "${
      result.condition
    }" 그룹에서 상위 ${result.rank}%래요! 여러분도 확인해보세요!`;
    const shareUrl =
      window.location.origin + `/?tab=rank&salary=${annualSalary}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "내 연봉 순위 리포트 | Moneysalary",
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
        국가통계 기반 데이터로 더 정확해진 내 소득 위치를 확인해보세요.
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
          <option value="professional">전문직(의료/법률/금융)</option>
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
          결과 확인
        </button>
      </div>

      {result && (
        <>
          <div className="mt-8 p-6 bg-signature-blue text-white rounded-2xl shadow-xl relative">
            <p className="text-center font-semibold text-blue-200">{`"${result.condition}" 그룹 내 연봉 리포트`}</p>
            <div className="grid grid-cols-3 gap-4 text-center my-6">
              <div>
                <p className="text-sm text-blue-200 opacity-80">내 순위</p>
                <p className="text-2xl lg:text-3xl font-bold">
                  상위 {result.rank ?? "N/A"}%
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-200 opacity-80">
                  그룹 중위연봉
                </p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatNumber(result.median / 10000)}
                  <span className="text-lg">만원</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-200 opacity-80">
                  그룹 평균연봉
                </p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {formatNumber(result.average / 10000)}
                  <span className="text-lg">만원</span>
                </p>
              </div>
            </div>
            <div className="w-full bg-blue-400/50 rounded-full h-3 mt-6 relative">
              <div
                className="bg-white h-3 rounded-full"
                style={{ width: `${100 - (result.rank ?? 100)}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-4 border-signature-blue"
                style={{ left: `${100 - (result.rank ?? 100)}%` }}
              />
            </div>
            <p className="text-xs text-blue-200 mt-2 text-center opacity-70">
              * 국가통계 기반 데이터로 추정한 값입니다.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleSaveData}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
              >
                대시보드에 저장
              </button>
              <button
                onClick={handleShare}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
              >
                결과 공유하기
              </button>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
              맞춤 가이드
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="block p-4 border rounded-lg hover:shadow-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <p className="font-semibold text-signature-blue">
                    {guide.title}
                  </p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    자세히 보기 →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
