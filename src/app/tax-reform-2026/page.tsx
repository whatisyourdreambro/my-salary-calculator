// src/app/tax-reform-2026/page.tsx
// 2026 세법개정안 선점 페이지 — 7월 말 발표 예정(2027년 시행분).
// 포지셔닝: /tax-changes-2026 = "2026년에 달라진 세금"(작년 개정 시행분),
//           /tax-reform-2026  = "2026년 세법개정안"(발표 전 정리 + 발표 후 즉시 갱신).

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, ArrowRight, Calculator, FileText, TrendingUp } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 세법개정안 — 7월 말 발표 예정, 무엇이 담기고 월급 세금은 어떻게 되나",
  description:
    "2026년 세법개정안(2027년 시행분) 발표 일정과 보도 기준 예상 내용 정리. 다주택자 종부세율 인상 등 부동산 세제가 중심으로 거론되고, 직장인 소득세 과표는 크게 안 바뀔 가능성. 발표 즉시 이 페이지에서 갱신합니다.",
  path: "/tax-reform-2026",
  ogType: "article",
  publishedTime: "2026-07-16",
  keywords: [
    "2026 세법개정안",
    "세법개정안",
    "2026년 세법개정안 발표",
    "세법개정안 발표 언제",
    "세법개정안 내용",
    "종부세 개편",
    "공정시장가액비율",
    "장기보유특별공제 개편",
    "소득세 과표 개편",
    "2027년 세금",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2026 세법개정안은 언제 발표되나요?",
    answer:
      "재정경제부(옛 기획재정부)가 7월 말 발표를 준비 중이라고 부총리가 밝혔습니다. 다만 구체적인 발표 날짜는 아직 공표되지 않았습니다. 참고로 작년 세법개정안은 7월 31일에 발표됐고, 12월 2일 국회 의결을 거쳐 대부분 올해 1월 1일부터 시행됐습니다. 올해도 비슷한 일정이 유력하며, 발표 즉시 이 페이지에 내용을 정리합니다.",
  },
  {
    question: "직장인 소득세 과표나 근로소득공제도 바뀌나요?",
    answer:
      "이번 개정안에서는 크게 바뀌지 않을 가능성이 높다는 보도가 나오고 있습니다. 정부가 소득세 과표의 물가연동에 반대 입장인 것으로 알려져, 과표 구간·근로소득공제의 대폭 개편은 담기지 않을 것이라는 관측입니다. 즉 '월급에서 떼는 세금'은 이번 발표로 크게 달라지지 않을 전망입니다. 다만 발표 전까지는 어떤 항목도 확정이 아니므로, 발표 후 이 페이지에서 확정 내용을 확인하세요.",
  },
  {
    question: "세법개정안이 제 연말정산에는 언제 영향을 주나요?",
    answer:
      "이번에 발표될 개정안은 국회 의결을 거쳐 대부분 2027년 1월 1일부터 시행되는 것이 통상 패턴입니다. 즉 2027년에 번 소득부터 적용되어 2028년 초 연말정산에 처음 반영됩니다. 올해 소득(2026년분)에 대한 연말정산은 이미 시행 중인 작년 개정 확정분(신용카드 자녀 추가 한도, 출산·보육수당 비과세 월 20만원 등)이 적용됩니다.",
  },
  {
    question: "종합부동산세는 어떻게 바뀌나요?",
    answer:
      "다주택자 종부세율 인상과 공정시장가액비율(현행 60%) 상향이 거론되고 있다고 보도됐습니다. 다만 모두 발표 전 관측 단계로 확정된 내용이 아닙니다. 현행 종부세 기본공제는 인별 9억원(1세대 1주택자 12억원)이며, 개정안이 발표·의결되기 전까지는 현행 기준이 그대로 적용됩니다.",
  },
  {
    question: "유산취득세(상속세 개편)는 시행되나요?",
    answer:
      "아직 시행되지 않았습니다. 정부가 2028년 시행을 목표로 추진했으나 관련 법안은 국회 계류 중입니다. 현행 상속·증여세는 일괄공제 5억원, 최고세율 50% 체계가 그대로 유지되고 있습니다. 이번 세법개정안에 관련 내용이 다시 담길지는 발표를 확인해야 합니다.",
  },
];

