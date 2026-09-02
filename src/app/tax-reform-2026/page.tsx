// src/app/tax-reform-2026/page.tsx
// 2026 세법개정안(정부 공식 명칭: 2026년 세제개편안) — 2026.8.3 확정 발표 반영.
// 포지셔닝: /tax-changes-2026 = "2026년에 달라진 세금"(작년 개정 시행분),
//           /tax-reform-2026  = "2026년 세법개정안"(8/3 발표 내용 + 국회 의결 후 재갱신).
// 출처: 재정경제부 보도자료 「2026년 세제개편안 발표」(2026.8.3) +
//       뉴스핌·서울경제·파이낸셜뉴스 2026.8.3 보도. 전 항목 국회 통과 필요.

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Calendar, ArrowRight, Calculator, FileText, TrendingUp } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import PublishedMeta from "@/components/PublishedMeta";
import { breadcrumbLd, faqLd, articleLd, speakableLd } from "@/lib/structuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import { InArticleAd, HomeTopAd, CalcResultAd, GuideMidAd, MultiplexAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = buildPageMetadata({
  title: "2026 세법개정안 확정 발표 — 8월 3일 세제개편안 내용·직장인 영향 총정리",
  description:
    "2026년 세법개정안(2026 세제개편안)이 8월 3일 확정 발표됐습니다. 소득세 과표·세율은 그대로, 부양가족 인적공제 소득요건 300만원 완화·월세 세액공제 한도 1,200만원·종부세 실거주 공제 14억 차등화 등 직장인 영향 총정리. 국회 통과 시 대부분 2027년 시행.",
  path: "/tax-reform-2026",
  ogType: "article",
  publishedTime: "2026-07-16",
  modifiedTime: "2026-08-07",
  keywords: [
    "2026 세법개정안",
    "2026 세제개편안",
    "세법개정안",
    "세제개편안 내용",
    "2026년 세법개정안 발표",
    "세법개정안 내용",
    "종부세 개편",
    "공정시장가액비율",
    "장기보유특별공제 개편",
    "인적공제 소득요건 300만원",
    "2027년 세금",
  ],
});

const FAQ_ITEMS = [
  {
    question: "2026 세법개정안(세제개편안)은 언제 발표됐나요?",
    answer:
      "재정경제부(옛 기획재정부)가 2026년 8월 3일 세제발전심의위원회 전체회의를 열어 「2026년 세제개편안」을 확정 발표했습니다. 8월 4~20일 입법예고와 9월 1일 국무회의를 거쳐 9월 3일 이전에 정기국회에 제출되며, 국회를 통과하면 대부분 2027년 1월 1일부터 시행되는 것이 통상 패턴입니다. 국회 의결 결과는 확정되는 대로 이 페이지에 반영합니다.",
  },
  {
    question: "직장인 소득세 과표나 근로소득공제도 바뀌나요?",
    answer:
      "이번 발표에는 소득세 과세표준 구간·세율 조정이 담기지 않았습니다. 즉 월급에서 원천징수되는 세금 구조는 그대로입니다. 대신 부양가족 인적공제 소득요건 완화(연 100만→300만원), 월세 세액공제 한도 확대(연 1,000만→1,200만원) 등 연말정산 공제를 넓히는 개정안이 담겼습니다. 모두 국회 통과가 필요하며, 통과 시 2027년 소득분부터 적용될 예정입니다.",
  },
  {
    question: "세법개정안이 제 연말정산에는 언제 영향을 주나요?",
    answer:
      "이번 개정안은 국회 의결을 거쳐 대부분 2027년 1월 1일부터 시행되는 것이 통상 패턴입니다. 즉 2027년에 번 소득부터 적용되어 2028년 초 연말정산에 처음 반영됩니다. 올해 소득(2026년분)에 대한 연말정산은 이미 시행 중인 작년 개정 확정분(신용카드 자녀 추가 한도, 출산·보육수당 비과세 월 20만원 등)이 적용됩니다.",
  },
  {
    question: "종합부동산세는 어떻게 바뀌나요?",
    answer:
      "1세대 1주택 기본공제를 실거주 14억원·비거주 9억원으로 차등화하고, 세율 체계를 주택 수 기준에서 주택가액 기준으로 일원화하며(과세표준 6~12억원 구간 1.0%→1.3%), 공정시장가액비율을 1주택 70%·다주택 단계적 80%로 올리는 내용이 발표됐습니다. 모두 국회 통과가 필요하며, 통과 전까지는 현행 기준(기본공제 인별 9억원·1세대 1주택 12억원, 공정시장가액비율 60%)이 그대로 적용됩니다.",
  },
  {
    question: "유산취득세(상속세 개편)는 시행되나요?",
    answer:
      "아직 시행되지 않았습니다. 정부가 2028년 시행을 목표로 추진했으나 관련 법안은 국회 계류 중입니다. 현행 상속·증여세는 일괄공제 5억원, 최고세율 50% 체계가 그대로 유지되고 있습니다.",
  },
];

