import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Calculator, HelpCircle, AlertTriangle } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "주휴수당 조건, 계산법, 못 받았을 때 대처법 총정리 (2025년)",
  description:
    "주 15시간 이상 일했다면 당신도 받을 수 있는 공짜 하루치 급여, 주휴수당! 지급 조건부터 내 알바비에 맞는 계산법, 그리고 사장님이 안 줄 때 대처법까지. 당신의 권리를 찾아가세요.",
  openGraph: {
    title: "주휴수당 조건, 계산법, 못 받았을 때 대처법 총정리 (2025년)",
    description:
      "일주일에 하루는 유급 휴가! 주휴수당, 제대로 알고 계신가요? 당신의 숨은 돈을 찾아드립니다.",
    images: ["/api/og?title=주휴수당, 당신도 받을 수 있어요!"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "주휴수당 조건, 계산법, 못 받았을 때 대처법 총정리 (2025년)",
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
    "주휴수당 지급 조건부터 계산법, 그리고 사장님이 안 줄 때 대처법까지. 당신의 권리를 찾아가세요.",
};

export default function HolidayAllowanceGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-gray-900 dark:to-amber-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            주휴수당,
            <br /> 당신의 숨은 돈을 찾아라!
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-amber-100 dark:text-gray-300">
            일주일에 15시간 이상 일했다면, 하루치 일당을 더 받을 수 있다는 사실! 아르바이트생과 단기 근로자의 소중한 권리, 주휴수당의 모든 것을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-amber-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              시급 1만원에 하루 8시간, 주 5일 일하면 주급은 40만원일까요? 정답은 '아니오'입니다. 주휴수당을 포함한 <strong>48만원</strong>을 받아야 맞습니다. 근로기준법에 명시된 엄연한 권리지만, 많은 분들이 모르고 지나치는 주휴수당, 지금부터 확실하게 챙겨가세요.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HelpCircle className="w-7 h-7 text-green-500" />
                주휴수당, 누가 받을 수 있나요? (지급 조건)
              </h2>
              <p>
                아래 3가지 조건을 <strong>모두</strong> 충족하면 정규직, 계약직, 아르바이트 등 고용 형태와 관계없이 누구나 주휴수당을 받을 수 있습니다.
              </p>
              <ol className="!my-4 list-decimal list-inside space-y-4 text-base bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                <li>
                  <strong>주 15시간 이상 근무:</strong> 1주일 동안의 소정근로시간이 15시간 이상이어야 합니다.
                </li>
                <li>
                  <strong>개근:</strong> 약속한 근무일에 모두 출근해야 합니다. 지각이나 조퇴는 결근이 아니지만, 사전에 합의되지 않은 결근이 있다면 해당 주의 주휴수당은 발생하지 않습니다.
                </li>
                <li>
                  <strong>계속 근로:</strong> 다음 주에도 계속 일할 것이 예정되어 있어야 합니다. (마지막 근무주는 제외될 수 있습니다.)
                </li>
              </ol>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Calculator className="w-7 h-7 text-signature-blue" />
                내 주휴수당, 얼마일까? (계산법)
              </h2>
              <p>
                주휴수당은 생각보다 간단하게 계산할 수 있습니다. 하루치 임금을 추가로 받는다고 생각하면 쉽습니다.
              </p>
              <div className="mt-6 p-8 bg-gray-100 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 text-center">
                <p className="text-lg font-medium">
                  (1주일 총 근로시간 / 40시간) × 8시간 × 시급
                </p>
                <p className="text-sm mt-2">* 주 40시간 미만 근로자의 경우, 위 공식 대신 <br/> <span className="font-bold">(1주일 총 근로시간 / 5) × 시급</span> 으로 더 간단히 계산할 수 있습니다.</p>
              </div>
              <blockquote className="!border-l-blue-500 mt-6">
                <p className="font-bold">예시: 시급 12,000원으로 주 3일, 하루 6시간씩 일하는 경우</p>
                 <ul className="!my-2 text-base">
                  <li><strong>1주일 총 근로시간:</strong> 6시간 × 3일 = 18시간</li>
                  <li><strong>주휴수당:</strong> (18시간 / 5) × 12,000원 = <strong>43,200원</strong></li>
                  <li><strong>총 주급:</strong> (18시간 × 12,000원) + 43,200원 = 216,000원 + 43,200원 = <strong>259,200원</strong></li>
                </ul>
              </blockquote>
            </section>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                사장님이 주휴수당을 안 준다면?
              </h2>
              <p className="!my-2 text-base">
                주휴수당은 근로기준법상 명시된 <strong>임금</strong>입니다. 이를 지급하지 않는 것은 명백한 임금체불에 해당합니다. 지급을 거부당했다면 증거(근로계약서, 출퇴근 기록, 급여 이체 내역 등)를 모아 고용노동부에 진정(신고)을 제기할 수 있습니다.
              </p>
              <a href="https://minwon.moel.go.kr/" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-red hover:underline">
                고용노동부 민원마당 바로가기 →
              </a>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                최저시급, 제대로 계산해보고 싶다면?
              </h2>
              <p>
                내 시급에 주휴수당이 포함되어 있는지, 최저시급은 잘 지켜지고 있는지 궁금하다면? <br />
                Moneysalary의 최저임금 계산기로 확인해보세요.
              </p>
              <Link
                href="/guides/minimum-wage"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                최저임금 계산기 바로가기 ⏱️
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}