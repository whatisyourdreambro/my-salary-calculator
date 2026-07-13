// src/app/salary-db/page.tsx — 서버 컴포넌트.
//
// 번들 경량화: 이전에는 'use client' 페이지가 companyRepository 를 직접 import
// 해 485개사 전체 프로필(~860KB)이 클라이언트 번들에 포함됐다. 여기서 목록
// 표시·검색에 필요한 필드만 추린 경량 인덱스를 만들어 SalaryDbClient 에 넘긴다.
// (메타데이터·JSON-LD 는 layout.tsx 담당)

import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import JsonLd from "@/components/JsonLd";
import { itemListLd } from "@/lib/structuredData";
import SalaryDbClient, { type CompanyIndexItem } from "./SalaryDbClient";

export default function SalaryDBPage() {
 const companies: CompanyIndexItem[] = companyRepository.getAll().map((c) => ({
 id: c.id,
 nameKo: c.name.ko,
 nameEn: c.name.en,
 ...(c.aliases ? { aliases: c.aliases } : {}),
 industry: c.industry,
 tier: c.tier,
 logo: c.logo,
 entryBase: c.salary.entry.base,
 seniorBase: c.salary.senior.base,
 incentiveTarget: c.salary.entry.incentive.target,
 weeklyHoursReal: c.workLife.weeklyHours.real,
 }));

 // 목록 페이지 ItemList 구조화데이터 — 신입 연봉 상위 30개사만
 // ("회사명 연봉" SERP 리치결과·사이트링크 기회. breadcrumb 은 layout 담당)
 const top30 = [...companies]
 .sort((a, b) => b.entryBase - a.entryBase)
 .slice(0, 30)
 .map((c) => ({
 name: `${c.nameKo} 연봉`,
 url: `/salary-db/${c.id}`,
 }));

 return (
 <>
 <JsonLd data={itemListLd({ name: "회사별 연봉 데이터베이스", items: top30 })} />
 <SalaryDbClient companies={companies} />
 </>
 );
}
