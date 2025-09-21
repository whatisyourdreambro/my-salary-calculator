// src/components/ShareableResult.tsx

"use client";

import { useMemo } from "react";
import CountUp from "react-countup";
import { calculateNetSalary } from "@/lib/calculator";
import type { AdvancedSettings } from "@/app/types";
import Link from "next/link";

const formatNumber = (num: number) => num.toLocaleString();

interface ShareableResultProps {
  data: string;
}

export default function ShareableResult({ data }: ShareableResultProps) {
  const decodedData = useMemo(() => {
    try {
      return JSON.parse(atob(data));
    } catch {
      // [수정] 사용하지 않는 변수 e를 제거했습니다.
      return null;
    }
  }, [data]);

  const result = useMemo(() => {
    if (!decodedData) return null;
    const { annualSalary, nonTaxableAmount, dependents, children } =
      decodedData;
    const settings: AdvancedSettings = {
      isSmeYouth: false,
      disabledDependents: 0,
      seniorDependents: 0,
    };
    return calculateNetSalary(
      annualSalary,
      nonTaxableAmount * 12,
      dependents,
      children,
      settings
    );
  }, [decodedData]);

  if (!decodedData || !result) {
    return (
      <div className="text-center p-8 bg-light-card dark:bg-dark-card rounded-2xl shadow-lg border">
        <h1 className="text-2xl font-bold text-danger">잘못된 정보입니다.</h1>
        <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
          공유된 데이터가 올바르지 않습니다. 다시 시도해주세요.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 py-3 px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const { annualSalary } = decodedData;

  return (
    <div className="bg-light-card dark:bg-dark-card p-8 rounded-2xl shadow-2xl border animate-fade-in-up">
      <div className="text-center">
        <p className="font-semibold text-light-text-secondary dark:text-dark-text-secondary">
          공유받은 연봉 분석 결과
        </p>
        <h2 className="text-3xl font-bold my-2">
          연봉{" "}
          <span className="text-primary">{formatNumber(annualSalary)}원</span>의
        </h2>
        <h1 className="text-5xl sm:text-6xl font-bold text-primary my-4">
          월 실수령액은 <br />{" "}
          <CountUp end={result.monthlyNet} separator="," duration={1.5} />원
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          (세금 및 4대보험 공제 후)
        </p>
        <Link
          href="/"
          className="inline-block mt-8 py-4 px-10 bg-accent text-light-text font-bold text-lg rounded-lg hover:bg-accent-hover transition-transform transform hover:scale-105 shadow-lg"
        >
          나의 연봉도 계산해보기 →
        </Link>
      </div>
    </div>
  );
}
