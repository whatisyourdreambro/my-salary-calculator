// src/app/parental-leave/page.tsx

import type { Metadata } from "next";
import ParentalLeaveContent from "./ParentalLeaveContent";
import { PARENTAL_LEAVE_FAQ } from "./faq";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

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

export default function ParentalLeavePage() {
 const breadcrumb = breadcrumbLd([
  { name: "홈", path: "/" },
  { name: "육아휴직 급여 계산기", path: "/parental-leave" },
 ]);

 // 화면 FAQ 와 같은 배열(faq.ts) — 마크업 문항이 본문에 그대로 있어야 한다 (B15 META-02)
 const faq = faqLd(PARENTAL_LEAVE_FAQ);

 // breadcrumb 은 위에서 이미 주입 — SoftwareApplication 만 추가 (BreadcrumbList 중복 금지)
 const app = softwareApplicationLd({
  name: "육아휴직 급여 계산기",
  description:
   "2026년 육아휴직 급여를 즉시 계산. 1~3개월 통상임금 100%(상한 250만원)·사후지급금 폐지 반영. 6+6 부모 육아휴직 최대 월 450만원, 배우자 출산휴가 20일, 신청 조건까지 완벽 가이드.",
  url: "/parental-leave",
 });

 return (
  <main className="w-full min-h-screen bg-canvas">
   <JsonLd data={breadcrumb} />
   <JsonLd data={faq} />
   <JsonLd data={app} />
   <ParentalLeaveContent />
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
    <ShareSection contentType="tool" />
   </div>
  </main>
 );
}
