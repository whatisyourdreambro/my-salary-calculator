// src/app/unemployment-benefit/page.tsx

import type { Metadata } from "next";
import UnemploymentBenefitContent from "./UnemploymentBenefitContent";
import { UNEMPLOYMENT_BENEFIT_FAQ } from "./faq";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

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

export default function UnemploymentBenefitPage() {
 const breadcrumb = breadcrumbLd([
  { name: "홈", path: "/" },
  { name: "실업급여 계산기", path: "/unemployment-benefit" },
 ]);

 // 화면 FAQ 와 같은 배열(faq.ts) — 마크업 문항이 본문에 그대로 있어야 한다 (B15 META-02)
 const faq = faqLd(UNEMPLOYMENT_BENEFIT_FAQ);

 // breadcrumb 은 위에서 이미 주입 — SoftwareApplication 만 추가 (BreadcrumbList 중복 금지)
 const app = softwareApplicationLd({
  name: "실업급여 계산기",
  description:
   "2026년 실업급여(구직급여) 수령액을 즉시 계산. 월급·가입기간 입력 → 예상 지급액과 지급 일수 자동 계산. 자진 퇴사 예외 조건, 신청 방법, 구직활동 요건까지 완벽 가이드.",
  url: "/unemployment-benefit",
 });

 return (
  <main className="w-full min-h-screen bg-canvas">
   <JsonLd data={breadcrumb} />
   <JsonLd data={faq} />
   <JsonLd data={app} />
   <UnemploymentBenefitContent />
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
    <ShareSection contentType="tool" />
   </div>
  </main>
 );
}
