import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "도지코인 키우기 (Meme Coin Clicker) - 100조 부자 되기 | 머니샐러리",
    description: "중독성 강한 코인 채굴 클리커 게임! 광클해서 도지코인을 모으고 화성 갈끄니까~ 가상 화폐 모의 투자 게임.",
    keywords: ["클리커게임", "코인게임", "도지코인", "비트코인게임", "돈버는게임", "방치형게임"],
    openGraph: {
        title: "도지코인 키우기 - 클릭으로 100조 벌기 도전!",
        description: "당신의 손가락으로 코인 제국을 건설하세요. 화성까지 가즈아!",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": "Meme Coin Clicker",
        "description": "가상 암호화폐 채굴 시뮬레이션 클리커 게임",
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
