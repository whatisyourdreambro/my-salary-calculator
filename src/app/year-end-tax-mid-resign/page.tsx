// src/app/year-end-tax-mid-resign/page.tsx
// 중도퇴사자·이직자 연말정산 — evergreen 시즌 페이지 (연도 없는 슬러그)
// 대상 쿼리: "중도퇴사 연말정산", "퇴사 후 연말정산", "이직 연말정산"
// 수치·기한은 국세청·법제처·국민건강보험공단·국민연금공단 공식 안내 확인분만 사용 (2026-08-15 검증)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import {
  Briefcase,
  ArrowRight,
  Calculator,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = buildPageMetadata({
  // 의도: 퇴사·이직자의 연말정산 처리 절차 (evergreen — 매년 반복 수요, 11월~5월 피크)
  title: "중도퇴사자 연말정산 — 퇴사 후 환급 방법·이직 합산·경정청구 총정리",
  description:
    "퇴사하면 회사가 기본공제만 반영한 약식 연말정산을 합니다. 놓친 신용카드·의료비·월세 공제는 다음해 5월 종합소득세 확정신고 또는 경정청구(5년 이내)로 환급. 이직자는 전 직장 원천징수영수증 제출로 합산, 무직 기간 건강보험 임의계속가입(신청기한 2개월)까지 한 번에.",
  path: "/year-end-tax-mid-resign",
  ogType: "article",
  publishedTime: "2026-08-15",
  modifiedTime: "2026-08-15",
  keywords: [
    "중도퇴사 연말정산",
    "퇴사 후 연말정산",
    "이직 연말정산",
    "중도퇴사자 연말정산 환급",
    "퇴사자 5월 종합소득세",
    "연말정산 경정청구",
    "근로소득원천징수영수증",
    "이직 원천징수영수증 제출",
    "퇴사 후 건강보험 임의계속가입",
    "퇴사 국민연금 납부예외",
  ],
});

