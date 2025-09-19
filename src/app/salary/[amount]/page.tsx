import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
import { salaryData } from "@/lib/salaryData";
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

  return {
    title: `연봉 ${formatNumber(
      amount
    )}원 실수령액, 순위, 완벽 분석 | Moneysalary`,
    description: `연봉 ${formatNumber(
      amount
    )}원의 월 실수령액, 4대 보험 공제 내역, 전국 근로자 대비 순위 및 맞춤형 재테크 가이드를 확인하세요.`,
    openGraph: {
      title: `연봉 ${formatNumber(amount)}원 실수령액 완벽 분석`,
      description: `월 실수령액부터 전국 순위, 추천 절세 팁까지 한눈에 확인하세요.`,
      url: `https://www.moneysalary.com/salary/${params.amount}`,
      type: "website",
    },
  };
}

// generateStaticParams를 수정하여 더 많은 롱테일 페이지를 생성합니다.
export async function generateStaticParams() {
  const paths = [];
  // 2000만원 ~ 1억원까지는 100만원 단위로 생성
  for (let i = 2000; i <= 10000; i += 100) {
    paths.push({ amount: i.toString() });
  }
  // 3000만원 ~ 8000만원 사이는 50만원 단위를 추가로 생성 (가장 검색량이 많은 구간)
  for (let i = 3050; i <= 7950; i += 100) {
    paths.push({ amount: i.toString() });
  }
  // 1억원 ~ 2억원까지는 500만원 단위로 생성
  for (let i = 10500; i <= 20000; i += 500) {
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

  const calculationResult = calculateNetSalary(annualSalary, 2400000, 1, 0, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const rankData = salaryData["all-all-all-all"];
  const findRank = () => {
    const rank = [...rankData.percentiles]
      .sort((a, b) => a.income - b.income)
      .reverse()
      .find((d) => annualSalary >= d.income);
    return rank ? 100 - rank.percentile : 0;
  };

  const rank = findRank();

  return (
    <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <SalaryDetailDashboard
        annualSalary={annualSalary}
        calculationResult={calculationResult}
        rank={rank}
        rankData={rankData}
      />
    </main>
  );
}
