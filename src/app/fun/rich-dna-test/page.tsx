import { Metadata } from 'next';
import RichDNAClient from './RichDNAClient';

export const metadata: Metadata = {
  title: '부자 DNA 테스트 (무료) | 나의 투자 성향은 워렌버핏? 일론머스크?',
  description: '1억이 생긴다면 어디에 투자하시겠습니까? 간단한 4가지 질문으로 알아보는 나의 투자 스타일과 부자 DNA. 워렌 버핏, 일론 머스크, 록펠러 등 당신과 닮은 부자를 찾아보세요.',
  openGraph: {
    title: '부자 DNA 테스트 | 당신은 어떤 재벌과 닮았을까요?',
    description: '내 안의 숨겨진 부자 본능을 깨워보세요. 소름돋는 싱크로율!',
    type: 'website',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  "name": "부자 DNA 테스트",
  "description": "투자 성향으로 알아보는 나의 부자 유형 테스트입니다.",
  "educationalUse": "Self-Assessment",
  "interactivityType": "active",
  "url": "https://www.moneysalary.com/fun/rich-dna-test",
  "about": {
    "@type": "Thing",
    "name": "Investment Personality"
  }
};

export default function RichDnaTestPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RichDNAClient />
    </>
  );
}
