import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "플렉스(FLEX) 계산기 - 이 예산으로 뭘 살 수 있을까?",
 description: "예산을 입력하면 치킨부터 강남 빌딩까지, 그 돈으로 살 수 있는 것을 알려주는 플렉스 계산기. 커피 몇 잔, 맥북 몇 대인지 재미있게 환산해보세요.",
 path: "/fun/what-to-buy",
 keywords: ["플렉스 계산기", "예산 계산", "이 돈으로 살 수 있는 것", "재미 계산기"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "FLEX Calculator",
 "description": "입력한 예산으로 구매 가능한 물건을 재미있게 환산해주는 플렉스 계산기",
 "applicationCategory": "EntertainmentApplication",
 "operatingSystem": "Any",
 "offers": {
 "@type": "Offer",
 "price": "0",
 "priceCurrency": "KRW"
 }
 };

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 />
 {children}
 </>
 );
}
