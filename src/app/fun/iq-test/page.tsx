import { Metadata } from 'next';
import IQTestClient from './IQTestClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
 title: '멘사급 IQ 테스트 (무료) - 상위 1% 논리력에 도전하세요',
 description: '15개의 정밀 논리 문제를 통해 당신의 지능 지수(IQ)를 측정해보세요. 결과 분석과 해설까지 무료로 제공됩니다.',
 path: '/fun/iq-test',
 keywords: ['IQ테스트', '무료IQ테스트', '멘사테스트', '지능검사', '논리퀴즈'],
});

const jsonLd = {
 "@context": "https://schema.org",
 "@type": "Quiz",
 "name": "멘사급 IQ 테스트",
 "description": "논리력, 수리력, 추리력을 테스트하는 15문항의 무료 IQ 테스트입니다.",
 "educationalUse": "Self-Assessment",
 "interactivityType": "active",
 "url": "https://www.moneysalary.com/fun/iq-test",
 "about": {
 "@type": "Thing",
 "name": "Intelligence Quotient"
 }
};

export default function IQTestPage() {
 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 />
 <IQTestClient />
 </>
 );
}
