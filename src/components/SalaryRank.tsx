"use client";

import { useState, useMemo, useRef } from "react";
import CurrencyInput from "./CurrencyInput";
import html2canvas from "html2canvas";
import Link from "next/link";
import { findSalaryRank, salaryData } from "@/lib/salaryData"; // salaryData 직접 import

const formatNumber = (num: number) => num.toLocaleString();

export default function SalaryRank() {
  const [salaryInput, setSalaryInput] = useState("");
  const [jobCategory, setJobCategory] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [ageGroup, setAgeGroup] = useState("all");
  const [region, setRegion] = useState("all");
  const resultCardRef = useRef<HTMLDivElement>(null);

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

    if (!salaryData[key]) {
      key = `all-${experienceLevel}-${ageGroup}-all`;
      if (!salaryData[key]) {
        key = "all-all-all-all";
      }
    }

    const { rank, median, average } = findSalaryRank(annualSalary, key);

    const jobMap: Record<string, string> = {
      all: "전체 직군",
      management: "경영/사무",
      it_dev: "IT/개발",
      design: "디자인",
      professional: "전문직",
      manufacturing: "생산/기술",
    };
    const expMap: Record<string, string> = {
      all: "전체 경력",
      "1-3": "1~3년차",
      "4-7": "4~7년차",
      "8+": "8년 이상",
    };
    const ageMap: Record<string, string> = {
      all: "전체 연령",
      "20s": "20대",
      "30s": "30대",
      "40s": "40대+",
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
      .join("/");

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

  const handleCapture = () => {
    const card = resultCardRef.current;
    if (card) {
      html2canvas(card, { backgroundColor: "#007FFF" }).then((canvas) => {
        const link = document.createElement("a");
        link.download = "my-salary-report.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
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
          <option value="it_dev">IT/개발</option>
          <option value="design">디자인</option>
          <option value="professional">전문직(의료/법률/금융)</option>
          <option value="manufacturing">생산/기술</option>
        </select>
        <select
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card focus:ring-2 focus:ring-signature-blue"
        >
          <option value="all">전체 경력</option>
          <option value="1-3">1~3년</option>
          <option value="4-7">4~7년</option>
          <option value="8+">8년 이상</option>
        </select>
        <select
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="w-full mt-1 p-2 border rounded-lg dark:bg-dark-card focus:ring-2 focus:ring-signature-blue"
        >
          <option value="all">전체 연령</option>
          <option value="20s">20대</option>
          <option value="30s">30대</option>
          <option value="40s">40대 이상</option>
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
          <div
            ref={resultCardRef}
            className="mt-8 p-6 bg-signature-blue text-white rounded-2xl shadow-xl relative"
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
