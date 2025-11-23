import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "인생 2회차 시뮬레이터 (Life Gacha) - 다음 생은 어디서? | 머니샐러리",
    description: "당신의 연봉이 다음 생을 결정합니다. 국적, 수저 계급, 재능, 직업까지! 운명의 수레바퀴를 돌려 새로운 인생을 확인하세요.",
    keywords: ["인생2회차", "환생시뮬레이터", "수저계급론", "인생가챠", "랜덤게임", "심심풀이", "운세"],
    openGraph: {
        title: "당신의 다음 생은? 인생 2회차 뽑기 (Life Gacha)",
        description: "재벌 3세? 아니면... 돌멩이? 당신의 운명을 시험해보세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": "Reincarnation Simulator",
        "description": "연봉 기반 인생 다시 살기 시뮬레이션 및 가챠 게임",
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