const FAQ_ITEMS = [
  {
    question: "중도에 퇴사하면 연말정산을 아예 못 받나요?",
    answer:
      "아닙니다. 소득세법 제137조에 따라 회사는 퇴직하는 달의 급여를 지급할 때 연말정산을 합니다. 다만 이때는 본인 기본공제, 근로소득공제, 급여에서 원천공제된 국민연금·건강보험료처럼 회사가 증빙 없이 확인 가능한 항목만 반영한 '약식 정산'입니다. 신용카드·의료비·월세·연금저축 등 증빙이 필요한 공제는 빠지므로, 놓친 공제는 다음해 5월 종합소득세 확정신고로 직접 반영해 환급받으면 됩니다.",
  },
  {
    question: "퇴사 후 재취업을 안 했는데, 놓친 환급은 언제 어떻게 받나요?",
    answer:
      "다음해 5월 1일~31일 종합소득세 확정신고 기간에 홈택스(hometax.go.kr)에서 직접 신고하면 됩니다. 퇴사한 회사가 발급한 근로소득원천징수영수증을 기초로 신용카드·의료비·월세·연금저축 등 약식 정산에서 빠진 공제를 추가 입력하면, 더 냈던 세금이 환급됩니다. 회사가 지급명세서를 국세청에 제출한 뒤에는 홈택스에서 본인의 근로소득 지급명세서를 직접 조회할 수도 있습니다.",
  },
  {
    question: "5월 확정신고 기간을 놓쳤어요. 환급을 포기해야 하나요?",
    answer:
      "아닙니다. 국세기본법 제45조의2의 경정청구 제도를 이용하면 법정신고기한이 지난 후 5년 이내에 관할 세무서에 환급을 청구할 수 있습니다. 예를 들어 2026년 귀속분(신고기한 2027년 5월 31일)은 2032년 5월 31일까지 경정청구가 가능합니다. 홈택스에서 온라인으로 신청할 수 있습니다.",
  },
  {
    question: "이직했는데 전 직장 원천징수영수증은 어떻게 받나요?",
    answer:
      "먼저 전 직장 인사·급여 담당자에게 근로소득원천징수영수증 발급을 요청하세요. 국세청 상담센터 안내 기준, 회사는 퇴사월 급여 지급일이 속하는 달의 다음달 말일까지 원천징수영수증을 발급할 의무가 있습니다. 회사가 연락되지 않으면 전 직장이 국세청에 지급명세서를 제출한 이후 홈택스에서 본인이 직접 조회·출력할 수 있습니다. 새 직장에 제출하지 못한 채 연말정산이 끝났다면 다음해 5월에 두 직장 소득을 합산해 직접 확정신고해야 합니다.",
  },
  {
    question: "이직자가 전 직장 소득을 합산 안 하면 어떻게 되나요?",
    answer:
      "소득세는 1년 치 소득을 합산해 누진세율을 적용하는 구조라, 두 직장에서 각각 따로 정산하면 실제보다 낮은 세율이 적용된 상태로 끝납니다. 합산 신고 의무가 남아 있으므로 5월 종합소득세 확정신고를 직접 해야 하고, 하지 않으면 나중에 가산세와 함께 추징될 수 있습니다. 새 직장 연말정산 때 전 직장 원천징수영수증을 제출해 합산하는 것이 가장 간단합니다(소득세법 제138조).",
  },
  {
    question: "퇴사 후 지역 건강보험료가 너무 올랐어요. 줄이는 방법이 있나요?",
    answer:
      "임의계속가입 제도를 검토하세요. 퇴직 이전 18개월 동안 직장가입자 자격을 통산 1년 이상 유지했다면, 퇴직 후에도 최대 36개월간 직장가입자 수준의 보험료(본인부담분)로 유지할 수 있습니다(국민건강보험법 제110조). 단, 신청기한이 짧습니다 — 지역가입자가 된 뒤 최초로 고지받은 지역보험료의 납부기한에서 2개월이 지나기 전까지 국민건강보험공단에 신청해야 합니다.",
  },
  {
    question: "무직 기간에 국민연금 보험료를 꼭 내야 하나요?",
    answer:
      "퇴사하면 사업장가입자에서 지역가입자로 전환되는데, 소득이 없으면 국민연금공단에 납부예외를 신청해 보험료 납부를 일시 유예할 수 있습니다(공단 지사 방문·우편·팩스·인터넷 신청 가능). 다만 납부예외 기간은 가입기간에서 제외되므로 나중에 받을 연금액이 줄어들 수 있다는 점은 감안해야 합니다.",
  },
  {
    question: "퇴사 후 무직 기간에 쓴 신용카드도 공제받을 수 있나요?",
    answer:
      "아니요. 신용카드 소득공제, 의료비·보험료 세액공제, 월세 세액공제 등은 근로를 제공한 기간 중 사용·지출한 금액만 공제됩니다. 퇴사 후 재취업 전 공백기에 쓴 금액은 공제 대상이 아닙니다. 반면 연금저축·IRP 납입액, 기부금, 국민연금보험료는 근로기간과 무관하게 연간 납입액 기준으로 인정되므로 무직 기간 납입분도 챙길 수 있습니다.",
  },
];

