"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { StoredSalaryData } from "@/app/types";
import { findSalaryRank } from "@/lib/salaryData";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import Link from "next/link";

const formatNumber = (num: number) => num.toLocaleString();

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;

// [최종 수정] 라이브러리의 타입 정의와 실제 데이터 간의 불일치 문제를 해결하기 위해
// 타입 단언(as)을 사용하고, 해당 라인에 대해서만 ESLint 규칙을 비활성화합니다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

  // props 객체에 필요한 값이 없는 경우를 대비한 방어 코드
  if (
    [cx, cy, midAngle, innerRadius, outerRadius, percent].some(
      (val) => val === undefined
    )
  ) {
    return null;
  }

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) {
    return null;
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="16px"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Report = () => {
  const searchParams = useSearchParams();
  const [data, setData] = useState<StoredSalaryData | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queryData = searchParams.get("data");
    let dataSource = null;

    if (queryData) {
      try {
        dataSource = JSON.parse(atob(queryData));
      } catch (e) {
        console.error("Failed to parse data from URL", e);
      }
    } else {
      const savedData = localStorage.getItem("moneysalary-dashboard");
      if (savedData) {
        dataSource = JSON.parse(savedData);
      }
    }

    if (dataSource) {
      setData(dataSource);
      const { rank } = findSalaryRank(
        dataSource.annualSalary,
        "all-all-all-all"
      );
      setRank(rank);
    }
  }, [searchParams]);

  const handleDownload = () => {
    if (reportRef.current) {
      html2canvas(reportRef.current, {
        backgroundColor: null,
        scale: 2,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.download = `moneysalary_report_${data?.annualSalary}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  const handleShare = () => {
    if (data) {
      const encodedData = btoa(JSON.stringify(data));
      const shareUrl = `${window.location.origin}/report?data=${encodedData}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert("공유 링크가 클립보드에 복사되었습니다!");
      });
    }
  };

  if (!data) {
    return (
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h1 className="text-3xl font-bold">리포트 데이터를 불러오는 중...</h1>
        <p className="mt-4">
          저장된 연봉 정보가 없습니다.{" "}
          <Link href="/" className="text-signature-blue font-bold">
            홈으로 돌아가
          </Link>{" "}
          연봉을 계산하고 저장해주세요.
        </p>
      </main>
    );
  }

  const totalAnnual = data.annualSalary;
  const netAnnual = data.monthlyNet * 12;
  const totalDeduction = totalAnnual - netAnnual;

  const chartData = [
    { name: "실수령액", value: netAnnual },
    { name: "총 공제액", value: totalDeduction },
  ];

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div
        ref={reportRef}
        className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-lg border"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-signature-blue">
              나의 종합 연봉 리포트
            </h1>
            <p className="text-sm text-gray-500">Moneysalary.com</p>
          </div>
          <div className="text-right">
            <p className="font-bold">
              {new Date().toLocaleDateString("ko-KR")}
            </p>
            <p className="text-xs">기준</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                연봉
              </p>
              <p className="text-4xl font-bold text-light-text dark:text-dark-text">
                {formatNumber(totalAnnual)}원
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                세후 월 수령액
              </p>
              <p className="text-4xl font-bold text-signature-blue">
                {formatNumber(data.monthlyNet)}원
              </p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                대한민국 연봉 순위 (전체 기준)
              </p>
              <p className="text-4xl font-bold text-light-text dark:text-dark-text">
                상위 {rank ?? "..."}%
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <h3 className="text-xl font-bold mb-4">연봉 구성 비율</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${formatNumber(value)}원`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleShare}
          className="w-full py-3 bg-gray-200 dark:bg-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          링크로 공유하기
        </button>
        <button
          onClick={handleDownload}
          className="w-full py-3 bg-signature-blue text-white font-bold rounded-lg hover:bg-blue-700 transition"
        >
          이미지로 저장하기
        </button>
      </div>
    </main>
  );
};

export default function ReportPage() {
  return (
    <Suspense fallback={<div>Loading Report...</div>}>
      <Report />
    </Suspense>
  );
}
