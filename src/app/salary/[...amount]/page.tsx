// src/app/salary/[...amount]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
import { salaryData, calculateRank } from "@/lib/salaryData";
import SalaryNudge from "@/components/SalaryNudge";
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

  const fmt = (n: number) => n.toLocaleString('ko-KR');
  const annualFmt = fmt(annualSalary);
  const eok = annualSalary >= 100000000 ? `${Math.floor(annualSalary / 100000000)}억` : `${Math.floor(annualSalary / 10000000)}천만원`;

  const title = `연봉 ${annualFmt}원 실수령액 2026 — 세후 월급·4대보험 계산기 | 머니샐러리`;
  const description = `연봉 ${annualFmt}원(${eok})의 2026년 월 실수령액은 얼마일까요? 국민연금·건강보험·고용보험·소득세 공제 후 실제 수령액, 부양가족 공제 적용액, 전국 근로자 대비 상위 몇 %인지 지금 바로 확인하세요.`;

  const { rank } = calculateRank(annualSalary, "all-all-all-all");

  return {
  title,
  description,
  keywords: [
  `연봉 ${annualFmt}원 실수령액`,
  `연봉 ${eok} 실수령액`,
  `연봉 ${eok} 세후 월급`,
  `연봉 ${eok} 4대보험`,
  '2026 연봉 계산기',
  '실수령액 계산기',
  '세후 월급 계산',
  ].join(', '),
  openGraph: {
  title,
  description,
  url: `https://www.moneysalary.com/salary/${params.amount.join("/")}`,
  siteName: '머니샐러리',
  type: "website",
  locale: 'ko_KR',
  images: [
  {
  url: `/api/og?title=${encodeURIComponent(jobTitle)}&salary=${annualSalary}&rank=${rank}`,
  width: 1200,
  height: 630,
  alt: title,
  },
  ],
  },
  twitter: {
  card: 'summary_large_image',
  title,
  description,
  },
  alternates: {
  canonical: `https://www.moneysalary.com/salary/${params.amount.join('/')}`,
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
  <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24">
  <SalaryDetailDashboard
  annualSalary={annualSalary}
  calculationResult={calculationResult}
  rank={rank ?? 0}
  rankData={rankData}
  />

  {/* 결과 바로 아래 비교 넛지 — 체류시간 증가 + 내부 링크 SEO */}
  <SalaryNudge currentSalary={annualSalary} />
  </main>
  );
}