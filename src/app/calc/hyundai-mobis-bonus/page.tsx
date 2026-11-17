// src/app/calc/hyundai-mobis-bonus/page.tsx
//
// 현대모비스 임단협 성과급·격려금 계산기.
// 2025 타결(2025-10-17): 성과금 450% + 격려금 1,420만 + 기본급 10만 인상 + 우리사주 17주 + 재래시장상품권 20만.
// 현대차그룹 연동형 — 현대차 타결 수준(2025: 450%+1,580만)을 거의 그대로 따라가는 패턴.
// 2026년분 타결(2026-11-18 다시 확인한 공개 출처):
//   - 더팩트 2026-08-26 (네이트 게재본 https://m.news.nate.com/view/20260826n34942): 잠정합의안 — 기본급 10만원 인상·
//     성과급 400%+1,320만원·주식 8주·복지포인트 50만원.
//   - 더팩트 2026-09-04 https://news.tf.co.kr/read/ogmeta/2361989.htm: '곧바로 올해 임단협을 마무리했다'.
//   - DART 2026-10-30 주요사항보고서(자기주식처분결정) https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20261030000571:
//     2026년 단체교섭에 따른 회사주식 지급 — 96,136주, 처분 예정일 2026-11-30, 처분 상대방 회사 직원,
//     직원 계좌 입고 또는 우리사주조합 출연(4년 의무예탁) 중 선택, 처분가 353,000원은 10/29 종가.
//   찬반투표 찬성률 보도는 찾지 못해 쓰지 않는다. 현대차 2026: 8/31 가결·9/1 보도(400%+1,270만·주식 15주).
//   운영자 승인 2026-11-17(N2-calc-19): Client.tsx 기본 시나리오를 2026 타결로(버튼 수 유지), 광고 위 배지·소개·
//   합의 구조 상자·안내 상자·출처 문구는 같은 폭 이하로 교체(src/lib/__tests__/r4MobisSettled2026.test.ts).
//   성과급 허브 카드·회사 페이지 계산기 안내(N2-data-09)는 승인 전이라 '2025 타결' 그대로 둔다.

import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { CURRENT_RATES_YEAR } from "@/config/currentRates";
import Link from "@/components/AppLink";
import {
  softwareApplicationLd,
  autoBreadcrumbLd,
  faqLd,
} from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import BonusClusterLinks from "@/components/BonusClusterLinks";
import { InArticleAd, CalcResultAd, GuideMidAd } from "@/components/AdPlacement";
import BonusNextLinks from "@/components/BonusNextLinks";
import CoupangBanner from "@/components/CoupangBanner";
import { Cog, AlertTriangle, Info } from "lucide-react";
import HyundaiMobisBonusClient from "./Client";
import ShareButtons from "@/components/ShareButtons";
import FavoritesButton from "@/components/FavoritesButton";
import { staticRouteLastModified } from "@/app/sitemap";

const SITE_URL = "https://www.moneysalary.com";
const SITE_NAME = "머니샐러리";
const PAGE_PATH = "/calc/hyundai-mobis-bonus";
const PAGE_TITLE = "현대모비스 성과급 계산기 2026";
const PAGE_TITLE_FULL = `${PAGE_TITLE} | ${SITE_NAME}`;
const PAGE_DESC =
  "현대모비스 임단협 성과급·격려금 계산기. 본인 기본급(월)만 입력하면 2026 타결안 성과금 400% + 격려금 1,320만원 + 주식 8주 + 포인트 50만원 합산 세전·세후 실수령액이 즉시. 2026 타결 + 2025 타결 시나리오 비교, 주식 11/30 지급(DART 공시) 반영.";

