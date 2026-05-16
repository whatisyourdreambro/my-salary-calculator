// src/app/parental-leave/page.tsx

import type { Metadata } from "next";
import ParentalLeaveContent from "./ParentalLeaveContent";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "육아휴직 급여 계산기 2026 — 6+6 부모 육아휴직 수령액 즉시 계산",
 description:
  "2026년 육아휴직 급여를 즉시 계산. 통상임금 입력 → 월별 예상 수령액 자동 계산. 6+6 부모 육아휴직 최대 월 450만원, 출산전후휴가 비교, 신청 조건까지 완벽 가이드.",
 path: "/parental-leave",
 keywords: [
  "육아휴직 급여 계산기",
  "육아휴직 수령액",
  "6+6 부모 육아휴직",
  "육아휴직 조건",
  "출산전후휴가",
  "육아휴직 신청방법",
  "2026 육아휴직",
  "육아기 근로시간 단축",
  "육아휴직 급여",
 ],
});

const FAQ_ITEMS = [
 {
  question: "2026년 육아휴직 급여는 얼마인가요?",
  answer:
   "통상임금의 80%(상한 월 150만원, 하한 월 70만원)입니다. 단, 생후 18개월 이내 자녀를 둔 부모가 모두 사용하는 '6+6 부모 육아휴직'은 첫 6개월 동안 통상임금 100%에 상한도 최대 월 450만원(6개월차)까지 올라갑니다.",
 },
 {
  question: "육아휴직 신청 자격이 어떻게 되나요?",
  answer:
   "만 8세 이하(또는 초등학교 2학년 이하) 자녀가 있으며, 육아휴직 시작일 기준 고용보험 피보험 기간이 180일 이상인 근로자라면 신청할 수 있습니다. 정규직, 계약직, 기간제 근로자 모두 해당됩니다.",
 },
 {
  question: "6+6 부모 육아휴직이 뭔가요?",
  answer:
   "생후 18개월 이내 자녀를 위해 부모가 모두(동시 또는 순차로) 육아휴직을 사용할 때 첫 6개월 동안 통상임금 100%를 지급하는 제도입니다. 상한도 월 200만원(1개월)부터 시작해 6개월째에는 월 450만원까지 올라갑니다.",
 },
 {
  question: "출산전후휴가와 육아휴직을 모두 사용할 수 있나요?",
  answer:
   "네, 두 제도는 별개이므로 모두 사용 가능합니다. 일반적으로 출산전후휴가(90일) 후 바로 육아휴직(최대 1년)을 이어서 사용합니다. 총 약 1년 3개월간 급여 지원을 받을 수 있습니다.",
 },
 {
  question: "회사가 육아휴직을 거부하면 어떻게 하나요?",
  answer:
   "회사는 정당한 사유 없이 육아휴직을 거부할 수 없습니다. 거부 시 500만원 이하 과태료, 불이익 처우 시 3년 이하 징역 또는 3,000만원 이하 벌금 대상입니다. 고용노동부(1350)에 신고하거나 근로복지공단에 구제 신청을 할 수 있습니다.",
 },
];

export default function ParentalLeavePage() {
 const breadcrumb = breadcrumbLd([
  { name: "홈", path: "/" },
  { name: "육아휴직 급여 계산기", path: "/parental-leave" },
 ]);

 const faq = faqLd(FAQ_ITEMS);

 return (
  <main className="w-full min-h-screen bg-canvas">
   <JsonLd data={breadcrumb} />
   <JsonLd data={faq} />
   <ParentalLeaveContent />
  </main>
 );
}
