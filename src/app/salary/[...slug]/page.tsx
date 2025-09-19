// src/app/salary/[...slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
import { salaryData, findSalaryRank } from "@/lib/salaryData";

export const runtime = "edge";

type Props = {
  params: { slug: string[] };
};

// slug 파라미터를 분석하여 연봉, 직업 등의 정보를 추출하는 함수
function parseSlug(slug: string[]) {
  // 예시: /salary/developer/5/samsung -> { job: 'developer', experience: 5, company: 'samsung' }
  // 실제 서비스에서는 이 slug를 기반으로 DB나 별도 데이터 소스에서 연봉 정보를 조회해야 합니다.
  // 여기서는 예시로 고정된 값을 반환합니다.
  const annualSalary = parseInt(slug[0], 10) * 10000 || 50000000;
  const jobTitle = slug.join(" ");
  const conditionKey = "all-all-all-all"; // slug에 따라 동적으로 키를 생성해야 합니다.

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

  const { rank } = findSalaryRank(annualSalary, "all-all-all-all");

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

  const calculationResult = calculateNetSalary(annualSalary, 2400000, 1, 0, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const { rank } = findSalaryRank(annualSalary, conditionKey);
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
