// src/components/SalaryAnalysis.tsx

"use client";

import { TrendingUp, PiggyBank, Shield, BarChart2 } from "lucide-react";
import Link from "next/link";

interface SalaryAnalysisProps {
  annualSalary: number;
  monthlyNet: number;
}

const formatNumber = (num: number) => num.toLocaleString();

const AnalysisCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-secondary p-6 rounded-xl border">
    <Icon className="w-8 h-8 text-primary mb-3" />
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <div className="text-sm text-muted-foreground space-y-2">
      {children}
    </div>
  </div>
);

export default function SalaryAnalysis({
  annualSalary,
  monthlyNet,
}: SalaryAnalysisProps) {
  const getAnalysisContent = () => {
    if (annualSalary <= 45000000) {
      // 씨앗 단계 (연봉 ~4500만원)
      return {
        title: "씨앗 단계: 부의 기초를 다질 때입니다.",
        cards: [
          {
            icon: PiggyBank,
            title: "1. 강제 저축 시스템 구축",
            content: (
              <>
                <p>
                  지금은 소비보다 저축 습관이 중요합니다. 월 실수령액의 40%
                  이상, 즉{" "}
                  <strong className="text-primary">
                    {formatNumber(Math.round(monthlyNet * 0.4))}원 이상
                  </strong>
                  을 &apos;선저축 후지출&apos;하는 습관을 만드세요.
                </p>
                <Link
                  href="/guides/first-job-investment"
                  className="text-primary font-semibold hover:underline"
                >
                  사회초년생 재테크 가이드 →
                </Link>
              </>
            ),
          },
          {
            icon: Shield,
            title: "2. 절세의 첫걸음, 연말정산",
            content: (
              <>
                <p>
                  연금저축/IRP 계좌는 최고의 절세 방패입니다. 연 600만원(월
                  50만원) 납입 시, 연말에{" "}
                  <strong className="text-primary">최대 99만원</strong>을
                  돌려받을 수 있습니다. 지금 바로 시작하세요.
                </p>
                <Link
                  href="/guides/year-end-tax-settlement"
                  className="text-primary font-semibold hover:underline"
                >
                  연말정산 A to Z 가이드 →
                </Link>
              </>
            ),
          },
        ],
      };
    } else if (annualSalary <= 80000000) {
      // 성장 단계 (연봉 4500만원 ~ 8000만원)
      return {
        title: "성장 단계: 자산의 파이를 키울 때입니다.",
        cards: [
          {
            icon: TrendingUp,
            title: "1. 투자의 시작, ETF",
            content: (
              <>
                <p>
                  저축만으로는 자산을 불리기 어렵습니다. &apos;S&P 500&apos;과
                  같은 우량 지수추종 ETF에 매월{" "}
                  <strong className="text-primary">50만원 이상</strong>을
                  적립식으로 투자하여 복리의 마법을 경험하세요.
                </p>
                <Link
                  href="/guides/road-to-100m-part3-invest"
                  className="text-primary font-semibold hover:underline"
                >
                  투자 파이프라인 구축 가이드 →
                </Link>
              </>
            ),
          },
          {
            icon: BarChart2,
            title: "2. 몸값 올리기, 이직과 협상",
            content: (
              <>
                <p>
                  가장 확실한 투자는 &apos;나&apos; 자신에게 하는 투자입니다.
                  현재 연봉에 만족하지 말고, 시장 가치를 파악하여{" "}
                  <strong className="text-primary">최소 15% 이상</strong>의 연봉
                  상승을 목표로 이직을 준비하세요.
                </p>
                <Link
                  href="/guides/salary-negotiation"
                  className="text-primary font-semibold hover:underline"
                >
                  연봉 협상 전략 가이드 →
                </Link>
              </>
            ),
          },
        ],
      };
    } else {
      // 수확 단계 (연봉 8000만원~)
      return {
        title: "수확 단계: 자산을 지키고 불릴 때입니다.",
        cards: [
          {
            icon: Shield,
            title: "1. 고소득자를 위한 세금 관리",
            content: (
              <>
                <p>
                  높은 세율 구간에 진입한 만큼, IRP/연금저축 한도{" "}
                  <strong className="text-primary">연 900만원</strong>을 모두
                  활용하여{" "}
                  <strong className="text-primary">최대 148.5만원</strong>의
                  세금을 돌려받는 것이 필수입니다.
                </p>
                <Link
                  href="/guides/bonus-tax"
                  className="text-primary font-semibold hover:underline"
                >
                  성과급 세금 절세 가이드 →
                </Link>
              </>
            ),
          },
          {
            icon: PiggyBank,
            title: "2. 부의 파이프라인 다각화",
            content: (
              <>
                <p>
                  근로소득 외에 추가 현금 흐름을 만드세요. 전문성을 활용한 N잡,
                  배당주 투자 등으로{" "}
                  <strong className="text-primary">월 100만원</strong>의 추가
                  소득을 목표로 자산 포트폴리오를 다각화하세요.
                </p>
                <Link
                  href="/guides/road-to-100m-part2-sidejob"
                  className="text-primary font-semibold hover:underline"
                >
                  N잡으로 월 100만원 벌기 →
                </Link>
              </>
            ),
          },
        ],
      };
    }
  };

  const analysis = getAnalysisContent();

  return (
    <div className="mt-8 bg-card p-6 rounded-2xl shadow-xl border animate-fade-in-up">
      <h3 className="text-2xl font-bold text-center mb-2">
        AI 금융 분석 리포트
      </h3>
      <p className="text-center text-muted-foreground mb-6">
        {analysis.title}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysis.cards.map((card) => (
          <AnalysisCard key={card.title} icon={card.icon} title={card.title}>
            {card.content}
          </AnalysisCard>
        ))}
      </div>
    </div>
  );
}