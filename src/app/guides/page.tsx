// src/app/guides/page.tsx

import type { Metadata } from "next";
import GuidesList from "@/components/GuidesList";
import Link from "next/link";
import {
  Star,
  BookOpenText,
  Target,
  Briefcase,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Moneysalary 금융 가이드 | 연봉, 세금, 재테크의 모든 것",
  description:
    "직장인을 위한 가장 현실적인 금융 인사이트. 연봉 실수령액부터 퇴직금, 연말정산, 투자 전략까지. 당신의 경제적 자유를 위한 모든 지식을 담았습니다.",
};

// [콘텐츠 허브 구축]
// 모든 가이드 데이터를 이 곳에서 중앙 관리합니다. RSS, Sitemap 등 다른 파일들이 이 데이터를 참조하게 됩니다.
const allGuides = [
  {
    slug: "road-to-100m-part3-invest",
    title: "월급으로 만드는 투자 파이프라인: 돈이 스스로 일하게 하라",
    description:
      "당신이 잠자는 동안에도 자산이 불어나는 자동화 시스템, 그 설계도를 공개합니다.",
    category: "재테크 로드맵",
    tags: ["핵심", "투자"],
  },
  {
    slug: "salary-negotiation",
    title: "연봉협상: 최소 20% 올려받는 4단계 전략 (2025년 최종판)",
    description:
      "당신의 가치를 돈으로 바꾸는 실전 협상 기술. 준비부터 마무리까지 A to Z.",
    category: "커리어 성장",
    tags: ["핵심", "커리어"],
  },
  {
    slug: "year-end-tax-settlement",
    title: "연말정산 A to Z: 13월의 월급, 제대로 찾는 법 (2025년)",
    description:
      "세금 폭탄이 아닌 '13월의 보너스'를 위한 완벽 가이드. 놓치기 쉬운 공제 꿀팁까지 A to Z를 알려드립니다.",
    category: "필수 지식",
    tags: ["핵심", "세금"],
  },
  {
    slug: "first-job-investment",
    title: "첫 월급 100만원 재테크: 부자되는 첫걸음, 이렇게 시작하세요",
    description:
      "사회초년생 필독! 당신의 미래를 바꿀 첫 월급 재테크 로드맵을 공개합니다.",
    category: "재테크 로드맵",
    tags: ["사회초년생"],
  },
  {
    slug: "four-major-insurances",
    title: "4대 보험 완벽 가이드: 내 월급에서 왜, 얼마나 떼는 걸까?",
    description:
      "국민연금, 건강보험, 고용보험, 산재보험. 내 삶을 지키는 최소한의 안전장치, 제대로 알아보세요.",
    category: "필수 지식",
    tags: ["사회초년생"],
  },
  // --- 이하 다른 가이드들 ---
  {
    slug: "exchange-rate-deep-dive",
    title: "환율의 대서사시: 당신의 부를 결정하는 보이지 않는 전쟁",
    description:
      "금리의 속삭임, 무역의 파도, 지정학적 폭풍 속에서 환율은 어떻게 춤추는가? 환율의 모든 것을 파헤칩니다.",
    category: "재테크 로드맵",
    tags: [],
  },
  {
    slug: "compound-interest",
    title: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기",
    description:
      "시간을 내 편으로 만들어 자산을 불리는 가장 확실한 방법, 복리의 모든 것을 알려드립니다.",
    category: "재테크 로드맵",
    tags: ["투자"],
  },
  {
    slug: "nekarakubae-salary",
    title: "네카라쿠배 개발자 초봉 1억, 그 진실은? (2025년 최종판)",
    description:
      "계약 연봉, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체와 세후 실수령액을 완벽하게 분석합니다.",
    category: "연봉 분석",
    tags: ["커리어"],
  },
  // ... (기존에 정의된 모든 가이드 항목들을 여기에 포함시킵니다)
];

const categories = [
  { id: "all", name: "전체보기", icon: BookOpenText },
  { id: "연봉 분석", name: "연봉 심층 분석", icon: Target },
  { id: "커리어 성장", name: "커리어 성장", icon: Briefcase },
  { id: "필수 지식", name: "필수 금융 지식", icon: BookOpenText },
  { id: "재테크 로드맵", name: "재테크 로드맵", icon: TrendingUp },
];

// [콘텐츠 허브 구축] 추천 가이드를 보여주는 카드 컴포넌트
const FeaturedGuideCard = ({ guide }: { guide: (typeof allGuides)[0] }) => (
  <Link
    href={`/guides/${guide.slug}`}
    className="block p-6 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1.5 transition-all bg-light-card dark:bg-dark-card group"
  >
    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 group-hover:text-signature-blue transition-colors">
      {guide.title}
    </h3>
    <p className="flex-grow text-sm text-light-text-secondary dark:text-dark-text-secondary">
      {guide.description}
    </p>
    <span className="mt-4 text-sm font-semibold text-signature-blue self-start">
      자세히 보기 →
    </span>
  </Link>
);

export default function GuidesPage() {
  const featuredGuides = allGuides.filter((g) => g.tags.includes("핵심"));
  const newcomerGuides = allGuides.filter((g) => g.tags.includes("사회초년생"));

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          Moneysalary 금융 라이브러리
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          당신의 경제적 자유를 위한 모든 지식을 담았습니다. <br /> 가장 궁금한
          주제부터 탐색해보세요.
        </p>
      </div>

      {/* [콘텐츠 허브 구축 1] 핵심 가이드 섹션 */}
      <section className="mb-20">
        <div className="flex items-center mb-6">
          <Star className="w-8 h-8 text-yellow-500" />
          <h2 className="ml-3 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            Moneysalary 추천 핵심 가이드
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGuides.map((guide) => (
            <FeaturedGuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      {/* [콘텐츠 허브 구축 2] 사회초년생 필독 가이드 섹션 */}
      <section className="mb-20">
        <div className="flex items-center mb-6">
          <BookOpenText className="w-8 h-8 text-green-500" />
          <h2 className="ml-3 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
            사회초년생 필독 가이드
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {newcomerGuides.map((guide) => (
            <FeaturedGuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      {/* [콘텐츠 허브 구축 3] 전체 가이드 목록 */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-200">
          전체 가이드 탐색
        </h2>
        <GuidesList guides={allGuides} categories={categories} />
      </section>
    </main>
  );
}
