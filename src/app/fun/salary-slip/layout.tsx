import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
 title: "가상 월급 명세서 만들기 - 10억 연봉 체험",
 description: "꿈의 연봉 10억, 실수령액은 얼마일까? 원하는 연봉의 월급 명세서를 가상으로 발급해드립니다. SNS 자랑용 이미지 생성.",
 path: "/fun/salary-slip",
 keywords: ["월급명세서", "가상명세서", "연봉계산기", "실수령액", "부자체험", "짤방생성"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
 const jsonLd = {
 "@context": "https://schema.org",
 "@type": "SoftwareApplication",
 "name": "Virtual Salary Slip Generator",
 "description": "사용자가 입력한 연봉을 기반으로 가상의 급여 명세서를 생성하는 도구",
 "applicationCategory": "FinanceApplication",
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
