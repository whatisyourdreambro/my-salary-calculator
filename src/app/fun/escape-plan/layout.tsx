import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "노비 탈출 계산기 - 나는 언제 은퇴할 수 있을까? | 머니샐러리",
    description: "현재 월급과 저축액으로 경제적 자유(FIRE)를 달성하는 시기를 계산해드립니다. 노비 문서 소각까지 남은 시간은?",
    keywords: ["은퇴계산기", "파이어족", "경제적자유", "노비탈출", "저축계산기", "복리계산기"],
    openGraph: {
        title: "노비 탈출 계산기 - 당신의 자유까지 남은 시간은?",
        description: "월급 노예에서 벗어나 진정한 자유를 찾는 여정. 지금 바로 계산해보세요.",
        type: "website",
    }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Escape Plan Calculator",
        "description": "경제적 자유 달성 시기 및 은퇴 자금 계산 도구",
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
