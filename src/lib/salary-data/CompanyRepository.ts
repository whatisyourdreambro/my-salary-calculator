import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";

export const companyRepository = {
 getAll: (): CompanyProfile[] => {
 return allCompanies;
 },

 getById: (id: string): CompanyProfile | undefined => {
 return allCompanies.find((c) => c.id === id);
 },

 search: (query: string): CompanyProfile[] => {
 const lowerQuery = query.toLowerCase();
 return allCompanies.filter(
 (c) =>
 c.name.ko.toLowerCase().includes(lowerQuery) ||
 c.name.en.toLowerCase().includes(lowerQuery) ||
 c.industry.toLowerCase().includes(lowerQuery)
 );
 },
};
