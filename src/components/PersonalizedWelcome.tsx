// src/components/PersonalizedWelcome.tsx
"use client";

import Link from "next/link";
import type { StoredFinancialData } from "@/app/types";
import { ArrowRight } from "lucide-react";

interface Props {
  profile: StoredFinancialData | null;
}

export default function PersonalizedWelcome({ profile }: Props) {
  // Render only if profile and salary history exist
  if (!profile || !profile.salary || !profile.salary.monthlyNet) {
    return null;
  }

  const { monthlyNet } = profile.salary;
  const formattedNet = new Intl.NumberFormat("ko-KR").format(monthlyNet);

  return (
    <div className="mb-8 p-6 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-800/50 rounded-xl shadow-md animate-fade-in-up">
      <h2 className="text-2xl font-bold text-primary">다시 오셨군요!</h2>
      <p className="mt-2 text-lg text-light-text-secondary dark:text-dark-text-secondary">
        최근 계산하신 월 실수령액은{" "}
        <strong className="text-light-text dark:text-dark-text font-bold">
          {formattedNet}원
        </strong>
        이었습니다.
      </p>
      <Link href="/dashboard">
        <button className="mt-4 px-6 py-2 bg-gray-800 text-white dark:bg-white dark:text-black font-semibold rounded-full text-sm hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors flex items-center gap-2">
          나의 금융 대시보드로 이동하기 <ArrowRight size={16} />
        </button>
      </Link>
    </div>
  );
}
