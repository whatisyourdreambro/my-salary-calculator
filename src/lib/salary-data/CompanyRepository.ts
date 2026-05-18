import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";
import { companyAliases } from "@/data/companyAliases";

/** 회사 객체에 검색 별칭(aliases)을 주입한다. */
function withAliases(company: CompanyProfile): CompanyProfile {
 const aliases = companyAliases[company.id];
 return aliases ? { ...company, aliases } : company;
}

// 별칭이 주입된 회사 목록 (모듈 로드 시 1회 생성).
const enrichedCompanies: CompanyProfile[] = allCompanies.map(withAliases);

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
};
