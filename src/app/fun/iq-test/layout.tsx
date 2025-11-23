import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "멘사급 IQ 테스트 (무료) - 나의 지능 지수는? | 머니샐러리",
    description: "15개의 논리 및 수리 문제를 통해 당신의 IQ를 측정해보세요. 상위 1%에 도전하시겠습니까? 즉시 결과 확인 가능.",
    keywords: ["IQ테스트", "무료IQ테스트", "멘사테스트", "지능검사", "두뇌트레이닝", "논리퀴즈"],
    openGraph: {
        title: "당신의 IQ는 얼마입니까? 무료 테스트",
        description: "15문제로 알아보는 나의 두뇌 회전력. 친구들과 결과를 공유해보세요!",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Mensa IQ Test",
        "description": "무료 온라인 IQ 테스트 및 지능 분석 도구",
        "applicationCategory": "EducationalApplication",
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
