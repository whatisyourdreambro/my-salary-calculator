// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import type { StoredFinancialData } from "@/app/types";
import PersonalizedWelcome from "@/components/PersonalizedWelcome";
import CalculatorTabs from "@/components/CalculatorTabs";
import { CheckCircle, BarChart, TrendingUp, Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  <Card className="h-full transition-shadow hover:shadow-lg">
    <CardHeader>
      <Icon className="w-8 h-8 text-primary mb-2" />
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        {children}
      </p>
    </CardContent>
  </Card>
);

export default function HomePage() {
  const [userProfile, setUserProfile] = useState<StoredFinancialData | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("moneysalary-financial-data");
      if (savedData) {
        setUserProfile(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Failed to parse user profile from localStorage:", error);
    }
  }, []);

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
        <section className="text-center py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PersonalizedWelcome profile={userProfile} />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-light-text dark:text-dark-text animate-fade-in-up">
            당신의 진짜 가치를,
            <br />
            <span className="text-primary">숫자로 증명하세요.</span>
          </h1>
          <p
            className="mt-6 max-w-2xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            2025년 최신 세법 기준, 가장 정확한 연봉 계산기.
            <br />
            단순 계산을 넘어 당신의 경제적 여정을 함께합니다.
          </p>
        </section>

        {/* Calculator Tabs Section */}
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <CalculatorTabs />
        </div>

        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              모든 것은 숫자에서 시작됩니다
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-light-text-secondary dark:text-dark-text-secondary">
              Moneysalary는 단순한 계산기를 넘어, 당신의 금융 여정을 위한 강력한
              나침반입니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <FeatureCard icon={Calculator} title="정확한 실수령액">
                4대 보험, 소득세, 비과세액까지 완벽 반영하여 1원 단위까지
                정확하게 계산합니다.
              </FeatureCard>
            </div>
            <div>
              <FeatureCard icon={BarChart} title="객관적인 연봉 순위">
                국가 통계 데이터 기반으로 직군/경력별 내 연봉 위치를 객관적으로
                파악하세요.
              </FeatureCard>
            </div>
            <div>
              <FeatureCard icon={TrendingUp} title="미래 연봉 예측">
                나의 커리어패스를 직접 설계하고, 승진과 이직을 통한 미래 연봉
                변화를 시뮬레이션합니다.
              </FeatureCard>
            </div>
            <div>
              <FeatureCard icon={CheckCircle} title="종합 금융 대시보드">
                급여, 퇴직금, 대출 정보를 한 곳에 저장하고 관리하는 나만의 금융
                비서를 경험하세요.
              </FeatureCard>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}