export default function YearEndTaxMidResignPage() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "중도퇴사자 연말정산", path: "/year-end-tax-mid-resign" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "중도퇴사자 연말정산 — 퇴사 후 환급·이직 합산·경정청구 총정리",
            description:
              "퇴사 시 약식 연말정산의 원리, 5월 종합소득세 확정신고·경정청구 환급 방법, 이직자 합산 절차, 무직 기간 4대보험 처리까지 종합 안내",
            slug: "year-end-tax-mid-resign",
            url: "/year-end-tax-mid-resign",
            publishedDate: "2026-08-15",
            modifiedDate: "2026-08-15",
          }),
          speakableLd({
            url: "/year-end-tax-mid-resign",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Briefcase className="w-4 h-4" />
            퇴사·이직자 전용 — 놓친 환급 되찾기
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            중도퇴사자 연말정산 <span className="text-electric">퇴사 후 환급 방법</span>
          </h1>
          <PublishedMeta publishedDate="2026-08-15" updatedDate="2026-08-15" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            퇴사하면 회사가 <strong>기본공제만 반영한 약식 연말정산</strong>을 하고 끝냅니다.
            신용카드·의료비·월세 공제가 통째로 빠진 상태 — 놓친 환급은{" "}
            <strong>다음해 5월 종합소득세 확정신고</strong>로 직접 되찾을 수 있고, 그마저
            놓쳤어도 <strong>5년 이내 경정청구</strong>가 가능합니다.
          </p>
          <YearEndTaxCluster className="justify-center" />
          <p className="mt-4 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 공식 출처:{" "}
            <a
              href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2304&cntntsId=238938"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              국세청 연말정산 종합 안내
            </a>{" "}
            ·{" "}
            <a
              href="https://call.nts.go.kr/call/taxInfo/selectTaxInfo.do?mi=1317"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              국세청 국세상담센터
            </a>
          </p>
        </div>

        <HomeTopAd />

        {/* 한눈에 보는 3단계 */}
        <section className="my-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "1단계 · 퇴사월",
              title: "회사가 약식 정산",
              desc: "퇴사월 급여 지급 시 기본공제만 반영해 정산 (소득세법 제137조). 원천징수영수증 꼭 받아두기.",
            },
            {
              step: "2단계 · 다음해 5월",
              title: "확정신고로 환급",
              desc: "5월 1~31일 홈택스에서 종합소득세 확정신고 — 놓친 신용카드·의료비·월세 공제 반영.",
            },
            {
              step: "3단계 · 그 후 5년",
              title: "경정청구로 복구",
              desc: "5월을 놓쳤어도 법정신고기한 후 5년 이내 경정청구 가능 (국세기본법 제45조의2).",
            },
          ].map((card) => (
            <div key={card.step} className="p-6 bg-white rounded-3xl border border-canvas-200">
              <p className="text-xs font-bold text-electric mb-2">{card.step}</p>
              <h2 className="text-lg font-black text-navy mb-2">{card.title}</h2>
              <p className="text-sm text-muted-blue leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </section>

        {/* ① 퇴사 시 회사가 하는 약식 연말정산 */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-4">
            ① 퇴사할 때 회사가 하는 &lsquo;약식 연말정산&rsquo;의 정체
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            연말정산은 원래 다음해 1~2월에 하지만, 중도퇴사자는 기다리지 않습니다.{" "}
            <strong>소득세법 제137조</strong>에 따라 회사는{" "}
            <strong>퇴직하는 달의 근로소득(급여)을 지급할 때</strong> 그 해 1월부터 퇴사월까지
            소득을 정산합니다. 문제는 이때 회사가{" "}
            <strong>증빙 없이 확인할 수 있는 항목만 반영</strong>한다는 점입니다. 근로자가
            간소화 자료를 제출하지 않은 상태이므로 사실상 &lsquo;기본공제만 넣은
            가계산&rsquo;에 가깝고, 그 결과 세금을 더 낸 상태로 끝나는 경우가 많습니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            국세청 상담센터 안내 기준, 회사는{" "}
            <strong>퇴사월 급여 지급일이 속하는 달의 다음달 말일까지</strong>{" "}
            근로소득원천징수영수증을 발급해야 합니다. 이 서류가 이후 모든 절차(이직 합산·5월
            확정신고·경정청구)의 출발점이니 퇴사 전에 꼭 챙겨두세요.
          </p>

          {/* 반영 vs 미반영 표 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-canvas-200">
              <h3 className="flex items-center gap-2 text-sm font-black text-navy mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                약식 정산에 반영되는 것
              </h3>
              <ul className="space-y-2 text-sm text-muted-blue">
                <li>본인 기본공제 (150만원)</li>
                <li>근로소득공제·근로소득세액공제</li>
                <li>급여에서 원천공제된 국민연금보험료</li>
                <li>급여에서 원천공제된 건강·고용보험료</li>
              </ul>
            </div>
            <div className="p-5 bg-white rounded-2xl border border-canvas-200">
              <h3 className="flex items-center gap-2 text-sm font-black text-navy mb-3">
                <XCircle className="w-4 h-4 text-red-500" />
                빠지는 것 (5월에 직접 챙길 몫)
              </h3>
              <ul className="space-y-2 text-sm text-muted-blue">
                <li>
                  <Link href="/credit-card-deduction-2026" className="text-electric font-bold hover:underline">
                    신용카드 소득공제
                  </Link>
                </li>
                <li>
                  <Link href="/medical-tax-credit-2026" className="text-electric font-bold hover:underline">
                    의료비 세액공제
                  </Link>{" "}
                  · 교육비·보험료
                </li>
                <li>
                  <Link href="/rent-tax-credit-2026" className="text-electric font-bold hover:underline">
                    월세 세액공제
                  </Link>
                </li>
                <li>연금저축·IRP, 기부금, 부양가족 인적공제</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-faint-blue mt-3">
            ※ 반영 항목은 &ldquo;별도 증빙 없이 확정 가능한 항목&rdquo;이라는 원리에 따른 대표
            예시입니다. 회사에 부양가족을 이미 등록해 둔 경우 등 실무 처리는 회사마다 다를 수
            있습니다.
          </p>
        </section>

        <CalcResultAd />

        {/* ② 5월 확정신고·경정청구 */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-4">
            ② 놓친 공제, 다음해 5월 확정신고로 되찾는 법
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            퇴사 후 그 해에 재취업하지 않았다면, 약식 정산에서 빠진 공제는{" "}
            <strong>다음해 5월 1일~31일 종합소득세 확정신고</strong> 기간에 홈택스에서 직접
            반영하면 됩니다. 전 직장 원천징수영수증의 결정세액을 기초로 신용카드·의료비·월세
            등 공제를 추가 입력하면 차액이 환급됩니다. 전 직장이 국세청에 지급명세서를 제출한
            뒤에는 홈택스에서 본인 지급명세서를 직접 조회할 수 있어, 회사와 연락이 끊겨도
            신고할 수 있습니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            5월마저 지나쳤다면 <strong>경정청구</strong>가 남아 있습니다.{" "}
            <strong>국세기본법 제45조의2</strong>에 따라{" "}
            <strong>법정신고기한이 지난 후 5년 이내</strong>라면 관할 세무서에 과다 납부한
            세액의 환급을 청구할 수 있습니다. 몇 년 전 퇴사하며 놓친 환급도 아직 살아있을 수
            있다는 뜻입니다.
          </p>

          {/* 일정표 */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm bg-white rounded-2xl border border-canvas-200 overflow-hidden">
              <thead>
                <tr className="bg-canvas-100 text-navy">
                  <th className="px-4 py-3 text-left font-black">시점</th>
                  <th className="px-4 py-3 text-left font-black">해야 할 일</th>
                  <th className="px-4 py-3 text-left font-black">근거</th>
                </tr>
              </thead>
              <tbody className="text-muted-blue">
                <tr className="border-t border-canvas-200">
                  <td className="px-4 py-3 font-bold whitespace-nowrap">퇴사월 급여일</td>
                  <td className="px-4 py-3">회사가 약식 연말정산 수행</td>
                  <td className="px-4 py-3 whitespace-nowrap">소득세법 제137조</td>
                </tr>
                <tr className="border-t border-canvas-200">
                  <td className="px-4 py-3 font-bold whitespace-nowrap">급여 지급월 다음달 말일</td>
                  <td className="px-4 py-3">원천징수영수증 발급 기한 — 못 받았으면 요청</td>
                  <td className="px-4 py-3 whitespace-nowrap">국세청 상담센터</td>
                </tr>
                <tr className="border-t border-canvas-200">
                  <td className="px-4 py-3 font-bold whitespace-nowrap">다음해 5월 1~31일</td>
                  <td className="px-4 py-3">종합소득세 확정신고 — 놓친 공제 반영해 환급</td>
                  <td className="px-4 py-3 whitespace-nowrap">소득세법 제70조</td>
                </tr>
                <tr className="border-t border-canvas-200">
                  <td className="px-4 py-3 font-bold whitespace-nowrap">신고기한 후 5년 이내</td>
                  <td className="px-4 py-3">경정청구로 과다 납부 세액 환급 청구</td>
                  <td className="px-4 py-3 whitespace-nowrap">국세기본법 제45조의2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-faint-blue mt-3">
            ※ 근로소득만 있고 약식 정산으로 이미 세액이 정확히 맞춰졌다면 신고 의무는 없지만,
            놓친 공제가 있다면 신고할수록 유리합니다. 예상 환급액은{" "}
            <Link href="/year-end-tax" className="text-electric font-bold hover:underline">
              연말정산 계산기
            </Link>
            로 미리 확인해 보세요.
          </p>
        </section>

        <InArticleAd />

        {/* ③ 이직자 합산 */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-4">
            ③ 이직자: 전 직장 원천징수영수증을 새 직장에 내면 끝
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            같은 해에 새 직장으로 옮겼다면 절차가 더 간단합니다.{" "}
            <strong>소득세법 제138조(재취직자의 연말정산)</strong>에 따라{" "}
            <strong>전 직장 근로소득원천징수영수증을 새 직장에 제출</strong>하면, 새 직장이
            1월부터 퇴사월까지의 전 직장 소득을 합산해 한 번에 연말정산을 해줍니다. 간소화
            자료도 새 직장 연말정산 때 평소처럼 제출하면 됩니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            합산을 빼먹으면 문제가 생깁니다. 소득세는 1년 치를 합산해 누진세율을 적용하는데,
            두 직장이 각각 따로 정산하면 실제보다 낮은 세율로 계산된 상태가 됩니다. 이 경우{" "}
            <strong>5월 종합소득세 확정신고로 직접 합산 신고할 의무</strong>가 남고, 하지
            않으면 나중에 가산세와 함께 추징될 수 있습니다. 전 직장과 연락이 어려우면 전
            직장이 지급명세서를 제출한 후 홈택스에서 직접 조회하는 방법도 있습니다.
          </p>
          <div className="mt-5 p-5 bg-electric-10 rounded-2xl border border-electric/20">
            <p className="flex items-start gap-2 text-sm text-navy leading-relaxed">
              <AlertCircle className="w-5 h-5 text-electric shrink-0 mt-0.5" />
              <span>
                <strong>이직 공백기에 쓴 돈은 공제가 안 됩니다.</strong> 신용카드·의료비·월세
                등은 근로를 제공한 기간 중 지출분만 공제 대상입니다(국세청 연말정산 안내).
                반면 연금저축·IRP·기부금·국민연금보험료는 연간 납입액 기준이라 공백기 납입분도
                인정됩니다.
              </span>
            </p>
          </div>
        </section>

        {/* ④ 무직 기간 4대보험 */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-4">
            ④ 무직 기간 4대보험: 건강보험 폭탄 막는 법
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            퇴사하면 건강보험은 직장가입자에서 <strong>지역가입자로 자동 전환</strong>되고,
            소득·재산 기준으로 보험료가 다시 계산되면서 회사가 절반을 부담하던 때보다 부담이
            커지는 경우가 많습니다. 이때 쓰는 것이 <strong>임의계속가입</strong>입니다
            (국민건강보험법 제110조, 법제처 찾기쉬운 생활법령정보 기준).
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted-blue">
            <li className="p-4 bg-white rounded-2xl border border-canvas-200 leading-relaxed">
              <strong className="text-navy">자격 요건</strong> — 퇴직 이전 18개월 동안
              직장가입자 자격을 <strong>통산 1년 이상</strong> 유지했을 것
            </li>
            <li className="p-4 bg-white rounded-2xl border border-canvas-200 leading-relaxed">
              <strong className="text-navy">신청 기한</strong> — 지역가입자가 된 뒤{" "}
              <strong>최초로 고지받은 지역보험료의 납부기한에서 2개월이 지나기 전</strong>까지
              국민건강보험공단에 신청 (기한이 짧아 놓치기 쉬운 포인트)
            </li>
            <li className="p-4 bg-white rounded-2xl border border-canvas-200 leading-relaxed">
              <strong className="text-navy">유지 기간</strong> — 퇴직일 다음날부터{" "}
              <strong>최대 36개월</strong>간 직장가입자 수준 보험료로 유지. 단, 최초
              보험료를 납부기한부터 2개월이 지나도록 내지 않으면 자격 상실
            </li>
          </ul>
          <p className="text-sm leading-7 text-muted-blue mt-5">
            국민연금도 <strong>지역가입자로 전환</strong>됩니다. 소득이 없으면 국민연금공단에{" "}
            <strong>납부예외</strong>를 신청해 보험료 납부를 일시 유예할 수 있습니다(지사
            방문·우편·팩스·인터넷, 정부24에서도 안내). 다만 납부예외 기간은 가입기간에서
            제외되어 나중에 받을 연금액이 줄어들 수 있으니, 여유가 있다면 지역가입자로 계속
            내는 선택지도 함께 저울질하세요. 고용보험은 근로자 신분이 아니면 가입 대상이
            아니며, 비자발적 퇴사라면{" "}
            <Link href="/unemployment-benefit" className="text-electric font-bold hover:underline">
              실업급여
            </Link>
            를 별도로 확인해 보세요.
          </p>
        </section>

        {/* CTA — 클러스터 연결 */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/year-end-tax"
            className="block p-6 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors"
          >
            <Calculator className="w-8 h-8 opacity-70 mb-3" />
            <h3 className="text-lg font-black mb-2">연말정산 환급액 계산기</h3>
            <p className="text-sm opacity-90">5월에 돌려받을 금액 미리 확인</p>
          </Link>
          <Link
            href="/year-end-tax-checklist"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <FileText className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">연말정산 체크리스트</h3>
            <p className="text-sm text-muted-blue">놓친 공제 40+ 항목 점검표</p>
          </Link>
          <Link
            href="/credit-card-deduction-2026"
            className="block p-6 bg-white border border-canvas-200 rounded-3xl text-navy hover:border-electric transition-colors"
          >
            <Calendar className="w-8 h-8 text-electric mb-3" />
            <h3 className="text-lg font-black mb-2">신용카드 공제 총정리</h3>
            <p className="text-sm text-muted-blue">약식 정산에서 가장 크게 빠지는 항목</p>
          </Link>
        </section>

        <GuideMidAd />

        {/* FAQ */}
        <section className="my-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">
            중도퇴사·이직 연말정산 자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy">
                  {item.question}
                  <ArrowRight className="w-4 h-4 text-electric transition-transform group-open:rotate-90" />
                </summary>
                <p className="faq-answer mt-3 text-sm text-muted-blue leading-relaxed">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
          <p className="text-xs text-faint-blue mt-6 leading-relaxed">
            출처: 소득세법 제70조·제137조·제138조, 국세기본법 제45조의2(
            <a
              href="https://www.law.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              국가법령정보센터
            </a>
            ) · 국세청{" "}
            <a
              href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2304&cntntsId=238938"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              연말정산 종합 안내
            </a>
            ·
            <a
              href="https://call.nts.go.kr/call/taxInfo/selectTaxInfo.do?mi=1317"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              국세상담센터
            </a>{" "}
            · 국민건강보험법 제110조(
            <a
              href="https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1063&ccfNo=2&cciNo=1&cnpClsNo=3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              법제처 찾기쉬운 생활법령정보
            </a>
            ) ·{" "}
            <a
              href="https://www.nps.or.kr/elctcvlcpt/comm/getOHAC0000M5.do?menuId=MN24001067"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric hover:underline"
            >
              국민연금공단 납부예외 안내
            </a>{" "}
            (2026-08-15 확인)
          </p>
        </section>

        <CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />

        <RelatedCalculators currentPath="/year-end-tax-mid-resign" />
        {/* 관련 링크 직후 멀티플렉스(관련 콘텐츠형) — 전면 최적화 (운영자 지시 2026-09-02) */}
        <MultiplexAd />

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="중도퇴사자 연말정산 — 퇴사 후 환급 방법 총정리"
            description="약식 정산에서 빠진 공제, 5월 확정신고·경정청구로 되찾는 법 + 이직 합산·건강보험 임의계속가입까지"
          />
        </div>
      </div>
    </main>
  );
}
