import { Metadata } from "next";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { notFound } from "next/navigation";
import CompanyDetailClient from "./CompanyDetailClient";

// Generate static params for all companies
export async function generateStaticParams() {
    const companies = companyRepository.getAll();
    return companies.map((company) => ({
        id: company.id,
    }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const company = companyRepository.getById(params.id);

    if (!company) {
        return {
            title: "Company Not Found",
        };
    }

    const entryTotal = company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
    const formatMoney = (val: number) => `${Math.round(val / 10000)}만원`;

    return {
        title: `${company.name.ko} 연봉 정보 (${new Date().getFullYear()}) - 신입 ${formatMoney(entryTotal)} | MoneySalary`,
        description: `${company.name.ko}(${company.name.en})의 실제 연봉 정보. 신입 ${formatMoney(entryTotal)}, 평균 근무시간 ${company.workLife.weeklyHours.real}시간, 기업문화 ${company.culture.score}/10점. 초봉부터 임원까지 연봉 로드맵, 복지 혜택, 장단점까지 한눈에 확인하세요.`,
        keywords: [
            `${company.name.ko} 연봉`,
            `${company.name.ko} 초봉`,
            `${company.name.ko} 신입연봉`,
            `${company.name.en} salary`,
            `${company.industry} 연봉`,
            "연봉정보",
            "기업연봉비교",
            "IT기업연봉",
            "대기업연봉",
        ],
        openGraph: {
            title: `${company.name.ko} 연봉 정보 - 신입 ${formatMoney(entryTotal)}`,
            description: `${company.name.ko}의 실제 연봉, 워라밸, 기업문화 정보. 신입부터 임원까지 연봉 로드맵 한눈에 보기.`,
            type: "article",
            images: [
                {
                    url: "/og-salary-db.png",
                    width: 1200,
                    height: 630,
                    alt: `${company.name.ko} 연봉 정보`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${company.name.ko} 연봉 - 신입 ${formatMoney(entryTotal)}`,
            description: `실제 연봉, 워라밸, 기업문화 정보 확인하기`,
        },
    };
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
    const company = companyRepository.getById(params.id);

    if (!company) {
        notFound();
    }

    return <CompanyDetailClient company={company} />;
}
