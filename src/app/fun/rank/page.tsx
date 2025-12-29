import { Metadata } from 'next';
import RankClient from './RankClient';

export const metadata: Metadata = {
    title: '내 연봉 순위 계산기 (2025 최신) | 대한민국 상위 몇 %인지 확인하세요',
    description: '국세청 통계 데이터를 기반으로 내 연봉이 대한민국 상위 몇 %인지 정확하게 분석해드립니다. 연봉 등급표와 백분위 정보를 무료로 확인하세요.',
    openGraph: {
        title: '내 연봉은 상위 몇 %? | 초정밀 연봉 랭킹 계산기',
        description: '2,000만 직장인 데이터 기반 분석. 당신의 연봉 등급을 확인해보세요.',
        type: 'website',
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "연봉 순위 계산기",
    "description": "대한민국 직장인 연봉 데이터를 기반으로 한 백분위 계산 도구입니다.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "KRW"
    }
};

export default function SalaryRankPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RankClient />
        </>
    );
}
