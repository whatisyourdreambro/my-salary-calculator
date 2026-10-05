import SalaryRankCalculator from "@/components/calculators/SalaryRankCalculator";
import { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "내 연봉 순위 계산기 - 나는 상위 몇%일까?",
 description: "연봉과 나이대를 입력하면 자체 참고표 기준 또래 중 상위 몇 %인지 계산하고 연봉 등급 카드를 발급하는 무료 연봉 순위 계산기. 공식 전국 순위가 아니며 공식 통계의 기준연도·원자료는 확인되지 않았습니다. 카드 이미지 저장·공유 가능.",
 path: "/fun/salary-rank",
 keywords: ["연봉 순위 계산기", "연봉 상위 퍼센트", "연봉 백분위", "연봉 분포"],
});

export default function SalaryRankPage() {
 return (
 <main className="w-full min-h-screen bg-canvas pt-28 px-4 pb-20 font-sans">
 <div className="text-center mb-12 max-w-2xl mx-auto">
 <h1 className="text-4xl font-black tracking-tight text-navy mb-4">
 내 연봉은 <span className="text-primary">상위 몇%</span>일까?
 </h1>
 <p className="text-lg text-faint-blue font-medium">
 자체 연봉 분포표에서 나의 위치를 확인하세요.
 </p>
 </div>

 <SalaryRankCalculator />

 {/* 자매 도구 상호 링크 */}
 <div className="max-w-2xl mx-auto mt-10 text-center">
 <Link
 href="/fun/rank"
 className="inline-flex items-center gap-2 text-sm font-bold text-electric hover:underline"
 >
 가볍게 보고 싶다면? 연봉 분포 시뮬레이터 (간단 버전) →
 </Link>
 </div>
 </main>
 );
}
