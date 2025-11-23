import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "자산 배분 마스터 (Asset Allocator) - 투자 미니게임 | 머니샐러리",
    description: "떨어지는 금과 주식을 잡고 세금폭탄을 피하세요! 60초 동안 최고의 수익률을 올리는 순발력 투자 게임.",
    keywords: ["투자게임", "주식게임", "미니게임", "재테크게임", "자산관리", "순발력게임"],
    openGraph: {
        title: "자산 배분 마스터 - 60초 투자 챌린지",
        description: "당신의 투자 본능을 깨우세요! 세금은 피하고 수익은 챙기세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": "Asset Allocator",
        "description": "자산 배분 및 투자 시뮬레이션 미니게임",
        "genre": "Simulation",
        "applicationCategory": "Game",
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
