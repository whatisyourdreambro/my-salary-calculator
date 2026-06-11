// src/app/earned-income-credit/page.tsx

import type { Metadata } from "next";
import EarnedIncomeCreditContent from "./EarnedIncomeCreditContent";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbLd, faqLd } from "@/lib/structuredData";

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

const FAQ_ITEMS = [
 {
  question: "2026년 근로장려금 신청 대상이 되려면 어떤 조건을 충족해야 하나요?",
  answer:
   "① 소득 요건: 단독가구 2,200만원, 홑벌이가구 3,200만원, 맞벌이가구 4,400만원 미만이어야 합니다. ② 재산 요건: 2025년 6월 1일 기준 가구원 전체 재산 합계가 2억 4천만원 미만이어야 합니다. ③ 국적 요건: 대한민국 국적자이거나 국적자와 혼인한 외국인이어야 합니다. 단독가구 연령 요건(과거 40세 이상)은 폐지되어 연령과 무관하게 신청할 수 있습니다.",
 },
 {
  question: "근로장려금은 얼마나 받을 수 있나요?",
  answer:
   "2026년(2025년 귀속) 기준 최대 지급액은 단독가구 165만원, 홑벌이가구 285만원, 맞벌이가구 330만원입니다. 소득 구간에 따라 점증→평탄→점감 구조로 지급되며, 재산이 1억 7천만원 이상이면 50% 감액됩니다.",
 },
 {
  question: "근로장려금 신청은 언제, 어떻게 하나요?",
  answer:
   "정기 신청은 매년 5월 1일~31일(전년도 소득 기준)입니다. 국세청 홈택스(www.hometax.go.kr), 손택스(모바일 앱), ARS(1544-9944), 세무서 방문 신청이 가능합니다. 반기 신청은 상반기분(3~8월 소득)은 9월, 하반기분(9~12월 소득)은 다음 해 3월에 신청합니다.",
 },
 {
  question: "자녀장려금과 근로장려금을 동시에 받을 수 있나요?",
  answer:
   "네, 동시에 받을 수 있습니다. 자녀장려금은 18세 미만 자녀가 있는 홑벌이·맞벌이 가구에 자녀 1인당 최대 100만원을 지급하는 별도 제도입니다. 근로장려금과 중복 수급이 가능하므로, 자녀가 있다면 둘 다 신청하는 것이 유리합니다.",
 },
 {
  question: "근로장려금을 받으면 건강보험료나 기초생활수급에 영향이 있나요?",
  answer:
   "근로장려금은 소득세법상 비과세 소득으로 건강보험료 산정에 포함되지 않습니다. 다만 기초생활보장 급여 수급 여부는 별도의 소득 인정액 계산 방식을 따르므로, 복지로(www.bokjiro.go.kr) 또는 주민센터를 통해 개별 확인하는 것이 좋습니다.",
 },
];

export default function EarnedIncomeCreditPage() {
 const breadcrumb = breadcrumbLd([
  { name: "홈", path: "/" },
  { name: "근로장려금 계산기", path: "/earned-income-credit" },
 ]);

 const faq = faqLd(FAQ_ITEMS);

 return (
  <main className="w-full min-h-screen bg-canvas">
   <JsonLd data={breadcrumb} />
   <JsonLd data={faq} />
   <EarnedIncomeCreditContent />
  </main>
 );
}
