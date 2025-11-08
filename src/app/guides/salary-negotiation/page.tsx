import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Target, MessageSquare, TrendingUp, Shield, Smile, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 협상 잘하는 법: 원하는 연봉을 얻어내는 실전 전략 (2025년)",
  description:
    "연봉 협상, 더 이상 두렵지 않습니다. 시장 가치 파악, 성과 증명, 논리적인 화술, 그리고 회사의 거절에 대처하는 법까지. 당신의 몸값을 높이는 연봉 협상의 모든 기술을 알려드립니다.",
  openGraph: {
    title: "연봉 협상 잘하는 법: 원하는 연봉을 얻어내는 실전 전략 (2025년)",
    description:
      "당신의 가치를 제대로 인정받는 시간, 연봉 협상. 성공적인 협상을 위한 모든 것을 준비하세요.",
    images: ["/api/og?title=연봉 협상, 당신의 몸값을 높여라"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 협상 잘하는 법: 원하는 연봉을 얻어내는 실전 전략 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-04-20",
  dateModified: currentDate,
  description:
    "시장 가치 파악부터 원하는 연봉 제시, 그리고 거절에 대처하는 법까지. 당신의 몸값을 높이는 연봉 협상의 모든 기술을 알려드립니다.",
};

export default function SalaryNegotiationGuidePage() {
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
            연봉 협상,
            <br /> 당신의 몸값을 높여라
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            1년의 노력을 보상받고, 새로운 시작의 가치를 인정받는 시간, 연봉 협상. 더 이상 회사에서 '주는 대로' 받지 마세요. 당신의 가치를 스스로 증명하고 쟁취하는 방법을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연봉 협상은 단순히 돈을 더 달라고 조르는 과정이 아닙니다. 지난 1년간 내가 회사에 기여한 바를 객관적인 데이터로 증명하고, 나의 시장 가치에 맞는 합당한 대우를 요구하는 '논리적인 설득' 과정입니다. 철저한 준비만이 당신을 협상의 승자로 이끌 것입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Rocket className="w-7 h-7 text-purple-500" />
                성공적인 연봉 협상을 위한 4단계
              </h2>
              <div className="mt-6 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">1</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">정보 수집: 나의 시장 가치를 파악하라</h3>
                    <p className="!text-sm !my-0">
                      채용 사이트(원티드, 리멤버)의 연봉 정보, 업계 현직자 커뮤니티(블라인드)를 통해 비슷한 연차와 직무의 평균 연봉을 파악하세요. 이것이 당신의 협상 기준점이 됩니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">2</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">성과 정리: 숫자로 증명하라</h3>
                    <p className="!text-sm !my-0">
                      '열심히 일했다'는 말은 힘이 없습니다. '어떤 프로젝트로 매출을 몇 % 상승시켰다', '업무 프로세스 개선으로 비용을 얼마 절감했다' 와 같이 성과를 구체적인 숫자로 정리하세요.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">3</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">목표 설정: 희망 연봉과 마지노선을 정하라</h3>
                    <p className="!text-sm !my-0">
                      조사한 시장 가치와 성과를 바탕으로 희망 연봉(이상적인 금액)과 마지노선(최소한 받아야 하는 금액)을 명확히 정하세요. 감정적인 대응을 피하고 유연하게 대처할 수 있습니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center text-purple-600 font-bold text-xl">4</div>
                  <div>
                    <h3 className="font-bold !mt-0 !mb-1">논리적인 소통: 근거를 제시하라</h3>
                    <p className="!text-sm !my-0">
                      '동기는 더 받는다던데' 같은 감정적인 비교는 최악입니다. 준비한 자료를 바탕으로 '저는 회사에 이렇게 기여했고, 저의 시장 가치는 이 정도이니, 이 정도의 보상을 기대합니다' 라고 자신감 있게 이야기하세요.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <blockquote className="!border-l-purple-500 mt-12">
                <p className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5"/> 협상 테이블에서의 전문가 Tip</p>
                <ul className="!my-2 space-y-2 text-base">
                    <li><strong>먼저 액수를 말하지 마라:</strong> 회사 측의 제안을 먼저 들어보고 협상을 시작하는 것이 유리합니다.</li>
                    <li><strong>침묵을 활용하라:</strong> 원하는 금액과 근거를 제시한 후에는, 불안해하며 말을 덧붙이지 말고 차분히 상대의 답변을 기다리세요. 침묵이 당신의 자신감을 보여줍니다.</li>
                    <li><strong>긍정적인 태도를 유지하라:</strong> 협상은 싸움이 아닙니다. '회사와 함께 성장하고 싶다'는 긍정적인 태도를 유지하며, 당신의 가치를 인정해달라고 정중히 요구하세요.</li>
                </ul>
            </blockquote>

            <section className="mt-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800">
              <h2 className="!mt-0 !text-2xl font-bold text-red-700 flex items-center gap-2">
                <Shield className="w-6 h-6" /> 회사의 '거절'에 대처하는 법
              </h2>
              <ul className="!my-4 space-y-2 text-base">
                <li><strong>"회사 예산이 부족합니다":</strong> "이해합니다. 그렇다면 혹시 연봉 외에 스톡옵션, 성과급, 복지포인트, 추가 유급휴가 등 다른 보상 방안도 논의가 가능할까요?" 라며 대안을 제시하세요.</li>
                <li><strong>"내부 규정상 어렵습니다":</strong> "그렇군요. 그렇다면 다음 평가 시점에 제가 원하는 수준의 보상을 받기 위해 어떤 목표를 달성해야 할지 구체적으로 알려주실 수 있을까요?" 라며 다음을 기약하세요.</li>
                <li><strong>"일단 동결 후, 나중에 인상":</strong> "알겠습니다. 논의된 내용을 잊지 않도록, 간단하게 메일로 정리해서 보내드려도 괜찮을까요?" 라며 내용을 기록으로 남기세요.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                연봉 인상 후, 내 통장엔 얼마가 더 찍힐까?
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                연봉 1,000만원 인상과 500만원 인상의 실수령액 차이는 생각보다 큽니다. '연봉 계산기'로 협상 전후의 월급을 비교하고, 당신의 노력이 가져온 실질적인 변화를 체감해보세요.
              </p>
              <Link
                href="/salary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                인상 전후 실수령액 비교하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}