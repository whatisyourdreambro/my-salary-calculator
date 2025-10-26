import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Car, Shield, Coins } from "lucide-react";

export const metadata: Metadata = {
  title: "현대차 생산직 연봉: '킹산직'의 모든 것 (2025년 최종 분석)",
  description:
    "수천 대 일의 경쟁률, 신의 직장이라 불리는 '킹산직'. 현대자동차 생산직의 신입 초봉, 성과급, 복지를 포함한 실제 연봉과 그들이 받는 대우에 대한 모든 것을 심층 분석합니다.",
  openGraph: {
    title: "현대차 생산직 연봉: '킹산직'의 모든 것 (2025년 최종 분석)",
    description:
      "수천 대 일의 경쟁률, 신의 직장이라 불리는 '킹산직'의 실제 연봉을 파헤쳐봅니다.",
    images: [
      "/api/og?title=현대차 생산직, 킹산직의 모든 것&description=2025년 연봉 및 성과급 심층 분석",
    ],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "현대차 생산직 연봉: '킹산직'의 모든 것 (2025년 최종 분석)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-09-21",
  dateModified: "2025-09-21",
  description:
    "현대자동차 생산직의 신입 초봉, 성과급, 복지를 포함한 실제 연봉과 그들이 받는 대우에 대한 모든 것을 심층 분석합니다.",
};

export default function HyundaiSalaryPage() {
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
        <div className="w-full bg-gradient-to-br from-gray-800 to-slate-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-yellow-400">킹산직</span>, 그들은 얼마를 벌까?
            <br /> 현대자동차 생산직 심층 분석
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-300">
            사무직보다 높은 연봉, 정년 보장, 강력한 복지. 대한민국 취업 시장의
            패러다임을 바꾼 &apos;킹산직&apos; 신드롬의 중심, 현대차 생산직의
            모든 것을 파헤칩니다.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              수천 대 일의 경쟁률, 주요 대학 커뮤니티의 폭발적인 관심. 과거
              제조업 생산직의 이미지를 완전히 뒤엎고 &apos;킹(King)산직&apos;,
              &apos;갓(God)산직&apos;이라는 신조어를 탄생시킨 현대자동차. 과연
              그들의 연봉 테이블에는 어떤 비밀이 숨겨져 있을까요?
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Coins className="w-7 h-7 text-yellow-500" />
                연봉 1억의 비밀: 기본급이 아닌 &apos;성과급&apos;
              </h2>
              <p>
                현대차 생산직 연봉의 핵심은 기본급이 아닙니다. 매년 노사 협상을
                통해 결정되는 막대한 규모의 <strong>성과급과 격려금</strong>이
                바로 고연봉의 비결입니다. 2025년 기준, 모든 수당과 성과급을
                포함한 신입의 초봉은 <strong>7,000만원에서 최대 1억원</strong>에
                육박할 것으로 예상됩니다.
              </p>
              <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <h3 className="!mt-0 !mb-2 font-bold text-lg">
                  2024년 실제 지급 사례 (언론 보도 기준)
                </h3>
                <ul className="!my-0 !text-base list-disc pl-5 space-y-1">
                  <li>
                    <strong>성과급:</strong> 400% + 1,050만원
                  </li>
                  <li>
                    <strong>격려금:</strong> 250만원
                  </li>
                  <li>
                    <strong>포인트 및 상품권:</strong> 70만원 상당
                  </li>
                </ul>
              </div>
            </section>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-500" />
                돈이 전부가 아니다: 킹산직을 만드는 3대 요소
              </h2>
              <p>
                높은 연봉 외에도 현대차 생산직이 선망의 대상이 된 이유는
                분명합니다.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 text-center">
                  <Shield className="w-10 h-10 text-blue-500 mx-auto" />
                  <h3 className="font-bold !mt-2 !mb-1">압도적 고용 안정성</h3>
                  <p className="!text-sm !my-0">
                    강력한 노동조합을 바탕으로 사실상 정년이 보장됩니다. 만
                    60세까지 안정적으로 근무할 수 있다는 것은 최고의 복지입니다.
                  </p>
                </div>
                <div className="p-4 text-center">
                  <Car className="w-10 h-10 text-blue-500 mx-auto" />
                  <h3 className="font-bold !mt-2 !mb-1">파격적인 복지 혜택</h3>
                  <p className="!text-sm !my-0">
                    최대 30% 저렴하게 신차를 구매할 수 있는 직원 할인 혜택은
                    현대차 직원만의 특권입니다. 자녀 학자금, 의료비 지원 등도
                    최고 수준입니다.
                  </p>
                </div>
                <div className="p-4 text-center">
                  <Crown className="w-10 h-10 text-yellow-500 mx-auto" />
                  <h3 className="font-bold !mt-2 !mb-1">사회적 인식 변화</h3>
                  <p className="!text-sm !my-0">
                    &apos;블루칼라&apos;에 대한 편견이 사라지고, 안정성과 높은
                    소득을 갖춘 &apos;기술 전문가&apos;로 인정받는 사회적
                    분위기가 형성되었습니다.
                  </p>
                </div>
              </div>
            </section>

            <blockquote>
              <p>
                물론 3교대 근무와 육체적 노동 강도는 분명히 고려해야 할
                부분입니다. 하지만 이를 상쇄하고도 남을 만큼의 압도적인 보상과
                안정성이 오늘날의 &apos;킹산직&apos; 신드롬을 만들었습니다.
              </p>
            </blockquote>

            <section className="mt-16 text-center">
              <h2 className="!text-2xl font-bold">
                만약 당신이 &apos;킹산직&apos;이 된다면?
              </h2>
              <p>
                성과급을 포함한 나의 첫해 예상 실수령액이 궁금하다면, 지금 바로
                계산해보세요.
              </p>
              <Link
                href="/?salaryInput=75,000,000&payBasis=annual"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                연봉 7,500만원 실수령액 계산하기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
