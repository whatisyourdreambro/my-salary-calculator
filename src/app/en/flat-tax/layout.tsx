import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, softwareApplicationLd } from "@/lib/structuredData";
import { buildPageMetadata } from "@/lib/seo";

// 자체 metadata 미선언 시 부모 en/layout.tsx 의 canonical(/en)을 상속하던 버그 수정 —
// 자기 자신을 가리키는 canonical 로 교정.
// en 로케일 수렴 (2026-08-24): buildPageMetadata locale:"en" — og:image 자동 부착,
// hreflang은 한국어판이 없어 en=x-default=자기 자신 (기존 수동 선언과 동일 구조).
export const metadata: Metadata = buildPageMetadata({
 title: "Korea Flat Tax 19% vs Progressive Tax Calculator",
 description:
 "Foreign workers in Korea can elect a flat 19% income tax. Compare the flat-tax option against the standard progressive brackets and see which leaves you more net pay.",
 path: "/en/flat-tax",
 locale: "en",
});

export default function FlatTaxLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <>
 {/* JSON-LD 0건이던 /en/flat-tax에 breadcrumb + SoftwareApplication 추가.
     page.tsx가 "use client"라 서버 layout에서 주입.
     softwareApplicationLd 기본 inLanguage("ko")만 영문으로 override */}
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "Home", path: "/en" },
 { name: "19% Flat Tax Calculator", path: "/en/flat-tax" },
 ]),
 {
 ...softwareApplicationLd({
 name: "Korea 19% Flat Tax Calculator",
 description:
 "Compare Korea's 19% flat tax election for foreign workers against the standard progressive income tax brackets.",
 url: "/en/flat-tax",
 }),
 inLanguage: "en",
 },
 ]}
 />
 {children}
 </>
 );
}
