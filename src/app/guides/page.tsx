// src/app/guides/page.tsx

import type { Metadata } from "next";
import GuidesList from "@/components/GuidesList";

export const metadata: Metadata = {
  title: "Moneysalary 금융 가이드 | 연봉, 세금, 재테크의 모든 것",
  description: "직장인을 위한 가장 현실적인 금융 인사이트. 연봉 실수령액부터 퇴직금, 연말정산, 투자 전략까지. 당신의 경제적 자유를 위한 모든 지식을 담았습니다.",
};

import { guides, categories } from "@/lib/guidesData";

export default function GuidesPage() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Moneysalary 금융 라이브러리
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          당신의 경제적 자유를 위한 모든 지식을 담았습니다. <br /> 가장 궁금한
          주제부터 탐색해보세요.
        </p>
      </div>

      <GuidesList guides={guides} categories={categories} />
    </main>
  );
}