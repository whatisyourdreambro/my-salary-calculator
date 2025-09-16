// src/app/guides/road-to-100m-part3-invest.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "월급으로 시작하는 투자 파이프라인 (2025년 투자 로드맵) | Moneysalary",
  description:
    "연봉으로 시작하는 가장 현실적인 투자 방법. 시드머니 모으기부터 미국 S&P 500 ETF, 연금저축펀드를 활용한 장기 투자 전략과 절세 혜택까지, 직장인을 위한 투자 로드맵을 제시합니다.",
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "월급으로 시작하는 투자 파이프라인 (2025년 투자 로드맵)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-16",
  description:
    "연봉으로 시작하는 가장 현실적인 투자 방법. 시드머니 모으기부터 미국 S&P 500 ETF, 연금저축펀드를 활용한 장기 투자 전략과 절세 혜택까지, 직장인을 위한 투자 로드맵을 제시합니다.",
};

export default function RoadTo100mInvestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <article className="prose dark:prose-invert lg:prose-xl w-full">
          <div className="mb-8">
            <h1 className="!mb-2 bg-gradient-to-r from-signature-blue to-violet-500 bg-clip-text text-transparent">
              월급으로 시작하는 투자 파이프라인 구축법
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              최종 업데이트: 2025년 9월 16일 | Road to 1억 시리즈 (3편)
            </p>
          </div>

          <p className="lead">
            열심히 일해서 번 돈, 통장에 그대로 잠들어 있지는 않나요? 인플레이션
            시대에 저축만으로는 자산을 불리기 어렵습니다.{" "}
            <strong>연봉 1억</strong>이라는 목표를 향한 마지막 퍼즐은 바로{" "}
            <strong>투자</strong>입니다. 매달 들어오는 월급을 기반으로, 꾸준하고
            안정적인 수익을 창출하는 현실적인 투자 파이프라인 구축 전략을
            소개합니다.
          </p>

          <h2>1단계: 목표 설정과 시드머니 마련</h2>
          <p>
            모든 투자의 시작은 명확한 목표 설정입니다.{" "}
            <strong>3년 안에 1억 모으기</strong>,{" "}
            <strong>매달 50만원 배당금 받기</strong> 등 구체적인 목표를 세우고,
            목표 달성을 위한 시드머니(종잣돈)를 마련해야 합니다. 가장 좋은
            방법은 <Link href="/">급여 계산기</Link>를 활용하여 고정 지출을
            제외한 월 저축 가능 금액을 파악하고, 강제 저축 시스템을 만드는
            것입니다.
          </p>

          <h2>2단계: 직장인 최고의 투자처, 미국 S&P 500 ETF</h2>
          <p>
            개별 종목을 분석할 시간이 부족한 직장인에게 가장 추천하는 투자처는
            바로 지수 추종 ETF(상장지수펀드)입니다. 특히{" "}
            <strong>미국 S&P 500 지수</strong>를 추종하는 ETF는 지난 수십 년간
            연평균 10% 내외의 안정적인 성장을 보여주었습니다.
          </p>
          <p>
            국내에 상장된 S&P 500 ETF에 투자하면{" "}
            <strong>연금저축펀드나 IRP 계좌</strong>를 통해 투자할 수 있다는 큰
            장점이 있습니다. 이를 통해{" "}
            <Link href="/guides/road-to-100m-part1-tax">
              절세 혜택(세액공제)
            </Link>
            과 장기적인 자산 증식이라는 두 마리 토끼를 모두 잡을 수 있습니다.
          </p>

          <h2>3단계: 꾸준함이 무기, 적립식 투자</h2>
          <p>
            주식 시장의 등락에 일희일비하지 않고, 매달 일정한 금액을 꾸준히
            투자하는 <strong>적립식 투자</strong>는 직장인에게 가장 적합한
            전략입니다. 주가가 낮을 때는 더 많은 수량을, 높을 때는 더 적은
            수량을 매수하게 되어 평균 매수 단가를 낮추는{" "}
            <strong>코스트 에버리징</strong> 효과를 누릴 수 있습니다.
          </p>

          <blockquote>
            <p>
              <strong>Road to 1억</strong> 시리즈는 여기서 마무리됩니다.
              계산부터 절세, 부업, 투자까지. Moneysalary는 당신의 경제적 자유를
              향한 여정을 항상 응원합니다.
            </p>
          </blockquote>
        </article>
      </main>
    </>
  );
}
