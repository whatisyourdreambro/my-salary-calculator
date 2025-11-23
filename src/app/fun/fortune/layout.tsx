import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "2026년 신년운세 - 정통 사주팔자 토정비결 | 머니샐러리",
    description: "2026년 병오년(丙午年) 당신의 운세는? 생년월일로 보는 정통 사주팔자. 재물운, 직장운, 연애운까지 무료로 확인하세요.",
    keywords: ["2026년운세", "신년운세", "무료사주", "토정비결", "병오년운세", "정통사주", "재물운"],
    openGraph: {
        title: "2026년 병오년 신년운세 - 무료 사주팔자",
        description: "붉은 말의 해, 당신에게 찾아올 대박 기운은? 지금 바로 확인하세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "2026 New Year Fortune",
        "description": "생년월일 기반 2026년 병오년 정통 사주 및 운세 분석 서비스",
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
