import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "부자 DNA 테스트 - 당신은 부자가 될 상인가? | 머니샐러리",
    description: "관상과 습관으로 알아보는 부자 가능성 테스트. 당신에게 숨겨진 부자의 유전자를 찾아드립니다. 재미로 보는 재물운.",
    keywords: ["부자테스트", "관상테스트", "부자관상", "재물운테스트", "심리테스트", "성향분석"],
    openGraph: {
        title: "당신은 부자가 될 상인가? 부자 DNA 테스트",
        description: "99% 정확도(?)의 부자 가능성 진단. 지금 확인해보세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Rich DNA Test",
        "description": "개인의 성향과 습관을 분석하여 부자가 될 가능성을 예측하는 테스트",
        "applicationCategory": "EntertainmentApplication",
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
