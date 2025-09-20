import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, HandCoins } from "lucide-react"; // Code2, TrendingUp 제거

export const metadata: Metadata = {
  title: "네카라쿠배 개발자 초봉 1억, 그 진실은? (2025년 최종판)",
  description:
    "꿈의 직장 '네카라쿠배' 신입 개발자, 정말 1억을 받을까? 계약 연봉 6500, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체와 세후 실수령액을 완벽하게 분석합니다.",
  openGraph: {
    title: "네카라쿠배 개발자 초봉 1억, 그 진실은?",
    description:
      "계약 연봉, 사이닝 보너스, 스톡옵션을 모두 포함한 '영끌 초봉'의 실체를 파헤칩니다.",
    images: [
      "/api/og?title=네카라쿠배 신입 초봉 1억의 진실&description=2025년 기준 계약연봉, 보너스, 스톡옵션 총정리",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "네카라쿠배 개발자 초봉 1억, 그 진실은? (2025년 최종판)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-22",
  dateModified: "2025-09-22",
  description:
    "계약 연봉 6500, 사이닝 보너스, 스톡옵션을 포함한 '영끌 초봉'의 실체와 세후 실수령액을 완벽하게 분석합니다.",
};

export default function NekarakubaeSalaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-light-bg dark:bg-dark-bg">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            네카라쿠배 신입 초봉 1억,
            <br /> <span className="text-emerald-400">그 진실을 파헤치다</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            개발자 지망생들의 꿈, &apos;네카라쿠배&apos;. 과연 소문처럼 억대
            연봉은 현실일까요? 계약서 뒤에 숨겨진 진짜 보상 체계를 낱낱이
            공개합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              네이버, 카카오, 라인, 쿠팡, 배달의민족. 대한민국 IT 산업을 이끄는
              이들 기업은 개발자들에게 최고의 대우를 약속하며 인재 유치 전쟁을
              벌여왔습니다. 그 중심에는 늘 &apos;신입 초봉&apos;이라는 뜨거운
              키워드가 있었죠. 결론부터 말하자면, &apos;초봉 1억&apos;은 절반은
              맞고 절반은 틀립니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-emerald-500" />
                &apos;영끌 연봉&apos;을 구성하는 3+1 요소
              </h2>
              <p>
                네카라쿠배의 보상은 단순히 12로 나누는 계약 연봉이 전부가
                아닙니다. 첫해 소득을 극대화하는 다양한 요소들이 포함된
                &apos;보상 패키지&apos; 개념으로 접근해야 합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ① 계약 연봉 (기본기)
                  </h3>
                  <p className="!text-sm !my-0">
                    2025년 기준 <strong>6,000만원 ~ 6,500만원</strong> 수준에서
                    형성됩니다. 매달 통장에 찍히는 월급의 기준이 되는 가장
                    중요한 금액입니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ② 사이닝 보너스 (환영 선물)
                  </h3>
                  <p className="!text-sm !my-0">
                    입사를 축하하며 일시불로 지급하는 보너스입니다. 보통{" "}
                    <strong>1,000만원 ~ 2,000만원</strong> 수준이며, 첫해 연봉을
                    극적으로 높여주는 핵심 요소입니다. (단, 보통 1~2년의
                    의무근무 기간이 있습니다.)
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ③ 스톡옵션 / RSU (미래 가치)
                  </h3>
                  <p className="!text-sm !my-0">
                    회사의 주식을 부여받는 제도로, 네카라쿠배 보상의 꽃입니다.
                    당장의 현금은 아니지만, 회사의 성장에 따라 수천, 수억원의
                    가치로 불어날 수 있는 잠재력을 가집니다.
                  </p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ④ 인센티브 (노력의 결실)
                  </h3>
                  <p className="!text-sm !my-0">
                    개인과 조직의 성과에 따라 지급되는 보너스입니다. 첫해부터 큰
                    금액을 기대하긴 어렵지만, 경력이 쌓일수록 중요한 소득원이
                    됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HandCoins className="w-7 h-7 text-green-500" />
                현실적인 실수령액: 세금의 무게
              </h2>
              <p>
                만약 당신이{" "}
                <strong>
                  &apos;계약 연봉 6,500만원 + 사이닝 보너스 2,000만원&apos;
                </strong>{" "}
                의 오퍼를 받았다면, 첫해 총소득은 8,500만원입니다. 하지만 사이닝
                보너스는 일시적인 소득으로 높은 세율이 적용되어 세금 부담이
                큽니다.
              </p>
              <blockquote>
                <p>
                  <strong>결론:</strong> 계약 연봉 6,500만원의 월 실수령액은 약{" "}
                  <strong>440만원</strong> 수준입니다. 사이닝 보너스 2,000만원은
                  세금을 제외하면 약 1,400~1,500만원을 수령하게 됩니다. 즉,
                  &apos;영끌 1억&apos;을 받아도 실제 손에 쥐는 돈은 예상보다
                  적을 수 있다는 점을 인지해야 합니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 가치를 증명할 준비가 되셨나요?
              </h2>
              <p>
                네카라쿠배의 높은 연봉은 뛰어난 인재에 대한 합당한 대우입니다.
                꿈의 무대에 오르기 위해, 지금 이 순간에도 당신의 실력을 갈고
                닦으세요.
              </p>
              <Link
                href="/?salaryInput=65,000,000&payBasis=annual"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 초봉 실수령액 직접 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
