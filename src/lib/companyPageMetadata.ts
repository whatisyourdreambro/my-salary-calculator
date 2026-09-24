// src/lib/companyPageMetadata.ts
//
// 회사 상세(/salary-db/[id]) 메타데이터 입력값 단일 소스 (2026-09-25 B7, SEO-CRAWL-03).
//
// page.tsx generateMetadata 와 rss-companies.xml 이 같은 입력으로 buildCompanyMetadata 를
// 호출해, RSS item <title>·<description> 이 페이지 <title>·description 과 문자열 그대로
// 같게 유지된다. 이 파일은 page.tsx 에 있던 인자 조립을 그대로 옮긴 것 — 산식을 바꾸면
// 회사 페이지 <title> 이 바뀐다(회사 <title> 은 불변 원칙). 수정 금지에 가깝게 다룰 것.

import type { Metadata } from "next";
import type { CompanyProfile } from "@/types/company";
import { getCompanySalaryBasis } from "@/lib/companySalaryBasis";
import { buildCompanyMetadata } from "@/lib/seo";

type CompanyMetadataInput = Parameters<typeof buildCompanyMetadata>[0];

/** page.tsx generateMetadata 가 buildCompanyMetadata 에 넘기는 인자 (신입=공시 우선 영끌 기준) */
export function companyMetadataInput(company: CompanyProfile): CompanyMetadataInput {
  const { entryTotalWon: entryTotal } = getCompanySalaryBasis(company);
  const seniorTotal =
    company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0);
  const juniorTotal =
    company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0);
  const leadTotal =
    company.salary.lead.base + (company.salary.lead.incentive.avgAmount || 0);

  return {
    id: company.id,
    name: company.name.ko,
    industry: company.industry,
    averageSalary: entryTotal,
    seniorSalary: seniorTotal,
    juniorSalary: juniorTotal,
    leadSalary: leadTotal,
    aliases: company.aliases,
    hasCareerLevels: !!company.careerLevels?.length,
    lastUpdated: company.lastUpdated,
  };
}

/** Metadata.title → 실제 <title> 문자열 (buildPageMetadata 는 { absolute } 형태로 돌려준다) */
export function metadataTitleText(title: Metadata["title"]): string {
  if (!title) return "";
  if (typeof title === "string") return title;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return "";
}

/** 회사 페이지 <title> · meta description 문자열 — RSS item 용 */
export function companyPageTitleAndDescription(company: CompanyProfile): {
  title: string;
  description: string;
} {
  const metadata = buildCompanyMetadata(companyMetadataInput(company));
  return {
    title: metadataTitleText(metadata.title),
    description: metadata.description ?? "",
  };
}
