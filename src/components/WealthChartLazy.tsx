"use client";

// 서버 컴포넌트(page.tsx) 안에서 선언한 dynamic(ssr:false)은 Next 14에서 코드
// 분할이 되지 않아 recharts ~292kB(raw)가 /salary/[amount] 첫 로드에 포함됐음
// (2026-07-06 감사). 클라이언트 래퍼로 옮겨야 별도 청크로 분리된다.
import dynamic from "next/dynamic";

const WealthChartLazy = dynamic(() => import("@/components/WealthChart"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-white rounded-3xl border border-canvas-200 animate-pulse" />
  ),
});

export default WealthChartLazy;
