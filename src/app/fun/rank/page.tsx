import { Metadata } from 'next';
import RankClient from './RankClient';
import { buildPageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildPageMetadata({
 title: '연봉 분포 시뮬레이터 - 내 연봉은 상위 몇 %? 자체 참고 구간 간단 버전',
 description: '고정된 자체 참고 구간으로 내 연봉이 상위 몇 %쯤인지 가볍게 시뮬레이션해보세요. 공식 전국 백분위가 아니며 원자료·통계 기준연도는 확인되지 않았습니다. 나이대별 자체 참고표는 내 연봉 순위 계산기에서 확인할 수 있습니다.',
 path: '/fun/rank',
 keywords: ['연봉 순위', '연봉 백분위', '연봉 상위 퍼센트', '연봉 분포'],
});

const jsonLd = {
 "@context": "https://schema.org",
 "@type": "WebApplication",
 "name": "연봉 분포 시뮬레이터",
 "description": "고정된 자체 참고 구간으로 연봉을 분류하는 재미용 도구이며 공식 전국 백분위가 아닙니다.",
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
 <JsonLd data={jsonLd} />
 <RankClient />
 </>
 );
}