// 2부-1 — 직장인·연말정산 관련 발표 내용 (2026.8.3 확정 발표, 전 항목 국회 통과 필요)
const WORKER_ITEMS = [
  {
    title: "부양가족 인적공제 소득요건 100만 → 300만원 완화",
    detail:
      "배우자·부양가족 기본공제(1인당 150만원)의 소득금액 요건을 연 100만원 이하에서 300만원 이하로 올립니다. 근로소득만 있는 가족은 총급여 500만원 이하 → 750만원 이하로 완화됩니다. 파트타임으로 일하는 배우자·부모님이 공제 대상에 새로 들어올 수 있어, 직장인 연말정산에 체감이 가장 큰 항목입니다.",
    tag: "연말정산",
  },
  {
    title: "월세 세액공제 한도 연 1,000만 → 1,200만원",
    detail:
      "세액공제 대상 월세액 한도가 연 1,000만원에서 1,200만원으로 늘어납니다. 청년은 2027~2029년 3년간 총급여 수준과 관계없이 17% 공제율을 적용받습니다.",
    tag: "주거",
  },
  {
    title: "전세대출 원리금 소득공제 — 무주택 부부 각각 적용",
    detail:
      "주택임차차입금 원리금 상환액 소득공제를 무주택 부부가 각각 적용받을 수 있게 됩니다. 부부합산 공제한도는 연 400만원입니다.",
    tag: "주거",
  },
  {
    title: "출산·보육 비과세 확대",
    detail:
      "회사가 지급하는 출산지원금 비과세가 임신 기간 중 지급분까지 넓어지고, 위탁아동 보육수당도 월 20만원까지 비과세가 적용됩니다.",
    tag: "가족",
  },
  {
    title: "지방 이주수당 비과세 신설",
    detail:
      "지방으로 이주한 근로자가 받는 이주수당에 월 20만원(비수도권 우대지역은 월 50만원) 비과세를 3년간 적용합니다. 발표 전 '지방 근무 소득세 감면 확대'로 거론되던 항목이 이 형태로 발표됐습니다.",
    tag: "근로소득",
  },
  {
    title: "근로장려금(EITC) 최대 360만원으로 확대",
    detail:
      "최대지급액이 단독 165→180만원, 홑벌이 285→310만원, 맞벌이 330→360만원으로 오르고, 소득요건도 단독 2,200→2,600만원, 홑벌이 3,200→3,700만원, 맞벌이 4,400→5,200만원으로 완화됩니다. 수혜 가구는 416만 → 489만 가구로 약 73만 가구 늘어날 전망입니다.",
    tag: "근로소득",
  },
];

