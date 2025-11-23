export type JobLevel = "entry" | "junior" | "senior" | "lead" | "executive";

export interface SalaryComponent {
    base: number; // Annual base salary in KRW
    incentive: {
        target: number; // Target percentage (e.g., 20%)
        max: number; // Max percentage (e.g., 50%)
        avgAmount?: number; // Estimated average amount in KRW
    };
    stock?: {
        type: "RSU" | "Option";
        amount: number; // Annual grant value in KRW
        vesting: string; // e.g., "4 years"
    };
    signOn?: number; // Typical sign-on bonus
}

export interface WorkLifeBalance {
    weeklyHours: {
        contract: number; // e.g., 40
        real: number; // e.g., 45 (The "Real" hours)
    };
    remoteWork: {
        policy: "remote" | "hybrid" | "office";
        daysPerWeek?: number; // If hybrid
        description?: string;
    };
    vacation: {
        days: number;
        usageRate: number; // 0-100% (How much people actually use)
    };
}

export interface BenefitItem {
    category: "financial" | "health" | "family" | "growth" | "lifestyle";
    title: string;
    description: string;
    value?: number; // Estimated annual monetary value
}

export interface CompanyProfile {
    id: string;
    name: {
        ko: string;
        en: string;
    };
    industry: string;
    tier: "conglomerate" | "unicorn" | "startup" | "foreign";
    logo: string; // Path to image or emoji
    description: string;

    // Compensation Map by Level
    salary: Record<JobLevel, SalaryComponent>;

    // Work Life & Culture
    workLife: WorkLifeBalance;
    culture: {
        score: number; // 1-10
        keywords: string[]; // e.g., "Horizontal", "Intense", "Growth"
        pros: string[];
        cons: string[];
    };

    // Benefits
    benefits: BenefitItem[];

    // Meta
    lastUpdated: string;
}