const FAQ_ITEMS = [
  {
    question: "현대모비스 성과급은 어떻게 결정되나요?",
    answer:
      "현대모비스는 별도 산식을 공표하지 않고, 매년 임금협상(임단협) 타결로 '성과금 기본급 N% + 격려금 정액 + 주식' 패키지가 결정됩니다. 같은 그룹 현대차의 타결 수준을 거의 그대로 따라가는 패턴으로, 현대차가 2025년 450% + 1,580만원에 타결하자 모비스도 450% + 1,420만원으로 타결했습니다 (전자신문·서울경제·아주경제, 2025-10-17 보도).",
  },
  {
    question: "2025년 임단협 타결 내용은 무엇인가요?",
    answer:
      "2025년 10월 17일 타결된 합의는 성과금 450% + 격려금 1,420만원 + 기본급 10만원 인상 + 우리사주 17주 + 재래시장상품권 20만원입니다 (전자신문·서울경제·아주경제 2025-10-17, 뉴스웍스 보도). 지급은 타결 직후 일괄 + 연말 격려금 분할(2024년 사례) 방식이 관행입니다.",
  },
  {
    question: "2024년에는 얼마를 받았나요?",
    answer:
      "2024년 7월 9일 잠정합의 기준 성과금·격려금 총 500% + 1,520만원 + 주식 36주 + 우리사주출연 리워드 100~150만원입니다. 세부 구성은 경영성과금 400% + 1,000만원(체결 즉시), 핵심경영목표 달성 격려금 100% + 주식 11주(12월), 글로벌 수주확대 격려금 500만원 + 주식 20주(9월말), 타결 합의 주식 5주(9월말)입니다 (머니S 단독, 2024-07-09 보도).",
  },
  {
    question: "현대차와 현대모비스 성과급 차이는?",
    answer:
      "정률(%) 부분은 사실상 동일하게 움직입니다. 2025년 기준 현대차 450% + 1,580만원 vs 모비스 450% + 1,420만원으로 정액 격려금이 160만원 적었습니다 (현대차 타결값은 머니투데이 2026-05-06 등 다수 매체 인용). 주식 지급도 현대차는 무상주, 모비스는 우리사주 17주(2025년)로 형태·수량이 다릅니다. 2026년에는 둘 다 성과금 400%로 같고, 정액은 현대차 1,270만원·모비스 1,320만원, 주식은 현대차 15주·모비스 8주입니다(머니투데이·한국경제 2026-09-01, 더팩트 2026-08-26 보도).",
  },
  {
    question: "2026년 성과급은 언제 결정되나요?",
    answer:
      "2026년분은 이미 타결됐습니다. 모비스 임협은 현대차 타결 이후 순차적으로 결정되는 패턴으로, 2026년 현대차 임협은 8월 31일 조합원 찬반투표 가결로 타결됐습니다(성과금 400%+1,270만원·주식 15주, 머니투데이·한국경제 2026-09-01 보도). 더팩트 2026-08-26 보도에 따르면 모비스 노사는 기본급 10만원 인상, 성과급 400%+1,320만원, 주식 8주, 복지포인트 50만원을 담은 잠정합의안을 마련했고, 더팩트 2026-09-04 보도에 따르면 곧바로 올해 임단협을 마무리했습니다. 회사는 2026-10-30 DART 주요사항보고서(자기주식 처분 결정)에서 2026년 단체교섭에 따른 회사주식 지급용 자기주식 96,136주를 2026-11-30 직원에게 처분할 예정이라고 공시했습니다.",
  },
  {
    question: "주식 8주는 얼마인가요?",
    answer:
      "지급 시점의 현대모비스 주가에 따라 달라집니다. 본 계산기는 주가를 직접 입력받아 '주식 수 × 주가'로 평가액을 계산합니다. 2026-10-30 DART 공시에 적힌 처분가 353,000원은 이사회 전날(10월 29일) 종가 기준이라 실제 지급일 주가와 다를 수 있습니다. 같은 공시 기준 주식은 직원 개인 증권계좌로 받거나 우리사주조합에 출연하는 방식 중 하나로 지급되고, 우리사주조합에 출연한 주식은 4년 동안 의무예탁됩니다. 인출 가능 시점을 사내 공지로 확인하세요. 지급 시점 시가 기준으로 근로소득 과세되는 것이 원칙입니다.",
  },
  {
    question: "현대모비스 평균 연봉은 얼마인가요?",
    answer:
      "사업보고서 기준 FY2025 평균 1억 3,700만원으로, 전년(FY2024 1억 3,500만원) 대비 200만원(+1.5%) 늘었습니다 (포쓰저널, 2026-03-09 보도). 사무·연구·생산직이 합산된 평균이라 직군·연차별 편차는 큽니다. 자세한 직급별 수준은 '현대모비스 연봉·복지 DB' 페이지를 참고하세요.",
  },
  {
    question: "성과금 세금은 어떻게 계산되나요?",
    answer:
      "성과금·격려금·정액 보너스 모두 근로소득에 합산되어 누진세율(6~45%) + 지방세(소득세의 10%) + 4대보험이 부과됩니다. 우리사주·주식 지급분은 시가 기준 근로소득으로 과세되며 매도 시점이 아닌 지급 시점에 과세됩니다. 본 계산기는 연봉 합산 전후 세금 차이를 성과급에 귀속시키는 marginal 방식으로 계산합니다.",
  },
  {
    question: "이 계산기 결과를 어디까지 신뢰할 수 있나요?",
    answer:
      "본 계산기는 2026년 임단협 타결 보도(더팩트 2026-08-26·2026-09-04)와 DART 자기주식 처분 공시(2026-10-30), 2025년 10월 임단협 타결 보도(전자신문·서울경제·아주경제·뉴스웍스) 기반 추정 모델입니다. 2024년 7월 잠정합의 보도(머니S 단독)는 '최근 지급 연혁' 표에만 씁니다. 실제 지급은 직군·근속·평가에 따라 차이 날 수 있고, 주식 평가액은 지급 시점 주가에 따라 달라집니다. 정확한 본인 케이스는 사내 급여 명세서로 확인하세요.",
  },
];

