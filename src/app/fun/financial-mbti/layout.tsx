import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "금융 MBTI 테스트 - 나의 투자 성향 분석 | 머니샐러리",
    description: "16가지 유형으로 알아보는 나의 금융 DNA. 당신은 워렌 버핏형인가요, 아니면 욜로족인가요? 3분 만에 확인하는 투자 성향.",
    keywords: ["금융MBTI", "투자성향테스트", "부자테스트", "MBTI검사", "재테크성향", "심리테스트"],
    openGraph: {
        title: "나의 금융 MBTI는? 투자 성향 무료 테스트",
        description: "친구들은 어떤 유형일까? 내 투자 성향을 분석하고 부자 되는 법을 알아보세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Financial MBTI Test",
        "description": "개인의 투자 성향과 금융 습관을 분석하는 MBTI 기반 테스트",
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
