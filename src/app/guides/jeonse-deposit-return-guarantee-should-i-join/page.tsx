
import type { Metadata } from "next";
import Link from "next/link";
import { Home, ShieldCheck, DollarSign, AlertTriangle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "전세 보증금 반환 보증, 꼭 가입해야 할까? (전세 사기 예방 필수)",
  description:
    "전세 사기, 더 이상 남의 일이 아닙니다. 내 소중한 전세 보증금을 지키는 가장 확실한 방법, 전세 보증금 반환 보증! 가입 조건, 보증 기관별 특징, 그리고 가입의 필요성까지 상세히 알려드립니다. 2025년 최신 전세 제도 반영.",
  openGraph: {
    title: "전세 보증금 반환 보증, 꼭 가입해야 할까? (전세 사기 예방 필수)",
    description:
      "전세 보증금, 안전하게 지키세요. 전세 보증금 반환 보증으로 당신의 소중한 자산을 보호하세요.",
    images: ["/api/og?title=전세 보증금 반환 보증, 필수일까?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "전세 보증금 반환 보증, 꼭 가입해야 할까? (전세 사기 예방 필수)",
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
    "전세 보증금 반환 보증의 가입 조건, 보증 기관별 특징, 그리고 가입의 필요성까지 상세히 알려드립니다. 2025년 최신 전세 제도 반영.",
};

export default function JeonseDepositGuaranteeGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-orange-500 to-red-600 dark:from-gray-900 dark:to-orange-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            전세 보증금 반환 보증,
            <br /> 내 돈 지키는 필수템?
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-red-100 dark:text-gray-300">
            전세 사기, 깡통 전세... 불안한 전세 시장 속에서 내 소중한 보증금을 지키는 가장 확실한 방법, 전세 보증금 반환 보증! 꼭 가입해야 할지, 어떻게 가입하는지 모든 것을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-red-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              전세는 목돈을 맡기고 주택을 빌리는 한국 고유의 주거 형태로, 월세보다 주거비 부담이 적다는 장점이 있습니다. 하지만 집주인의 재정 상황 악화나 전세 사기 등으로 인해 전세 보증금을 돌려받지 못하는 위험이 항상 존재합니다. 이러한 위험으로부터 세입자의 보증금을 보호하기 위해 '전세 보증금 반환 보증' 제도가 운영되고 있습니다. 이 가이드를 통해 전세 보증금 반환 보증의 모든 것을 파악하고, 당신의 소중한 자산을 지키세요.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                전세 보증금 미반환 위험, 왜 커지고 있을까?
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li>
                  <strong>깡통 전세:</strong> 전세 가격이 매매 가격보다 높아지는 현상으로, 집주인이 집을 팔아도 보증금을 돌려주기 어려운 상황.
                </li>
                <li>
                  <strong>전세 사기:</strong> 임대인이 여러 채의 주택을 소유하며 보증금을 가로채는 조직적인 사기 행각.
                </li>
                <li>
                  <strong>금리 인상:</strong> 대출 이자 부담 증가로 임대인의 재정 상황이 악화되어 보증금 반환이 어려워지는 경우.
                </li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-green-500" />
                전세 보증금 반환 보증, 무엇인가요?
              </h2>
              <p>
                전세 보증금 반환 보증은 전세 계약 종료 후 임대인이 임차인에게 전세 보증금을 반환하지 못할 경우, 주택도시보증공사(HUG), 한국주택금융공사(HF), 서울보증보험(SGI) 등 보증 기관이 임차인에게 대신 보증금을 지급해주는 제도입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    1. HUG (주택도시보증공사)
                  </h3>
                  <p className="!text-sm !my-0">
                    가장 일반적인 보증 기관으로, 보증료가 저렴하고 보증 한도가 높습니다. 전세가율(전세가/매매가) 90% 이내 주택에 가입 가능합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    2. HF (한국주택금융공사)
                  </h3>
                  <p className="!text-sm !my-0">
                    HUG보다 가입 조건이 다소 까다롭지만, 보증료가 저렴합니다. 전세가율 100% 이내 주택에 가입 가능합니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 text-light-text dark:text-dark-text flex items-center gap-2">
                    3. SGI (서울보증보험)
                  </h3>
                  <p className="!text-sm !my-0">
                    보증료가 비싸지만, 가입 조건이 비교적 유연합니다. 전세가율 100% 이내 주택에 가입 가능하며, 주택 종류에 제한이 적습니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 전세 보증금 반환 보증, 꼭 가입해야 할까?
              </h2>
              <p className="!my-2 text-base">
                전세 보증금 반환 보증은 선택이 아닌 필수입니다. 특히 전세가율이 높거나, 임대인의 재정 상황이 불안정하다고 판단될 경우 반드시 가입해야 합니다. 보증료가 아깝다고 생각할 수 있지만, 내 소중한 전세 보증금을 지키는 가장 확실한 안전장치입니다.
              </p>
              <Link href="https://www.khug.or.kr/" target="_blank" rel="noopener noreferrer" className="font-semibold text-yellow-800 hover:underline">
                → 주택도시보증공사 (HUG) 홈페이지 바로가기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <Home className="w-7 h-7 text-indigo-500" />
                당신의 소중한 보증금, 안전하게 지키세요!
              </h2>
              <p>
                전세 계약은 신중하게, 그리고 안전하게! 전세 보증금 반환 보증으로 <br />
                당신의 소중한 자산을 보호하고 안심하고 거주하세요.
              </p>
              <Link
                href="/home-loan"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                주택담보대출 계산기 바로가기 🏠
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
