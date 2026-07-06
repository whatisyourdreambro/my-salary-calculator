// 홈 — 서버 컴포넌트 래퍼.
// 인터랙티브 계산기 UI는 HomeClient(클라이언트 아일랜드)가, JSON-LD와
// SEO 본문/FAQ/내부링크는 서버에서 렌더링한다. 크롤러가 텍스트 콘텐츠를
// 즉시 읽을 수 있도록 HomeSeoSection을 정적 HTML로 제공.
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { faqLd, howToLd } from "@/lib/structuredData";
import { HOME_FAQ_ITEMS, HOME_HOWTO_DATA } from "@/lib/homeContent";
import HomeClient from "./HomeClient";
import HomeSeoSection from "@/components/home/HomeSeoSection";

// canonical/hreflang은 홈 전용 값 — 루트 layout에 두면 alternates를 자체 정의하지
// 않는 모든 페이지에 "canonical: 홈"이 상속되는 사고 위험이 있어 여기로 이동(2026-07-06).
export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.moneysalary.com",
    languages: {
      "ko-KR": "https://www.moneysalary.com",
      en: "https://www.moneysalary.com/en",
      "x-default": "https://www.moneysalary.com",
    },
    types: {
      "application/rss+xml": [
        {
          url: "https://www.moneysalary.com/rss.xml",
          title: "머니샐러리 금융 가이드 RSS",
        },
      ],
    },
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqLd(HOME_FAQ_ITEMS), howToLd(HOME_HOWTO_DATA)]} />
      <HomeClient />
      <HomeSeoSection />
    </>
  );
}