// 2부-2 — 부동산 세제 발표 내용 (2026.8.3 확정 발표, 전 항목 국회 통과 필요)
const REALESTATE_ITEMS = [
  {
    title: "종부세 1주택 기본공제 — 실거주 14억·비거주 9억 차등화",
    detail:
      "1세대 1주택 기본공제(현행 12억원)를 실제 거주하면 14억원으로 올리고, 거주하지 않으면 9억원으로 낮춥니다. '실거주 여부'가 종부세의 핵심 기준이 됩니다.",
    tag: "종부세",
  },
  {
    title: "종부세 과세체계 — 주택 수 → 주택가액 기준 일원화",
    detail:
      "세율 체계를 주택 수 기준에서 주택가액 기준으로 일원화하고, 과세표준 6~12억원 구간 세율을 1.0%에서 1.3%로 올립니다. 세부담상한은 150%에서 200%로 상향합니다.",
    tag: "종부세",
  },
  {
    title: "공정시장가액비율 60% → 70~80% 상향",
    detail:
      "1세대 1주택·지방 2주택 이하는 2027년부터 60%에서 70%로, 다주택자는 단계적으로 80%까지 올립니다. 세율이 같아도 종부세 과세표준 자체가 커집니다. 발표 전 '상향 거론' 단계였던 항목이 수치로 확정 발표됐습니다.",
    tag: "종부세",
  },
  {
    title: "양도세 장기보유특별공제 — 실거주 중심 재편",
    detail:
      "보유 기간 위주였던 장기보유특별공제를 실제 거주 기간 중심으로 재편합니다. 발표 전 거론되던 방향이 그대로 발표에 담겼습니다.",
    tag: "양도세",
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
            title: "2026 세법개정안(세제개편안) 확정 발표 — 내용·직장인 영향 총정리",
            description:
              "2026년 8월 3일 확정 발표된 2026년 세제개편안(2027년 시행분)의 직장인·연말정산·부동산 세제 내용과 국회 일정, 이미 시행 중인 작년 확정분과의 구분 정리",
            slug: "tax-reform-2026",
            url: "/tax-reform-2026",
            publishedDate: "2026-07-16",
            modifiedDate: "2026-08-07",
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
            8월 3일 확정 발표 · 국회 의결 시 이 페이지 갱신
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-navy mb-4">
            2026 세법개정안 <span className="text-electric">발표 내용 총정리</span>
          </h1>
          <PublishedMeta publishedDate="2026-07-16" updatedDate="2026-08-07" className="mb-2" />
          <p className="text-base sm:text-lg text-muted-blue leading-relaxed max-w-2xl mx-auto">
            2026년 세법개정안(정부 공식 명칭: <strong>2026년 세제개편안</strong>)이
            8월 3일 확정 발표됐습니다. 무엇이 담겼는지, 직장인 월급 세금과
            연말정산에는 어떤 영향이 있는지 발표 내용 기준으로 정리했습니다. 모든
            항목은 <strong>국회 통과 전 개정안</strong>입니다.
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

        {/* 1부 — 언제 발표됐나 */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-navy mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-electric" />
            언제 발표됐나 — 8월 3일 확정 발표
          </h2>
          <p className="text-sm leading-7 text-muted-blue">
            재정경제부(옛 기획재정부)는 <strong>2026년 8월 3일</strong>{" "}
            세제발전심의위원회 전체회의를 열어 「2026년 세제개편안」을
            확정·발표했습니다. 당초 7월 말로 예고됐던 발표가 8월 초로 소폭
            순연된 것입니다.
          </p>
          <p className="text-sm leading-7 text-muted-blue mt-4">
            이후 일정은 <strong>8월 4~20일 입법예고 → 9월 1일 국무회의 → 9월 3일
            이전 정기국회 제출</strong> 순입니다. 국회를 통과하면 대부분 2027년
            1월 1일부터 시행되는 것이 통상 패턴입니다(작년 개정안은 12월 2일
            의결). 국회 심의 과정에서 내용이 수정·제외될 수 있으므로, 아래 모든
            항목은 아직 확정이 아닙니다.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                step: "1단계 · 정부 발표",
                desc: "8월 3일 발표 완료",
                highlight: true,
              },
              {
                step: "2단계 · 국회 심의",
                desc: "9월 초 제출 → 연말 의결",
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

        <CalcResultAd />

        {/* 2부 — 무엇이 담겼나 (8/3 발표 내용, 전 항목 국회 통과 필요) */}
        <section className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black text-navy mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-electric" />
            무엇이 담겼나 — 8월 3일 발표 내용
          </h2>
          <p className="text-xs text-faint-blue mb-4">
            ⚠️ 아래 항목은 8월 3일 정부 발표 기준이며, 전부{" "}
            <strong>개정안 — 국회 통과 필요</strong> 상태입니다. 국회 심의에서
            수정·제외될 수 있고, 의결 결과는 이 페이지에서 갱신합니다.
          </p>

          <h3 className="text-base font-black text-navy mb-3 mt-6">
            직장인·연말정산 관련
          </h3>
          <div className="space-y-3">
            {WORKER_ITEMS.map((item) => (
              <div
                key={item.title}
                className="p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-navy text-base mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-blue leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-canvas text-faint-blue text-xs font-bold">
                    {item.tag} · 국회 통과 필요
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-base font-black text-navy mb-3 mt-8">
            부동산 세제 — 실거주 중심 개편
          </h3>
          <div className="space-y-3">
            {REALESTATE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="p-5 bg-white rounded-2xl border border-canvas-200"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-navy text-base mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-blue leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                  <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-canvas text-faint-blue text-xs font-bold">
                    {item.tag} · 국회 통과 필요
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
              그래서 직장인 월급 세금은? — 과표·세율 조정 없음
            </h3>
            <p className="text-sm leading-7 text-muted-blue">
              이번 세제개편안에는 <strong>소득세 과세표준 구간·세율 조정이
              담기지 않았습니다.</strong> 월급에서 원천징수되는 세금 구조는
              그대로입니다. 발표 전 &lsquo;크게 안 바뀔 것&rsquo;이라던 관측이 발표에서도
              그대로 확인된 셈입니다. 대신 부양가족 인적공제 소득요건 완화, 월세
              세액공제 확대처럼 <strong>연말정산 공제를 넓히는 방향</strong>의
              항목들이 담겼습니다 — 모두 국회 통과 시 2027년 소득분부터 적용될
              예정입니다.
            </p>
          </div>

          <p className="mt-6 inline-block text-xs text-canvas-700 px-4 py-2 bg-canvas-100 rounded-xl border border-canvas-200">
            📚 출처:{" "}
            <a
              href="https://mofe.go.kr/nw/nes/detailNesDtaView.do?searchBbsId1=MOSFBBS_000000000028&searchNttId1=MOSF_000000000078809&menuNo=4010100"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric font-bold hover:underline"
            >
              재정경제부 「2026년 세제개편안 발표」 보도자료 (2026.8.3)
            </a>{" "}
            · 뉴스핌·서울경제·파이낸셜뉴스 2026.8.3 보도
          </p>
        </section>

        {/*
          ─────────────────────────────────────────────────────────
          [국회 의결 후 갱신 슬롯]
          정기국회 의결(예년 기준 12월 초) 직후:
          1) WORKER_ITEMS·REALESTATE_ITEMS의 '국회 통과 필요' 태그를
             확정/수정/제외로 교체하고 의결일 명시
          2) metadata modifiedTime·PublishedMeta updatedDate·articleLd
             modifiedDate를 의결 반영일로 갱신
          3) 시행 시기가 항목별로 확정되면 각 detail에 반영
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
            내용입니다. 이번 8월 발표(2027년 시행분)와 헷갈리기 쉬우니 구분해서
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

        <GuideMidAd />

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
        {/* 관련 링크 직후 멀티플렉스(관련 콘텐츠형) — 전면 최적화 (운영자 지시 2026-09-02) */}
        <MultiplexAd />

        <div className="mt-8 max-w-3xl mx-auto">
          <ShareButtons
            title="2026 세법개정안 확정 발표 — 내용·직장인 영향 총정리"
            description="8월 3일 발표. 소득세 과표는 그대로, 인적공제·월세공제 확대, 종부세 실거주 중심 개편"
          />
        </div>

        <div className="mt-8">
          <HomeTopAd />
        </div>
      </div>
    </main>
  );
}