export const metadata: Metadata = {
  // canonical/OG/twitter/robots/hreflang은 buildPageMetadata(src/lib/seo.ts) 정본으로 생성 —
  // 수기 canonical 드리프트 방지. 기존 출력값은 유지되고 헬퍼 자동 필드만 추가된다.
  ...buildPageMetadata({
    title: PAGE_TITLE,
    description: PAGE_DESC,
    path: PAGE_PATH,
  }),
  // 페이지 고유 키워드 — 헬퍼의 DEFAULT_KEYWORDS 병합으로 기존 keywords 출력이
  // 바뀌지 않도록 기존 값 그대로 override.
  keywords: [
    "현대모비스 성과급",
    "현대모비스 성과금",
    "모비스 성과급",
    "현대모비스 임단협",
    "현대모비스 격려금",
    "현대모비스 우리사주",
    "현대모비스 성과급 계산기",
    "현대모비스 성과급 2026",
    "현대모비스 보너스",
    "현대모비스 연봉",
  ],
};

export default function HyundaiMobisBonusPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "현대모비스 성과급" }),
          softwareApplicationLd({
            name: PAGE_TITLE,
            description: PAGE_DESC,
            url: `${SITE_URL}${PAGE_PATH}`,
            dateModified: staticRouteLastModified(PAGE_PATH),
          }),
          faqLd(FAQ_ITEMS),
        ]}
      />

      <main className="w-full min-h-screen bg-canvas pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <Cog className="w-3.5 h-3.5" />
              2026 임단협 타결 반영 + 주식 11/30 지급
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
              현대모비스 성과급 계산기 <span className="text-primary">2026</span>
            </h1>
            <p className="text-base sm:text-lg text-faint-blue leading-relaxed max-w-3xl">
              임단협 타결 기준 본인 기본급만 입력하면{" "}
              <strong>성과금 400% + 격려금 1,320만 + 주식 8주 + 포인트 50만</strong>{" "}
              합산 세전·세후 실수령액이 즉시 계산됩니다.
            </p>
            <div className="mt-5">
              <ShareButtons title={PAGE_TITLE_FULL} description={PAGE_DESC} />
            </div>
            <div className="mt-4 flex justify-center"><FavoritesButton /></div>
          </header>

          <HyundaiMobisBonusClient />

          <div className="mt-8">
            <CalcResultAd />
            <BonusNextLinks slug="hyundai-mobis-bonus" />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">현대모비스 임단협 합의 구조</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <article className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
                <h3 className="font-bold mb-2 text-lg">📋 2025년 타결 (실제 지급)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 10만원 인상</li>
                  <li>• 성과금 <strong>450%</strong></li>
                  <li>• 격려금 <strong>1,420만원</strong></li>
                  <li>• 우리사주 <strong>17주</strong></li>
                  <li>• 재래시장상품권 <strong>20만원</strong></li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  2025-10-17 타결. 현대차 타결(450% + 1,580만) 직후 순차 합의
                  (전자신문·서울경제·아주경제 보도).
                </p>
              </article>
              <article className="rounded-xl border border-canvas-deep p-5 bg-canvas/30">
                <h3 className="font-bold mb-2 text-lg">📢 2026 임단협 (타결)</h3>
                <ul className="space-y-1 text-sm leading-relaxed">
                  <li>• 기본급 월 <strong>10만원</strong> 인상</li>
                  <li>• 성과금 <strong>400%</strong> + 격려금 <strong>1,320만원</strong></li>
                  <li>• 주식 <strong>8주</strong>(11/30 지급)·복지포인트 50만원</li>
                  <li>• 현대차 8/31 <strong>가결</strong>(성과금 400%·1,270만, 주식 15주)</li>
                </ul>
                <p className="text-xs text-faint mt-2">
                  더팩트 2026-08-26·09-04 보도, 주식 지급은 DART 10/30 공시.
                </p>
              </article>
            </div>
          </section>

          <div className="mt-10">
            <GuideMidAd />
          </div>

          <section className="mt-12 rounded-2xl border border-canvas-deep bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-black mb-4">최근 지급 연혁</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-canvas-deep text-left">
                    <th className="py-2 pr-4 font-bold whitespace-nowrap">연도</th>
                    <th className="py-2 pr-4 font-bold">합의 내용</th>
                    <th className="py-2 font-bold whitespace-nowrap">출처</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-b border-canvas-deep/60">
                    <td className="py-2.5 pr-4 font-bold whitespace-nowrap">2025</td>
                    <td className="py-2.5 pr-4 leading-relaxed">
                      성과금 <strong>450%</strong> + 격려금 <strong>1,420만원</strong> + 기본급 10만원 인상 +
                      우리사주 17주 + 재래시장상품권 20만원
                    </td>
                    <td className="py-2.5 text-xs text-faint whitespace-nowrap">
                      전자신문·서울경제·아주경제
                      <br />
                      2025-10-17
                    </td>
                  </tr>
                  <tr className="border-b border-canvas-deep/60">
                    <td className="py-2.5 pr-4 font-bold whitespace-nowrap">2024</td>
                    <td className="py-2.5 pr-4 leading-relaxed">
                      성과금·격려금 총 <strong>500%</strong> + <strong>1,520만원</strong> + 주식 36주 +
                      우리사주출연 리워드 100~150만원 (경영성과금 400%+1,000만 즉시 / 핵심경영목표 100%+11주 12월 /
                      글로벌 수주확대 500만+20주 9월말 / 타결 합의 5주 9월말)
                    </td>
                    <td className="py-2.5 text-xs text-faint whitespace-nowrap">
                      머니S 단독
                      <br />
                      2024-07-09
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-bold whitespace-nowrap">참고</td>
                    <td className="py-2.5 pr-4 leading-relaxed">
                      현대차 2025년 타결: 성과금 450% + 1,580만원 — 모비스 타결의 벤치마크
                    </td>
                    <td className="py-2.5 text-xs text-faint whitespace-nowrap">
                      머니투데이
                      <br />
                      2026-05-06 인용
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-faint">
              평균 연봉: FY2025 사업보고서 기준 1억 3,700만원, 전년 대비 +200만원(+1.5%)
              (포쓰저널, 2026-03-09).
            </p>
          </section>

          <div className="mt-10">
            <InArticleAd />
          </div>

          <section className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-black mb-6">자주 묻는 질문</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-xl border border-canvas-deep bg-white p-5 open:bg-canvas/30"
                >
                  <summary className="cursor-pointer font-bold text-base list-none flex items-start gap-3">
                    <span className="text-primary mt-0.5">Q.</span>
                    <span className="flex-1">{item.question}</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-faint pl-7">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <aside className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="block mb-1 text-amber-900">⚠️ 추정 시뮬레이터입니다</strong>
                <span className="text-amber-800">
                  2026년 임단협 타결 보도·DART 공시 + 2025년 10월 타결 공개 보도 기반 추정.
                  실제 지급은 직군·근속·평가에 따라 차이 가능하며, 주식 평가액은 지급
                  시점 주가에 따라 달라집니다.
                </span>
              </span>
            </p>
          </aside>

          <section className="mt-10 grid sm:grid-cols-2 gap-4">
            <Link
              href="/calc/hyundai-bonus"
              className="block rounded-xl border-2 border-primary/30 bg-primary/5 p-5 hover:bg-primary/10 transition"
            >
              <p className="text-xs font-bold text-primary mb-1">📊 비교 계산기</p>
              <p className="font-black text-lg">현대차 성과급 계산기 →</p>
              <p className="text-sm text-faint mt-1">450% + 1,580만 + 무상주 30주</p>
            </Link>
            <Link
              href="/salary-db/hyundai-mobis"
              className="block rounded-xl border border-canvas-deep p-5 hover:bg-canvas/40 transition"
            >
              <p className="text-xs font-bold text-faint mb-1">📋 회사 정보</p>
              <p className="font-black text-lg">현대모비스 연봉·복지 DB →</p>
              <p className="text-sm text-faint mt-1">직급별 평균 연봉, 복지·워라밸 전체</p>
            </Link>
          </section>

          <div className="mt-10">
            <CoupangBanner responsive={{ mobile: "square", desktop: "rectangle" }} />
          </div>

          <BonusClusterLinks currentSlug="hyundai-mobis-bonus" />

          <RelatedCalculators
            currentPath={PAGE_PATH}
            limit={4}
            title="다음 계산기도 함께 보세요"
          />

          <footer className="mt-10 text-xs text-faint border-t border-canvas-deep pt-5">
            <p className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>데이터 출처</strong>: 2025년 10월 현대모비스 임단협 타결
                (전자신문·서울경제·아주경제 2025-10-17, 뉴스웍스), 2024년 7월 잠정합의
                (머니S 단독 2024-07-09), 현대차 2025 타결 벤치마크(머니투데이 2026-05-06 인용),
                평균연봉 FY2025 사업보고서(포쓰저널 2026-03-09). {CURRENT_RATES_YEAR} 세법 반영.
                2026년분 임단협은 타결(2026-09 보도).
              </span>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
