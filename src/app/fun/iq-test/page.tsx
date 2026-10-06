import { Metadata } from 'next';
import IQTestClient from './IQTestClient';
import { buildPageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildPageMetadata({
 title: 'IQ 테스트 무료 (재미용 논리 퀴즈) - 15문항 참고 점수와 해설',
 description: '무료 IQ 테스트 스타일 논리 퀴즈 15문항. 정답률 기반 참고 점수와 해설을 확인하세요. 재미용이며 표준화된 지능검사나 공식 IQ 측정이 아닙니다.',
 path: '/fun/iq-test',
 keywords: ['IQ테스트', '무료IQ테스트', '멘사테스트', '지능검사', '논리퀴즈'],
});

const jsonLd = {
 "@context": "https://schema.org",
 "@type": "Quiz",
 "name": "직장인 IQ 테스트 (재미용 논리 퀴즈)",
 "description": "15문항을 풀고 정답률 기반 참고 점수와 해설을 확인하는 재미용 무료 퀴즈입니다.",
 "educationalUse": "Self-Assessment",
 "interactivityType": "active",
 "url": "https://www.moneysalary.com/fun/iq-test",
 "about": {
 "@type": "Thing",
 "name": "Logic Quiz"
 }
};

export default function IQTestPage() {
 return (
 <>
 <JsonLd data={jsonLd} />
 <IQTestClient />
 </>
 );
}
