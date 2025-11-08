import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, PenTool, ShoppingCart, Brain, Code, DollarSign, Calculator } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "연봉 1억 로드맵 2편: 현실적인 직장인 부업 BEST 5",
  description:
    "월급만으론 부족하다! 당신의 전문성과 시간을 활용해 월 100만원의 추가 소득을 만드는 현실적인 직장인 부업 5가지를 소개합니다. N잡러를 위한 세금 신고 팁까지 확인하세요.",
  openGraph: {
    title: "연봉 1억 로드맵 2편: 현실적인 직장인 부업 BEST 5",
    description:
      "퇴근 후 2시간, 당신의 몸값을 높이는 시간. 월 100만원을 더 버는 직장인 부업의 모든 것을 알려드립니다.",
    images: ["/api/og?title=직장인 부업으로 월 100만원 더 벌기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "연봉 1억 로드맵 2편: 현실적인 직장인 부업 BEST 5",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-03-10",
  dateModified: currentDate,
  description:
    "당신의 전문성과 시간을 활용해 월 100만원의 추가 소득을 만드는 현실적인 직장인 부업 5가지를 소개하고, N잡러를 위한 세금 신고 팁까지 알려드립니다.",
};

export default function RoadTo100MPart2SidejobGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-500 to-sky-500 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            연봉 1억 로드맵 ②
            <br /> 부업으로 월 100만원 더 벌기
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-sky-100 dark:text-gray-300">
            치솟는 물가, 제자리인 월급. 이제 부업은 선택이 아닌 필수입니다. 당신의 퇴근 후 2시간을 월 100만원의 추가 소득으로 바꾸는 현실적인 부업 가이드를 제시합니다.
          </p>
          <p className="mt-4 text-xs text-sky-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              연봉 1억을 향한 여정, 절세만으로는 부족합니다. 소득의 파이프라인 자체를 늘려야 합니다. 중요한 것은 '나의 강점'을 활용하여 '지속 가능한' 부업을 찾는 것입니다. '하루 30분, 월 500 보장' 같은 허황된 광고가 아닌, 진짜 현실적인 부업 5가지를 소개합니다.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-green-500" />
                직장인 현실 부업 BEST 5
              </h2>
              <div className="mt-6 space-y-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><Brain className="w-6 h-6 text-purple-500" /> 1. 지식/경험 판매</h3>
                  <p className="!text-sm !my-2">당신의 직무 전문성(마케팅, 개발)이나 취미(투자, 글쓰기)를 강의, 컨설팅, 전자책으로 만들어 판매합니다.</p>
                  <div className="text-xs flex gap-4">
                    <div><strong>장점:</strong><span className="ml-1">높은 마진, 자동 수익화 가능</span></div>
                    <div><strong>단점:</strong><span className="ml-1">초기 콘텐츠 제작 부담</span></div>
                    <div><strong>플랫폼:</strong><span className="ml-1">크몽, 탈잉, 클래스101</span></div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><PenTool className="w-6 h-6 text-blue-500" /> 2. 콘텐츠 제작</h3>
                  <p className="!text-sm !my-2">블로그, 유튜브, 인스타그램 등 플랫폼에 꾸준히 콘텐츠를 쌓아 팬을 모으고 광고, 협찬 등으로 수익을 창출합니다.</p>
                   <div className="text-xs flex gap-4">
                    <div><strong>장점:</strong><span className="ml-1">낮은 초기 비용, 퍼스널 브랜딩</span></div>
                    <div><strong>단점:</strong><span className="ml-1">수익화까지 시간 소요</span></div>
                    <div><strong>플랫폼:</strong><span className="ml-1">유튜브, 인스타그램, 티스토리</span></div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><Code className="w-6 h-6 text-rose-500" /> 3. 외주/프로젝트</h3>
                  <p className="!text-sm !my-2">디자인, 개발, 번역 등 본인의 직무 능력을 활용해 건당으로 프로젝트를 수주하여 즉각적인 수익을 만듭니다.</p>
                   <div className="text-xs flex gap-4">
                    <div><strong>장점:</strong><span className="ml-1">즉각적인 수익, 경력 관리</span></div>
                    <div><strong>단점:</strong><span className="ml-1">시간 관리의 어려움</span></div>
                    <div><strong>플랫폼:</strong><span className="ml-1">크몽, 위시켓, 숨고</span></div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-cyan-500" /> 4. 온라인 쇼핑몰</h3>
                  <p className="!text-sm !my-2">특정 아이템을 사입하거나, 재고 없이 판매하는 위탁판매 방식으로 나만의 온라인 스토어를 운영합니다.</p>
                   <div className="text-xs flex gap-4">
                    <div><strong>장점:</strong><span className="ml-1">낮은 진입 장벽(위탁판매)</span></div>
                    <div><strong>단점:</strong><span className="ml-1">높은 경쟁, CS 부담</span></div>
                    <div><strong>플랫폼:</strong><span className="ml-1">네이버 스마트스토어, 쿠팡</span></div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                  <h3 className="font-bold !mt-0 !mb-2 flex items-center gap-2"><DollarSign className="w-6 h-6 text-amber-500" /> 5. 앱/웹 서비스 개발</h3>
                  <p className="!text-sm !my-2">개발자라면 자신의 아이디어를 바탕으로 간단한 유료 앱이나 구독형 웹 서비스를 만들어 패시브 인컴을 구축합니다.</p>
                   <div className="text-xs flex gap-4">
                    <div><strong>장점:</strong><span className="ml-1">높은 수익 잠재력, 자동화</span></div>
                    <div><strong>단점:</strong><span className="ml-1">높은 기술 요구, 유지보수</span></div>
                    <div><strong>플랫폼:</strong><span className="ml-1">앱스토어, 플레이스토어, 웹</span></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-8 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <DollarSign className="w-6 h-6" /> N잡러 필독! 부업 소득 세금 신고
              </h2>
              <p className="!my-2 text-base">
                부업으로 발생한 소득도 반드시 세금 신고를 해야 합니다. 보통 사업소득(3.3% 원천징수) 또는 기타소득으로 분류되며, 다음 해 5월 <strong>종합소득세 신고</strong> 기간에 본업 소득과 합산하여 신고해야 합니다. 놓치면 가산세 폭탄을 맞을 수 있으니 주의하세요!
              </p>
              <Link href="/guides/comprehensive-income-tax-filing-complete-guide-for-n-jobbers" className="text-sm font-bold text-yellow-800 dark:text-yellow-300 hover:underline mt-2 inline-block">N잡러 종합소득세 신고 가이드 바로가기 →</Link>
            </section>

            <section className="mt-12 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">프리랜서, 내 몸값은 얼마일까?</h2>
              <p className="mt-4 max-w-xl mx-auto">
                부업을 시작할 때 가장 어려운 점 중 하나는 바로 가격 책정입니다. 내 기술과 시간에 맞는 적정 시급과 월급을 '프리랜서 계산기'로 미리 가늠해보세요.
              </p>
              <Link
                href="/freelancer-calculator"
                className="inline-block mt-6 py-3 px-6 bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-lg text-center font-bold text-md hover:bg-gray-900 dark:hover:bg-white transition-transform transform hover:scale-105 shadow-lg"
              >
                <Calculator className="inline-block w-5 h-5 mr-2" />
                프리랜서 예상 수입 계산하기
              </Link>
            </section>

            <section className="mt-12 text-center">
              <h2 className="!text-2xl font-bold">
                부업으로 번 돈, 어떻게 굴려야 할까?
              </h2>
              <p>
                부업으로 만든 소중한 시드머니, 그냥 두면 인플레이션에 녹아내립니다. <br />
                다음 편에서는 이 돈을 눈덩이처럼 불려줄 투자의 기본 원칙에 대해 알아봅니다.
              </p>
              <Link
                href="/guides/road-to-100m-part3-invest"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                3편: 부업으로 번 돈, 투자로 불리기 📈
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}