import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";
import { companyAliases } from "@/data/companyAliases";
import { normalizeIndustry } from "./industryTaxonomy";

/** 회사 객체에 검색 별칭(aliases)과 표준 업종 id(industryId)를 주입한다. */
function enrich(company: CompanyProfile): CompanyProfile {
 const aliases = companyAliases[company.id];
 return {
 ...company,
 ...(aliases ? { aliases } : {}),
 industryId: normalizeIndustry(company.industry),
 };
}

// 별칭·업종 id가 주입된 회사 목록 (모듈 로드 시 1회 생성).
const enrichedCompanies: CompanyProfile[] = allCompanies.map(enrich);

export const companyRepository = {
 getAll: (): CompanyProfile[] => {
 return enrichedCompanies;
 },

 getById: (id: string): CompanyProfile | undefined => {
 return enrichedCompanies.find((c) => c.id === id);
 },

 search: (query: string): CompanyProfile[] => {
 const lowerQuery = query.toLowerCase().trim();
 if (!lowerQuery) return enrichedCompanies;
 return enrichedCompanies.filter(
 (c) =>
 c.name.ko.toLowerCase().includes(lowerQuery) ||
 c.name.en.toLowerCase().includes(lowerQuery) ||
 c.industry.toLowerCase().includes(lowerQuery) ||
 (c.aliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ?? false)
 );
 },

 /** 표준 업종 id에 속한 회사 목록. */
 getByIndustry: (industryId: string): CompanyProfile[] => {
 return enrichedCompanies.filter((c) => c.industryId === industryId);
 },

 /** 데이터에 실제 존재하는 표준 업종 id 목록. */
 getIndustryIds: (): string[] => {
 return Array.from(new Set(enrichedCompanies.map((c) => c.industryId ?? "etc")));
 },
};
