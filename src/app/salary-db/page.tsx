// src/app/salary-db/page.tsx — 서버 컴포넌트.
//
// 번들 경량화: 이전에는 'use client' 페이지가 companyRepository 를 직접 import
// 해 485개사 전체 프로필(~860KB)이 클라이언트 번들에 포함됐다. 여기서 목록
// 표시·검색에 필요한 필드만 추린 경량 인덱스를 만들어 SalaryDbClient 에 넘긴다.
// (메타데이터·JSON-LD 는 layout.tsx 담당)

import { companyRepository } from "@/lib/salary-data/CompanyRepository";
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

 return <SalaryDbClient companies={companies} />;
}
