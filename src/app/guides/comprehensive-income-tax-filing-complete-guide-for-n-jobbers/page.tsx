
import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, FileText, ShieldCheck, Lightbulb, ExternalLink } from "lucide-react";

const today = new Date();
const year = today.getFullYear();
const month = (today.getMonth() + 1).toString().padStart(2, "0");
const day = today.getDate().toString().padStart(2, "0");
const currentDate = `${year}-${month}-${day}`;
const currentDateKorean = `${year}년 ${month}월 ${day}일`;

export const metadata: Metadata = {
  title: "N잡러 종합소득세 신고 완벽 가이드: 5단계로 끝내기 (2025년)",
  description:
    "월급 외 부업 소득, 5월 종합소득세 신고 기간을 놓치면 가산세 폭탄! 사업소득과 기타소득의 차이부터 홈택스 신고 5단계 프로세스, 절세 꿀팁까지 N잡러를 위한 모든 것을 알려드립니다.",
  openGraph: {
    title: "N잡러 종합소득세 신고 완벽 가이드: 5단계로 끝내기 (2025년)",
    description:
      "N잡러, 5월은 세금 신고의 달! 종합소득세의 모든 것을 파헤치고 당신의 소득을 지키세요.",
    images: ["/api/og?title=N잡러 종합소득세, 5단계로 끝내기"],
  },
};

const articleStructuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "N잡러 종합소득세 신고 완벽 가이드: 5단계로 끝내기 (2025년)",
  author: { "@type": "Organization", name: "Moneysalary" },
  datePublished: "2025-05-05",
  dateModified: currentDate,
  description:
    "N잡러를 위한 종합소득세 신고 5단계 프로세스와 사업소득/기타소득 비교, 절세 팁을 알려드립니다.",
};

export default function ComprehensiveIncomeTaxGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <main className="w-full bg-background">
        <div className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-gray-900 dark:to-blue-900 text-white text-center py-20 sm:py-28 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            N잡러 종합소득세 신고,
            <br /> 5단계로 끝내기
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100 dark:text-gray-300">
            월급 외 부업 소득이 있다면 5월은 '세금 신고의 달'! 복잡하게 느껴지는 종합소득세 신고를 쉽게 이해하고, 당신의 소중한 소득을 지키는 절세 팁을 알려드립니다.
          </p>
          <p className="mt-4 text-xs text-indigo-200 dark:text-gray-500">
            최종 업데이트: {currentDateKorean}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 -mt-20">
          <article className="prose dark:prose-invert lg:prose-xl max-w-none bg-light-card dark:bg-dark-card p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
            <p className="lead text-lg sm:text-xl font-medium text-gray-700 dark:text-gray-300">
              N잡러 시대, 추가 소득은 기쁨이지만 '세금'이라는 숙제가 따라옵니다. 근로소득은 회사에서 연말정산으로 끝나지만, 부업으로 번 돈은 다음 해 5월 1일부터 31일까지, 작년 1년간의 모든 소득을 합산하여 **종합소득세**를 직접 신고 및 납부해야 합니다. 놓치면 무거운 가산세를 물 수 있으니, 이 가이드만 따라오세요.
            </p>

            <section className="mt-12">
              <h2 className="!text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-500" />
                사업소득 vs 기타소득, 내 부업 소득은?
              </h2>
              <p>
                부업 소득은 보통 '사업소득'과 '기타소득'으로 나뉩니다. 어떻게 구분되는지에 따라 세금 계산법이 달라져 매우 중요합니다.
              </p>
              <div className="overflow-x-auto mt-4 shadow-md rounded-lg">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr><th className="p-3 font-semibold">구분</th><th className="p-3 font-semibold">사업소득</th><th className="p-3 font-semibold">기타소득</th></tr>
                  </thead>
                  <tbody>
                    <tr className="border-b dark:border-gray-700"><td className="p-3 font-bold">정의</td><td className="p-3">계속적, 반복적 활동</td><td className="p-3">일시적, 우발적 활동</td></tr>
                    <tr className="border-b dark:border-gray-700"><td className="p-3 font-bold">예시</td><td className="p-3">프리랜서 개발, 디자인, 컨설팅</td><td className="p-3">일회성 강연, 원고료, 상금</td></tr>
                    <tr className="border-b dark:border-gray-700"><td className="p-3 font-bold">원천징수</td><td className="p-3"><strong>3.3%</strong></td><td className="p-3"><strong>8.8%</strong> (필요경비 60% 인정 시)</td></tr>
                    <tr className="border-b dark:border-gray-700"><td className="p-3 font-bold">핵심</td><td className="p-3">장부 작성으로 필요경비 처리</td><td className="p-3">연 300만원 이하 분리과세 선택 가능</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-12 bg-teal-50 dark:bg-teal-900/20 p-6 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="!mt-0 !text-2xl font-bold text-teal-700 flex items-center gap-2">
                <Briefcase className="w-6 h-6" />
                종합소득세 신고, 5단계로 끝내기
              </h2>
              <ol className="!my-4 space-y-3 text-base !p-0 !list-none">
                <li className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"><strong>1단계 (5월 초): 소득자료 확인</strong><br/>국세청 홈택스에 로그인하여 'My홈택스'에서 작년 1년간의 내 모든 소득(근로, 사업, 기타 등) 자료가 정확히 조회되는지 확인합니다.</li>
                <li className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"><strong>2단계 (수시): 필요경비 자료 준비</strong><br/>사업소득이 있다면, 부업과 관련된 지출 증빙(영수증, 이체내역 등)을 꼼꼼히 챙겨 필요경비를 인정받아야 세금이 줄어듭니다.</li>
                <li className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"><strong>3단계 (5월 중): 공제항목 확인</strong><br/>부양가족, 연금계좌, 보험료, 기부금 등 연말정산 때와 동일한 소득/세액공제 항목들을 다시 한번 확인하고 챙깁니다.</li>
                <li className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"><strong>4단계 (5/1~5/31): 홈택스 신고</strong><br/>홈택스(PC) 또는 손택스(모바일)를 통해 신고서를 작성합니다. 국세청에서 발송한 안내문에 따라 '모두채움' 서비스를 이용하면 대부분 자동으로 채워져 편리합니다.</li>
                <li className="p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"><strong>5단계 (신고 후): 세금 납부 또는 환급</strong><br/>신고서 제출 후 생성된 세금을 납부하거나, 환급금이 있다면 6월 말~7월 초에 입금될 때까지 기다립니다.</li>
              </ol>
            </section>

            <section className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800">
              <h2 className="!mt-0 !text-2xl font-bold text-yellow-700 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" /> N잡러 절세 꿀팁
              </h2>
              <ul className="!my-2 space-y-2 text-base">
                <li><strong>기타소득 300만원 분리과세 활용:</strong> 기타소득 금액이 연 300만원 이하라면, 종합과세와 분리과세(22%) 중 유리한 쪽을 선택할 수 있습니다. 나의 한계세율이 24% 이상이라면 분리과세가 유리합니다.</li>
                <li><strong>간편장부 작성:</strong> 사업소득이 있다면, 수입과 지출을 기록한 간편장부를 작성하는 것만으로도 세금을 줄일 수 있습니다. (단순경비율 vs 기준경비율)</li>
                <li><strong>절세 상품은 기본:</strong> 연금저축, IRP, ISA 등은 연말정산뿐만 아니라 종합소득세 신고 시에도 동일하게 강력한 절세 효과를 발휘합니다.</li>
              </ul>
            </section>

            <section className="mt-16 text-center bg-gray-100 dark:bg-gray-800/50 p-8 rounded-2xl">
              <h2 className="!text-2xl font-bold">
                5월, 종합소득세 신고 기간을 놓치지 마세요
              </h2>
              <p className="mt-4 max-w-xl mx-auto">
                국세청 홈택스에서 간편하게 신고하고, 예상 세액을 미리 조회할 수 있습니다. 지금 바로 방문하여 내 소득을 확인해보세요.
              </p>
              <Link
                href="https://www.hometax.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 py-4 px-8 bg-signature-blue text-white rounded-lg text-center font-bold text-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
              >
                <ExternalLink className="inline-block w-5 h-5 mr-2" />
                국세청 홈택스 바로가기
              </Link>
            </section>
          </article>
        </div>
      </main>
    </>
  );
}
