import type { Metadata } from "next";
import ComparisonResultContent from "@/components/ComparisonResultContent";
import { companies } from "@/lib/companyData";
import { buildPageMetadata } from "@/lib/seo";

export const runtime = 'edge';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateMetadata({ params }: PageProps): Metadata {
  const [idA, idB] = params.slug.split("-vs-");
  const nameA = companies.find((c) => c.id === idA)?.name;
  const nameB = companies.find((c) => c.id === idB)?.name;

  // 알 수 없는 기업 조합 URL은 색인 제외 — 무한 thin-content 방지
  if (!nameA || !nameB) {
    return buildPageMetadata({
      title: "회사 연봉 비교",
      description: "두 기업의 연봉·복지·성장성을 한눈에 비교하세요.",
      path: `/company/compare/${params.slug}`,
      noIndex: true,
    });
  }

  // 카니발 해소(전체 점검 2026-06): 동일 비교가 /salary-db/compare/[slug]에 더 풍부하게 존재.
  // 레거시 6개사 비교는 noindex로 색인 권위를 /salary-db로 통합(둘 다 색인 시 순위 분산).
  return buildPageMetadata({
    title: `${nameA} vs ${nameB} 연봉 비교 — 초봉·평균연봉·복지 1:1 분석`,
    description: `${nameA}와 ${nameB}의 신입 초봉, 평균 연봉, 복지 혜택, 성장성을 2026년 기준으로 1:1 비교합니다. 두 기업 중 어디가 더 유리한지 한눈에 확인하세요.`,
    path: `/company/compare/${params.slug}`,
    noIndex: true,
    keywords: [
      `${nameA} ${nameB} 비교`,
      `${nameA} vs ${nameB}`,
      `${nameA} 연봉`,
      `${nameB} 연봉`,
      "회사 연봉 비교",
    ],
  });
}

export default function ComparisonResultPage({ params }: PageProps) {
  return <ComparisonResultContent slug={params.slug} />;
}
