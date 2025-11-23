import { CompanyProfile } from "@/types/company";
import { seedCompanies } from "@/data/seedCompanies";
import { globalCompanies } from "@/data/globalCompanies";
import { krCompanies_Batch2 } from "@/data/krCompanies_Batch2";
import { krCompanies_Batch3 } from "@/data/krCompanies_Batch3";
import { krCompanies_Batch4 } from "@/data/krCompanies_Batch4";
import { krCompanies_Batch5 } from "@/data/krCompanies_Batch5";

// Merge all data sources
const allCompanies = [...seedCompanies, ...globalCompanies, ...krCompanies_Batch2, ...krCompanies_Batch3, ...krCompanies_Batch4, ...krCompanies_Batch5];

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
