import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "급여/세금/퇴직금 가이드 | Moneysalary",
  description:
    "실업급여, 주휴수당, 퇴직금 세금 등 직장인이라면 꼭 알아야 할 필수 정보들을 알기 쉽게 정리했습니다.",
};

const guides = [
  {
    slug: "industry-trends-2025",
    title:
      "대기업 연봉의 미래: 삼성·하이닉스 AI성과급 vs 현대차, 정부 정책 총정리",
    description:
      "AI 반도체 붐, 자동차 산업 전환, 그리고 정부의 '기업 밸류업 프로그램'이 대기업 직장인들의 연봉과 성과급에 미칠 영향을 심층 분석합니다.",
  },
  {
    slug: "unemployment-benefits",
    title: "실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판)",
    description:
      "실업급여 수급 자격, 신청 방법, 지급액, 구직활동까지. 2025년 최신 기준으로 실업급여의 모든 것을 자세히 알려드립니다.",
  },
  {
    slug: "holiday-allowance",
    title: "주휴수당 계산법 및 지급 조건 완벽 가이드",
    description:
      "주휴수당, 받을 수 있는지 궁금하신가요? 2025년 최신 지급 조건과 내 월급에 맞는 주휴수당 계산법을 예시와 함께 알려드립니다.",
  },
  {
    slug: "severance-tax",
    title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기",
    description:
      "내 퇴직금에서 세금이 얼마나 빠져나갈까요? 복잡한 퇴직소득세 계산 구조와 공제 항목을 예시와 함께 쉽게 설명해 드립니다.",
  },
  {
    slug: "four-major-insurances",
    title: "4대 보험 완벽 정리: 국민연금, 건강보험, 고용보험, 산재보험",
    description:
      "직장인이라면 반드시 알아야 할 4대 사회보험의 모든 것. 각 보험의 역할, 요율, 계산 방법까지 한 페이지에서 완벽하게 마스터하세요.",
  },
  {
    slug: "year-end-tax-settlement",
    title: "연말정산 A to Z: 13월의 월급, 제대로 챙기는 법",
    description:
      "소득공제와 세액공제의 차이점부터 놓치기 쉬운 핵심 공제 항목까지, 연말정산의 모든 것을 알려드립니다.",
  },
  {
    slug: "minimum-wage",
    title: "2025년 최저임금 완벽정리 (시급, 월급, 연봉)",
    description:
      "2025년 최저시급은 얼마일까요? 최저임금 기준 월급과 연봉, 그리고 주휴수당 포함 계산법까지 모두 알려드립니다.",
  },
  {
    slug: "nurse-salary",
    title: "2025년 간호사 연봉 테이블 완벽 분석 (신규, 5년차, 수간호사)",
    description:
      "대학병원, 종합병원, 개인병원별 신규 간호사부터 5년차, 10년차 이상 수간호사까지 직급별 연봉 및 실수령액 정보를 제공합니다.",
  },
  {
    slug: "road-to-100m-part1-tax",
    title: "연봉 1억을 위한 현실적인 절세 전략 (2025년 최종판)",
    description:
      "연봉 1억 실수령액을 높이는 가장 확실한 방법, 절세. 연금저축펀드, IRP, 비과세 수당 활용법부터 총정리했습니다.",
  },
  {
    slug: "road-to-100m-part2-sidejob",
    title: "N잡으로 월 100만원 더 벌기 (2025년 부업 가이드)",
    description:
      "직장인 부업 추천! 전문성을 활용한 N잡부터 스마트스토어, 배달 아르바이트까지 현실적인 방법을 알려드립니다.",
  },
  {
    slug: "road-to-100m-part3-invest",
    title: "월급으로 시작하는 투자 파이프라인 (2025년 투자 로드맵)",
    description:
      "시드머니 모으기부터 미국 S&P 500 ETF, 연금저축펀드를 활용한 장기 투자 전략과 절세 혜택까지 제시합니다.",
  },
];

export default function GuidesListPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-signature-blue dark:text-gray-100 sm:text-5xl">
          콘텐츠 가이드
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
          직장인이라면 꼭 알아야 할 필수 금융 정보를 쉽고 깊이있게 알려드립니다.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="flex flex-col p-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all bg-light-card dark:bg-dark-card"
          >
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">
              {guide.title}
            </h2>
            <p className="flex-grow text-light-text-secondary dark:text-dark-text-secondary">
              {guide.description}
            </p>
            <span className="mt-4 text-sm font-semibold text-signature-blue self-start">
              자세히 보기 →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
