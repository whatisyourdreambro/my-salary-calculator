// src/app/page.tsx

"use client";

import dynamic from 'next/dynamic';
import { CheckCircle, BarChart, TrendingUp, Calculator } from "lucide-react";

const CalculatorTabs = dynamic(() => import('@/components/CalculatorTabs'), {
  ssr: false,
  loading: () => <div className="w-full h-[500px] flex justify-center items-center"><p>계산기 로딩 중...</p></div>
});

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Moneysalary",
  url: "https://www.moneysalary.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.moneysalary.com/salary/{search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const FeatureCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full">
    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{children}</p>
  </div>
);

export default function HomePage() {
  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById("calculator-section");
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      <main className="w-full">
        {/* Hero Section */}
        <section className="text-center py-20 sm:py-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-fade-in-up">
            당신의 연봉,
            <br />
            <span className="text-primary">정확한 가치를 알다</span>
          </h1>
          <p
            className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            2025년 최신 기준 연봉 실수령액 계산부터 퇴직금, 연말정산까지.
            <br />
            머니샐러리가 당신의 성공적인 금융 여정을 돕습니다.
          </p>
          <div
            className="mt-10 flex justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={scrollToCalculator}
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg text-lg hover:brightness-95 transition-all"
            >
              계산 시작하기
            </button>
          </div>
        </section>

        {/* Calculator Tabs Section */}
        <div
          id="calculator-section"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <CalculatorTabs />
        </div>

        {/* Features Section */}
        <section className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              당신의 금융 파트너, 머니샐러리
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              정확한 계산을 넘어, 건강한 재무 관리를 위한 다양한 기능을
              제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={Calculator} title="종합 소득 계산">
              정규직, 프리랜서 등 다양한 고용 형태에 맞는 정확한 세후 소득을
              계산합니다.
            </FeatureCard>
            <FeatureCard icon={BarChart} title="연봉 정보 분석">
              연봉 테이블, 순위 비교, 미래 연봉 예측을 통해 자신의 가치를
              객관적으로 파악하세요.
            </FeatureCard>
            <FeatureCard icon={TrendingUp} title="금융 성장 가이드">
              초년생부터 투자 전문가까지, 커리어와 자산 성장을 위한 맞춤형
              콘텐츠를 제공합니다.
            </FeatureCard>
            <FeatureCard icon={CheckCircle} title="나만의 금융 비서">
              대시보드에서 급여, 대출, 예상 세금 등을 한눈에 확인하고 관리할 수
              있습니다.
            </FeatureCard>
          </div>
        </section>
      </main>
    </>
  );
}
