// /calc/offer-compare — 이직 오퍼 실수령 비교 (2026-08-31 신설, P9)
// 기존 완성 기능 SalaryComparator(홈 비교 탭)의 색인 가능 URL화.
// ★비교 엔진 신설 금지 — Client.tsx가 SalaryComparator 정본을 그대로 임베드.
// ★키워드 축: "이직 오퍼 비교"·"오퍼 실수령 비교"·"연봉 오퍼 비교"만.
//   "연봉 협상 계산기"=/salary-raise-2026, "중소 대기업 비교"=/company/simulator,
//   회사 간 비교=/salary-db/compare 소유 — 본문에서 상호링크로 차별화.
// 갱신 슬롯: 2027-01 — 4대보험 요율·간이세액표 개정 시 본문 "2026년 기준" 문구
//   기준연도 갱신 (계산 자체는 src/lib/calculator.ts 단일 엔진이라 자동 반영).

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { softwareApplicationLd, autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { GitCompare, Info } from "lucide-react";
import OfferCompareClient from "./Client";

const FAQ_ITEMS = [
  {
    question: "왜 계약 연봉이 아니라 월 실수령액으로 비교해야 하나요?",
    answer:
      "국민연금·건강보험(장기요양 포함)·고용보험과 근로소득세는 소득 구간에 따라 공제액이 달라지는 구조라, 계약 연봉이 오른 만큼 실수령액이 그대로 오르지 않습니다. 또 비과세 식대나 부양가족 수 같은 조건에 따라 같은 연봉이라도 통장에 들어오는 금액이 달라집니다. 이 계산기는 모든 오퍼에 동일한 공통 설정(비과세액·부양가족·자녀)을 적용해 2026년 기준 월 실수령액으로 순위를 매기므로, 조건이 다른 오퍼를 같은 잣대로 비교할 수 있습니다.",
  },
  {
    question: "성과급(변동 상여)은 어떤 칸에 어떻게 입력하나요?",
    answer:
      "계약서에 금액이 확정된 고정 상여는 '성과금(연)' 칸에 그대로 입력하면 됩니다. 반면 실적에 따라 달라지는 변동 성과급은 회사가 제시한 기대치가 아니라 최근 실제 지급된 수준을 보수적으로 넣는 것이 안전합니다. 채용 과정에서 안내되는 '최대 지급률'은 보장 금액이 아니므로, 변동분을 0으로 둔 시나리오와 실적 기준 시나리오를 각각 오퍼로 추가해 두 경우를 모두 비교해 보는 방법을 권합니다.",
  },
  {
    question: "사이닝보너스는 어떻게 비교에 반영하나요?",
    answer:
      "사이닝보너스는 근로소득으로 합산 과세되며, 일정 기간 내 중도 퇴사 시 반환(일부 또는 전부) 조항이 붙는 것이 일반적입니다. 1회성 금액이므로 매년 반복되는 연 단위 총보상과 섞지 말고 분리해서 판단하는 것이 원칙입니다. 실제 세부담과 반환 조건은 계약서 문구와 개인 상황에 따라 달라지므로, 구체적인 금액 판단이 필요하면 계약서의 반환 조항을 확인하고 필요시 세무·노무 전문가와 상담하세요.",
  },
  {
    question: "오퍼는 몇 개까지 비교할 수 있나요?",
    answer:
      "최소 2개부터 최대 10개까지 비교할 수 있습니다. 오퍼마다 회사명·계약 연봉·성과금·기타 수당을 따로 입력하고, 비과세액(월)·부양가족·20세 이하 자녀는 공통 설정으로 모든 오퍼에 동일하게 적용됩니다. 결과는 월 실수령액이 높은 순으로 정렬되며, 1위(BEST) 오퍼 대비 나머지 오퍼의 월 차액이 함께 표시되고 결과 화면은 이미지로 저장할 수 있습니다.",
  },
  {
    question: "실수령액 외에 오퍼에서 더 확인할 것은 무엇인가요?",
    answer:
      "숫자로 환산되지 않는 조건이 장기적으로는 더 클 수 있습니다. 대표적으로 퇴직금 산정 기준(기본급 기준인지 총보상 기준인지), 연봉 인상 주기와 재원, 성과급의 지급 근거(영업이익 연동 여부), 스톡옵션·RSU 같은 주식 보상, 복지포인트·주거지원 등입니다. 이 계산기는 현금성 보상의 세후 비교만 담당하므로, 나머지 조건은 처우 안내서(오퍼 레터)의 문구를 기준으로 별도로 따져보세요.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: "이직 오퍼 실수령 비교 계산기",
  tagline: "오퍼 최대 10개, 월 실수령액 순위 비교",
  description:
    "이직 오퍼를 최대 10개까지 등록해 계약 연봉·성과금·기타 수당을 합친 총보상 기준 월 실수령액 순위와 BEST 오퍼 대비 차액을 한 번에 비교합니다. 2026년 4대보험·소득세 기준, 비과세액·부양가족 공통 적용.",
  path: "/calc/offer-compare",
  keywords: ["이직 오퍼 비교", "오퍼 실수령 비교", "연봉 오퍼 비교", "오퍼 비교 계산기", "이직 오퍼 실수령액"],
});

const NEXT_LINKS = [
  {
    href: "/salary-raise-2026",
    title: "연봉 인상 시뮬레이터",
    desc: "재직 중 인상률별 실수령 변화 — 협상 목표치 잡기",
  },
  {
    href: "/company/simulator",
    title: "기업 규모 점프 시뮬레이터",
    desc: "중소→대기업 이동 시 보상 격차 시뮬레이션",
  },
  {
    href: "/salary-db",
    title: "기업 연봉 데이터베이스",
    desc: "지원할 회사의 공시 기준 평균 연봉 확인",
  },
  {
    href: "/guides/job-change-salary-jump-2026",
    title: "이직으로 연봉 30% 점프하는 법",
    desc: "이직 타이밍과 직군별 평균 인상률 가이드",
  },
  {
    href: "/guides/salary-negotiation-script-2026",
    title: "연봉 협상 실전 스크립트",
    desc: "오퍼 받은 직후 1주일 안에 쓰는 대화법",
  },
];

export default function OfferComparePage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: "이직 오퍼 실수령 비교 계산기",
            description:
              "이직 오퍼 최대 10개의 총보상을 동일 조건으로 월 실수령액 순위 비교하고 BEST 오퍼 대비 차액을 계산합니다.",
            url: "/calc/offer-compare",
          }),
          autoBreadcrumbLd("/calc/offer-compare", { leafName: "이직 오퍼 실수령 비교" }),
          faqLd(FAQ_ITEMS),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <GitCompare size={12} /> 최대 10개 오퍼 동시 비교
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              이직 오퍼 실수령 비교
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300">
              계약 연봉이 아니라 <strong className="text-electric">월 실수령액</strong>으로 오퍼 순위를 매기세요
            </p>
          </header>

          <OfferCompareClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">오퍼 비교의 기준은 총보상, 판단은 실수령액</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              두 오퍼의 계약 연봉이 500만원 차이라도, 4대보험과 근로소득세를 공제한 뒤의
              월 실수령액 차이는 그보다 작습니다. 소득이 커질수록 공제도 함께 커지는
              구조이기 때문입니다. 그래서 오퍼 비교는 <strong>기본급 + 확정 상여 + 고정
              수당을 합친 총보상</strong>을 같은 조건(비과세액·부양가족)으로 세후 환산해
              비교해야 왜곡이 없습니다. 이 페이지의 계산은 홈 연봉 계산기와 동일한 단일
              엔진으로 2026년 적용 4대보험 요율과 근로소득 간이세액 기준(국민연금공단·
              국민건강보험공단·국세청 고시)을 사용합니다. (기준일 2026-08-31)
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">총보상 비교 체크리스트 3가지</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                <strong>기본급 비중</strong> — 같은 총보상이라도 기본급이 큰 오퍼가 유리한
                경우가 많습니다. 연장수당·퇴직금 등 각종 산정의 출발점이 기본급 중심으로
                설계된 회사가 많기 때문입니다. 오퍼 레터에서 기본급과 상여의 구성비를
                반드시 확인하세요.
              </li>
              <li>
                <strong>고정 상여 vs 변동 성과급</strong> — 금액이 계약으로 확정된 상여만
                총보상에 그대로 넣고, 실적 연동 성과급은 최근 실제 지급 수준을 보수적으로
                반영하세요. &ldquo;최대 OO%&rdquo; 같은 상한 표기는 보장 금액이 아닙니다.
              </li>
              <li>
                <strong>변동성의 방향</strong> — 성과급 비중이 큰 오퍼는 좋은 해와 나쁜
                해의 편차가 큽니다. 변동분을 0으로 둔 시나리오를 별도 오퍼로 추가해
                &lsquo;최악의 해&rsquo; 기준 순위도 함께 확인하는 것이 안전합니다.
              </li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">사이닝보너스, 일반 원칙만 기억하세요</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              사이닝보너스는 <strong>근로소득으로 합산 과세</strong>되고, 약정 기간을
              채우지 못하고 퇴사하면 <strong>반환 조항이 적용되는 것이 일반적</strong>입니다.
              1회성 금액이므로 매년 반복되는 연 단위 총보상과는 분리해서 판단하고, 반환
              조건·기간은 계약서 문구가 기준입니다. 개인별 세부담은 상황에 따라 달라지므로
              이 페이지에서는 특정 세율이나 환산 공식을 제시하지 않습니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">이 계산기가 다루는 것, 다루지 않는 것</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              이 페이지는 <strong>내가 받은 오퍼들끼리의 세후 비교</strong> 전용입니다.
              재직 중인 회사에서 인상률을 협상할 때의 실수령 변화는{" "}
              <Link href="/salary-raise-2026" className="text-electric font-bold hover:underline">
                연봉 인상 시뮬레이터
              </Link>
              에서, 중소기업에서 대기업으로 옮길 때의 보상 격차 시뮬레이션은{" "}
              <Link href="/company/simulator" className="text-electric font-bold hover:underline">
                기업 규모 점프 시뮬레이터
              </Link>
              에서, 특정 회사끼리의 공시 연봉 비교(예: 네이버 vs 카카오)는{" "}
              <Link href="/salary-db/compare/naver-vs-kakao" className="text-electric font-bold hover:underline">
                기업 연봉 비교
              </Link>
              에서 확인할 수 있습니다. 오퍼 금액이 아직 없다면{" "}
              <Link href="/salary-db" className="text-electric font-bold hover:underline">
                기업 연봉 데이터베이스
              </Link>
              에서 지원할 회사의 공시 평균 연봉을 먼저 확인하세요.
            </p>
          </article>

          {/* 본문-FAQ 사이 광고 — 참조 페이지(/calc/ordinary-wage) 표준 배치 복제 */}
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

          {/* FAQ 직하 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
          <GuideMidAd />

          {/* 내부링크 — 광고 아래 배치 (신규 섹션은 항상 광고 아래 원칙) */}
          <section className="mb-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mb-5">다음 단계로 이동</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {NEXT_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-800 p-5 hover:border-electric transition-colors block"
                >
                  <div className="font-bold text-navy dark:text-canvas-50 mb-1">{link.title}</div>
                  <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">{link.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              실수령액은 2026년 적용 4대보험 요율과 근로소득 간이세액 기준의 참고용
              계산으로, 실제 급여는 회사의 급여 규정·비과세 항목 구성·연말정산 결과에
              따라 달라질 수 있습니다. 사이닝보너스 등 1회성 보상의 세부담과 반환 조건은
              계약서와 개인 상황에 따라 다르므로 필요시 세무·노무 전문가와 상담하세요.
            </p>
          </div>

          <RelatedCalculators currentPath="/calc/offer-compare" />
        </div>
      </main>
    </>
  );
}
