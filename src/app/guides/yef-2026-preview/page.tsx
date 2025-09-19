import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2026년 연말정산, 바뀌는 공제 항목 총정리",
  description:
    "미리 준비하는 2026년 연말정산. 새롭게 바뀌는 소득공제, 세액공제 항목은 무엇일까요? 최신 세법 개정안을 바탕으로 핵심 변경 사항을 예측하고 정리합니다.",
};

export default function YEF2026PreviewPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          2026년 연말정산 미리보기
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          미리 준비하는 자가 13월의 월급을 얻는다!
        </p>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          아직 2025년이지만, 현명한 직장인이라면 내년의 세금 정책 변화를 미리
          살펴봐야 합니다. 현재 논의 중인 세법 개정안을 바탕으로 2026년
          연말정산에서 달라질 가능성이 높은 항목들을 예측해 보았습니다.
        </p>
        <section className="mt-12 bg-light-card dark:bg-dark-card p-6 rounded-2xl shadow-lg">
          <h2 className="!mt-0 text-2xl font-bold">주요 변경 예상 항목</h2>
          <ul className="!my-4">
            <li>
              <strong>자녀 세액공제 확대:</strong> 저출산 문제 해결을 위해 자녀
              세액공제 금액이 상향 조정될 가능성이 높습니다.
            </li>
            <li>
              <strong>월세 세액공제 기준 완화:</strong> 더 많은 1인 가구 및
              청년층이 혜택을 볼 수 있도록 소득 기준이 완화될 수 있습니다.
            </li>
          </ul>
          <p className="text-sm">
            *본 내용은 확정된 사항이 아니며, 최신 세법 개정안을 바탕으로 한 예측
            정보입니다.
          </p>
        </section>
        <Link
          href="/year-end-tax"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          올해 환급금부터 계산해보기 →
        </Link>
      </article>
    </main>
  );
}
