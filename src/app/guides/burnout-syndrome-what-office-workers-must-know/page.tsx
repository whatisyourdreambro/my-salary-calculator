
import type { Metadata } from "next";
import Link from "next/link";
import { Flame, HeartCrack, Lightbulb, ShieldCheck, TrendingUp } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "번아웃 증후군 자가진단 및 극복 방법 (feat. 연봉 협상, 이직)",
  description:
    "혹시 나도 번아웃? 자가진단 체크리스트로 확인해보세요. 번아웃의 증상과 원인, 그리고 뽀모도로, 명상 등 구체적인 극복 방법과 함께 커리어 재평가의 기회로 삼는 법을 알려드립니다.",
  openGraph: {
    title: "번아웃 증후군 자가진단 및 극복 방법 (feat. 연봉 협상, 이직)",
    description:
      "번아웃, 더 이상 혼자 힘들어하지 마세요. 당신의 몸과 마음, 그리고 커리어를 지키는 방법을 알려드립니다.",
    images: ["/api/og?title=번아웃 증후군, 혹시 나도?"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "번아웃 증후군 자가진단 및 극복 방법 (feat. 연봉 협상, 이직)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-05-10",
  dateModified: currentDate,
  description:
    "번아웃 증후군 자가진단, 구체적인 극복 방법, 그리고 번아웃을 커리어 재평가의 기회로 삼는 법을 알려드립니다.",
};

export default function BurnoutSyndromeGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-gray-600 to-slate-800 dark:from-gray-900 dark:to-slate-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            혹시, 번아웃 증후군이신가요?
            <br /> 당신의 마음을 위한 가이드
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-200 dark:text-gray-300">
            '다 타서 재만 남은 것 같다...' 현대 직장인들의 고질병, 번아웃. 당신의 몸과 마음, 그리고 커리어를 지키는 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-slate-300 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              번아웃 증후군(Burnout Syndrome)은 단순히 '피곤하다'는 감정을 넘어, 일에 대한 열정과 에너지가 모두 소진된 상태를 의미합니다. 이는 우울증, 불안 장애 등 심각한 문제로 이어질 수 있기에, 조기에 증상을 인지하고 적극적으로 대처하는 것이 매우 중요합니다.
            </p>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-brand-red flex items-center gap-2">
                <Flame className="w-6 h-6" />
                혹시 나도 번아웃? (자가진단 체크리스트)
              </h2>
              <p className="!my-2 text-base">
                최근 2~3개월간 아래 증상 중 3개 이상 해당된다면 번아웃을 의심해볼 수 있습니다.
              </p>
              <ul className="!my-4 space-y-2 text-base list-none !p-0">
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-400"/><span>아침에 눈을 뜨면 출근할 생각에 절망감이 든다.</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-400"/><span>업무에 대한 성취감이 없고, 냉소적으로 변했다.</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-400"/><span>사소한 일에도 쉽게 짜증이 나고 감정 조절이 어렵다.</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-400"/><span>집중력이 떨어져 업무 실수가 잦아졌다.</span></li>
                <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-red-400"/><span>주말 내내 쉬어도 피로가 풀리지 않는다.</span></li>
              </ul>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <HeartCrack className="w-7 h-7 text-purple-500" />
                번아웃, 왜 찾아올까?
              </h2>
              <p>
                번아웃은 개인의 나약함 때문이 아닙니다. 과도한 업무량, 통제력 부족, 불공정한 보상, 가치관의 충돌 등 복합적인 환경 요인이 작용하여 발생합니다.
              </p>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> 지금 당장 실천할 수 있는 극복 방법
              </h2>
              <ul className="!my-2 space-y-3 text-base">
                <li><strong>업무 기법 바꾸기 (뽀모도로):</strong> '25분 집중, 5분 휴식'을 반복하여 뇌의 과부하를 막고 집중력을 유지하는 방법입니다. 짧은 휴식이 긴 번아웃을 막아줍니다.</li>
                <li><strong>마음 챙김 (명상 앱 활용):</strong> 하루 10분, 'Calm'이나 '코끼리' 같은 명상 앱을 통해 스트레스 반응을 조절하는 훈련을 해보세요.</li>
                <li><strong>디지털 디톡스:</strong> 퇴근 후, 주말만이라도 업무 관련 알림을 끄고 온전히 나에게 집중하는 시간을 가지세요.</li>
                <li><strong>작은 성취감 찾기:</strong> 거창한 목표 대신 '오늘 할 일 3가지 끝내기'처럼 작은 목표를 세우고 달성하며 성취감을 되찾으세요.</li>
              </ul>
            </section>

            <section className="mt-12 bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800">
              <h2 className="!mt-0 !text-2xl font-bold text-green-700 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> 번아웃, 내 몸값을 재평가할 기회?
              </h2>
              <p className="!my-2 text-base">
                혹시 당신의 번아웃이 '노력에 비해 정당한 보상을 받지 못한다'는 생각에서 비롯된 것은 아닐까요? 번아웃은 현재 나의 상황을 점검하고, 커리어를 한 단계 발전시킬 기회가 될 수 있습니다.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/guides/salary-negotiation" className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md">
                  <p className="font-bold !my-0">현재 회사에서 가치를 증명하고 싶다면?</p>
                  <p className="text-sm text-blue-600 !my-0">연봉 협상 가이드 →</p>
                </Link>
                <Link href="/guides/job-change-success-strategy-200-percent-use-of-headhunters" className="p-4 bg-white dark:bg-gray-800 rounded-lg text-center hover:shadow-md">
                  <p className="font-bold !my-0">새로운 환경이 필요하다면?</p>
                  <p className="text-sm text-blue-600 !my-0">이직 성공 전략 가이드 →</p>
                </Link>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <ShieldCheck className="w-7 h-7 text-indigo-500" />
                당신의 몸과 마음을 지키는 것이 최우선입니다
              </h2>
              <p className="mt-4">
                번아웃은 당신의 잘못이 아닙니다. 때로는 환경을 바꾸는 것이 가장 좋은 해결책일 수 있습니다. <br/>
                일과 삶의 균형을 찾을 수 있는 회사를 알아보는 것은 어떨까요?
              </p>
              <Link
                href="/guides/how-to-find-a-company-with-good-work-life-balance"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                워라밸 좋은 회사 찾는 법 가이드 보기 🧘‍♀️
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
