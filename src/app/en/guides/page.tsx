import { enGuideCards, categoriesEn } from "@/lib/guidesData";
import EnglishGuidesClient from "./EnglishGuidesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: { absolute: "English Pay, Tax and Money Guides | Moneysalary" },
 description:
  "Understand Korean payslips, tax, insurance and employee compensation in English. Read dated sources, eligibility checks and transparent financial examples.",
 alternates: {
  canonical: "https://www.moneysalary.com/en/guides",
  languages: {
   "ko-KR": "https://www.moneysalary.com/guides",
   "en": "https://www.moneysalary.com/en/guides",
   "x-default": "https://www.moneysalary.com/guides",
  },
 },
 keywords:
  "korean salary guide english, korea tax insurance, employee compensation, korean payslip, korea job offer",
 openGraph: {
  title: "English Pay, Tax and Money Guides | Moneysalary",
  description:
   "English explanations of pay, tax, insurance and employee compensation, with sources and clear assumptions.",
  type: "website",
  locale: "en_US",
  url: "https://www.moneysalary.com/en/guides",
  images: [{ url: "https://www.moneysalary.com/api/og?lang=en&title=English+Pay+Tax+and+Money+Guides", width: 1200, height: 630 }],
 },
 twitter: {
  card: "summary_large_image",
  title: "English Pay, Tax and Money Guides | Moneysalary",
  description:
   "Pay, insurance, tax and employee-compensation questions explained in English with dated sources.",
 },
};

export default function EnglishGuidesIndex() {
 // 실제 영문 가이드가 존재하는 카테고리만 칩으로 넘긴다.
 // categoriesEn 은 한국어 categories 를 그대로 번역한 목록이라, 영문판이
 // 없는 4종(Salary·Investing·Career·Basics)이 "눌러도 항상 0건"인 죽은 칩으로
 // 남아 있었다 (2026-09-06 전수검사).
 // 2026-11-13 lens-meta-F12: EnglishGuidesClient 는 2026-09-02 부터 useSearchParams 를 쓰지 않는다(마운트 후 읽기).
 //   남아 있던 Suspense 경계 때문에 정적 내보내기가 h1·본문 전체를 <div hidden id="S:0"> 에 담아 스크립트로 옮겼다 —
 //   한국어 /guides 처럼 경계 없이 렌더해 h1·본문이 main 안의 첫 HTML 에 들어가게 한다.
 return (
  <EnglishGuidesClient
   guides={enGuideCards}
   categoriesEn={categoriesEn.filter(
    (c) => c.id === "all" || enGuideCards.some((g) => g.category === c.id)
   )}
  />
 );
}
