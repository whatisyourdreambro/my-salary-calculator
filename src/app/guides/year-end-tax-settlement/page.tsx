import type { Metadata } from "next";
import Link from "next/link";
import { Map, Key, PiggyBank } from "lucide-react"; // Treasure 제거

export const metadata: Metadata = {
  title: "연말정산 A to Z: 13월의 월급, 제대로 찾는 법 (2025년)",
  description:
    "세금 폭탄이 아닌 '13월의 보너스'를 위한 연말정산 완벽 가이드. 소득공제와 세액공제의 차이부터, 놓치기 쉬운 월세, 의료비, 기부금 공제 꿀팁까지 A to Z를 알려드립니다.",
  openGraph: {
    title: "연말정산 A to Z: 당신의 13월의 월급을 찾아드립니다",
    description:
      "복잡한 연말정산, 이 글 하나로 완벽하게 정복하고 최대 환급에 도전하세요.",
    images: [
      "/api/og?title=연말정산, 13월의 월급 찾아가세요&description=놓치기 쉬운 공제 항목 완벽 가이드",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연말정산 A to Z: 13월의 월급, 제대로 찾는 법 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-01",
  dateModified: "2025-09-20",
  description:
    "소득공제와 세액공제의 차이부터 놓치기 쉬운 월세, 의료비, 기부금 등 핵심 공제 항목까지, 연말정산의 모든 것을 알려드립니다.",
};

export default function YearEndTaxSettlementPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-gray-900 dark:to-purple-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            13월의 월급 찾아 떠나는
            <br /> 연말정산 보물찾기
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            매년 돌아오는 연말정산, 더 이상 &apos;세금 폭탄&apos; 걱정은 그만!
            당신이 1년 동안 낸 세금 속에 숨겨진 환급금을 찾는 여정, 저희가
            함께하겠습니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연말정산은 단순히 세금을 더 내거나 돌려받는 행정 절차가 아닙니다.
              1년 동안의 내 소비와 삶을 돌아보고, 국가로부터 정당한 세금 혜택을
              돌려받는 현명한 재테크의 과정입니다. 이 글에서는 연말정산의 핵심
              개념부터, 대부분이 놓치는 숨은 공제 항목까지, 당신의 지갑을
              두둑하게 만들어 줄 모든 비법을 공개합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Map className="w-7 h-7 text-purple-500" />
                보물찾기 지도: 소득공제 vs 세액공제
              </h2>
              <p>
                연말정산의 두 가지 핵심 보물 지도, &apos;소득공제&apos;와
                &apos;세액공제&apos;의 차이만 알아도 절반은 성공입니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="font-bold !mt-0 !text-lg">
                    소득공제: 세금 매기는 밭 자체를 줄인다!
                  </h3>
                  <p className="!text-sm !my-0 mt-2">
                    세금을 부과할 대상 소득(과세표준) 자체를 줄여주는
                    방식입니다. <strong>연봉이 높을수록</strong> 적용되는 세율이
                    높아지기 때문에, 같은 금액을 공제받아도 절세 효과가 더
                    커집니다. (예: 신용카드 사용액, 주택청약저축)
                  </p>
                </div>
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <h3 className="font-bold !mt-0 !text-lg">
                    세액공제: 나온 세금에서 직접 깎아준다!
                  </h3>
                  <p className="!text-sm !my-0 mt-2">
                    이미 계산된 세금 자체를 직접 깎아주는 가장 강력한
                    혜택입니다. <strong>소득 수준과 관계없이</strong> 공제액이
                    일정하여, 저연봉자에게 더 유리할 수 있습니다. (예: 월세액,
                    의료비, 교육비, 연금계좌)
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Key className="w-7 h-7 text-amber-500" />
                보물상자 여는 황금열쇠: 놓치기 쉬운 핵심 공제 3가지
              </h2>
              <p>
                국세청 홈택스 간소화 서비스가 대부분의 정보를 자동으로
                불러오지만, 아래 항목들은 내가 직접 챙기지 않으면 영원히 잠들어
                버리는 숨겨진 보물들입니다.
              </p>
              <div className="mt-6 space-y-4">
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    1. 월세 세액공제: 1년치 월세 돌려받기
                  </h3>
                  <p className="!my-0 !text-base">
                    총급여 7,000만 원 이하의 무주택 세대주라면, 연간 750만원
                    한도 내에서 지불한 월세의 <strong>최대 17%</strong>까지
                    돌려받을 수 있습니다. 임대차계약서와 월세 이체 내역만 있다면
                    신청 가능하니 절대 놓치지 마세요!
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    2. 안경·콘택트렌즈 구입비: 시력 교정도 의료비!
                  </h3>
                  <p className="!my-0 !text-base">
                    안경점에서 구매한 안경과 콘택트렌즈 비용도 1인당 연
                    50만원까지 의료비 세액공제 대상입니다. 간소화 자료에
                    조회되지 않는 경우가 많으니, 구매 시 꼭{" "}
                    <strong>&apos;연말정산 소득공제용&apos;</strong> 영수증을
                    챙겨두세요.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                  <h3 className="font-bold !mt-0 !text-lg">
                    3. 중·고등학생 교복 구입비: 학부모 필수 체크
                  </h3>
                  <p className="!my-0 !text-base">
                    자녀의 교복 구입비 역시 1인당 연 50만원까지 교육비
                    세액공제를 받을 수 있습니다. 대부분 간소화 자료에서 조회가
                    안 되므로, 교복점에서 교육비 납입증명서를 발급받아 회사에
                    제출해야 합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold flex items-center gap-3 justify-center">
                <PiggyBank className="w-7 h-7 text-signature-blue" />
                당신의 13월의 월급, 얼마나 될까요?
              </h2>
              <p>
                연말정산은 아는 만큼 보입니다. 당신의 소비 습관과 가족 구성에
                따라 환급액은 천차만별로 달라질 수 있습니다. Moneysalary
                연말정산 계산기로 당신의 숨은 보물이 얼마나 될지 미리
                확인해보세요.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 예상 환급금 계산하러 가기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
