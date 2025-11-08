
import type { Metadata } from "next";
import Link from "next/link";
import { FileText, TrendingUp, ShieldCheck, Lightbulb } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "2025년 달라지는 세법, 나에게 유리한 변화는? (연말정산, 부동산, 주식)",
  description:
    "매년 바뀌는 세법, 2025년에는 어떤 변화가 있을까요? 연말정산 소득공제/세액공제 확대, 부동산 세금 완화, 주식 양도소득세 개편 등 개인에게 유리한 주요 세법 개정 내용을 상세히 분석하고, 절세 전략을 알려드립니다.",
  openGraph: {
    title: "2025년 달라지는 세법, 나에게 유리한 변화는? (연말정산, 부동산, 주식)",
    description:
      "세법 변화를 알면 돈이 보입니다. 2025년, 당신의 지갑을 두둑하게 채워줄 세법 개정 내용을 확인하세요.",
    images: ["/api/og?title=2025년 달라지는 세법, 나에게 유리한 변화는?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2025년 달라지는 세법, 나에게 유리한 변화는? (연말정산, 부동산, 주식)",
  author: {
    "@type": "Organization",
    name: "Moneysalary",
  },
  publisher: {
    "@type": "Organization",
    name: "Moneysalary",
    logo: {
      "@type": "ImageObject",
      url: "https://www.moneysalary.com/favicon.ico",
    },
  },
  datePublished: "2025-10-28",
  dateModified: currentDate,
  description:
    "연말정산 소득공제/세액공제 확대, 부동산 세금 완화, 주식 양도소득세 개편 등 개인에게 유리한 주요 세법 개정 내용을 상세히 분석하고, 절세 전략을 알려드립니다.",
};

export default function ChangingTaxLaws2025GuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            2025년 달라지는 세법,
            <br /> 나에게 유리한 변화는?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            매년 연말이면 발표되는 세법 개정안. 복잡하고 어렵게 느껴지지만, 미리 알아두면 당신의 지갑을 두둑하게 채워줄 수 있습니다. 2025년, 개인에게 유리하게 달라지는 세법을 지금 바로 확인하세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              세법은 정부의 경제 정책 방향을 반영하며 매년 크고 작은 변화를 겪습니다. 이러한 변화를 미리 파악하고 대비하는 것은 합법적인 절세와 현명한 재정 계획 수립에 필수적입니다. 특히 2025년에는 서민과 중산층의 세금 부담을 완화하고, 경제 활력을 높이기 위한 다양한 세법 개정이 예고되어 있습니다. 당신에게 직접적인 영향을 미칠 주요 변화들을 중심으로 자세히 살펴보겠습니다.
            </p>

            <section className="mt-12 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="!mt-0 !text-2xl font-bold text-signature-blue flex items-center gap-2">
                <FileText className="w-6 h-6" />
                세법 개정, 왜 중요할까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>절세 기회 포착:</strong> 새로운 공제 항목이나 세액 감면 혜택을 미리 알아두면 연말정산이나 종합소득세 신고 시 세금을 크게 줄일 수 있습니다.
                </li>
                <li>
                  <strong>재정 계획 수정:</strong> 부동산, 주식 등 자산 관련 세법 변화는 투자 전략이나 자산 포트폴리오를 수정하는 데 중요한 기준이 됩니다.
                </li>
                <li>
                  <strong>불이익 방지:</strong> 변경된 세법을 알지 못해 가산세를 물거나 불필요한 세금을 납부하는 것을 방지할 수 있습니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-green-500" />
                2025년 개인에게 유리한 주요 세법 변화 (예상)
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. 연말정산 소득공제/세액공제 확대
                  </h3>
                  <p className="!text-sm !my-0">
                    서민과 중산층의 세금 부담을 덜어주기 위해 신용카드 소득공제율 상향, 자녀세액공제 확대, 월세 세액공제 대상 확대 등 다양한 공제 혜택이 늘어날 것으로 예상됩니다. 특히 출산 및 양육 관련 공제 혜택이 강화될 가능성이 높습니다.
                  </p>
                   <Link href="/guides/year-end-tax-settlement" className="text-sm text-blue-600 hover:underline">→ 연말정산 완벽 가이드 보기</Link>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. ISA 계좌 비과세 한도 상향 및 가입 대상 확대
                  </h3>
                  <p className="!text-sm !my-0">
                    '만능 절세 통장'으로 불리는 ISA 계좌의 비과세 한도가 크게 상향되고, 가입 대상도 확대될 것으로 보입니다. 이는 개인 투자자들의 자산 증식을 돕고, 절세 혜택을 더욱 폭넓게 누릴 수 있도록 할 것입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. 부동산 세금 완화 (취득세, 양도소득세 등)
                  </h3>
                  <p className="!text-sm !my-0">
                    침체된 부동산 시장 활성화를 위해 취득세 감면, 다주택자 양도소득세 중과 완화 등 부동산 관련 세금 부담이 줄어들 가능성이 있습니다. 특히 생애최초 주택 구매자에 대한 혜택이 강화될 것으로 예상됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 세법 변화, 이렇게 활용하세요!
              </h2>
              <p className="!my-2 text-base">
                세법 개정은 당신의 재정 계획에 직접적인 영향을 미칩니다. 새로운 공제 혜택을 최대한 활용하고, 변경되는 세금 정책에 맞춰 투자 전략을 수정하는 등 적극적으로 대응해야 합니다. 필요하다면 세무 전문가와 상담하여 최적의 절세 방안을 모색하세요.
              </p>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 자산을 지키는 현명한 세금 전략!
              </h2>
              <p>
                복잡한 세법, Moneysalary가 쉽게 풀어드립니다. <br />
                달라지는 세법을 미리 알고 당신의 소중한 자산을 지키세요.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연말정산 계산기 바로가기 💰
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
