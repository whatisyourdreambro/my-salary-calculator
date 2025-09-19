import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "삼성전자 vs SK하이닉스, 성과급 포함 연봉 비교 (2025년 최종판)",
  description:
    "반도체 양대산맥, 삼성전자와 SK하이닉스! HBM 대전 속에서 과연 어디가 더 높은 성과급과 연봉을 받을까요? 현직자 정보를 기반으로 상세히 비교 분석합니다.",
};

export default function SamsungVsHynixPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-signature-blue">
          삼성전자 vs SK하이닉스, 최후의 승자는?
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          성과급 포함 진짜 연봉, 2025년 기준 완벽 비교 분석
        </p>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          '신의 직장'이라 불리는 삼성전자와 SK하이닉스. 특히 AI 반도체 시장의
          핵심인 HBM 기술 경쟁이 치열해지면서 두 회사의 성과급 격차는 직장인들
          사이 최고의 관심사입니다. 과연 2025년, 보너스까지 합산한 실제 연봉은
          어디가 더 높을까요?
        </p>
        <p>
          (이 가이드는 이미 존재하는{" "}
          <Link href="/guides/industry-trends-2025">성과급 격차 심층 분석</Link>
          의 내용을 기반으로, 두 회사의 연봉 비교에 더 초점을 맞춰 재구성한
          콘텐츠입니다.)
        </p>
        <Link
          href="/?tab=comparator"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold text-xl hover:bg-blue-700 transition-colors"
        >
          삼성 vs 하이닉스 오퍼, 직접 비교해보기 →
        </Link>
      </article>
    </main>
  );
}
