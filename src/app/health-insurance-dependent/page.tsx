// src/app/health-insurance-dependent/page.tsx
// 건강보험 피부양자 자격 판정기 — 11월 연례 재산정 시즌 대비 룰 판정형 페이지.
// 룰 정본: 국민건강보험법 시행규칙 별표 1의2 (2022-09 2단계 개편 후 현행, 2026-08 조회 검증).
// 갱신 슬롯: 매년 9~10월 — 별표1의2 기준 개정 확인(11월 재산정 전)

import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { AlertTriangle } from "lucide-react";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { autoBreadcrumbLd, faqLd, softwareApplicationLd, howToLd } from "@/lib/structuredData";
import { HomeTopAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import ShareButtons from "@/components/ShareButtons";
import HealthInsuranceDependentClient from "./Client";

export const metadata: Metadata = buildPageMetadata({
  title: "건강보험 피부양자 자격 판정기 — 소득 2,000만원·재산 5.4억 기준 1분 확인",
  description:
    "건강보험 피부양자 유지/탈락 즉시 판정. 연 소득 2,000만원·사업소득 요건·재산세 과세표준 5.4억(초과 시 9억까지 소득 1,000만원 조건)·형제자매 예외까지 별표 1의2 전체 분기 반영. 11월 연례 재산정 전에 미리 확인하세요.",
  path: "/health-insurance-dependent",
  keywords: [
    "피부양자 자격",
    "건강보험 피부양자",
    "피부양자 조건",
    "피부양자 소득요건",
    "피부양자 재산요건",
    "피부양자 탈락",
    "피부양자 자격상실",
    "지역가입자 전환",
    "피부양자 형제자매",
    "건강보험 피부양자 등록",
  ],
});

const FAQS = [
  {
    q: "건강보험 피부양자 소득요건은 어떻게 되나요?",
    a: "연간 합산소득(이자·배당·사업·근로·연금·기타소득의 합계)이 2,000만원 이하여야 합니다. 여기에 사업소득 요건이 추가로 적용됩니다. 사업자등록이 있는 경우에는 사업소득이 아예 없어야(0원) 하고, 사업자등록이 없는 경우(3.3% 원천징수 프리랜서 등)에는 사업소득이 연 500만원 이하여야 합니다. 하나라도 초과하면 초과 금액과 관계없이 피부양자에서 제외됩니다. 근거는 국민건강보험법 시행규칙 별표 1의2입니다.",
  },
  {
    q: "재산요건은 얼마까지 허용되나요?",
    a: "재산세 과세표준 합계가 5억 4,000만원 이하면 재산요건을 통과합니다. 5억 4,000만원 초과~9억원 이하 구간은 연간 합산소득이 1,000만원 이하인 경우에만 인정되고, 9억원을 초과하면 소득과 관계없이 탈락합니다. 기준이 되는 금액은 시가나 공시가격이 아니라 재산세 과세표준(공시가격에 공정시장가액비율을 곱한 값)으로, 매년 7월·9월 재산세 고지서나 위택스(wetax)에서 확인할 수 있습니다.",
  },
  {
    q: "누가 피부양자로 등록될 수 있나요? (부양요건)",
    a: "직장가입자의 배우자, 직계존속(부모·조부모, 배우자의 직계존속인 장인·장모·시부모 포함), 직계비속(자녀·손자녀, 배우자의 직계비속 포함)과 그 배우자(사위·며느리), 그리고 예외 요건을 충족한 형제자매입니다. 여기에 해당하면서 주로 직장가입자에게 생계를 의존하고, 소득·재산요건을 모두 충족해야 합니다. 삼촌·이모·조카 등 그 외 친족은 대상이 아닙니다.",
  },
  {
    q: "형제자매도 피부양자가 될 수 있나요?",
    a: "원칙적으로는 안 됩니다. 2022년 9월 부과체계 2단계 개편 이후 형제자매는 피부양자에서 원칙 제외되었고, 65세 이상·30세 미만·장애인(국가유공자·보훈보상대상자로서 상이등급 판정을 받은 사람 포함)에 해당하는 경우에만 예외로 인정됩니다. 예외에 해당하더라도 재산세 과세표준 1억 8,000만원 이하라는 별도의 재산요건이 적용되어 일반 대상자(5억 4,000만원)보다 훨씬 엄격합니다.",
  },
  {
    q: "11월 피부양자 재산정이 무엇인가요? 언제 탈락 통보가 오나요?",
    a: "국민건강보험공단은 매년 11월에 국세청 연계 전년도 귀속 소득자료(그해 확정분)를 반영해 전체 피부양자 자격을 일괄 재판정합니다. 이때 소득·재산 기준을 초과한 것으로 확인되면 12월 1일자로 피부양자 자격을 잃고 지역가입자로 전환되어 12월분부터 지역가입자 보험료가 부과됩니다. 재산정 전인 9~10월에 본인의 전년도 소득과 재산세 과세표준을 미리 점검해 두면 갑작스러운 보험료 고지를 피할 수 있습니다.",
  },
  {
    q: "이자·배당(금융소득)은 어떻게 계산되나요?",
    a: "이자소득과 배당소득의 합계가 연 1,000만원 이하면 합산소득에 포함하지 않고, 1,000만원을 초과하면 초과분이 아니라 전액이 합산됩니다. 예를 들어 금융소득이 연 990만원이면 소득 산정에서 빠지지만, 1,010만원이면 1,010만원 전액이 합산소득에 들어가므로 경계선 부근에서는 예금 만기 시점 분산 등 이자 수령 시기 관리가 중요합니다.",
  },
  {
    q: "주택임대소득이 있으면 어떻게 되나요?",
    a: "주택임대소득은 사업소득 중에서도 가장 엄격하게 적용됩니다. 사업자등록 여부와 관계없이 주택임대에서 발생한 사업소득금액이 있으면(1원이라도) 피부양자에서 제외됩니다. 다만 기준은 수입금액(월세 합계)이 아니라 필요경비와 공제를 차감한 소득금액이므로, 등록임대주택 여부 등에 따라 소득금액이 0으로 계산되면 자격이 유지될 수 있습니다. 정확한 소득금액은 종합소득세 신고 자료로 확인하세요.",
  },
  {
    q: "피부양자에서 탈락하면 보험료를 얼마나 내나요?",
    a: "탈락하면 지역가입자로 전환되어 본인의 소득과 재산을 기준으로 보험료가 산정됩니다. 소득에는 직장가입자와 같은 정률(2026년 7.19%)이 적용되고 재산에는 점수제가 적용되어, 재산이 있는 은퇴자는 통상 월 수십만원 수준이 됩니다. 이 판정기는 자격 여부만 판정하며, 예상 보험료 금액은 건강보험료 계산기(/health-insurance-fee-2026)에서 지역가입자 모드로 확인할 수 있습니다.",
  },
  {
    q: "이 판정기의 기준은 어디에 근거하나요?",
    a: "국민건강보험법 제5조(적용 대상 등)와 같은 법 시행규칙 제2조·별표 1의2(피부양자 자격의 인정기준 중 소득 및 재산요건)에 근거합니다. 2022년 9월 시행된 건강보험료 부과체계 2단계 개편(소득요건 연 3,400만원 → 2,000만원 강화)이 반영된 현행 기준이며, 2026년 8월 국민건강보험공단 안내 기준으로 확인했습니다. 실제 자격 판정은 공단이 국세청·지방자치단체 자료로 확정합니다.",
  },
];

const HOWTO_STEPS = [
  {
    name: "관계 선택",
    text: "직장가입자와의 관계(배우자·직계존속·직계비속·형제자매)를 선택합니다. 형제자매는 65세 이상·30세 미만·장애인 예외 해당 여부를 추가로 선택합니다.",
  },
  {
    name: "연간 합산소득 입력",
    text: "이자·배당·사업·근로·연금·기타소득의 연간 합계를 입력합니다. 금융소득은 연 1,000만원 초과 시에만 전액 합산됩니다.",
  },
  {
    name: "사업자등록·사업소득 입력",
    text: "사업자등록 여부를 선택하고 연간 사업소득금액을 입력합니다. 등록이 있으면 0원, 없으면 연 500만원 이하여야 합니다.",
  },
  {
    name: "재산세 과세표준 입력 후 판정 확인",
    text: "재산세 고지서의 과세표준을 입력하면 유지/탈락 판정과 탈락 사유가 즉시 표시됩니다.",
  },
];

// 광고 아래 내부 링크 4종 (임무 지정)
const RELATED_LINKS = [
  {
    href: "/health-insurance-fee-2026",
    title: "건강보험료 계산기",
    desc: "탈락 시 지역가입자 보험료 예상",
  },
  {
    href: "/health-insurance-2026",
    title: "건보료 연말정산 가이드",
    desc: "4월 정산·분납·환급 총정리",
  },
  {
    href: "/national-pension-estimate-2026",
    title: "국민연금 예상수령액",
    desc: "연금소득도 피부양자 소득에 합산",
  },
  {
    href: "/calc/pension-hike-2027",
    title: "국민연금 인상 계산기",
    desc: "2027년부터 보험료율 단계 인상",
  },
];

export default function HealthInsuranceDependentPage() {
  return (
    <main className="w-full min-h-screen bg-canvas dark:bg-canvas-950 pb-20">
      <JsonLd
        data={[
          autoBreadcrumbLd("/health-insurance-dependent", {
            leafName: "건강보험 피부양자 자격 판정기",
          }),
          softwareApplicationLd({
            name: "건강보험 피부양자 자격 판정기",
            description:
              "소득·재산·관계 문항 입력으로 건강보험 피부양자 유지/탈락을 별표 1의2 기준으로 즉시 판정",
            url: "/health-insurance-dependent",
          }),
          faqLd(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
          howToLd({
            name: "건강보험 피부양자 자격 확인하는 방법",
            description:
              "관계·소득·재산 문항에 답해 피부양자 유지/탈락을 1분 안에 판정",
            totalTime: "PT1M",
            steps: HOWTO_STEPS,
          }),
        ]}
      />

      <div className="page-width pt-24 pb-3">
        <Breadcrumbs
          path="/health-insurance-dependent"
          leafName="건강보험 피부양자 자격 판정기"
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-10 text-electric font-bold text-xs uppercase tracking-wider mb-3">
            11월 연례 재산정 대비
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-canvas-50 leading-tight mb-3">
            건강보험 피부양자 자격 판정기
          </h1>
          <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
            관계·소득·재산 문항에 답하면 건강보험 피부양자 자격의 유지/탈락을 즉시 판정합니다.
            연 소득 2,000만원, 사업소득 요건(등록 시 0원·미등록 시 500만원), 재산세 과세표준
            5억 4,000만원(초과 시 9억원까지 소득 1,000만원 조건), 형제자매 예외(1억 8,000만원)까지
            국민건강보험법 시행규칙 별표 1의2의 전체 분기를 반영했습니다. 공단은 매년 11월
            전년도 소득으로 자격을 재산정해 12월부터 지역보험료를 부과하니, 그 전에 미리
            확인하세요.
          </p>
        </header>

        <HomeTopAd />

        <HealthInsuranceDependentClient />

        <CalcResultAd />

        {/* 내부 링크 4종 — 광고 아래 배치 준수 */}
        <section className="my-8">
          <h2 className="text-sm font-black text-navy dark:text-canvas-50 mb-3">
            판정 후 바로 이어서 확인
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {RELATED_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block p-3 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
              >
                <p className="text-xs font-bold text-navy dark:text-canvas-50 mb-1">
                  {link.title}
                </p>
                <p className="text-[11px] leading-4 text-muted-blue dark:text-canvas-300">
                  {link.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* 제도 설명 — thin page 방어 */}
        <section className="my-10 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50">
            건강보험 피부양자란?
          </h2>
          <p>
            피부양자는 직장가입자에게 주로 생계를 의존하는 가족으로서,{" "}
            <strong>보험료를 한 푼도 내지 않고</strong> 건강보험 혜택을 받는 사람입니다.
            국민건강보험법 제5조와 시행규칙 별표 1의2가 정한 ① 부양요건(관계), ② 소득요건,
            ③ 재산요건을 <strong>모두</strong> 충족해야 하며, 하나라도 어긋나면 지역가입자로
            전환되어 본인 소득·재산 기준의 보험료가 부과됩니다. 은퇴한 부모님, 소득이 없는
            배우자, 학생 자녀가 대표적인 피부양자입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            요건 ① 부양요건 — 인정되는 가족 범위
          </h2>
          <ul>
            <li>
              <strong>배우자</strong>
            </li>
            <li>
              <strong>직계존속</strong> — 부모·조부모. 배우자의 직계존속(장인·장모·시부모)도
              포함됩니다.
            </li>
            <li>
              <strong>직계비속과 그 배우자</strong> — 자녀·손자녀(배우자의 직계비속 포함)와
              사위·며느리.
            </li>
            <li>
              <strong>형제자매</strong> — 원칙 제외. 65세 이상·30세 미만·장애인(국가유공자·
              보훈보상대상자 상이등급 포함)만 예외로 인정됩니다.
            </li>
          </ul>
          <p>
            삼촌·이모·조카 등 그 외 친족은 소득이 전혀 없어도 피부양자가 될 수 없습니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            요건 ② 소득요건 — 연 2,000만원 + 사업소득 분기
          </h2>
          <p>
            이자·배당·사업·근로·연금(공적연금)·기타소득을 합친{" "}
            <strong>연간 합산소득이 2,000만원 이하</strong>여야 합니다. 2,000만원을 1원이라도
            넘으면 초과 폭과 관계없이 탈락합니다. 여기에 사업소득 분기가 추가됩니다.
          </p>
          <ul>
            <li>
              <strong>사업자등록이 있으면</strong> — 사업소득이 없어야(0원) 합니다.
            </li>
            <li>
              <strong>사업자등록이 없으면</strong>(3.3% 원천징수 프리랜서 등) — 사업소득 연{" "}
              <strong>500만원 이하</strong>까지 허용됩니다.
            </li>
            <li>
              <strong>주택임대소득</strong>은 등록 여부와 무관하게 소득금액이 있으면
              제외됩니다(수입금액이 아니라 필요경비 차감 후 소득금액 기준).
            </li>
          </ul>
          <p>
            금융소득(이자+배당)은 합계 연 1,000만원 이하면 합산하지 않고,{" "}
            <strong>1,000만원 초과 시 전액</strong>이 합산됩니다. 경계 부근이라면 예금 만기
            분산 등 수령 시기 관리가 자격 유지에 결정적입니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            요건 ③ 재산요건 — 재산세 과세표준 3구간
          </h2>
          <ul>
            <li>
              <strong>5억 4,000만원 이하</strong> → 통과.
            </li>
            <li>
              <strong>5억 4,000만원 초과 ~ 9억원 이하</strong> → 연간 합산소득이{" "}
              <strong>1,000만원 이하</strong>일 때만 통과.
            </li>
            <li>
              <strong>9억원 초과</strong> → 소득과 관계없이 탈락.
            </li>
            <li>
              <strong>형제자매</strong>는 별도 기준 — 재산세 과세표준{" "}
              <strong>1억 8,000만원 이하</strong>.
            </li>
          </ul>
          <p>
            기준은 시가·공시가격이 아니라 <strong>재산세 과세표준</strong>(공시가격 ×
            공정시장가액비율)입니다. 매년 7월·9월 재산세 고지서 또는 위택스에서 확인할 수
            있으며, 명의자별로 각자 판정하므로 부부라도 본인 명의 재산만 따집니다.
          </p>

          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mt-10">
            매년 11월, 공단이 자격을 다시 심사합니다
          </h2>
          <p>
            국민건강보험공단은 <strong>매년 11월</strong> 국세청과 연계된{" "}
            <strong>전년도 귀속 소득자료</strong>(그해 확정된 종합소득 등)를 반영해 전체
            피부양자 자격을 일괄 재산정합니다. 기준 초과가 확인되면 <strong>12월 1일자로
            자격을 상실</strong>하고 지역가입자로 전환되어 <strong>12월분부터 지역가입자
            보험료</strong>가 부과됩니다. 작년에 퇴직금 외 소득이 늘었거나, 이자를 몰아
            받았거나, 연금 수령을 시작한 분이라면 9~10월에 이 판정기로 미리 점검해 두세요.
            갑작스러운 보험료 고지서를 받고 나서야 탈락을 아는 경우가 매년 반복됩니다.
          </p>
          <p>
            탈락 이후의 보험료가 얼마나 될지는{" "}
            <Link href="/health-insurance-fee-2026">건강보험료 계산기</Link>의 지역가입자
            모드로 확인할 수 있고, 퇴직으로 직장가입자 자격을 잃은 경우라면 임의계속가입
            (퇴직 후 최대 36개월 직장 수준 보험료) 등의 대안도 함께 비교해 볼 수 있습니다.
            일시적 사업소득 발생 후 폐업했다면 공단(1577-1000)에 소명해
            재판정을 받을 수 있으니 사정 변경이 있다면 공단에 먼저 문의하세요.
          </p>
        </section>

        <InArticleAd />

        {/* FAQ */}
        <section className="my-10">
          <h2 className="text-xl font-black text-navy dark:text-canvas-50 mb-5">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group p-5 bg-white dark:bg-canvas-900 rounded-2xl border border-canvas-200 dark:border-canvas-700"
              >
                <summary className="flex items-center justify-between cursor-pointer text-sm font-bold text-navy dark:text-canvas-50">
                  Q. {faq.q}
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-blue dark:text-canvas-300">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* 면책 */}
        <aside className="my-10 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10 p-5 text-sm">
          <p className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong className="block mb-1 text-amber-900 dark:text-amber-300">
                간이 판정 도구입니다
              </strong>
              <span className="text-amber-800 dark:text-amber-200">
                본 판정기는 별표 1의2의 소득·재산·부양요건을 입력값 기준으로 확인하는 간이
                도구입니다. 실제 자격은 국민건강보험공단이 국세청 소득자료·지방자치단체 재산세
                자료로 확정하며, 소득금액 산정 방식(필요경비·분리과세 여부 등)에 따라 결과가
                달라질 수 있습니다. 정확한 판정은 공단(1577-1000) 또는 The건강보험에서
                확인하세요.
              </span>
            </span>
          </p>
        </aside>

        {/* 출처 */}
        <section className="my-8 text-xs text-faint-blue leading-6">
          <h2 className="text-sm font-bold text-navy dark:text-canvas-100 mb-2">출처·근거</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>국민건강보험법 제5조 (적용 대상 등) — 피부양자의 범위</li>
            <li>
              국민건강보험법 시행규칙 제2조·별표 1의2 (피부양자 자격의 인정기준 중 소득 및
              재산요건) — 2022년 9월 부과체계 2단계 개편 반영 현행 기준
            </li>
            <li>국민건강보험공단 피부양자 자격 안내 (2026년 8월 조회 기준)</li>
          </ul>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        {/* RelatedCalculators 자동 추천 (dead-end 차단) */}
        <RelatedCalculators
          currentPath="/health-insurance-dependent"
          title="이 판정과 함께 보면 좋은 도구"
        />

        {/* ShareButtons (공유 유입) */}
        <div className="my-8">
          <ShareButtons
            title="건강보험 피부양자 자격 판정기"
            description="소득·재산 문항으로 피부양자 유지/탈락 1분 판정 — 11월 재산정 대비"
          />
        </div>

        {/* 관련 도구 */}
        <section className="my-10">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            함께 보면 좋은 계산기
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/health-insurance-fee-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                건강보험료 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                직장·지역가입자 보험료 자동 산출
              </p>
            </Link>
            <Link
              href="/health-insurance-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                건보료 연말정산 가이드
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                4월 정산 원리·분납·환급 정리
              </p>
            </Link>
            <Link
              href="/national-pension-estimate-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                국민연금 예상수령액 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                연금소득은 피부양자 소득에 합산
              </p>
            </Link>
            <Link
              href="/calc/pension-hike-2027"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                국민연금 인상 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                2027년 보험료율 인상분 미리 계산
              </p>
            </Link>
            <Link
              href="/social-insurance-rates-2026"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                2026 4대보험 요율표
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                건강보험 3.595% 등 최신 요율 총정리
              </p>
            </Link>
            <Link
              href="/"
              className="block p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
            >
              <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                연봉 실수령액 계산기
              </p>
              <p className="text-xs text-muted-blue dark:text-canvas-300">
                4대보험·소득세 자동 공제
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