// 2부 — 보도 기준 예상 내용 (전부 미확정, 발표 시 교체)
const REPORTED_ITEMS = [
  {
    title: "다주택자 종부세율 인상",
    detail:
      "이번 개정안의 중심은 부동산 세제가 될 것으로 보도되고 있습니다. 다주택자에 대한 종합부동산세율 인상이 거론됩니다.",
    tag: "부동산",
  },
  {
    title: "종부세 공정시장가액비율 상향",
    detail:
      "현행 60%인 공정시장가액비율을 올리는 방안이 거론된다고 보도됐습니다. 비율이 오르면 세율이 그대로여도 종부세 부담이 커집니다.",
    tag: "부동산",
  },
  {
    title: "양도세 장기보유특별공제 실거주 중심 재편",
    detail:
      "보유 기간 위주였던 장기보유특별공제를 실거주 중심으로 재편하는 방안이 거론된다고 보도됐습니다.",
    tag: "부동산",
  },
  {
    title: "지방 근무 근로자 소득세 감면 확대",
    detail:
      "지방에서 근무하는 근로자의 소득세 감면을 확대하는 방안을 검토한다는 발언이 보도됐습니다. 구체 대상·감면 폭은 미공개입니다.",
    tag: "근로소득",
  },
];

export default function TaxReform2026Page() {
  return (
    <main className="min-h-screen bg-canvas pb-20 pt-28">
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "홈", path: "/" },
            { name: "2026 세법개정안", path: "/tax-reform-2026" },
          ]),
          faqLd(FAQ_ITEMS),
          articleLd({
            title: "2026 세법개정안 — 발표 일정·예상 내용·직장인 영향 총정리",
            description:
              "7월 말 발표 예정인 2026년 세법개정안(2027년 시행분)의 일정과 보도 기준 예상 내용, 이미 시행 중인 작년 확정분과의 구분 정리",
            slug: "tax-reform-2026",
            url: "/tax-reform-2026",
            publishedDate: "2026-07-16",
            modifiedDate: "2026-07-16",
          }),
          speakableLd({
            url: "/tax-reform-2026",
            cssSelectors: [".faq-answer"],
          }),
        ]}
      />

      <div className="page-width">
        <div className="text-center mb-12">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electric-10 text-electric font-bold text-sm mb-6">
            <Calendar className="w-4 h-4" />
            7월 말 발표 예정 · 발표 즉시 이 페이지 갱신
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 세법개정안 <span className="text-electric">발표 전 총정리</span>
          </h1>
          <PublishedMeta publishedDate="2026-07-16" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            2026년 세법개정안은 <strong>2027년부터 시행될 세금 규칙</strong>을 담는
            발표입니다. 언제 나오는지, 무엇이 담길 것으로 보도되는지, 그리고 직장인
            월급 세금은 어떻게 되는지를 발표 전 기준으로 정리했습니다.
          </p>
          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            🔎 이미 <strong>올해(2026년)에 시행 중인</strong> 세법 변경이 궁금하다면{" "}
            <Link
              href="/tax-changes-2026"
              className="text-electric font-bold hover:underline"
            >
              2026 세법 변경사항 페이지
            </Link>
            를 확인하세요.
          </p>
        </div>

        {/* 1부 — 언제 발표되나 */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-navy mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-electric" />
            언제 발표되나 — 7월 말 예정
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            재정경제부(옛 기획재정부 — 부처명이 변경됐습니다)가 <strong>7월 말 발표를
            준비 중</strong>이라고 부총리가 밝혔습니다. 구체적인 발표 날짜는 아직
            공표되지 않았습니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            일정을 가늠하려면 작년 패턴이 참고가 됩니다. 작년 세법개정안은{" "}
            <strong>7월 31일 발표 → 12월 2일 국회 의결 → 대부분 올해 1월 1일
            시행</strong>의 순서로 진행됐습니다. 올해 발표분도 국회를 통과하면
            대부분 2027년 1월 1일부터 시행되는 흐름이 유력합니다.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                step: "1단계 · 정부 발표",
                desc: "7월 말 예정 (작년은 7/31)",
                highlight: true,
              },
              {
                step: "2단계 · 국회 의결",
                desc: "연말 (작년은 12/2)",
                highlight: false,
              },
              {
                step: "3단계 · 시행",
                desc: "대부분 2027년 1월 1일",
                highlight: false,
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-4 rounded-2xl border ${
                  item.highlight
                    ? "bg-electric-10 border-electric"
                    : "bg-white border-canvas-200"
                }`}
              >
                <p className="text-xs font-bold text-electric mb-1">{item.step}</p>
                <p className="text-sm font-bold text-navy">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2부 — 무엇이 담길까 (보도 기준, 전부 미확정) */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-navy mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-electric" />
            무엇이 담길까 — 보도로 거론되는 내용
          </h2>
          <p className="text-xs text-faint-blue mb-4">
            ⚠️ 아래 항목은 전부 <strong>발표 전 보도 기준</strong>이며 확정된 내용이
            아닙니다. 발표 시 이 페이지에서 확정 내용으로 갱신합니다.
          </p>
          <div className="space-y-3">
            {REPORTED_ITEMS.map((item) => (
              <div
                key={item.title}
                className="p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-blue leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-canvas text-faint-blue text-xs font-bold">
                    {item.tag} · 미확정
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 검색 의도 핵심 답변 — 직장인 월급 세금 */}
          <div className="mt-6 p-6 bg-electric-5 rounded-3xl border-2 border-electric">
            <p className="text-xs font-bold text-electric mb-2">
              가장 많이 묻는 질문
            </p>
            <h3 className="text-lg sm:text-xl font-black text-navy mb-3">
              그래서 직장인 월급 세금은? — 크게 안 바뀔 가능성
            </h3>
            <p className="text-sm leading-7 text-muted-blue">
              직장인에게 직접 영향을 주는 <strong>소득세 과표 구간과
              근로소득공제는 이번 개정안에서 크게 바뀌지 않을 가능성</strong>이
              높다는 보도가 나오고 있습니다. 정부가 소득세 과표의 물가연동에 반대
              입장인 것으로 알려져 있기 때문입니다. 즉 이번 발표의 중심은 부동산
              세제이고, 월급에서 원천징수되는 세금 구조는 그대로일 전망입니다.
              물론 이 역시 발표 전 관측이므로, 발표 내용이 나오면 즉시 여기에
              반영하겠습니다.
            </p>
          </div>
        </section>

        {/*
          ─────────────────────────────────────────────────────────
          [발표 후 갱신 슬롯]
          재정경제부의 2026 세법개정안 공식 발표(7월 말 예정) 직후:
          1) 이 자리에 "발표 내용 정리" 섹션을 신설해 확정 항목별 표로 정리
          2) 위 REPORTED_ITEMS의 '미확정' 태그를 확정/제외로 교체
          3) metadata의 modifiedTime·PublishedMeta updatedDate·articleLd
             modifiedDate를 발표 반영일로 갱신
          ─────────────────────────────────────────────────────────
        */}

        <InArticleAd />

        {/* 3부 — 이미 2026년에 시행 중인 것들 */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-navy mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric" />
            혼동 주의 — 이미 2026년에 시행 중인 것들
          </h2>
          <p className="text-sm leading-7 text-muted-blue mb-4">
            아래는 <strong>작년 개정으로 확정되어 올해부터 시행 중</strong>인
            내용입니다. 이번 7월 발표(2027년 시행분)와 헷갈리기 쉬우니 구분해서
            보세요. 올해 소득에 대한 연말정산에는 아래 항목이 적용됩니다.
          </p>
          <div className="space-y-3">
            {[
              {
                title: "신용카드 소득공제 자녀 추가 한도",
                detail:
                  "자녀 1명이면 +50만원, 2명 이상이면 +100만원의 공제 한도가 추가됩니다 (총급여 7천만원 초과자는 절반).",
              },
              {
                title: "출산·보육수당 비과세",
                detail: "자녀 1인당 월 20만원까지 비과세 적용됩니다.",
              },
              {
                title: "교육비 세액공제 확대",
                detail:
                  "자녀의 소득요건이 폐지됐고, 9세 미만 자녀의 예체능 학원비도 공제 대상에 포함됩니다.",
              },
              {
                title: "월세 세액공제 — 주말부부 각자 신청",
                detail:
                  "주말부부는 각자 월세 세액공제를 신청할 수 있습니다 (부부합산 한도 연 1,000만원).",
              },
              {
                title: "배당소득 분리과세 신설 (2026~2028 한시)",
                detail:
                  "배당성향 40% 이상 고배당 상장사의 현금배당 직접투자분이 대상입니다 (ETF·펀드 제외). 세율은 2천만원 이하 14%, 2천만~3억원 20%, 3억~50억원 25%, 50억원 초과 30%.",
              },
              {
                title: "증권거래세 인상",
                detail:
                  "코스피 0% → 0.05%(농어촌특별세 포함 실질 0.20%), 코스닥 0.15% → 0.20%로 인상됐습니다.",
              },
              {
                title: "상장주식 대주주 기준 — 종목당 50억원 유지",
                detail:
                  "종목당 50억원 기준이 유지됩니다. 10억원으로 강화하는 안은 2025년 9월 철회됐습니다.",
              },
              {
                title: "상속·증여세 — 현행 유지",
                detail:
                  "일괄공제 5억원·최고세율 50%의 현행 체계가 유지됩니다. 유산취득세는 정부가 2028년 시행을 목표로 추진했으나 국회 계류 중으로, 아직 시행되지 않았습니다.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <h3 className="font-bold text-navy text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-blue leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-faint-blue mt-4">
            ※ 올해 시행분 전체 목록과 결혼·출산 공제 등 상세 내용은{" "}
            <Link
              href="/tax-changes-2026"
              className="text-electric font-bold hover:underline"
            >
              2026 세법 변경사항
            </Link>
            에서 확인하세요.
          </p>
        </section>

        {/* CTA */}
        <Link
          href="/year-end-tax"
          className="block mb-12 p-6 sm:p-8 bg-electric rounded-3xl text-white hover:bg-blue-600 transition-colors group"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold opacity-90 mb-2">
                올해 소득분은 현행 세법 적용
              </p>
              <h3 className="text-xl sm:text-2xl font-black mb-2">
                내 연말정산 환급금 미리 계산하기
              </h3>
              <p className="text-sm opacity-90">
                이미 시행 중인 공제 항목 기준으로 환급·추납 예상액 확인
              </p>
            </div>
            <Calculator className="w-12 h-12 opacity-50 group-hover:opacity-80 transition-opacity flex-shrink-0" />
          </div>
        </Link>

        {/* FAQ */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-black text-navy mb-6">
            2026 세법개정안 자주 묻는 질문
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
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        <RelatedCalculators currentPath="/tax-reform-2026" />

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="2026 세법개정안 — 발표 일정·예상 내용 총정리"
            description="7월 말 발표 예정. 부동산 세제 중심 거론, 직장인 월급 세금은 크게 안 바뀔 전망"
          />
        </div>

        <div className="mt-8">
          <HomeTopAd />
        </div>
      </div>
    </main>
  );
}
