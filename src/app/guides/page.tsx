import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Target, Briefcase, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Moneysalary 금융 가이드 | 연봉, 세금, 재테크의 모든 것",
  description:
    "직장인을 위한 가장 현실적인 금융 인사이트. 연봉 실수령액부터 퇴직금, 연말정산, 투자 전략까지. 당신의 경제적 자유를 위한 모든 지식을 담았습니다.",
};

// [수정] 고도화된 콘텐츠에 맞춰 제목과 설명을 모두 업데이트하고, 카테고리(category)와 아이콘(icon) 속성을 추가했습니다.
const guides = [
  // 카테고리 1: 연봉의 모든 것
  {
    slug: "2025-salary-guide",
    title: "2025년 연봉 실수령액: 내 월급, 세후 얼마일까?",
    description:
      "연봉 3000부터 1억까지, 2025년 최신 세법을 완벽 적용한 실수령액 테이블과 상세 공제 내역을 확인하세요.",
    category: "연봉 기본",
  },
  {
    slug: "salary-4500",
    title: "연봉 4500만원 실수령액: 세후 월급 318만원, 적절한 걸까?",
    description:
      "세후 월급 318만원을 상세히 분해하고, 이 시기 직장인을 위한 가장 현실적인 재테크 전략과 미래 로드맵을 제시합니다.",
    category: "연봉 분석",
  },
  {
    slug: "nekarakubae-salary",
    title: "네카라쿠배 개발자 초봉 1억, 그 진실은? (2025년 최종판)",
    description:
      "계약 연봉, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체와 세후 실수령액을 완벽하게 분석합니다.",
    category: "연봉 분석",
  },
  {
    slug: "hyundai-salary",
    title: "현대차 생산직 연봉: '킹산직'의 모든 것 (2025년 최종 분석)",
    description:
      "수천 대 일의 경쟁률, 신의 직장이라 불리는 '킹산직'의 실제 연봉을 파헤쳐봅니다.",
    category: "연봉 분석",
  },
  {
    slug: "nurse-salary",
    title: "간호사 연봉 테이블: 신규부터 수간호사까지 총정리 (2025년)",
    description:
      "병원 규모별, 경력별 현실적인 연봉과 세후 실수령액, 그리고 간호사의 커리어 로드맵까지 완벽 분석합니다.",
    category: "연봉 분석",
  },
  {
    slug: "civil-servant-salary",
    title: "공무원 월급, 정말 박봉일까? | 9급·7급 첫 월급 실수령액 분석",
    description:
      "기본급 뒤에 숨겨진 각종 수당을 포함한 공무원의 진짜 월급을 공개합니다.",
    category: "연봉 분석",
  },

  // 카테고리 2: 커리어와 성장
  {
    slug: "salary-negotiation",
    title: "연봉협상: 최소 20% 올려받는 4단계 전략 (2025년 최종판)",
    description:
      "당신의 가치를 돈으로 바꾸는 실전 협상 기술. 준비부터 마무리까지 A to Z.",
    category: "커리어 성장",
  },
  {
    slug: "samsung-vs-hynix",
    title: "삼성전자 vs SK하이닉스: 연봉과 성과급, 누가 진정한 승자인가?",
    description:
      "HBM 전쟁 속 두 거인의 성과급과 미래, 현직자와 취준생을 위한 완벽 분석.",
    category: "커리어 성장",
  },
  {
    slug: "industry-trends-2025",
    title: "2025 산업대전망: 반도체, 자동차 그리고 내 월급의 미래",
    description:
      "거대한 산업의 흐름 속, 당신의 연봉은 어디로 향할까요? 2025년 핵심 트렌드를 분석합니다.",
    category: "커리어 성장",
  },
  {
    slug: "nurse-5yr-salary",
    title: "5년차 간호사 연봉과 커리어: 번아웃과 성장 사이 (2025년)",
    description:
      "임상에 남을 것인가, 떠날 것인가. 5년차 간호사의 현실 연봉과 미래 커리어 로드맵을 제시합니다.",
    category: "커리어 성장",
  },

  // 카테고리 3: 필수 금융 지식
  {
    slug: "four-major-insurances",
    title: "4대 보험 완벽 가이드: 내 월급에서 왜, 얼마나 떼는 걸까?",
    description:
      "국민연금, 건강보험, 고용보험, 산재보험. 내 삶을 지키는 최소한의 안전장치, 제대로 알아보세요.",
    category: "필수 지식",
  },
  {
    slug: "bonus-tax",
    title: "성과급 세금 폭탄, 피하는 법 완벽 가이드 (2025년 최종판)",
    description:
      "상여금 세금 계산의 원리부터 연말정산으로 세금을 돌려받는 방법, IRP를 활용한 절세 전략까지 총정리.",
    category: "필수 지식",
  },
  {
    slug: "severance-tax",
    title: "퇴직금 세금 계산: 최소 40% 아끼는 공제의 비밀 (2025년)",
    description:
      "복잡한 퇴직소득세 4단계 계산법과 세금을 획기적으로 줄여주는 '공제'의 모든 것을 설명합니다.",
    category: "필수 지식",
  },
  {
    slug: "year-end-tax-settlement",
    title: "연말정산 A to Z: 13월의 월급, 제대로 찾는 법 (2025년)",
    description:
      "세금 폭탄이 아닌 '13월의 보너스'를 위한 완벽 가이드. 놓치기 쉬운 공제 꿀팁까지 A to Z를 알려드립니다.",
    category: "필수 지식",
  },
  {
    slug: "unemployment-benefits",
    title: "실업급여 A to Z: 조건, 신청 방법, 금액까지 완벽 정리 (2025년)",
    description:
      "갑작스러운 실직, 막막하신가요? 당신의 새로운 시작을 돕기 위한 모든 정보를 담았습니다.",
    category: "필수 지식",
  },
  {
    slug: "holiday-allowance",
    title: "주휴수당, 당신의 숨겨진 1일치 월급 | 조건, 계산법, Q&A 완벽정리",
    description:
      "주 15시간 이상 일했다면 당신도 받을 수 있다! 당신의 소중한 권리를 찾아드립니다.",
    category: "필수 지식",
  },
  {
    slug: "minimum-wage",
    title: "2025년 최저임금 완벽정리: 시급 10,030원, 내 월급은? (예상)",
    description:
      "최저시급 기준, 주휴수당을 포함한 실수령액은 얼마일까요? 대한민국 최저임금의 모든 것을 알려드립니다.",
    category: "필수 지식",
  },
  {
    slug: "4-day-week",
    title: "주 4일제, 꿈일까 현실일까? | 연봉 삭감의 진실과 계산법",
    description:
      "'임금 유지'와 '비례 삭감' 시나리오별 연봉 변화를 실제 예시와 함께 완벽하게 계산해 드립니다.",
    category: "필수 지식",
  },

  // 카테고리 4: 재테크 로드맵
  {
    slug: "road-to-100m-part1-tax",
    title: "연봉 1억을 위한 절세 전략: 세금, 아는 만큼 월급이 늘어난다",
    description:
      "부를 쌓기 위한 첫 번째 관문이자 가장 확실한 방법, 절세의 모든 것을 알려드립니다.",
    category: "재테크 로드맵",
  },
  {
    slug: "road-to-100m-part2-sidejob",
    title: "N잡으로 월 100만원 더 벌기: 당신의 시간을 돈으로 바꾸는 기술",
    description:
      "퇴근 후, 주말의 자투리 시간을 활용해 월 100만원의 추가 현금 흐름을 만드는 가장 현실적인 방법을 공개합니다.",
    category: "재테크 로드맵",
  },
  {
    slug: "road-to-100m-part3-invest",
    title: "월급으로 만드는 투자 파이프라인: 돈이 스스로 일하게 하라",
    description:
      "당신이 잠자는 동안에도 자산이 불어나는 자동화 시스템, 그 설계도를 공개합니다.",
    category: "재테크 로드맵",
  },
  {
    slug: "first-job-investment",
    title: "첫 월급 100만원 재테크: 부자되는 첫걸음, 이렇게 시작하세요",
    description:
      "사회초년생 필독! 당신의 미래를 바꿀 첫 월급 재테크 로드맵을 공개합니다.",
    category: "재테크 로드맵",
  },
  {
    slug: "didimdol-vs-bogeumjari",
    title: "디딤돌 vs 보금자리론, 내게 맞는 대출은? (2025년 최종 비교)",
    description:
      "내 집 마련, 어떤 대출부터 알아봐야 할까요? 두 대표 정책 대출을 완벽하게 비교해드립니다.",
    category: "재테크 로드맵",
  },
  {
    slug: "yef-2026-preview",
    title: "2026 연말정산 미리보기: 13월의 월급, 더 두둑해질까?",
    description:
      "내년 연말정산, 미리 준비하고 더 많이 환급받으세요. 핵심 변경 예측 총정리.",
    category: "재테크 로드맵",
  },
];

const categories = [
  { id: "연봉 분석", name: "연봉 심층 분석", icon: Target },
  { id: "커리어 성장", name: "커리어 성장", icon: Briefcase },
  { id: "필수 지식", name: "필수 금융 지식", icon: BookOpenText },
  { id: "재테크 로드맵", name: "재테크 로드맵", icon: TrendingUp },
];

export default function GuidesListPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          Moneysalary 금융 라이브러리
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          당신의 경제적 자유를 위한 모든 지식을 담았습니다. <br /> 가장 궁금한
          주제부터 탐색해보세요.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.id} className="mb-16">
          <div className="flex items-center mb-6">
            <category.icon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            <h2 className="ml-3 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
              {category.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides
              .filter((g) => g.category === category.id)
              .map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="flex flex-col p-6 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1.5 transition-all bg-light-card dark:bg-dark-card group"
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
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
