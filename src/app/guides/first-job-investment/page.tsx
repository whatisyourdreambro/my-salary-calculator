import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "첫 월급 재테크, 100만원으로 시작하는 투자 로드맵",
  description:
    "사회초년생을 위한 첫 월급 재테크 완벽 가이드. 100만원 시드머니로 시작하는 연금저축펀드, S&P 500 ETF 등 가장 현실적인 투자 방법을 소개합니다.",
};

export default function FirstJobInvestmentPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          첫 월급 100만원, 어떻게 굴려야 할까?
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          사회초년생을 위한 가장 현실적인 투자 로드맵
        </p>
      </div>
      <article className="prose dark:prose-invert lg:prose-xl max-w-none">
        <p className="lead">
          설레는 첫 월급, 하지만 어떻게 관리해야 할지 막막한가요? 월 100만원의
          소액으로도 시작할 수 있는, 사회초년생을 위한 가장 안정적이고 현실적인
          투자 파이프라인 구축법을 소개합니다.
        </p>
        <p>
          (이 가이드는{" "}
          <Link href="/guides/road-to-100m-part3-invest">
            월급으로 시작하는 투자 파이프라인
          </Link>
          콘텐츠를 사회초년생의 눈높이에 맞춰 재구성한 버전입니다.)
        </p>
        <Link
          href="/fire-calculator"
          className="block mt-12 p-4 bg-signature-blue text-white rounded-lg text-center font-bold"
        >
          나의 은퇴 나이 계산해보기 →
        </Link>
      </article>
    </main>
  );
}
