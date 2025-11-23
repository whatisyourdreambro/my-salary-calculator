import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "지름신 판독기 (What To Buy) - 살까 말까 고민될 때 | 머니샐러리",
    description: "사고 싶은 물건이 있나요? 가격과 효용을 분석하여 합리적인 소비인지 판단해드립니다. 지름신 강림 전 필수 코스.",
    keywords: ["지름신", "쇼핑고민", "살까말까", "합리적소비", "결정장애", "쇼핑도우미"],
    openGraph: {
        title: "살까 말까 고민될 땐? 지름신 판독기",
        description: "AI가 당신의 지갑을 지켜드립니다. 합리적인 소비인지 확인해보세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Shopping Decision Helper",
        "description": "구매 고민 중인 물품의 가치를 분석하여 구매 여부를 조언하는 도구",
        "applicationCategory": "ShoppingApplication",
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
