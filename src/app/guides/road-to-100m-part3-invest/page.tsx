import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Shield, Repeat, BrainCircuit } from "lucide-react";

export const metadata: Metadata = {
  title: "월급으로 만드는 투자 파이프라인: 돈이 스스로 일하게 하라 (2025년)",
  description:
    "Road to 1억 최종장. 당신의 월급을 잠에서 깨워 일하게 만드는 법. 직장인을 위한 가장 현실적인 투자처 S&P 500 ETF와 연금저축펀드를 활용한 자동 자산 증식 시스템 구축법을 공개합니다.",
  openGraph: {
    title: "월급으로 만드는 투자 파이프라인: 돈이 스스로 일하게 하라",
    description:
      "절세와 N잡으로 만든 시드머니, 이제 투자를 통해 눈덩이처럼 불려나갈 시간입니다. Road to 1억 최종 가이드.",
    images: [
      "/api/og?title=당신의 돈이 스스로 일하게 만드는 법&description=Road to 1억 최종장: 투자 파이프라인 구축",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "월급으로 만드는 투자 파이프라인: 돈이 스스로 일하게 하라 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-16",
  dateModified: "2025-09-20",
  description:
    "직장인을 위한 가장 현실적인 투자처 S&P 500 ETF와 연금저축펀드를 활용한 자동 자산 증식 시스템 구축법을 공개합니다.",
};

export default function RoadTo100mInvestPage() {
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
        <div className="w-full bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-gray-900 dark:to-violet-800 text-white text-center py-20 sm:py-28 px-4">
          <p className="text-lg font-semibold text-indigo-200">
            Road to 1억 시리즈 (최종편)
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            돈이 스스로 일하게 하라
            <br /> <span className="text-violet-300">투자 파이프라인 구축</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            절세로 돈을 지키고, N잡으로 시드머니를 마련했다면, 이제 부의
            추월차선에 올라탈 시간입니다. 당신이 잠자는 동안에도 자산이 불어나는
            자동화 시스템, 그 설계도를 공개합니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              열심히 일해서 번 돈, 통장에 그대로 잠들어 있지는 않나요?
              인플레이션 시대에 저축만으로는 자산을 불리기 어렵습니다.{" "}
              <strong>연봉 1억</strong>이라는 목표를 향한 마지막 퍼즐, 그리고
              경제적 자유를 향한 유일한 길은 바로{" "}
              <strong>&apos;투자&apos;</strong>입니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-violet-500" />
                가장 먼저 해야 할 투자: 당신의 뇌
              </h2>
              <p>
                투자를 시작하기 전, 가장 먼저 바꿔야 할 것은 바로 &apos;노동
                소득&apos;에만 의존하는 생각의 프레임입니다. 투자는 단순히 돈을
                버는 기술이 아니라, 자본주의 시스템을 이해하고 돈이 움직이는
                원리를 깨닫는 철학에 가깝습니다. 워런 버핏이 말했듯,
                &quot;잠자는 동안에도 돈이 들어오는 방법을 찾아내지 못한다면
                당신은 죽을 때까지 일을 해야만 할 것이다.&quot; 투자는 바로 그
                방법을 찾는 여정의 시작입니다.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Rocket className="w-7 h-7 text-green-500" />
                직장인 최고의 투자처: 미국 S&P 500 ETF
              </h2>
              <p>
                개별 주식 종목을 분석하고 시장의 타이밍을 맞추는 것은 전업
                투자자에게도 어려운 일입니다. 시간이 부족한 직장인에게 가장
                현실적이고 강력한 투자처는 바로 지수를 추종하는{" "}
                <strong>인덱스 펀드 ETF</strong>입니다.
              </p>
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                <h3 className="font-bold !mt-0 !text-xl">
                  왜 미국 S&P 500인가?
                </h3>
                <ul className="!my-2 !text-base">
                  <li>
                    <strong>최고의 분산투자:</strong> 애플, 마이크로소프트, 구글
                    등 미국을 대표하는 500개 혁신 기업에 자동으로 분산 투자하여
                    개별 기업의 리스크를 최소화합니다.
                  </li>
                  <li>
                    <strong>검증된 우상향:</strong> 지난 수십 년간 수많은 경제
                    위기 속에서도 연평균 10% 내외의 놀라운 복리 수익률을
                    기록하며 장기적으로 우상향해왔습니다.
                  </li>
                  <li>
                    <strong>저렴한 수수료:</strong> 펀드매니저가 적극적으로
                    운용하는 액티브 펀드와 달리, 지수를 그대로 따라가기 때문에
                    운용 보수가 매우 저렴합니다.
                  </li>
                </ul>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-500" />
                최강의 조합: S&P 500 + 연금저축펀드/IRP
              </h2>
              <p>
                최고의 투자처를 찾았다면, 이제 가장 유리한 방법으로 투자해야
                합니다. S&P 500 ETF를 <strong>연금저축펀드</strong>나{" "}
                <strong>IRP(개인형 퇴직연금)</strong> 계좌를 통해 매수하면, 두
                마리 토끼를 모두 잡을 수 있습니다.
              </p>
              <blockquote>
                <p>
                  연간 최대 900만원까지 납입하며 S&P 500 ETF를 매수하면,
                  연말정산 시 <strong>최대 148.5만원을 확정적으로 환급</strong>
                  받는 동시에, 장기적으로는 미국 시장의 성장에 따른{" "}
                  <strong>자본 수익</strong>까지 기대할 수 있습니다. 이는
                  현존하는 가장 강력한 절세 및 투자 조합입니다.
                </p>
              </blockquote>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Repeat className="w-7 h-7 text-amber-500" />
                성공의 유일한 열쇠: 꾸준함
              </h2>
              <p>
                시장의 등락에 일희일비하지 않고, 매달 월급날 일정한 금액을
                꾸준히 투자하는 <strong>적립식 투자(코스트 에버리징)</strong>는
                직장인에게 가장 적합한 전략입니다. 주가가 낮을 때는 더 많은
                수량을, 높을 때는 더 적은 수량을 매수하게 되어 평균 매수 단가를
                낮추고 장기적인 변동성 위험을 줄여줍니다.
              </p>
            </section>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                Road to 1억, 여정의 끝 그리고 새로운 시작
              </h2>
              <p>
                절세로 기초를 다지고, N잡으로 현금 흐름을 늘리고, 투자로 자산을
                증식시키는 이 세 가지 기둥이 바로 당신을 경제적 자유로 이끌
                단단한 파이프라인입니다. 이 시리즈는 여기서 마무리되지만, 당신의
                진짜 여정은 지금부터 시작입니다.
              </p>
              <Link
                href="/fire-calculator"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                내 은퇴 나이 계산해보기 🔥
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
