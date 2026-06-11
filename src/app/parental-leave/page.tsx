// src/app/parental-leave/page.tsx

import type { Metadata } from "next";
import ParentalLeaveContent from "./ParentalLeaveContent";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "육아휴직 급여 계산기 2026 — 6+6 부모 육아휴직 수령액 즉시 계산",
 description:
  "2026년 육아휴직 급여를 즉시 계산. 1~3개월 통상임금 100%(상한 250만원)·사후지급금 폐지 반영. 6+6 부모 육아휴직 최대 월 450만원, 배우자 출산휴가 20일, 신청 조건까지 완벽 가이드.",
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
   "2025년 개편 기준으로 1~3개월은 통상임금 100%(상한 월 250만원), 4~6개월은 100%(상한 월 200만원), 7개월부터는 80%(상한 월 160만원)이며 하한은 월 70만원입니다. 사후지급금이 폐지되어 매월 전액 지급됩니다. 생후 18개월 이내 자녀를 둔 부모가 모두 사용하는 '6+6 부모 육아휴직'은 첫 6개월 동안 통상임금 100%에 상한이 최대 월 450만원(6개월차)까지 올라갑니다.",
 },
 {
  question: "육아휴직 신청 자격이 어떻게 되나요?",
  answer:
   "만 8세 이하(또는 초등학교 2학년 이하) 자녀가 있으며, 육아휴직 시작일 기준 고용보험 피보험 기간이 180일 이상인 근로자라면 신청할 수 있습니다. 정규직, 계약직, 기간제 근로자 모두 해당됩니다.",
 },
 {
  question: "6+6 부모 육아휴직이 뭔가요?",
  answer:
   "생후 18개월 이내 자녀를 위해 부모가 모두(동시 또는 순차로) 육아휴직을 사용할 때 첫 6개월 동안 통상임금 100%를 지급하는 제도입니다. 상한도 월 250만원(1개월)부터 시작해 6개월째에는 월 450만원까지 올라갑니다.",
 },
 {
  question: "출산전후휴가와 육아휴직을 모두 사용할 수 있나요?",
  answer:
   "네, 두 제도는 별개이므로 모두 사용 가능합니다. 일반적으로 출산전후휴가(90일) 후 바로 육아휴직을 이어서 사용합니다. 육아휴직 기간은 기본 1년이며, 부모가 각각 3개월 이상 사용하는 경우 등 조건을 충족하면 최대 1년 6개월까지 연장됩니다.",
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
