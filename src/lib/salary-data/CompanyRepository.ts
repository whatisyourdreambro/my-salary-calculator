import { CompanyProfile } from "@/types/company";
import { seedCompanies } from "@/data/seedCompanies";

export class CompanyRepository {
    private companies: CompanyProfile[];

    constructor() {
        // In a real app, this might fetch from a DB.
        // For now, we load the seed data.
        this.companies = seedCompanies;
    }

    getAll(): CompanyProfile[] {
        return this.companies;
    }

    getById(id: string): CompanyProfile | undefined {
        return this.companies.find((c) => c.id === id);
    }

    search(query: string): CompanyProfile[] {
        const lowerQuery = query.toLowerCase();
        return this.companies.filter(
            (c) =>
                c.name.ko.toLowerCase().includes(lowerQuery) ||
                c.name.en.toLowerCase().includes(lowerQuery) ||
                c.industry.toLowerCase().includes(lowerQuery)
        );
    }

    // Future: Add filtering by salary range, industry, etc.
}

export const companyRepository = new CompanyRepository();
