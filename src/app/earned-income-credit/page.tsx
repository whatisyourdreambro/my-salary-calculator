// src/app/earned-income-credit/page.tsx

import type { Metadata } from "next";
import EarnedIncomeCreditContent from "./EarnedIncomeCreditContent";
import { EARNED_INCOME_CREDIT_FAQ } from "./faq";
import JsonLd from "@/components/JsonLd";
import ShareSection from "@/components/ShareSection";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "근로장려금 계산기 2026 — 단독·홑벌이·맞벌이 수령액 즉시 계산",
 description:
  "2026년 근로장려금 수령액을 즉시 계산. 가구 유형 선택 + 연간 소득 입력 → 예상 지급액 자동 계산. 단독 최대 165만원, 홑벌이 285만원, 맞벌이 330만원. 신청 방법·조건·일정 완벽 가이드.",
 path: "/earned-income-credit",
 keywords: [
  "근로장려금 계산기",
  "근로장려금 수령액",
  "근로장려금 조건",
  "근로장려금 신청",
  "2026 근로장려금",
  "근로장려금 얼마",
  "근로장려금 홑벌이",
  "근로장려금 맞벌이",
  "자녀장려금",
  "장려금 신청방법",
 ],
});

export default function EarnedIncomeCreditPage() {
 const breadcrumb = breadcrumbLd([
  { name: "홈", path: "/" },
  { name: "근로장려금 계산기", path: "/earned-income-credit" },
 ]);

 // 화면 FAQ 와 같은 배열(faq.ts) — 마크업 문항이 본문에 그대로 있어야 한다 (B15 META-02)
 const faq = faqLd(EARNED_INCOME_CREDIT_FAQ);

 // breadcrumb 은 위에서 이미 주입 — SoftwareApplication 만 추가 (BreadcrumbList 중복 금지)
 const app = softwareApplicationLd({
  name: "근로장려금 계산기",
  description:
   "2026년 근로장려금 수령액을 즉시 계산. 가구 유형 선택 + 연간 소득 입력 → 예상 지급액 자동 계산. 단독 최대 165만원, 홑벌이 285만원, 맞벌이 330만원. 신청 방법·조건·일정 완벽 가이드.",
  url: "/earned-income-credit",
 });

 return (
  <main className="w-full min-h-screen bg-canvas">
   <JsonLd data={breadcrumb} />
   <JsonLd data={faq} />
   <JsonLd data={app} />
   <EarnedIncomeCreditContent />
   <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
    <ShareSection contentType="tool" />
   </div>
  </main>
 );
}
