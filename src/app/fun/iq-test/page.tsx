import { Metadata } from 'next';
import IQTestClient from './IQTestClient';

export const metadata: Metadata = {
    title: '멘사급 IQ 테스트 (무료) | 상위 1% 논리력에 도전하세요',
    description: '15개의 정밀 논리 문제를 통해 당신의 지능 지수(IQ)를 측정해보세요. 결과 분석과 해설까지 무료로 제공됩니다. #IQ테스트 #멘사 #지능검사',
    openGraph: {
        title: '멘사급 IQ 테스트 | 제 점수는요...?',
        description: '당신의 두뇌 회전력은 상위 몇 %일까요? 지금 바로 확인해보세요.',
        type: 'website',
        images: ['/images/og-iq-test.png'], // Assuming/Placeholder
    },
};

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
