// src/components/FinancialHealthAnalysis.tsx

"use client";

import { AlertTriangle, ShieldCheck, Award } from "lucide-react";
import Link from "next/link";

interface FinancialHealthAnalysisProps {
  monthlyNet: number;
  monthlyExpenses: number;
}

const formatNumber = (num: number) => num.toLocaleString();

export default function FinancialHealthAnalysis({
  monthlyNet,
  monthlyExpenses,
}: FinancialHealthAnalysisProps) {
  if (monthlyNet <= 0 || monthlyExpenses <= 0) {
    return null;
  }

  const monthlySaving = monthlyNet - monthlyExpenses;
  const savingRate = Math.round((monthlySaving / monthlyNet) * 100);

  const getHealthStatus = () => {
    if (savingRate < 20) {
      return {
        Icon: AlertTriangle,
        color: "text-danger",
        bgColor: "bg-red-50 dark:bg-red-900/20",
        title: "위험: 재정 상태 점검이 시급합니다.",
        message: `현재 저축률은 ${savingRate}%로, 미래를 위한 재정적 준비가 부족한 상태입니다. 소비 습관을 점검하고 고정 지출을 줄이는 노력이 반드시 필요합니다.`,
        actionLink: "/guides/first-job-investment",
        actionText: "사회초년생 재테크 가이드 보기",
      };
    }
    if (savingRate < 50) {
      return {
        Icon: ShieldCheck,
        color: "text-primary",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        title: "안정: 잘하고 있지만, 더 발전할 수 있습니다.",
        message: `현재 저축률은 ${savingRate}%로, 안정적인 재무 흐름을 만들고 있습니다. 여기서 만족하지 말고, 투자 파이프라인을 구축하여 자산 증식 속도를 높여보세요.`,
        actionLink: "/guides/road-to-100m-part3-invest",
        actionText: "투자 파이프라인 구축 가이드 보기",
      };
    }
    return {
      Icon: Award,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      title: "우수: 훌륭한 재무 습관을 가지고 있습니다.",
      message: `현재 저축률은 ${savingRate}%로, 매우 훌륭한 저축 습관을 가지고 있습니다. 이제 N잡, 부수입 등을 통해 소득의 파이 자체를 키워 경제적 자유를 앞당기세요.`,
      actionLink: "/guides/road-to-100m-part2-sidejob",
      actionText: "N잡으로 월 100만원 더 벌기",
    };
  };

  const status = getHealthStatus();

  return (
    <div className={`mt-8 p-6 rounded-2xl border ${status.bgColor}`}>
      <div className="flex items-center gap-4">
        <status.Icon className={`w-10 h-10 ${status.color}`} />
        <div>
          <h3 className={`text-2xl font-bold ${status.color}`}>
            금융 건전성: {status.title}
          </h3>
        </div>
      </div>
      <div className="mt-4 pl-14">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              월 저축 가능액
            </p>
            <p className="font-bold text-lg">{formatNumber(monthlySaving)}원</p>
          </div>
          <div className="bg-light-card dark:bg-dark-card p-3 rounded-lg">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              예상 저축률
            </p>
            <p className={`font-bold text-lg ${status.color}`}>{savingRate}%</p>
          </div>
        </div>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          {status.message}
        </p>
        <Link
          href={status.actionLink}
          className={`mt-3 inline-block text-sm font-bold ${status.color} hover:underline`}
        >
          {status.actionText} →
        </Link>
      </div>
    </div>
  );
}
