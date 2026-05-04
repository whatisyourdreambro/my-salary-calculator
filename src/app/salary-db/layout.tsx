import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/structuredData";

export const metadata: Metadata = buildPageMetadata({
 title: "회사별 연봉 데이터베이스 — 50+ 기업 평균 연봉·복지·워라밸",
 description:
 "삼성전자, 네이버, 카카오, 현대차, SK하이닉스 등 50+ 한국 기업의 직급별 연봉, 복지, 워라밸 데이터를 한눈에 비교하세요. 같은 업종 평균과 차이도 자동 계산.",
 path: "/salary-db",
 keywords: [
 "회사별 연봉",
 "기업 연봉 비교",
 "대기업 연봉",
 "IT 회사 연봉",
 "삼성전자 연봉",
 "네이버 연봉",
 "카카오 연봉",
 "현대차 연봉",
 ],
});

export default function SalaryDbLayout({ children }: { children: React.ReactNode }) {
 return (
 <>
 <JsonLd
 data={breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "회사별 연봉", path: "/salary-db" },
 ])}
 />
 {children}
 </>
 );
}
