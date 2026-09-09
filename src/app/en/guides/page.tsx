import { Suspense } from "react";
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
 // useSearchParams(q 검색 초기값)를 쓰는 클라이언트 컴포넌트라 Suspense 경계 필요
 return (
  <Suspense>
   {/* 실제 영문 가이드가 존재하는 카테고리만 칩으로 넘긴다.
       categoriesEn 은 한국어 categories 를 그대로 번역한 목록이라, 영문판이
       없는 4종(Salary·Investing·Career·Basics)이 "눌러도 항상 0건"인 죽은 칩으로
       남아 있었다 (2026-09-06 전수검사). */}
   <EnglishGuidesClient
    guides={enGuideCards}
    categoriesEn={categoriesEn.filter(
     (c) => c.id === "all" || enGuideCards.some((g) => g.category === c.id)
    )}
   />
  </Suspense>
 );
}
