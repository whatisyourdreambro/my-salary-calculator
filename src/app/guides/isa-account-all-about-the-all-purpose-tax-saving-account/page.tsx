
import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, ShieldCheck, TrendingUp, Zap } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "ISA 계좌 200% 활용법: 만기자금 연금이전 추가 세액공제 꿀팁 (2025년)",
  description:
    "2025년 금투세 시대, ISA는 선택이 아닌 필수입니다. 중개형 ISA 파헤치기, 비과세 혜택은 물론, 만기 자금을 연금계좌로 이전해 10% 추가 세액공제를 받는 전문가의 비법까지 총정리.",
  openGraph: {
    title: "ISA 계좌 200% 활용법: 만기자금 연금이전 추가 세액공제 꿀팁 (2025년)",
    description:
      "ISA, 그냥 만들면 손해! 만기 후 연금계좌 이전으로 세액공제 10% 더 받는 법, 아는 사람만 압니다.",
    images: ["/api/og?title=ISA 계좌, 아는만큼 돈 버는 비법"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "ISA 계좌 200% 활용법: 만기자금 연금이전 추가 세액공제 꿀팁 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-02-15",
  dateModified: currentDate,
  description:
    "ISA 계좌의 종류, 비과세 혜택, 그리고 만기 자금을 연금계좌로 이전하여 추가 세액공제를 받는 전문가의 활용 전략까지 총정리합니다.",
};

export default function IsaAccountGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-gray-900 dark:to-green-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            ISA 계좌,
            <br /> 아는 만큼 돈 버는 비법
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-teal-100 dark:text-gray-300">
            2025년 금융투자소득세 도입, ISA는 이제 선택이 아닌 필수입니다. 당신의 투자 수익을 지키는 '만능 방패' ISA의 모든 활용 전략을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-teal-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              ISA(개인종합자산관리계좌)는 하나의 계좌에서 주식, 펀드, 채권 등 다양한 금융 상품을 운용하며 절세 혜택을 누리는 '만능 계좌'입니다. 특히 2025년 비과세 한도 확대 및 금융투자소득세 도입이 예정되면서, ISA는 모든 투자자의 필수품으로 자리 잡고 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-green-500" />
                ISA의 강력한 혜택 3가지
              </h2>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">1. 비과세 & 저율과세</h3>
                  <p className="!text-sm !my-0">
                    계좌에서 발생한 순수익 중 <strong>500만원(서민/농어민형 1,000만원)까지는 세금이 0원</strong>입니다. 비과세 한도를 넘는 수익은 9.9%의 낮은 세율로 분리과세되어 금융소득종합과세(최대 49.5%)를 피할 수 있습니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">2. 손익통산</h3>
                  <p className="!text-sm !my-0">
                    여러 상품에 투자하다 보면 이익이 난 상품도, 손실이 난 상품도 있겠죠? ISA는 계좌 내 모든 상품의 <strong>이익과 손실을 합산(손익통산)</strong>한 최종 순수익에 대해서만 세금을 매깁니다. 합리적인 절세의 핵심입니다.
                  </p>
                </div>
                 <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !text-lg">3. 다양한 상품 투자</h3>
                  <p className="!text-sm !my-0">
                    국내 상장 주식, 펀드, 채권, ELS, ETF 등 대부분의 금융상품을 하나의 계좌에서 자유롭게 투자하고 관리할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold">어떤 ISA를 만들어야 할까?</h2>
              <p>ISA는 운용 방식에 따라 중개형, 신탁형, 일임형으로 나뉩니다. 2025년 현재, 대부분의 투자자는 **중개형 ISA**를 선택합니다.</p>
              <blockquote className="!border-l-blue-500 mt-6">
                <h4 className="font-bold !text-lg !mt-0">중개형 ISA: 투자의 자유를 원한다면</h4>
                <p>
                  투자자가 직접 국내 주식, 채권, 펀드, ETF 등을 자유롭게 매매하며 포트폴리오를 구성할 수 있습니다. <strong>직접 투자를 선호하는 대부분의 투자자에게 가장 적합한 유형</strong>입니다. 증권사에서 개설할 수 있습니다.
                </p>
              </blockquote>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>신탁형/일임형 ISA:</strong> 전문가에게 맡기고 싶다면 은행이나 증권사에서 개설할 수 있지만, 상품 선택의 제약이 있고 수수료가 발생하여 현재는 가입자가 많지 않습니다.
              </p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-2xl border-2 border-yellow-300 dark:border-yellow-700">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <Zap className="w-6 h-6" /> ISA 200% 활용을 위한 전문가 꿀팁
              </h2>
              <ul className="!my-4 space-y-3 text-base !p-0">
                <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <strong className="text-yellow-700 dark:text-yellow-300">Tip 1: 3년 의무기간은 필수!</strong><br/>
                  비과세 혜택을 받으려면 최소 3년은 계좌를 유지해야 합니다. 중도 해지 시에는 세금 혜택이 사라지니, 3년 이상 묻어둘 수 있는 자금으로 투자하세요.
                </li>
                <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <strong className="text-yellow-700 dark:text-yellow-300">Tip 2: 연간 한도는 채울수록 이득!</strong><br/>
                  연간 납입 한도(2025년 기준 4,000만원)는 다음 해로 이월되지 않습니다. 한도를 꽉 채워 투자해야 비과세 혜택을 최대로 누릴 수 있습니다.
                </li>
                <li className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm">
                  <strong className="text-yellow-700 dark:text-yellow-300">Tip 3: 만기 자금은 연금계좌로 이전! (핵심)</strong><br/>
                  ISA 만기 후 60일 내에 계좌 잔액을 IRP나 연금저축펀드 등 연금계좌로 이전하면, <strong>이전 금액의 10%(최대 300만원)를 추가로 세액공제</strong> 받을 수 있습니다. ISA와 연금계좌의 시너지를 활용한 최고의 절세 전략입니다.
                </li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                ISA, 어떻게 채워야 할까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                만능 계좌를 만들었다면, 이제 어떤 자산으로 채울지 고민할 차례입니다. 나만의 투자 원칙을 세우고 안정적인 포트폴리오를 구축하는 방법을 알아보세요.
              </p>
              <Link
                href="/guides/portfolio-construction-creating-my-own-investment-strategy"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                나만의 포트폴리오 만들러 가기 📊
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
