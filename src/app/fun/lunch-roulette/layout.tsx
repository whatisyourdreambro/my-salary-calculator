import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "직장인 점심 메뉴 룰렛 - 오늘 뭐 먹지? | 머니샐러리",
    description: "결정 장애 직장인을 위한 점심 메뉴 추천 룰렛! 한식, 중식, 일식, 양식 중 당신의 선택은? 주변 맛집 추천 기능까지.",
    keywords: ["점심메뉴추천", "오늘뭐먹지", "점심룰렛", "메뉴고르기", "직장인점심", "맛집추천"],
    openGraph: {
        title: "오늘 점심 뭐 먹지? 1초 만에 해결해드립니다.",
        description: "고민할 시간에 룰렛을 돌리세요! 실패 없는 점심 메뉴 추천.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Lunch Menu Roulette",
        "description": "무작위 점심 메뉴 추천 및 의사결정 도구",
        "applicationCategory": "LifestyleApplication",
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
