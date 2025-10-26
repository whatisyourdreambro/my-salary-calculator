import type { Metadata } from "next";
import Link from "next/link";
import { PiggyBank, Rocket, Shield } from "lucide-react"; // Coffee 제거

export const metadata: Metadata = {
  title: "첫 월급 100만원 재테크: 부자되는 첫걸음, 이렇게 시작하세요",
  description:
    "사회초년생 필독! 설레는 첫 월급, 어떻게 관리해야 할까요? 100만원으로 시작하는 가장 현실적인 재테크 로드맵. 연금저축펀드, S&P 500 ETF 등 당신의 미래를 바꿀 첫 단추를 채워드립니다.",
  openGraph: {
    title: "첫 월급 100만원 재테크: 부자되는 첫걸음, 이렇게 시작하세요",
    description:
      "사회초년생 필독! 당신의 미래를 바꿀 첫 월급 재테크 로드맵을 공개합니다.",
    images: [
      "/api/og?title=첫 월급 100만원으로 부자되기&description=사회초년생을 위한 현실 재테크 로드맵",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "첫 월급 100만원 재테크: 부자되는 첫걸음, 이렇게 시작하세요",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-22",
  dateModified: "2025-09-22",
  description:
    "사회초년생을 위한 첫 월급 재테크 완벽 가이드. 100만원 시드머니로 시작하는 연금저축펀드, S&P 500 ETF 등 가장 현실적인 투자 방법을 소개합니다.",
};

export default function FirstJobInvestmentPage() {
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
        <div className="w-full bg-gradient-to-br from-green-500 to-emerald-600 dark:from-gray-900 dark:to-green-800 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            내 첫 월급,
            <br />{" "}
            <span className="text-emerald-300">미래를 위한 씨앗 심기</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-emerald-100 dark:text-gray-300">
            설레는 첫 월급, 어떻게 관리해야 할지 막막한가요? 월 100만원, 아니
            10만원의 소액으로도 시작할 수 있는, 사회초년생을 위한 가장 현실적인
            투자 파이프라인 구축법을 소개합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              인생 첫 월급 통장을 받아든 당신, 축하합니다! 당신은 이제 노동
              소득을 자본 소득으로 바꿀 수 있는 인생의 가장 중요한 출발선에
              섰습니다. 첫 단추를 어떻게 채우느냐에 따라 10년, 20년 뒤 당신의
              경제적 위치는 완전히 달라질 것입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <PiggyBank className="w-7 h-7 text-pink-500" />
                Step 1: 목표 설정과 &apos;선저축 후지출&apos;
              </h2>
              <p>
                재테크의 시작은 거창한 투자 공부가 아닙니다.{" "}
                <strong>&apos;나는 이 돈을 왜 모으는가?&apos;</strong>에 대한
                답을 찾는 것부터 시작해야 합니다. &apos;3년 안에 1억
                모으기&apos;, &apos;5년 안에 내 집 계약금 만들기&apos; 등
                구체적인 목표를 세우고, 고정 지출을 제외한 월 저축 가능 금액을
                파악하여 <strong>월급날 바로 자동이체</strong>되는 강제 저축
                시스템을 만드세요. 남는 돈을 저축하는 것이 아니라, 저축하고 남는
                돈으로 생활하는 습관이 부의 첫걸음입니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-500" />
                Step 2: 최고의 방패, 연금저축펀드부터
              </h2>
              <p>
                사회초년생이 가장 먼저 만들어야 할 금융 상품은 단연{" "}
                <strong>연금저축펀드</strong>입니다. 왜냐하면 국가가 보장하는
                &apos;세액공제&apos;라는 강력한 방패를 제공하기 때문입니다.
              </p>
              <blockquote>
                <p>
                  연 600만원(월 50만원)까지 납입하면 연말정산 시{" "}
                  <strong>최대 99만원</strong>(총급여 5,500만원 이하, 16.5%
                  공제)을 현금으로 돌려받습니다. 아직 투자가 무섭다면, 이 계좌에
                  돈을 넣고 아무것도 하지 않아도 연 16.5%의 확정 수익을 얻는
                  것과 같습니다. 이보다 더 좋은 투자는 없습니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Rocket className="w-7 h-7 text-green-500" />
                Step 3: 첫 투자, S&P 500 ETF로 시작하기
              </h2>
              <p>
                연금저축펀드 계좌를 만들었다면, 이제 그 안에서 무엇을 살지
                결정해야 합니다. 사회초년생의 첫 투자로는 전 세계 최고의 기업
                500개에 자동으로 분산 투자하는{" "}
                <strong>미국 S&P 500 추종 ETF</strong>를 강력하게 추천합니다.
              </p>
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold !mt-0 !text-xl">
                  사회초년생에게 S&P 500이 완벽한 이유
                </h3>
                <ul className="!my-2 !text-base">
                  <li>
                    <strong>시간이 당신의 편:</strong> 20~30대의 가장 큰 무기는
                    &apos;시간&apos;입니다. 단기적인 등락에 흔들리지 않고 10년,
                    20년 꾸준히 적립식으로 투자한다면, 복리의 마법을 통해 자산이
                    눈덩이처럼 불어나는 것을 경험하게 될 것입니다.
                  </li>
                  <li>
                    <strong>공부할 필요 없는 투자:</strong> 개별 기업을 분석할
                    필요 없이 미국 시장 전체의 성장에 투자하는 가장 쉽고 검증된
                    방법입니다.
                  </li>
                </ul>
              </div>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                당신의 첫 월급이 미래의 당신을 만듭니다
              </h2>
              <p>
                오늘 마시는 커피 한 잔을 아껴 투자한 5,000원이, 30년 뒤에는
                당신의 노후를 책임질 50만원이 될 수 있습니다. 지금 바로 당신의
                미래를 위한 첫 씨앗을 심어보세요.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                나의 은퇴 나이 계산해보기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
