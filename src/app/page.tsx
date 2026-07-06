// 홈 — 서버 컴포넌트 래퍼.
// 인터랙티브 계산기 UI는 HomeClient(클라이언트 아일랜드)가, JSON-LD와
// SEO 본문/FAQ/내부링크는 서버에서 렌더링한다. 크롤러가 텍스트 콘텐츠를
// 즉시 읽을 수 있도록 HomeSeoSection을 정적 HTML로 제공.
import JsonLd from "@/components/JsonLd";
import { faqLd, howToLd } from "@/lib/structuredData";
import { HOME_FAQ_ITEMS, HOME_HOWTO_DATA } from "@/lib/homeContent";
import HomeClient from "./HomeClient";
import HomeSeoSection from "@/components/home/HomeSeoSection";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqLd(HOME_FAQ_ITEMS), howToLd(HOME_HOWTO_DATA)]} />
      <HomeClient />
      <HomeSeoSection />
    </>
  );
}
