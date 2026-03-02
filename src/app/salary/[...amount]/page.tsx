// src/app/salary/[...amount]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
import { salaryData, calculateRank } from "@/lib/salaryData";
import AdUnit from "@/components/AdUnit";

export const revalidate = 86400;

// [필수] Cloudflare Pages 호환을 위해 순수 Edge 런타임만 선언합니다.
export const runtime = "edge";

type Props = {
  params: { amount: string[] }; // 폴더명이 [...amount] 이므로 slug대신 amount로 매핑
};

function parseSlug(slug: string[]) {
  const annualSalary = parseInt(slug[0], 10) * 10000 || 50000000;
  const jobTitle = slug.slice(1).join(" ") || "직장인"; // 수정된 파싱
  const conditionKey = "all-all-all-all";

  return { annualSalary, jobTitle, conditionKey };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { annualSalary, jobTitle } = parseSlug(params.amount);
  if (isNaN(annualSalary) || annualSalary <= 0) {
    return { title: "정보를 찾을 수 없습니다." };
  }

  const formattedSalary = annualSalary.toLocaleString();
  const title = `연봉 ${formattedSalary}원 (${jobTitle}) 실수령액, 순위 분석 | Moneysalary`;
  const description = `연봉 ${formattedSalary}원 (${jobTitle})의 월 실수령액, 4대 보험 공제 내역, 전국 근로자 대비 순위 및 맞춤형 재테크 가이드를 확인하세요.`;

  const { rank } = calculateRank(annualSalary, "all-all-all-all");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.moneysalary.com/salary/${params.amount.join("/")}`,
      type: "website",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            jobTitle
          )}&salary=${annualSalary}&rank=${rank}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default function SalarySlugPage({ params }: Props) {
  const { annualSalary, conditionKey } = parseSlug(params.amount);

  if (isNaN(annualSalary) || annualSalary <= 0) {
    notFound();
  }

  const calculationResult = calculateNetSalary(annualSalary, 2400000, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const { rank } = calculateRank(annualSalary, conditionKey);
  const rankData = salaryData[conditionKey] || salaryData["all-all-all-all"];

  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-10">
      {/* 상단 배너 광고 */}
      <AdUnit slotId="9958502911" format="auto" className="mb-8" label="상단 배너" />

      <SalaryDetailDashboard
        annualSalary={annualSalary}
        calculationResult={calculationResult}
        rank={rank ?? 0}
        rankData={rankData}
      />

      {/* 대시보드 하단 프리미엄 본문 광고 */}
      <div className="mt-12">
        <AdUnit slotId="5584143639" format="auto" label="결과창 프리미엄" />
      </div>
    </main>
  );
}