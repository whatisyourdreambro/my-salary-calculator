import type { Metadata } from "next";
import HomeLoanSimulator from "@/components/HomeLoanSimulator";
import RelatedCalculators from "@/components/RelatedCalculators";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, softwareApplicationLd, faqLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "주택담보대출 계산기 - DSR/LTV 한도·월 상환액 (2026)",
 description:
 "2026년 최신 DSR 40% 규제 반영. 주택 가격·대출 금리·기간을 입력하고 월 상환액, 총 이자, 내 연봉으로 받을 수 있는 대출 한도를 즉시 계산하세요.",
 path: "/home-loan",
 keywords: [
 "주택담보대출 계산기",
 "DSR 계산기",
 "LTV 계산기",
 "주담대 한도",
 "월 상환액 계산기",
 "내 연봉 대출 한도",
 ],
});

const FAQ_ITEMS = [
 {
 question: "주택담보대출 한도는 어떻게 결정되나요?",
 answer:
 "DSR(총부채원리금상환비율)과 LTV(담보인정비율) 두 가지로 결정됩니다. 2026년 기준 DSR 40%, 규제지역 LTV 50% 이내에서 더 작은 금액이 한도가 됩니다.",
 },
 {
 question: "DSR 40% 규제는 무엇인가요?",
 answer:
 "총부채의 연간 원리금 상환액이 연소득의 40%를 넘지 않도록 하는 규제입니다. 예를 들어 연봉 5,000만원이면 연 2,000만원, 월 약 167만원이 모든 대출의 상환액 합계 상한입니다.",
 },
 {
 question: "원리금균등 vs 원금균등, 어느 쪽이 유리한가요?",
 answer:
 "원리금균등은 매월 상환액이 일정해 가계부 관리가 쉽지만 총 이자가 더 큽니다. 원금균등은 초기 부담이 크지만 총 이자가 적습니다. 여유자금이 있다면 원금균등이 유리합니다.",
 },
];

export default function HomeLoanPage() {
 return (
 <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pt-24 sm:pt-28 pb-20">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "주택담보대출 계산기", path: "/home-loan" },
 ]),
 softwareApplicationLd({
 name: "주택담보대출 계산기",
 description:
 "DSR/LTV 한도와 월 상환액, 총 이자를 2026 세법 기준으로 계산.",
 url: "/home-loan",
 }),
 faqLd(FAQ_ITEMS),
 ]}
 />

 <header className="text-center mb-10 sm:mb-12">
 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-10 border border-primary-20 text-electric font-bold text-[12px] mb-5">
 🏡 내 집 마련 시뮬레이터
 </span>
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.04em] text-navy dark:text-canvas-50 leading-[1.1] mb-4">
 주택담보대출 <span className="text-electric">한도·월 상환액</span>
 </h1>
 <p className="text-base sm:text-lg text-muted-blue dark:text-canvas-300 max-w-xl mx-auto leading-relaxed font-medium">
 DSR 40% 규제와 LTV를 모두 반영해, 받을 수 있는 실제 한도와 월 상환액을 즉시 계산합니다.
 </p>
 </header>

 <HomeLoanSimulator />

 <RelatedCalculators currentPath="/home-loan" />
 </div>
 </main>
 );
}
