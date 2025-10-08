// src/app/salary/[amount]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import SalaryDetailDashboard from "@/components/SalaryDetailDashboard";
import { calculateNetSalary } from "@/lib/calculator";
import { salaryData, findSalaryRank } from "@/lib/salaryData";
import SalaryAnalysis from "@/components/SalaryAnalysis"; // 연봉별 맞춤 분석 컴포넌트 추가

export const runtime = "edge";

type Props = {
  params: { amount: string };
};

const formatNumber = (num: number) => num.toLocaleString();

/**
 * [SEO 초고도화 1] 동적 메타데이터 생성 최적화
 * 각 연봉 페이지에 고유하고 구체적인 제목과 설명을 부여하여 검색 엔진의 이해도를 높입니다.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const amount = parseInt(params.amount, 10) * 10000;
  if (isNaN(amount) || amount < 0) {
    return { title: "정보를 찾을 수 없습니다." };
  }

  const { rank } = findSalaryRank(amount, "all-all-all-all");
  const formattedSalary = formatNumber(amount);
  const { monthlyNet } = calculateNetSalary(amount, 2400000, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const title = `연봉 ${formattedSalary}원 실수령액: 월 ${formatNumber(
    monthlyNet
  )}원 (상위 ${rank}%)`;
  const description = `연봉 ${formattedSalary}원의 2025년 최신 기준 세후 실수령액, 월급 상세 공제 내역, 전국 근로자 대비 소득 순위 및 맞춤형 재테크 전략을 확인하세요.`;

  return {
    title: `${title} | Moneysalary`,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.moneysalary.com/salary/${params.amount}`,
      type: "article",
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(
            `연봉 ${formattedSalary}원`
          )}&description=${encodeURIComponent(
            `월 실수령액은 약 ${formatNumber(monthlyNet)}원 입니다.`
          )}&rank=${rank}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

/**
 * [SEO 초고도화 2] FAQ 스키마 데이터 동적 생성
 * '연봉 X원의 실수령액은?', '연봉 X원의 세금은?' 등 예상 질문과 답변을 구조화된 데이터로 제공하여
 * 구글 검색 결과에 '자주 묻는 질문(FAQ)' 형태로 노출될 확률을 극대화합니다.
 */
const getFaqStructuredData = (
  annualSalary: number,
  monthlyNet: number,
  totalDeduction: number
) => {
  const formattedSalary = formatNumber(annualSalary);
  const formattedMonthlyNet = formatNumber(monthlyNet);
  const formattedTotalDeduction = formatNumber(totalDeduction);

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `연봉 ${formattedSalary}원의 실수령액은 얼마인가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `2025년 최신 세법 기준, 연봉 ${formattedSalary}원의 월 평균 실수령액은 약 ${formattedMonthlyNet}원입니다. 이는 4대 보험과 소득세 등 월 평균 약 ${formattedTotalDeduction}원의 공제액이 제외된 금액입니다.`,
        },
      },
      {
        "@type": "Question",
        name: `연봉 ${formattedSalary}원은 대한민국 상위 몇 %인가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `국가통계포털(KOSIS) 데이터 기반으로 분석한 결과, 연봉 ${formattedSalary}원은 전체 임금 근로자 중 상위 ${
            findSalaryRank(annualSalary, "all-all-all-all").rank
          }%에 해당하는 소득 수준입니다.`,
        },
      },
      {
        "@type": "Question",
        name: `연봉 ${formattedSalary}원에 맞는 재테크 방법은 무엇인가요?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `연봉 ${formattedSalary} 구간은 본격적으로 자산을 불려나가야 하는 중요한 시기입니다. '선저축 후지출' 습관을 만들고, 연금저축펀드/IRP를 활용한 절세와 S&P 500 ETF 등 우량 자산에 대한 장기 투자를 시작하는 것을 추천합니다. 자세한 내용은 본문 하단의 AI 금융 분석 리포트를 참고하세요.`,
        },
      },
    ],
  };
};

// Next.js가 빌드 시점에 미리 페이지를 생성하도록 경로를 제공합니다.
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

  const calculationResult = calculateNetSalary(annualSalary, 2400000, 1, 0, {
    isSmeYouth: false,
    disabledDependents: 0,
    seniorDependents: 0,
  });

  const { rank } = findSalaryRank(annualSalary, "all-all-all-all");
  const rankData = salaryData["all-all-all-all"];

  const faqStructuredData = getFaqStructuredData(
    annualSalary,
    calculationResult.monthlyNet,
    calculationResult.totalDeduction
  );

  return (
    <>
      {/* [SEO 초고도화 3] 생성된 스키마 데이터를 페이지에 삽입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <SalaryDetailDashboard
          annualSalary={annualSalary}
          calculationResult={calculationResult}
          rank={rank ?? 0}
          rankData={rankData}
        />
        {/* [콘텐츠 초고도화] 연봉별 맞춤 분석 및 재테크 가이드 컴포넌트 추가 */}
        <SalaryAnalysis
          annualSalary={annualSalary}
          monthlyNet={calculationResult.monthlyNet}
        />
      </main>
    </>
  );
}
