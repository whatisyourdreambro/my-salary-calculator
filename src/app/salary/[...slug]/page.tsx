// src/app/salary/[...slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
// [수정] findSalaryRank -> calculateRank 로 변경
import { salaryData, calculateRank } from "@/lib/salaryData";

export const runtime = "edge";

type Props = {
  params: { slug: string[] };
};

function parseSlug(slug: string[]) {
  const annualSalary = parseInt(slug[0], 10) * 10000 || 50000000;
  const jobTitle = slug.join(" ");
  const conditionKey = "all-all-all-all";

  return { annualSalary, jobTitle, conditionKey };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { annualSalary, jobTitle } = parseSlug(params.slug);
  if (isNaN(annualSalary) || annualSalary <= 0) {
    return { title: "정보를 찾을 수 없습니다." };
  }

  const formattedSalary = annualSalary.toLocaleString();
  const title = `연봉 ${formattedSalary}원 (${jobTitle}) 실수령액, 순위 분석 | Moneysalary`;
  const description = `연봉 ${formattedSalary}원 (${jobTitle})의 월 실수령액, 4대 보험 공제 내역, 전국 근로자 대비 순위 및 맞춤형 재테크 가이드를 확인하세요.`;

  // [수정] findSalaryRank -> calculateRank 로 변경
  const { rank } = calculateRank(annualSalary, "all-all-all-all");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.moneysalary.com/salary/${params.slug.join("/")}`,
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
  const { annualSalary, conditionKey } = parseSlug(params.slug);

  if (isNaN(annualSalary) || annualSalary <= 0) {
    notFound();
  }

  // [수정] 불필요한 인수(0)를 제거했습니다.
  const calculationResult = calculateNetSalary(annualSalary, 2400000, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  // [수정] findSalaryRank -> calculateRank 로 변경
  const { rank } = calculateRank(annualSalary, conditionKey);
  const rankData = salaryData[conditionKey] || salaryData["all-all-all-all"];

  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <SalaryDetailDashboard
        annualSalary={annualSalary}
        calculationResult={calculationResult}
        rank={rank ?? 0}
        rankData={rankData}
      />
    </main>
  );
}
