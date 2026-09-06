import { Suspense } from "react";
import { enGuideCards, categoriesEn } from "@/lib/guidesData";
import EnglishGuidesClient from "./EnglishGuidesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
 title: { absolute: "Finance Guides for Working in Korea | Moneysalary" },
 description:
  "In-depth English guides on Korean salary, semiconductor stocks, employee stock plans, taxes, and personal finance for professionals working in Korea.",
 alternates: {
  canonical: "https://www.moneysalary.com/en/guides",
  languages: {
   "ko-KR": "https://www.moneysalary.com/guides",
   "en": "https://www.moneysalary.com/en/guides",
   "x-default": "https://www.moneysalary.com/guides",
  },
 },
 keywords:
  "korea finance guides english, samsung stock guide, sk hynix stock, korea esop, korea isa account, expat investing korea",
 openGraph: {
  title: "Finance Guides for Working in Korea | Moneysalary",
  description:
   "Samsung Electronics, SK Hynix, ESOP, ISA, and more — English guides for working professionals in Korea.",
  type: "website",
  locale: "en_US",
  url: "https://www.moneysalary.com/en/guides",
  images: [{ url: "https://www.moneysalary.com/api/og?lang=en&title=Finance+Guides+for+Working+in+Korea", width: 1200, height: 630 }],
 },
 twitter: {
  card: "summary_large_image",
  title: "Finance Guides for Working in Korea | Moneysalary",
  description:
   "In-depth English guides on Korean salary, semiconductor stocks, ESOP, taxes and personal finance.",
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
