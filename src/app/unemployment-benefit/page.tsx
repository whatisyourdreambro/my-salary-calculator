// src/app/unemployment-benefit/page.tsx

import type { Metadata } from "next";
import UnemploymentBenefitContent from "./UnemploymentBenefitContent";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "실업급여 계산기 2026 — 수령액·기간·신청 조건 즉시 계산",
 description:
  "2026년 실업급여(구직급여) 수령액을 즉시 계산. 월급·가입기간 입력 → 예상 지급액과 지급 일수 자동 계산. 자진 퇴사 예외 조건, 신청 방법, 구직활동 요건까지 완벽 가이드.",
 path: "/unemployment-benefit",
 keywords: [
  "실업급여 계산기",
  "실업급여 수령액",
  "실업급여 조건",
  "구직급여 계산",
  "실업급여 신청방법",
  "고용보험 실업급여",
  "실업급여 얼마",
  "실업급여 기간",
  "2026 실업급여",
 ],
});

const FAQ_ITEMS = [
 {
  question: "실업급여 신청 조건이 뭔가요?",
  answer:
   "퇴직 전 18개월 중 고용보험 피보험 기간이 180일 이상이고, 비자발적 퇴사(해고·권고사직·계약만료 등)여야 합니다. 자진 퇴사라도 임금 체불, 직장 내 괴롭힘, 통근 불가 등 정당한 사유가 있으면 수급 가능합니다.",
 },
 {
  question: "실업급여는 얼마나 받을 수 있나요?",
  answer:
   "퇴직 전 3개월 평균임금의 60%를 받습니다. 하한은 최저임금의 80% × 1일 소정근로시간으로, 2026년은 8시간 기준 하한액(66,048원)이 상한액(66,000원)보다 높아 사실상 일 66,048원(월 약 198만원) 정액 수준입니다. 50세 미만 기준 고용보험 가입 기간에 따라 120일~240일, 50세 이상은 최대 270일 지급됩니다.",
 },
 {
  question: "자진 퇴사하면 실업급여를 못 받나요?",
  answer:
   "원칙적으로 비자발적 퇴사여야 합니다. 하지만 임금 체불(2개월 이상), 직장 내 괴롭힘 피해, 배우자 이직으로 인한 이사, 통근 3시간 이상, 건강 악화 등 정당한 사유가 있는 자진 퇴사는 예외적으로 수급 자격이 인정됩니다.",
 },
 {
  question: "실업급여 받으면서 아르바이트할 수 있나요?",
  answer:
   "주 15시간 이상 또는 월 소득 60만원 초과 시 취업으로 보아 즉시 고용센터에 신고해야 합니다. 신고하면 해당 날은 급여가 차감되지만 지급 일수는 연장됩니다. 신고 없이 수령하면 부정수급으로 전액 반환 + 추가 징수 처분을 받습니다.",
 },
 {
  question: "조기재취업수당이 뭔가요?",
  answer:
   "수급 기간 중 잔여 급여 일수가 30일 이상 남은 상태에서 재취업하면 남은 급여의 50%를 일시금으로 받는 제도입니다. 재취업일 다음 날부터 12개월 이내에 고용센터에 신청해야 합니다.",
 },
];

export default function UnemploymentBenefitPage() {
 const breadcrumb = breadcrumbLd([
  { name: "홈", path: "/" },
  { name: "실업급여 계산기", path: "/unemployment-benefit" },
 ]);

 const faq = faqLd(FAQ_ITEMS);

 return (
  <main className="w-full min-h-screen bg-canvas">
   <JsonLd data={breadcrumb} />
   <JsonLd data={faq} />
   <UnemploymentBenefitContent />
  </main>
 );
}
