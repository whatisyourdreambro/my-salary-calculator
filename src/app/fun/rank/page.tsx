import { Metadata } from 'next';
import RankClient from './RankClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
 title: '연봉 분포 시뮬레이터 (2026 최신) - 내 연봉은 상위 몇 %? 간단 버전',
 description: '통계 기반 자체 추정 모델로 내 연봉이 대한민국 상위 몇 %쯤인지 가볍게 시뮬레이션해보세요. 정밀 백분위는 내 연봉 순위 계산기에서 확인할 수 있습니다.',
 path: '/fun/rank',
 keywords: ['연봉 순위', '연봉 백분위', '연봉 상위 퍼센트', '연봉 분포'],
});

const jsonLd = {
 "@context": "https://schema.org",
 "@type": "WebApplication",
 "name": "연봉 분포 시뮬레이터",
 "description": "통계 기반 자체 추정 모델로 연봉 백분위를 시뮬레이션하는 간단 도구입니다.",
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
