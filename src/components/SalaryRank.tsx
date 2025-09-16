// src/components/SalaryRank.tsx

"use client";

import { useState, useMemo, useRef } from "react";
import CurrencyInput from "./CurrencyInput";
import html2canvas from "html2canvas";
import Link from "next/link";
// [수정] 데이터를 외부 파일에서 import 합니다.
import { salaryData } from "@/lib/salaryData";

const formatNumber = (num: number) => num.toLocaleString();

// [수정] SalaryStat 타입은 salaryData.ts에서 가져오므로 여기선 제거합니다.

const findSalaryRank = (annualSalary: number, key: string) => {
  const data = salaryData[key] || salaryData["all-all-all-all"];
  if (annualSalary <= 0)
    return { rank: null, median: data.median, average: data.average };

  const rank = [...data.percentiles]
    .sort((a, b) => a.income - b.income)
    .reverse()
    .find((d) => annualSalary >= d.income);

  const percentile = rank ? rank.percentile : 0;
  return { rank: 100 - percentile, median: data.median, average: data.average };
};

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

  const resultCardRef = useRef<HTMLDivElement>(null);

  const annualSalary = useMemo(
    () => Number(salaryInput.replace(/,/g, "")),
    [salaryInput]
  );

  const handleCalculateRank = () => {
    const filters = [jobCategory, experienceLevel, ageGroup, region];
    const key = filters.some((f) => f === "all")
      ? "all-all-all-all"
      : filters.join("-");

    const { rank, median, average } = findSalaryRank(annualSalary, key);

    const jobMap: Record<string, string> = {
      all: "전체",
      management: "경영/사무",
      it_dev: "IT/개발",
      design: "디자인",
    };
    const expMap: Record<string, string> = {
      all: "경력",
      "1-3": "1~3년차",
      "4-7": "4~7년차",
      "8+": "8년 이상",
    };
    const ageMap: Record<string, string> = {
      all: "연령",
      "20s": "20대",
      "30s": "30대",
      "40s": "40대 이상",
    };
    const regionMap: Record<string, string> = {
      all: "지역",
      capital: "수도권",
      "non-capital": "수도권 외",
    };

    const conditionText =
      key === "all-all-all-all"
        ? "전체 근로자"
        : [
            jobMap[jobCategory],
            expMap[experienceLevel],
            ageMap[ageGroup],
            regionMap[region],
          ].join("/");

    const recommendedGuides = [];
    if (annualSalary > 0 && annualSalary < 40000000) {
      recommendedGuides.push(
        {
          title: "실업급여 조건, A부터 Z까지 완벽 정리",
          href: "/guides/unemployment-benefits",
        },
        {
          title: "2025년 최저임금 완벽정리 (시급, 월급, 연봉)",
          href: "/guides/minimum-wage",
        }
      );
    } else if (annualSalary >= 70000000) {
      recommendedGuides.push(
        {
          title: "4대 보험 완벽 정리: 국민연금, 건강보험 등",
          href: "/guides/four-major-insurances",
        },
        {
          title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기",
          href: "/guides/severance-tax",
        }
      );
    } else {
      recommendedGuides.push(
        {
          title: "연말정산 A to Z: 13월의 월급, 제대로 챙기는 법",
          href: "/guides/year-end-tax-settlement",
        },
        {
          title: "주휴수당 계산법 및 지급 조건 완벽 가이드",
          href: "/guides/holiday-allowance",
        }
      );
    }

    setResult({
      rank,
      median,
      average,
      condition: conditionText,
      recommendedGuides,
    });
  };

  const handleCapture = () => {
    const card = resultCardRef.current;
    if (!card) return;

    const watermark = document.createElement("div");
    watermark.innerText = "moneysalary.com";
    Object.assign(watermark.style, {
      position: "absolute",
      bottom: "10px",
      right: "15px",
      fontSize: "12px",
      color: "rgba(255, 255, 255, 0.5)",
      pointerEvents: "none",
    });

    card.appendChild(watermark);

    html2canvas(card, { backgroundColor: "#007FFF" }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `my_salary_report_${annualSalary}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      card.removeChild(watermark);
    });
  };

  const handleShare = () => {
    if (!result) return;
    const shareText = `💰 내 연봉 ${annualSalary.toLocaleString()}원은 "${
      result.condition
    }" 그룹에서 상위 ${result.rank}%래요! 여러분도 확인해보세요!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: "내 연봉 리포트",
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      alert(
        "결과가 클립보드에 복사되었습니다. 원하는 곳에 붙여넣어 공유하세요!"
      );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-16 bg-light-card dark:bg-dark-card p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-light-text dark:text-dark-text mb-2">
        💰 내 연봉, 동료들과 비교하면 몇 등일까?
      </h2>
      <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">
        직군, 경력, 나이, 지역을 선택하고 더 정확한 내 소득 위치를 확인해보세요.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            직군
          </label>
          <select
            value={jobCategory}
            onChange={(e) => setJobCategory(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 focus:ring-2 focus:ring-signature-blue"
          >
            <option value="all">전체</option>
            <option value="management">경영/사무</option>
            <option value="it_dev">IT/개발</option>
            <option value="design">디자인</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            경력
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 focus:ring-2 focus:ring-signature-blue"
          >
            <option value="all">전체</option>
            <option value="1-3">1~3년</option>
            <option value="4-7">4~7년</option>
            <option value="8+">8년 이상</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            나이
          </label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 focus:ring-2 focus:ring-signature-blue"
          >
            <option value="all">전체</option>
            <option value="20s">20대</option>
            <option value="30s">30대</option>
            <option value="40s">40대 이상</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
            지역
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card dark:border-gray-700 focus:ring-2 focus:ring-signature-blue"
          >
            <option value="all">전국</option>
            <option value="capital">수도권</option>
            <option value="non-capital">수도권 외</option>
          </select>
        </div>
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
          <div
            ref={resultCardRef}
            className="mt-8 p-6 bg-signature-blue text-white rounded-2xl shadow-xl relative transition-all duration-500"
          >
            <p className="text-center font-semibold text-blue-200">
              {`"${result.condition}" 그룹 내 연봉 리포트`}
            </p>
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
                className="bg-white h-3 rounded-full transition-all duration-1000"
                style={{ width: `${100 - (result.rank ?? 100)}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-4 border-signature-blue"
                style={{ left: `${100 - (result.rank ?? 100)}%` }}
              />
            </div>
            <p className="text-xs text-blue-200 mt-2 text-center opacity-70">
              * 정부 공인 데이터를 기반으로 한 추정치입니다.
            </p>
            <div className="flex gap-2 mt-8">
              <button
                onClick={handleShare}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
              >
                공유하기
              </button>
              <button
                onClick={handleCapture}
                className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
              >
                이미지 저장
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
              {`'${result.condition}' 그룹을 위한 맞춤 가이드`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.recommendedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="block p-4 border rounded-lg hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                >
                  <p className="font-semibold text-signature-blue">
                    {guide.title}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
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
