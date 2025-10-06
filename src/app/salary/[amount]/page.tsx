// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
import { salaryData, findSalaryRank } from "@/lib/salaryData";
export const runtime = "edge";

type Props = {
  params: { amount: string };
};

const formatNumber = (num: number) => num.toLocaleString();

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const amount = parseInt(params.amount, 10) * 10000;
  if (isNaN(amount) || amount < 0) {
    return { title: "정보를 찾을 수 없습니다." };
  }

  // 연봉 순위 계산 로직 추가
  const { rank } = findSalaryRank(amount, "all-all-all-all");

  const formattedSalary = formatNumber(amount);
  const title = `연봉 ${formattedSalary}원 실수령액, 순위, 완벽 분석`;
  const description = `월 실수령액부터 전국 순위, 추천 절세 팁까지 한눈에 확인하세요.`;

  return {
    title: `${title} | Moneysalary`,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.moneysalary.com/salary/${params.amount}`,
      type: "website",
      // 동적으로 OG 이미지 URL 생성
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            `연봉 ${formattedSalary}원`
          )}&description=${encodeURIComponent(
            `월 실수령액은 얼마일까요?`
          )}&rank=${rank}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export async function generateStaticParams() {
  const paths = [];
  for (let i = 2000; i <= 10000; i += 50) {
    paths.push({ amount: i.toString() });
  }
  for (let i = 10100; i <= 20000; i += 100) {
    paths.push({ amount: i.toString() });
  }
  for (let i = 20500; i <= 50000; i += 500) {
    paths.push({ amount: i.toString() });
  }
  return paths;
}

export default function SalaryDetailPage({ params }: Props) {
  const amountParam = parseInt(params.amount, 10);
  if (isNaN(amountParam) || amountParam <= 0) {
    notFound();
  }
  const annualSalary = amountParam * 10000;

  // [수정] 불필요한 인수(0)를 제거했습니다.
  const calculationResult = calculateNetSalary(annualSalary, 2400000, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const { rank } = findSalaryRank(annualSalary, "all-all-all-all");
  const rankData = salaryData["all-all-all-all"];

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
