// /calc/bonus-home-plan — 성과급 내 집 마련 계산기 (2026-09-27 신설, 운영자 요청)
// 삼성전자 DS·SK하이닉스 성과급을 영업이익 시나리오(가정)로 5년(2027~2031년 지급분) 누적하고, 한국부동산원 시·구
// 아파트 중위가격과 DSR·LTV·주담대 한도로 몇 년 뒤 살 수 있는지 계산한다. 정적(○) 라우트 — 본문 숫자는 빌드 때
// 스냅숏(src/data/marketSnapshot.json)·엔진(src/lib/bonusHome/*)에서 만든다. 런타임 외부 요청 없음.
// 광고 순서는 /calc/pension-hike-2027 과 같다: Client(입력 → 결과 → CalcResultAd → 상세) → 본문 → InArticleAd → FAQ → GuideMidAd → 안내 → 관련 계산기.
// ★ 갱신 체크포인트: 매월 16일 이후 시세 스냅숏(npx tsx scripts/fetch-market-snapshot.ts) · 10월 말 3분기 실적(기본 규칙 재검토) ·
//   1~2월 삼성 OPI·SK PS 발표 · 2026-12-31 지방 스트레스 금리 유예 종료 · 규제지역 변경 · 4월 사업보고서.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { buildToolMetadata } from "@/lib/seo";
import { autoBreadcrumbLd, datasetLd, faqLd, softwareApplicationLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import RelatedCalculators from "@/components/RelatedCalculators";
import { GuideMidAd, InArticleAd } from "@/components/AdPlacement";
import { Home, Info } from "lucide-react";
import { HOME_REGIONS } from "@/data/homePriceRegions";
import { buildPlan, DEFAULT_PLAN_STATE, fmtEokShort, fmtManwon, fmtTril, MARKET_SNAPSHOT } from "@/lib/bonusHome/plan";
import { companyScenarioOps, h1Tril, RULE_SCENARIO_IDS, SCENARIO_RULES } from "@/lib/bonusHome/scenarios";
import { SAMSUNG_OP_HISTORY, SK_OP_HISTORY } from "@/lib/bonusHome/opActuals";
import { LOAN_RULE_SOURCES, LOAN_RULES_AS_OF } from "@/lib/bonusHome/loanRules";
import { SAMSUNG_WAGE_2026, skPs } from "@/lib/bonusHome/compEngines";
import BonusHomePlanClient from "./Client";

const PATH = "/calc/bonus-home-plan";
const NAME = "성과급 내 집 마련 계산기";
const asOfLabel = MARKET_SNAPSHOT.rone.monthLabel; // "2026년 8월" — 월 갱신 때 메타만 바뀐다
const roneMonthIso = `${MARKET_SNAPSHOT.rone.month.slice(0, 4)}-${MARKET_SNAPSHOT.rone.month.slice(4, 6)}`;

// 빌드 시 예시 숫자 — 계산기 기본값(삼성전자 DS 메모리·연봉 8천만·화성시 동탄구·모은 돈 0·저축 30%·기본 시나리오)
const example = buildPlan(DEFAULT_PLAN_STATE);
const ex2027 = example.comp.years[0];
const exampleRegion = example.region;
const skPsBase1eok = skPs(companyScenarioOps("sk", "base")[0], 100_000_000);

const FAQ_ITEMS = [
  {
    question: "삼성 특별경영성과급은 언제 현금화되나요?",
    answer:
      "2026년 5월 27일 타결된 임금협약 보도에 따르면 DS부문 특별경영성과급은 세후 전액을 자사주로 받습니다. 3분의 1은 받는 즉시 팔 수 있고, 나머지 3분의 1씩은 1년·2년 잠금 뒤 풀립니다. 첫 지급은 2026년 실적분으로 2027년 1월입니다. 계산기는 잠긴 주식을 풀리는 해에만 쓸 수 있는 돈으로 보고, '잠금 주식도 자산에 포함'을 켜면 잠긴 몫까지 자산에 넣습니다. 2031년 이후에 풀리는 몫은 '이후 수령분'으로 따로 보여 줍니다.",
  },
  {
    question: "SK하이닉스 PS 이연분은 어떻게 계산하나요?",
    answer:
      "2026년 9월 16일 가결된 임단협 보도 기준으로 2026년 실적분 PS부터 다음 해 2월 현금 50%, 4월 자사주 30%(즉시 매도 가능), 그다음 두 해에 자사주 10%씩을 받습니다. 계산기는 받는 해의 연봉에 더해 세금을 계산하고, 이연 자사주 가치에는 주가 변동 가정(기본 0%)을 곱합니다. 2025년분 PS(2026년 2월 지급)는 옛 방식이라 2027·2028년에 이연 현금 10%씩이 더해집니다.",
  },
  {
    question: "집값 기준은 무엇이고 언제 갱신되나요?",
    answer: `한국부동산원 전국주택가격동향조사의 '(월) 중위매매가격_아파트' 시·군·구 값입니다(국가승인통계, 현재 ${asOfLabel} 기준). 특정 단지 시세가 아니라 그 시·구 아파트 거래가격의 중간값입니다. 통계는 다음 달 중순쯤 공표되고, 계산기는 매월 16일 이후 새 달 값으로 갱신합니다. 관심 단지가 있으면 '직접 입력 가격'에 넣어 계산할 수 있습니다.`,
  },
  {
    question: "대출 한도가 은행 상담 결과와 다를 수 있는 이유는?",
    answer:
      "계산기는 DSR 40%, 스트레스 금리(수도권·규제지역 3.0%p, 지방 0.75%p, 변동금리 기준), 무주택 LTV(규제지역 40%·그 외 70%), 수도권·규제지역 주담대 한도(시가 15억 이하 6억 등)만 적용합니다. 실제 심사는 은행마다 소득 인정 방식(성과급 반영 여부·기간), 금리 유형(혼합·주기형은 스트레스 가산이 더 작음), 신용·기존 대출, 생애최초·정책대출 여부에 따라 달라집니다. 규제 기준일은 " + LOAN_RULES_AS_OF + "입니다.",
  },
  {
    question: "증권사 전망을 쓰지 않는 이유는?",
    answer:
      "증권사 실적 예상은 유료로 제공되는 데이터이고, 예측을 계산기 숫자처럼 보여 주면 확정된 것처럼 오해하기 쉽습니다. 이 계산기는 DART에 공시된 상반기 확정 영업이익에 누구나 확인할 수 있는 규칙(×1.5·×2·매년 ×0.7·×1.1)을 곱한 시나리오(가정)만 씁니다. 연도별 값은 '직접' 시나리오에서 원하는 숫자로 바꿀 수 있습니다.",
  },
];

export const metadata: Metadata = buildToolMetadata({
  name: NAME,
  tagline: "5년 누적 성과급·DSR로 동탄·평택·이천 집값 비교",
  description: `성과급 내 집 마련 계산기. 삼성전자 DS·SK하이닉스 성과급을 영업이익 시나리오(가정)로 5년간 세후 누적하고, 한국부동산원 아파트 중위가격(${asOfLabel})과 DSR·LTV 한도로 수원 영통·동탄·기흥·평택·이천·청주에서 몇 년 뒤 집을 살 수 있는지 계산합니다.`,
  path: PATH,
  keywords: ["성과급 내집마련", "성과급 집 사기", "삼성전자 성과급 아파트", "SK하이닉스 성과급 집", "동탄 아파트 중위가격", "평택 아파트 가격", "이천 아파트 가격", "DSR 대출 한도"],
});

const TH = "px-2 py-2 text-left text-xs font-bold text-faint-blue";
const TD = "px-2 py-2 text-sm text-muted-blue dark:text-canvas-300";

export default function BonusHomePlanPage() {
  return (
    <>
      <JsonLd
        data={[
          softwareApplicationLd({
            name: NAME,
            description: "삼성전자 DS·SK하이닉스 성과급 5년 누적(시나리오 가정)과 한국부동산원 아파트 중위가격·DSR 한도로 구매 가능 연도를 계산합니다.",
            url: PATH,
          }),
          autoBreadcrumbLd(PATH, { leafName: NAME }),
          faqLd(FAQ_ITEMS),
          datasetLd({
            name: "반도체 사업장 인근 시·구 아파트 중위 매매가격",
            description: `한국부동산원 전국주택가격동향조사 (월) 중위매매가격_아파트 — ${HOME_REGIONS.map((r) => r.label).join("·")} ${asOfLabel} 값`,
            url: PATH,
            citation: { name: "한국부동산원 전국주택가격동향조사 (월) 중위매매가격_아파트", url: "https://www.reb.or.kr/r-one/" },
            temporalCoverage: roneMonthIso,
            dateModified: MARKET_SNAPSHOT.fetchedAt,
          }),
        ]}
      />
      <main className="min-h-screen pb-32 pt-24 px-4 font-sans bg-canvas dark:bg-canvas-950">
        <div className="max-w-3xl mx-auto">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-5 bg-electric-10 text-electric border border-electric-30">
              <Home size={12} /> 한국부동산원 {asOfLabel} 중위가격
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3 text-navy dark:text-canvas-50" style={{ letterSpacing: "-0.04em" }}>
              {NAME}
            </h1>
            <p className="text-lg font-medium text-muted-blue dark:text-canvas-300 break-keep">
              성과급 5년 누적 + DSR·LTV 한도 — <strong className="text-electric">몇 년 뒤 살 수 있나</strong>
            </p>
          </header>

          <BonusHomePlanClient />

          <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-10 mt-10">
            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">성과급 5년 누적, 이렇게 계산합니다</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              실적 연도 2026~2030년 성과급을 받는 해(2027~2031년)에 맞춰 더하고, 받는 해 연봉에 합산해 세금(연간 결정세액 차이)과
              4대보험을 뺍니다. 삼성전자 DS는 OPI(연봉의 {DEFAULT_PLAN_STATE.opi1Pct}% — 2025년분 DS부문 공통 실지급률, 보도 기준)와
              특별경영성과급(영업이익 10.5% 재원, 2026~28년 200조·2029년부터 100조 미만이면 0), TAI(월 기본급 × 2026년 상반기 지급률,
              연 2회)를 더합니다. SK하이닉스는 PS(영업이익 10% ÷ 직원 34,549명 × 연봉/1억)와 PI(반기마다 기본급 × PI%)입니다.
              연봉은 삼성 {SAMSUNG_WAGE_2026.totalPct}%(2026 임금협약 {SAMSUNG_WAGE_2026.basePct}% + 성과 평균 {SAMSUNG_WAGE_2026.meritAvgPct}%),
              SK 6.3%씩 오른다고 가정합니다.
            </p>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>
                삼성전자 메모리·연봉 8천만원·기본 시나리오(가정): 2027년 성과급 세전 {fmtEokShort(ex2027.gross)}(특별경영성과급 {fmtEokShort(ex2027.components[1].gross)} 포함),
                세후 {fmtEokShort(ex2027.net)}(공제율 약 {Math.round(ex2027.effRate)}%)
              </li>
              <li>같은 조건·기본 시나리오(가정)의 5년 누적 세후 성과급 {fmtEokShort(example.comp.fiveYearNet)}, {exampleRegion.label} 중위가격 기준 구매 가능 {example.afford.buyYear ? `${example.afford.buyYear}년 말` : "2031년까지 불가"}(모은 돈 0원·월 저축 30%)</li>
              <li>SK하이닉스 연봉 1억·기본 시나리오(가정): 2026년 실적분 PS 세전 {fmtEokShort(skPsBase1eok)}</li>
            </ul>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">영업이익 시나리오는 전망이 아닙니다</h2>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              영업이익은 DART에 공시된 2026년 상반기 확정 실적(삼성전자 {fmtTril(h1Tril("samsung"))}, SK하이닉스 {fmtTril(h1Tril("sk"))})에
              정해진 규칙을 곱한 시나리오(가정)입니다. 증권사 컨센서스·전망이 아닙니다. 계산기의 &lsquo;직접&rsquo; 시나리오에서 해마다 바꿀 수 있습니다.
            </p>
            <div className="not-prose overflow-x-auto mb-4">
              <table className="w-full min-w-[560px] rounded-xl bg-white dark:bg-canvas-900">
                <thead>
                  <tr className="border-b border-canvas-200 dark:border-canvas-800">
                    <th className={TH}>시나리오(가정)</th>
                    <th className={TH}>규칙</th>
                    <th className={TH}>삼성전자 2026~2030 (조)</th>
                    <th className={TH}>SK하이닉스 2026~2030 (조)</th>
                  </tr>
                </thead>
                <tbody>
                  {RULE_SCENARIO_IDS.map((id) => (
                    <tr key={id} className="border-b border-canvas-100 dark:border-canvas-800">
                      <td className={`${TD} font-bold`}>{SCENARIO_RULES[id].label}(가정)</td>
                      <td className={TD}>{SCENARIO_RULES[id].ruleText}</td>
                      <td className={`${TD} tabular-nums`}>{companyScenarioOps("samsung", id).join(" · ")}</td>
                      <td className={`${TD} tabular-nums`}>{companyScenarioOps("sk", id).join(" · ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              과거 실적(참고, DART 연결 영업이익) — SK하이닉스 {SK_OP_HISTORY.filter((h) => h.label.endsWith("연간")).map((h) => `${h.label.slice(0, 4)}년 ${fmtTril(h.tril)}`).join(", ")},
              2026년 상반기 {fmtTril(h1Tril("sk"))}. 삼성전자 {SAMSUNG_OP_HISTORY.map((h) => `${h.label} ${fmtTril(h.tril)}`).join(", ")}.
              삼성은 보수 시나리오(가정)에서 2027년 실적부터 특별경영성과급 조건(200조) 아래로 내려가 그 뒤 지급분이 0이 됩니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">지역 아파트 중위가격 — 한국부동산원 {asOfLabel}</h2>
            <div className="not-prose overflow-x-auto mb-4">
              <table className="w-full min-w-[620px] rounded-xl bg-white dark:bg-canvas-900">
                <thead>
                  <tr className="border-b border-canvas-200 dark:border-canvas-800">
                    <th className={TH}>시·구</th>
                    <th className={TH}>중위가격</th>
                    <th className={TH}>평균가격</th>
                    <th className={TH}>규제</th>
                    <th className={TH}>주요 사업장</th>
                  </tr>
                </thead>
                <tbody>
                  {HOME_REGIONS.map((r) => {
                    const v = MARKET_SNAPSHOT.rone.regions[r.id];
                    return (
                      <tr key={r.id} className="border-b border-canvas-100 dark:border-canvas-800">
                        <td className={`${TD} font-bold`}>{r.label}<span className="block text-[11px] font-normal text-faint-blue">CLS {r.rOneClsId}</span></td>
                        <td className={`${TD} tabular-nums`}>{fmtEokShort(v.median)}</td>
                        <td className={`${TD} tabular-nums`}>{fmtEokShort(v.mean)}</td>
                        <td className={TD}>{r.regulated ? "규제지역" : r.capitalArea ? "수도권 비규제" : "지방"}</td>
                        <td className={TD}>{r.workplace}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
              출처: 한국부동산원 전국주택가격동향조사, {asOfLabel} — (월) 중위매매가격_아파트·평균매매가격_아파트(시·군·구). 전국 아파트 중위가격은
              {" "}{fmtEokShort(MARKET_SNAPSHOT.rone.nationalMedian)}입니다. 중위가격은 그 시·구 아파트 가격을 줄 세운 가운데 값으로, 특정 단지 시세가 아닙니다.
              청주시는 구별 통계가 없어 시 전체 값입니다. 화성시 동탄구·용인시 기흥구는 2026년 7월 1일부터 규제지역입니다.
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">대출 한도: DSR 40%·스트레스 금리·LTV·주담대 한도</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>DSR 40% — 직전 연도 총급여(연봉 + 받은 성과급)로 연 원리금 상환액이 40%를 넘지 않는 원금. 금리에 스트레스 가산(수도권·규제지역 3.0%p, 지방 0.75%p, 변동금리 기준)을 더해 계산합니다.</li>
              <li>LTV — 무주택자 규제지역 40%, 그 외 70%.</li>
              <li>주담대 금액 한도 — 수도권·규제지역 시가 15억 이하 6억, 15억 초과~25억 4억, 25억 초과 2억. 만기 30년 이내.</li>
              <li>대출 가능액 = 세 한도 중 가장 작은 값이며, 계산기에 어느 제약이 묶였는지 함께 표시합니다. 기본 금리는 한국은행 ECOS 예금은행 주택담보대출 금리 {MARKET_SNAPSHOT.ecos.ratePct}%({MARKET_SNAPSHOT.ecos.monthLabel}, 신규취급액)입니다.</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed text-sm">
              근거(대출 규제 기준일 {LOAN_RULES_AS_OF}):{" "}
              {LOAN_RULE_SOURCES.map((src, i) => (
                <span key={src.url}>
                  {i > 0 ? " · " : ""}
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-electric font-bold hover:underline">{src.label}</a> ({src.date})
                </span>
              ))}
            </p>

            <h2 className="text-2xl font-black text-navy dark:text-canvas-50 mt-8 mb-4">이 계산기가 하지 않는 것</h2>
            <ul className="space-y-2 text-muted-blue dark:text-canvas-300">
              <li>증권사 실적 예상이나 주가 시세를 쓰지 않습니다 — 주가는 잠금·이연 주식에 곱하는 가정(기본 0%)뿐입니다.</li>
              <li>단지별 실거래가·호가를 쓰지 않습니다 — 시·구 아파트 중위가격만 씁니다(관심 단지는 직접 입력).</li>
              <li>생애최초·디딤돌·보금자리 등 정책대출, 다주택·갈아타기, 전세 낀 매수, 중개보수·등기 비용은 넣지 않습니다.</li>
              <li>2026년 남은 기간의 저축과 12월 TAI·PI는 판정에 넣지 않습니다(보수적) — 이미 모은 돈에 포함해 입력하세요.</li>
              <li>2027년 이후 세법·4대보험 요율·대출 규제 변화, 개인 인사평가에 따른 성과급 차이는 반영하지 않습니다.</li>
            </ul>
            <p className="text-muted-blue dark:text-canvas-300 leading-relaxed">
              회사별 계산 근거는{" "}
              <Link href="/calc/samsung-bonus" className="text-electric font-bold hover:underline">삼성전자 성과급 계산기</Link>와{" "}
              <Link href="/calc/sk-hynix-bonus" className="text-electric font-bold hover:underline">SK하이닉스 성과급 계산기</Link>에서, 대출은{" "}
              <Link href="/tools/real-estate/dsr" className="text-electric font-bold hover:underline">DSR 계산기</Link>에서 자세히 볼 수 있습니다.
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

          {/* FAQ 직하 광고 */}
          <GuideMidAd />

          <div className="rounded-2xl p-5 mb-8 flex gap-3 bg-electric-5 border border-electric-20">
            <Info size={18} className="text-electric flex-shrink-0 mt-1" />
            <p className="text-xs text-muted-blue dark:text-canvas-300 leading-relaxed">
              투자·부동산·대출 자문이 아닌 가정 기반 계산입니다. 영업이익은 시나리오(가정), 성과급 제도는 보도 기준, 집값은 한국부동산원
              {" "}{asOfLabel} 시·구 중위가격, 대출 규제는 {LOAN_RULES_AS_OF} 기준입니다. 실제 성과급은 회사 공지로, 대출 한도는 은행 심사로
              확정됩니다. 월 상환액 예시는 {fmtManwon(example.afford.repayment.monthlyPayment)}({exampleRegion.label}·기본값) 수준입니다.
            </p>
          </div>

          <RelatedCalculators currentPath={PATH} />
        </div>
      </main>
    </>
  );
}
