// /calc/smb-income-tax-break — 중소기업 취업자 소득세 감면 계산기 (2026-08-31 신설, P7 승인 배치)
// 조세특례제한법 제30조 — 청년 90%·5년 / 60세 이상·장애인·경력단절여성 70%·3년, 한도 200만원.
// 적용기한: 2026-12-31까지 취업분 (현행법 — "일몰 막차" 맥락).
// 갱신 슬롯: 2026-12 세법개정 — 일몰 연장 여부(전례 3회 연장, 연장 시 막차 문구 즉시 교체)
// 계산 로직: src/lib/smbTaxBreak.ts — taxConstants2026 정본 엔진 재사용 + 소득세법 59조 3항 연동 축소 반영.
// 키워드 분업: 이 페이지는 "감면 계산·감면기간·경정청구" 축. 중소 vs 대기업 실수령 비교는
// /company/simulator 소유 — 본문 상호링크만, 해당 콘텐츠 신설 금지.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd } from "@/components/AdPlacement";
import { BadgePercent, Info } from "lucide-react";
import SmbTaxBreakClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "중소기업 취업자 소득세 감면은 누가 받을 수 있나요?",
    answer:
      "조세특례제한법 30조에 따라 중소기업기본법상 중소기업(시행령에 열거된 업종 한정)에 취업한 청년(근로계약 체결일 현재 만 15~34세, 병역 이행기간 최대 6년 차감), 60세 이상, 장애인, 경력단절여성이 대상입니다. 감면율은 청년 90%, 그 외 70%이며 과세기간당 한도는 200만원입니다. 현행법상 2026년 12월 31일까지 취업(재취업 포함)한 사람에게 적용됩니다.",
  },
  {
    question: "감면기간 5년(3년)은 어떻게 세나요? 이직하면 다시 시작되나요?",
    answer:
      "감면을 최초로 적용받은 회사의 취업일부터 청년 5년, 그 외 3년이 되는 날이 속하는 달까지 발생한 소득에 적용됩니다. 이직하거나 중간에 쉬어도 기간은 리셋되지 않고 계속 흐릅니다(공백기간 포함). 새 회사도 감면 대상 중소기업이라면 그 회사에 감면신청서를 다시 제출해 남은 기간만큼 이어서 감면받을 수 있습니다.",
  },
  {
    question: "몇 년째 다니면서 감면을 몰랐습니다. 소급해서 돌려받을 수 있나요?",
    answer:
      "가능합니다. 감면신청서 제출 기한(취업일이 속하는 달의 다음 달 말일)을 넘겼더라도 불이익 규정이 없어 지금 신청할 수 있고, 이미 지나간 연도는 경정청구로 환급받습니다. 경정청구는 각 연도 종합소득세 법정신고기한(다음 해 5월 31일)부터 5년 이내에 홈택스에서 할 수 있습니다(국세기본법 45조의2). 예를 들어 2026년에는 2021년 귀속분(2022년 5월 신고분)까지 청구할 수 있습니다.",
  },
  {
    question: "계산 결과가 홈택스 연말정산과 왜 다를 수 있나요?",
    answer:
      "이 계산기는 기본 인적공제와 국민연금 연금보험료공제만 반영한 근사치로, 신용카드·월세·보험료·의료비 등 개인별 공제는 반영하지 않습니다. 다만 많은 계산기가 빠뜨리는 핵심, 즉 감면을 받으면 근로소득세액공제가 감면 비율만큼 축소되는 연동 규정(소득세법 59조 3항)은 반영했습니다. 이 축소를 빼고 계산하면 절감액이 실제보다 수십만 원 부풀려집니다.",
  },
  {
    question: "군대를 다녀와서 만 34세가 넘었는데 청년 감면이 되나요?",
    answer:
      "병역 이행기간(현역·상근예비역·의무경찰·사회복무요원 등)은 최대 6년까지 근로계약 체결일 현재 나이에서 빼고 판정합니다. 예를 들어 만 36세라도 군 복무 2년을 빼면 환산 34세로 청년 요건을 충족합니다. 위 계산기의 청년 요건 체크에 나이와 복무 개월을 넣으면 바로 판정됩니다.",
  },
  {
    question: "어떤 회사·업종은 감면을 못 받나요?",
    answer:
      "회사가 중소기업기본법상 중소기업이어도 조특법 시행령(27조)에 열거된 업종을 영위해야 합니다. 대표적으로 법무·회계·세무 등 전문서비스업, 금융 및 보험업, 병원·의원 등 보건업은 제외되고, 국가·지방자치단체·공공기관·지방공기업 근무자도 대상이 아닙니다. 또 임원, 최대주주(최대출자자)와 그 배우자·직계존비속, 일용근로자는 감면받을 수 없습니다. 회사가 대상인지는 인사팀이나 세무대리인에게 확인하는 것이 정확합니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "중소기업 취업자 소득세 감면 계산기",
  tagline: "청년 90%·5년 절감액과 감면기간, 경정청구까지",
  description:
    "조특법 30조 중소기업 취업자 소득세 감면 계산기. 청년 90%·5년, 60세 이상·장애인·경력단절여성 70%·3년, 한도 200만원. 근로소득세액공제 연동 축소(소득세법 59조3항)까지 반영한 홈택스 기준 절감액과 경정청구 5년 소급 방법 안내.",
  path: "/calc/smb-income-tax-break",
  keywords: [
    "중소기업 취업자 소득세 감면",
    "중소기업 소득세 감면 계산기",
    "청년 소득세 감면 90%",
    "소득세 감면 감면기간",
    "소득세 감면 경정청구",
  ],
});

export default function SmbIncomeTaxBreakPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "중소기업 취업자 소득세 감면 계산기",
            description:
              "조특법 30조 감면세액과 근로소득세액공제 연동 축소를 반영한 연간·감면기간 절감액을 자동 계산합니다.",
            url: "/calc/smb-income-tax-break",
          }),
          autoBreadcrumbLd("/calc/smb-income-tax-break", {
            leafName: "중소기업 취업자 소득세 감면 계산기",
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <BadgePercent size={12} /> 현행법 일몰 2026-12-31 — 막차 확인
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              중소기업 취업자<br className="sm:hidden" /> 소득세 감면 계산기
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              청년 <strong className="text-electric">90%·5년</strong> — 연간 절감액과 놓친 연도{" "}
              <strong className="text-electric">경정청구</strong>까지 한 번에
            </p>
          </header>

          <SmbTaxBreakClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">감면율·기간·한도 (조세특례제한법 30조)</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              중소기업 취업자 소득세 감면은 요건만 맞으면 <strong>월급에서 떼는 소득세의
              90%(청년)를 최대 5년간</strong> 돌려주는, 근로자 세제 혜택 중 체감이 가장 큰
              제도입니다. 2026년 현행 기준은 다음과 같습니다(기준일 2026-08-31, 조세특례제한법
              30조·같은 법 시행령 27조).
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>청년(근로계약 체결일 현재 만 15~34세, 병역기간 최대 6년 차감): <strong>감면율 90% · 5년</strong></li>
              <li>60세 이상·장애인·경력단절여성: <strong>감면율 70% · 3년</strong></li>
              <li>감면 한도: <strong>과세기간(1년)당 200만원</strong></li>
              <li>적용기한: <strong>2026년 12월 31일까지 취업(재취업 포함)분</strong> — 현행법 기준</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              적용기한이 올해 말로 정해져 있다는 점이 중요합니다. 이 제도는 지금까지 세 차례
              연장되어 왔지만, 2027년 이후 연장 여부는 올해 말 세법개정 결과에 달려 있습니다.
              현행법만 놓고 보면 <strong>2026년 12월 31일까지 중소기업에 입사(이직 포함)하는
              사람까지가 &lsquo;막차&rsquo;</strong>입니다. 하반기 입사·이직을 저울질하고 있다면
              계약 시점이 해를 넘기지 않는지 확인할 가치가 있습니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">홈택스와 같은 결과가 나오게 하는 핵심 — 세액공제 연동 축소</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              감면액을 &ldquo;산출세액 × 90%&rdquo;로만 계산하면 홈택스 연말정산 결과와 크게
              어긋납니다. 소득세법 59조 3항이 <strong>감면을 받는 사람의 근로소득세액공제를
              감면 비율만큼 축소</strong>하도록 연동해 두었기 때문입니다(공제액 × (1 −
              감면세액/산출세액)). 이 계산기는 이 연동 규정을 반영합니다. 검산 예시 하나를
              그대로 따라가 보면 다음과 같습니다.
            </p>
            <div className="not-prose rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 my-4 text-sm text-muted-blue dark:text-canvas-300 space-y-1.5">
              <p className="font-bold text-navy dark:text-canvas-50 mb-2">검산 예시 — 연봉 3,000만원 · 본인 1인 · 청년 90% (2026년 귀속)</p>
              <p>① 근로소득공제 975만원 → 인적공제 150만원·연금보험료공제 142만 5,000원 차감 → 과세표준 1,732만 5,000원</p>
              <p>② 산출세액 = 1,732만 5,000원 × 15% − 126만원 = <strong>1,338,750원</strong></p>
              <p>③ 감면세액 = 1,338,750원 × 90% = <strong>1,204,875원</strong> (한도 200만원 이내)</p>
              <p>④ 근로소득세액공제 726,625원 → 연동 축소 후 <strong>72,662원</strong> (× (1 − 90%))</p>
              <p>⑤ 결정세액 = 1,338,750 − 1,204,875 − 72,662 = <strong>약 61,213원</strong> (감면이 없었다면 612,125원)</p>
              <p className="pt-1">→ 연간 절감액 약 <strong>60만 6,000원</strong>(지방소득세 10% 포함), 5년이면 약 303만원. 만약 ④의 축소를 빼먹으면 결정세액이 0원으로 잘못 계산되어 절감액이 60만원 이상 부풀려집니다.</p>
            </div>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">감면 대상이 아닌 경우 — 업종·기관·사람</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              회사 규모가 중소기업이어도 <strong>조특법 시행령 27조에 열거된 업종</strong>(제조업·
              도소매업·음식점업·정보통신업 등)을 영위해야 감면 대상입니다. 대표적인 제외
              업종은 <strong>법무·회계·세무 등 전문서비스업, 금융 및 보험업, 병원·의원 등
              보건업</strong>이고, 국가·지방자치단체·공공기관·지방공기업 근무자도 제외됩니다.
              사람 기준으로는 임원, 최대주주(최대출자자)와 그 배우자·직계존비속, 일용근로자가
              제외됩니다. 재직 중인 회사가 대상인지 애매하면 인사팀 또는 세무대리인에게 업종
              코드를 확인하는 것이 가장 정확합니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">신청 방법 — 그리고 놓쳤다면 경정청구 5년</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>① 근로자 → 회사: &lsquo;중소기업 취업자 소득세 감면신청서&rsquo;를 <strong>취업일이 속하는 달의 다음 달 말일까지</strong> 회사(원천징수의무자)에 제출</li>
              <li>② 회사 → 세무서: 회사가 감면 대상 명세서를 관할 세무서에 제출 — 이후 매달 원천징수부터 감면 반영</li>
              <li>③ 기한을 넘겼다면: 불이익 없이 지금 제출 가능. <strong>이미 지나간 연도는 경정청구로 5년 소급 환급</strong>(국세기본법 45조의2 — 법정신고기한부터 5년 이내, 홈택스 신청)</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              감면으로 얇아진 원천징수와 연말정산 환급이 어떻게 맞물리는지는{" "}
              <Link href="/year-end-tax" className="text-electric font-bold hover:underline">
                연말정산 계산기
              </Link>
              에서, 감면이 끝난 뒤의 세금 구조는{" "}
              <Link href="/income-tax-2026" className="text-electric font-bold hover:underline">
                종합소득세 계산기
              </Link>
              에서 이어서 확인할 수 있습니다. 감면을 포함해 &ldquo;중소기업과 대기업 중 실수령이
              어디가 나은가&rdquo;라는 비교 자체가 궁금하다면{" "}
              <Link href="/company/simulator" className="text-electric font-bold hover:underline">
                기업 유형별 실수령 시뮬레이터
              </Link>
              가 그 질문 전용 페이지입니다.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 */}
          <InArticleAd />

          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 group">
                  <summary className="cursor-pointer font-bold text-navy dark:text-canvas-50 flex items-center justify-between">
                    {item.question}<span className="text-electric group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* 내부링크 — 광고 아래 배치 */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">이어서 확인하면 좋은 페이지</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  href: "/company/simulator",
                  title: "기업 유형별 실수령 시뮬레이터",
                  desc: "중소기업 vs 대기업 — 연봉·실수령 비교는 여기서",
                },
                {
                  href: "/new-employee-2026",
                  title: "2026 신입 연봉 협상 가이드",
                  desc: "첫 입사 전 초봉 시세와 협상 준비",
                },
                {
                  href: "/year-end-tax",
                  title: "연말정산 계산기",
                  desc: "감면 반영 후 13월의 월급 미리 계산",
                },
                {
                  href: "/income-tax-2026",
                  title: "종합소득세 계산기",
                  desc: "8단계 누진세율 — 감면 종료 후 세금 구조",
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 hover:border-electric transition-colors block"
                >
                  <div className="font-bold text-navy dark:text-canvas-50">{l.title}</div>
                  <div className="text-xs text-faint-blue mt-1">{l.desc}</div>
                </Link>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              본 페이지는 조세특례제한법 30조·같은 법 시행령 27조, 소득세법 59조 3항의 현행
              규정(기준일 2026-08-31)에 따른 참고용 근사 계산입니다. 감면 요건(업종·연령·
              경력단절 요건 등) 판정과 경정청구는 개인별 사실관계에 따라 달라질 수 있으므로,
              최종 확인은 홈택스 또는 세무 전문가 상담을 권합니다.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/smb-income-tax-break" />
        </div>
      </main>
    </>
  );
}
