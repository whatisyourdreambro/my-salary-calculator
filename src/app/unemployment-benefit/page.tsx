// src/app/unemployment-benefit/page.tsx

import type { Metadata } from "next";
import UnemploymentBenefitContent from "./UnemploymentBenefitContent";
import { UNEMPLOYMENT_BENEFIT_FAQ } from "./faq";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";

// 검색 설명·SoftwareApplication 설명 — 1일 상·하한은 정본 상수(config/unemploymentBenefit)에서 만든다(2026-11-15 SEASONB ideas[6]).
// 상한 = 고용보험법 시행령 제68조 제1항 임금일액 상한 × 60%(고용보험법 제46조), 하한 = 이직 연도 최저시급 × 80% × 1일 소정근로시간
// 8시간(같은 조) — 금액은 이 상수에서만 읽는다(리터럴 금지, verify:tax). 1월 고시·최저임금 전환 때 상수만 바꾸면 이 문장도 따라간다.
// 검색 설명 변경 기록: docs/gsc-sniping-log.md.
const won = (n: number): string => Math.round(n).toLocaleString("en-US");
const UNEMPLOYMENT_DESCRIPTION = `${UNEMPLOYMENT_BENEFIT_2026.YEAR}년 실업급여(구직급여) 수령액을 즉시 계산. 1일 상한 ${won(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER)}원·하한 ${won(unemploymentDailyLowerBound())}원(${UNEMPLOYMENT_BENEFIT_2026.MAX_DAILY_HOURS}시간 기준) 반영. 월급·가입기간 입력 → 예상 지급액과 지급 일수 자동 계산. 자진 퇴사 예외 조건, 신청 방법까지 정리.`;

export const metadata: Metadata = buildPageMetadata({
 title: "실업급여 계산기 2026 — 수령액·기간·신청 조건 즉시 계산",
 description: UNEMPLOYMENT_DESCRIPTION,
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
  description: UNEMPLOYMENT_DESCRIPTION,
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
