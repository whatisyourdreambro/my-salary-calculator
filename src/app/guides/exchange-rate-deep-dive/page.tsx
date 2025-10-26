import type { Metadata } from "next";
import Link from "next/link";
import { Globe, TrendingUp, BrainCircuit, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "환율의 대서사시: 당신의 부를 결정하는 보이지 않는 전쟁",
  description:
    "금리의 속삭임, 무역의 파도, 지정학적 폭풍 속에서 환율은 어떻게 춤추는가? 환율이 당신의 해외여행, 직구, 미국 주식 투자의 수익률을 결정하는 원리를 파헤치고, 환테크의 비밀과 미래 화폐 전쟁까지 조망하는 가장 깊이 있는 안내서.",
  openGraph: {
    title: "환율의 대서사시: 당신의 부를 결정하는 보이지 않는 전쟁",
    description:
      "금리의 속삭임, 무역의 파도, 지정학적 폭풍. 환율이 춤추는 이유와 당신의 자산에 미치는 영향을 완벽하게 분석합니다.",
    images: [
      "/api/og?title=환율의 대서사시&description=당신의 부를 결정하는 보이지 않는 전쟁",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "환율의 대서사시: 당신의 부를 결정하는 보이지 않는 전쟁",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-10-08",
  dateModified: "2025-10-08",
  description:
    "금리의 속삭임, 무역의 파도, 지정학적 폭풍 속에서 환율은 어떻게 춤추는가? 환율이 당신의 해외여행, 직구, 미국 주식 투자의 수익률을 결정하는 원리를 파헤치고, 환테크의 비밀과 미래 화폐 전쟁까지 조망합니다.",
};

export default function ExchangeRateDeepDivePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            환율의 대서사시
            <br />{" "}
            <span className="text-blue-300">보이지 않는 전쟁, 부의 이동</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            뉴스 속 삭막한 숫자가 아닌, 당신의 자산을 움직이는 거대한 파도.
            금리의 속삭임과 지정학적 폭풍 속에서 춤추는 환율의 모든 것을 파헤쳐,
            부의 흐름을 읽는 눈을 뜨게 해드립니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              우리는 매일 환율이라는 보이지 않는 전쟁터 속에서 살아갑니다.
              당신이 마시는 스타벅스 커피의 원두 가격, 새로 산 아이폰의 부품값,
              그리고 미국 주식 계좌의 수익률까지, 모든 것은 환율이라는 거대한
              손에 의해 좌우됩니다. 이 전쟁의 법칙을 이해하는 자만이 부의 흐름을
              읽고, 자신의 자산을 지킬 수 있습니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Globe className="w-7 h-7 text-signature-blue" />
                환율, 그 본질을 향한 첫걸음
              </h2>
              <p>
                환율은 단순히 &apos;돈의 교환 비율&apos;이 아닙니다. 그것은 한
                나라의 경제적 체력, 즉{" "}
                <strong>&apos;경제 펀더멘털&apos;</strong>을 비추는 거울이자,
                글로벌 자본이 매기는 냉정한 &apos;성적표&apos;입니다. 환율이
                1,300원에서 1,400원으로 올랐다는 것은, 단순히 1달러를 사는 데
                100원이 더 필요해졌다는 의미를 넘어, 국제 시장에서 대한민국
                &apos;원화&apos;의 구매력이 그만큼 떨어졌음을 의미합니다.
              </p>
              <blockquote>
                <p>
                  <strong>환율 상승 (원화 가치 하락):</strong> 수출 기업은 웃고,
                  수입 기업과 해외 여행객은 웁니다. 당신의 미국 주식 계좌는
                  &apos;환차익&apos;이라는 보너스를 얻게 됩니다.
                  <br />
                  <strong>환율 하락 (원화 가치 상승):</strong> 해외 직구가
                  즐거워지고, 수입 물가가 안정됩니다. 하지만 수출 기업들은 가격
                  경쟁력에 비상이 걸립니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-red-500" />
                환율을 움직이는 3가지 거대한 힘
              </h2>
              <p>
                변덕스러워 보이는 환율의 움직임 뒤에는 거대한 경제 원리가 숨어
                있습니다.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ① 금리의 속삭임: 돈은 높은 곳으로 흐른다
                  </h3>
                  <p className="!my-0 !text-base">
                    가장 강력한 변수입니다. 만약 미국 금리가 한국보다 높다면, 전
                    세계 투자자들은 더 높은 이자를 주는 달러 자산을 사기 위해
                    원화를 팔고 달러를 사들일 것입니다. 이는 달러의 가치를
                    높이고 원화의 가치를 떨어뜨려, 결국 환율 상승으로
                    이어집니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ② 무역의 파도: 경상수지 흑자와 적자
                  </h3>
                  <p className="!my-0 !text-base">
                    한국이 반도체를 많이 팔아 벌어들인 달러(수출)가, 원유를 사는
                    데 쓴 달러(수입)보다 많다면(경상수지 흑자), 국내에 달러
                    공급이 늘어나 달러 가치가 하락하고 환율은 안정됩니다. 반대의
                    경우(적자)는 환율 상승의 요인이 됩니다.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h3 className="font-bold !mt-0 !mb-1 text-lg">
                    ③ 지정학적 폭풍: 안전자산 선호 심리
                  </h3>
                  <p className="!my-0 !text-base">
                    전쟁, 팬데믹, 금융 위기 등 전 세계적인 불안감이 커지면,
                    투자자들은 신흥국 통화(원화 등)를 팔고 가장 안전한 자산으로
                    여겨지는 &apos;미국 달러&apos;를 사들입니다. 이는 한국
                    경제와 상관없이 달러 가치를 끌어올려 환율을 급등시키는
                    요인이 됩니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-green-500" />
                투자자의 딜레마: 환차익 vs 환헤지
              </h2>
              <p>
                미국 주식에 투자하는 당신에게 환율은 양날의 검입니다. 환율이
                오르면 가만히 있어도 내 자산 가치가 늘어나는
                &apos;환차익&apos;을 얻지만, 환율이 떨어지면 주가가 올라도 전체
                수익률이 깎이는 &apos;환차손&apos;을 입을 수 있습니다.
              </p>
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold !mt-0 !text-xl">
                  환헤지(Hedge), 꼭 해야 할까?
                </h3>
                <p className="!my-2 !text-base">
                  환헤지는 환율 변동의 위험을 피하기 위해 추가 비용을 내고
                  환율을 고정하는 보험과 같습니다. 단기 투자자에게는 유용할 수
                  있지만, 장기 투자자에게는 오히려 &apos;독&apos;이 될 수
                  있습니다. 역사적으로 달러는 위기 때마다 가치가 오르는
                  안전자산의 역할을 해왔습니다. 주가가 폭락하는 위기 상황에서,
                  환율 상승(환차익)이 내 자산의 하락을 방어해주는 훌륭한
                  &apos;자동 보험&apos; 역할을 하기 때문입니다.
                </p>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <BrainCircuit className="w-7 h-7 text-signature-blue" />
                미래를 읽는 자, 부를 지배한다
              </h2>
              <p>
                환율은 단순한 숫자를 넘어, 세계 경제의 흐름과 힘의 이동을
                보여주는 가장 정직한 지표입니다. 환율의 언어를 이해하는 것은,
                다가올 경제의 겨울과 여름을 미리 알고 대비하는 것과 같습니다.
                당신의 경제적 시야를 넓히는 첫걸음, 바로 환율에서 시작됩니다.
              </p>
              <Link
                href="/glossary"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                더 많은 금융 용어 알아보기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
