"use client";

import dynamic from "next/dynamic";
import DeferredSection from "@/components/DeferredSection";
import IslandBoundary, { IslandFallback } from "@/components/IslandBoundary";

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
      {/* 청크 로드 실패는 이 계산기 자리(로딩과 같은 min-h 560)에서만 대체 — 홈 본문·광고는 유지. */}
      <IslandBoundary
        name={id}
        fallback={<IslandFallback className="flex min-h-[560px] items-center justify-center text-center text-sm text-muted-foreground" message={`${title}를 불러오지 못했습니다.`} href={href} linkLabel={`${title} 페이지에서 계산하기`} />}
      >
        <Component />
      </IslandBoundary>
    </DeferredSection>
  );
}
