// src/app/salary-db/page.tsx — 서버 컴포넌트.
//
// 번들 경량화: 이전에는 'use client' 페이지가 companyRepository 를 직접 import
// 해 전체 회사 프로필(~860KB)이 클라이언트 번들에 포함됐다. 여기서 목록
// 표시·검색에 필요한 필드만 추린 경량 인덱스를 만들어 SalaryDbClient 에 넘긴다.
// (메타데이터는 layout.tsx 담당. breadcrumb JSON-LD는 이중 주입 방지를 위해
// layout이 아니라 각 페이지가 주입 — 2026-08-07)

import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd, itemListLd } from "@/lib/structuredData";
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
 // 신입 영끌(기본급+평균 인센티브) — 상세·랭킹 페이지와 동일 정렬 기준
 entryTotal: c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0),
 // 글로벌 본사 기업 — 정렬 시 국내 기업 뒤로 (순위성 노출 방지, 2026-08 점검)
 isGlobal: c.isGlobal ?? false,
 seniorBase: c.salary.senior.base,
 incentiveTarget: c.salary.entry.incentive.target,
 weeklyHoursReal: c.workLife.weeklyHours.real,
 }));

 // 목록 페이지 ItemList 구조화데이터 — 신입 영끌 상위 30개사만 (국내 기준,
 // 글로벌 기업 제외 — "회사명 연봉" SERP 리치결과·사이트링크 기회)
 const top30 = companyRepository
 .getAll()
 .filter((c) => !c.isGlobal)
 .map((c) => ({
 id: c.id,
 nameKo: c.name.ko,
 entryTotal: c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0),
 }))
 .sort((a, b) => b.entryTotal - a.entryTotal)
 .slice(0, 30)
 .map((c) => ({
 name: `${c.nameKo} 연봉`,
 url: `/salary-db/${c.id}`,
 }));

 return (
 <>
 <JsonLd
 data={[
 breadcrumbLd([
 { name: "홈", path: "/" },
 { name: "회사별 연봉", path: "/salary-db" },
 ]),
 itemListLd({ name: "회사별 연봉 데이터베이스", items: top30 }),
 ]}
 />
 <SalaryDbClient companies={companies} />
 </>
 );
}
