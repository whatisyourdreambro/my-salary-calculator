
import type { Metadata } from "next";
import Link from "next/link";
import { Family, ShieldCheck, DollarSign, FileText } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "상속세 vs 증여세, 미리 준비하는 자산 승계: 절세 전략 (2025년)",
  description:
    "부의 대물림, 세금 폭탄 피하는 법! 상속세와 증여세의 차이점, 계산법, 그리고 합법적인 절세 전략을 알려드립니다. 사전 증여, 배우자 공제, 가업 승계 등 당신의 소중한 자산을 지키는 현명한 자산 승계 계획을 세우세요.",
  openGraph: {
    title: "상속세 vs 증여세, 미리 준비하는 자산 승계: 절세 전략 (2025년)",
    description:
      "상속세와 증여세, 제대로 알고 준비하면 세금 폭탄을 피할 수 있습니다. 당신의 자산을 지키는 현명한 선택.",
    images: ["/api/og?title=상속세 vs 증여세, 자산 승계 전략"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "상속세 vs 증여세, 미리 준비하는 자산 승계: 절세 전략 (2025년)",
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
    "상속세와 증여세의 차이점, 계산법, 그리고 합법적인 절세 전략을 알려드립니다. 사전 증여, 배우자 공제, 가업 승계 등 당신의 소중한 자산을 지키는 현명한 자산 승계 계획을 세우세요.",
};

export default function InheritanceGiftTaxGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 dark:from-gray-900 dark:to-purple-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            상속세 vs 증여세,
            <br /> 미리 준비하는 자산 승계
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            부의 대물림은 피할 수 없는 현실. 하지만 세금 폭탄을 피하고 당신의 소중한 자산을 후대에 온전히 물려주기 위해서는 철저한 준비가 필요합니다. 상속세와 증여세의 모든 것을 파헤치고, 현명한 자산 승계 전략을 세우세요.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              상속세와 증여세는 부의 이전에 부과되는 세금으로, 고액 자산가들에게는 가장 큰 세금 부담 중 하나입니다. 두 세금 모두 높은 누진세율이 적용되므로, 미리 계획하지 않으면 막대한 세금 폭탄을 맞을 수 있습니다. 하지만 상속세와 증여세는 그 성격과 계산 방식, 그리고 절세 전략에서 큰 차이를 보입니다. 이 가이드를 통해 두 세금의 차이점을 명확히 이해하고, 당신의 자산을 지키는 현명한 승계 계획을 세워보세요.
            </p>

            <section className="mt-12 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-200 dark:border-purple-800">
              <h2 className="!mt-0 !text-2xl font-bold text-purple-600 flex items-center gap-2">
                <Family className="w-6 h-6" />
                상속세 vs 증여세, 무엇이 다를까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>상속세:</strong> 사망으로 인해 재산이 무상으로 이전될 때 부과되는 세금. 피상속인(사망자)을 기준으로 상속 재산 전체에 대해 과세됩니다.
                </li>
                <li>
                  <strong>증여세:</strong> 생전에 재산이 무상으로 이전될 때 부과되는 세금. 수증인(재산을 받는 사람)을 기준으로 증여받은 재산에 대해 과세됩니다.
                </li>
                <li>
                  <strong>핵심 차이:</strong> 상속세는 '사망'을 전제로 하고, 증여세는 '생전'에 재산을 이전할 때 부과됩니다. 이 차이가 절세 전략의 핵심이 됩니다.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3 text-center justify-center">
                <FileText className="w-7 h-7 text-green-500" />
                상속세/증여세 계산법과 공제 한도
              </h2>
              <p className="text-center">
                두 세금 모두 누진세율이 적용되며, 다양한 공제 항목을 활용하여 세금 부담을 줄일 수 있습니다.
              </p>
              <div className="overflow-x-auto mt-6 shadow-md rounded-lg">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">구분</th>
                      <th className="py-3 px-4 font-bold text-blue-600">상속세</th>
                      <th className="py-3 px-4 font-bold text-orange-500">증여세</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">과세 대상</td>
                      <td className="py-4 px-4">피상속인의 모든 상속 재산</td>
                      <td className="py-4 px-4">수증인이 증여받은 재산</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">세율</td>
                      <td className="py-4 px-4">10% ~ 50% (누진세율)</td>
                      <td className="py-4 px-4">10% ~ 50% (누진세율)</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">주요 공제</td>
                      <td className="py-4 px-4">배우자 공제 (최소 5억~최대 30억), 일괄 공제 (5억), 금융재산 상속 공제 등</td>
                      <td className="py-4 px-4">배우자 공제 (6억), 직계존비속 공제 (5천만원), 기타 친족 공제 (1천만원)</td>
                    </tr>
                     <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4 font-bold">신고 기한</td>
                      <td className="py-4 px-4">상속 개시일이 속하는 달의 말일부터 6개월 이내</td>
                      <td className="py-4 px-4">증여일이 속하는 달의 말일부터 3개월 이내</td>
                    </tr>
                  </tbody>
                </table>
              </div>
               <p class="text-xs text-center mt-2 text-gray-500">* 위 내용은 2025년 세법 기준으로, 향후 변경될 수 있습니다.</p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 상속세/증여세 절세 전략 TOP 3
              </h2>
              <ul className="!my-2 space-y-1 text-base">
                <li>
                  <strong>1. 사전 증여 활용:</strong> 증여세는 10년 단위로 공제 한도가 초기화됩니다. 자녀에게 미리미리 증여하여 세금 부담을 분산하는 것이 유리합니다.
                </li>
                <li>
                  <strong>2. 배우자 공제 최대한 활용:</strong> 배우자에게 증여하거나 상속할 경우 공제 한도가 매우 큽니다. 배우자에게 먼저 증여한 후 자녀에게 재증여하는 방식도 고려해볼 수 있습니다.
                </li>
                <li>
                  <strong>3. 가업 승계 지원 제도 활용:</strong> 중소기업의 경우 가업 승계를 위한 다양한 세금 감면 혜택이 있습니다. 전문가와 상담하여 활용 가능 여부를 확인하세요.
                </li>
              </ul>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 소중한 자산, 현명하게 승계하세요!
              </h2>
              <p>
                상속세와 증여세는 미리 준비할수록 절세 효과가 커집니다. <br />
                Moneysalary의 재테크 가이드와 함께 당신의 자산을 지키세요.
              </p>
              <Link
                href="/guides/road-to-100m-part3-invest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                투자 시스템 만들기 가이드 보기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
