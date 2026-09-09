"use client";

import dynamic from "next/dynamic";
import DeferredSection from "@/components/DeferredSection";

function LoadingCalculator() {
  return <div className="flex min-h-[560px] items-center justify-center text-sm text-muted-foreground" role="status">계산기를 불러오는 중입니다.</div>;
}

const LoanCalculator = dynamic(() => import("@/components/LoanCalculator"), { ssr: false, loading: LoadingCalculator });
const DepositCalculator = dynamic(() => import("@/components/DepositCalculator"), { ssr: false, loading: LoadingCalculator });

const calculators = {
  loan: { title: "대출 이자 계산기", href: "/tools/loan", Component: LoanCalculator },
  deposit: { title: "적금 이자 계산기", href: "/tools/deposit", Component: DepositCalculator },
};

/** Home-only mounting boundary; standalone tool pages keep their immediate forms. */
export default function DeferredHomeCalculator({ kind }: { kind: keyof typeof calculators }) {
  const id = `home-${kind}-calculator`;
  const { title, href, Component } = calculators[kind];

  return (
    <DeferredSection id={id} label={title} fallbackHref={href}>
      <Component />
    </DeferredSection>
  );
}
