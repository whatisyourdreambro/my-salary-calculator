import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";
import { glossaryData } from "@/data/glossaryData";

export const metadata: Metadata = buildPageMetadata({
 title: "금융 용어 사전 - 4대보험·세금·재테크 핵심 용어 100+",
 description:
 "직장인이 꼭 알아야 할 4대보험, 세금, 부동산, 투자 용어를 쉬운 비유로 설명합니다. 검색·카테고리·랜덤 학습까지 한 페이지에서.",
 path: "/glossary",
 keywords: ["금융 용어", "세금 용어", "4대보험 용어", "재테크 용어", "용어 사전"],
});

// schema.org DefinedTermSet — 용어 사전에 적합
function buildDefinedTermSetLd() {
 return {
 "@context": "https://schema.org",
 "@type": "DefinedTermSet",
 name: "머니샐러리 금융 용어 사전",
 description: "직장인을 위한 금융·세금·재테크 용어 모음",
 url: "https://www.moneysalary.com/glossary",
 hasDefinedTerm: glossaryData.slice(0, 50).map((item) => ({
 "@type": "DefinedTerm",
 name: item.title,
 description: item.summary,
 inDefinedTermSet: "https://www.moneysalary.com/glossary",
 })),
 };
}

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "용어 사전", path: "/glossary" },
 ]),
 buildDefinedTermSetLd(),
 ]}
 />
 {children}
 </>
 );
}
