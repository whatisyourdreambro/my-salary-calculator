import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "연봉 서열 계산기 - 내 연봉은 상위 몇 %? | 머니샐러리",
    description: "대한민국 직장인 연봉 데이터 기반 서열 측정기. 내 나이, 직급 대비 내 연봉 수준을 냉정하게 평가해드립니다.",
    keywords: ["연봉순위", "연봉서열", "내연봉위치", "직장인평균연봉", "연봉계산기", "소득분위"],
    openGraph: {
        title: "내 연봉은 대한민국 상위 몇 %일까?",
        description: "팩트 폭격 주의! 당신의 연봉 서열을 지금 바로 확인하세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Salary Rank Calculator",
        "description": "연봉 데이터 비교 및 백분위 분석 도구",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
