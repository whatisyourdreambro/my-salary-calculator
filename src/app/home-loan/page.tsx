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
 <main className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
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

 <div className="text-center mb-10">
 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
 🏡 내 집 마련 시뮬레이터
 </h1>
 <p className="mt-4 text-base lg:text-lg text-muted-blue">
 주택담보대출, 얼마나 받을 수 있을까? 월 상환액과 DSR을 미리 계산하고
 똑똑하게 계획하세요.
 </p>
 </div>

 <HomeLoanSimulator />

 <RelatedCalculators currentPath="/home-loan" />
 </main>
 );
}
