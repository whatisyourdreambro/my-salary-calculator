import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "회사 연봉·복지 비교 — 삼성·네이버·카카오 등 65+ 기업",
 description:
 "삼성전자·SK하이닉스·NAVER·카카오 등 한국 주요 65+ 기업의 신입 초봉, 평균 연봉, 임원 평균, 복지 혜택을 한 페이지에서 비교하세요.",
 path: "/company",
 keywords: [
 "회사 연봉",
 "기업 연봉 비교",
 "대기업 연봉",
 "IT 회사 연봉",
 "삼성전자 연봉",
 "네이버 연봉",
 "카카오 연봉",
 "SK하이닉스 연봉",
 ],
});

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "회사 연봉 비교", path: "/company" },
 ])}
 />
 {children}
 </>
 );
}
