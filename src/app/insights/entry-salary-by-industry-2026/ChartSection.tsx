"use client";

// 서버 컴포넌트(리포트 페이지)에서 recharts를 직접 dynamic(ssr:false) 할 수 없어
// 클라이언트 경계를 만드는 얇은 래퍼. 차트 본체는 InsightEntrySalaryChart.
import dynamic from "next/dynamic";
import type { IndustryChartDatum } from "@/components/charts/InsightEntrySalaryChart";

const InsightEntrySalaryChart = dynamic(
  () =>
    import("@/components/charts/InsightEntrySalaryChart").then(
      (m) => m.InsightEntrySalaryChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl bg-canvas-100" />
    ),
  }
);

export default function ChartSection({ data }: { data: IndustryChartDatum[] }) {
  return (
    <div className="h-[560px] w-full">
      <InsightEntrySalaryChart data={data} />
    </div>
  );
}
