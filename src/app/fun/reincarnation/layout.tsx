import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "인생 2회차 시뮬레이터 - 재벌집 막내아들 되기 | 머니샐러리",
    description: "랜덤으로 다시 태어난다면? 수저 계급론을 바탕으로 한 인생 시뮬레이션. 금수저, 흙수저, 다이아수저 확률 게임.",
    keywords: ["인생게임", "환생시뮬레이터", "수저계급론", "랜덤게임", "심심풀이", "운세"],
    openGraph: {
        title: "당신의 다음 생은? 인생 2회차 시뮬레이터",
        description: "재벌집 막내아들로 태어날 확률은? 지금 바로 돌려보세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": "Reincarnation Simulator",
        "description": "확률 기반 인생 다시 살기 시뮬레이션 게임",
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
