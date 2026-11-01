// src/app/year-end-tax-preview/page.tsx
//
// 홈택스 "연말정산 미리보기" 이용법 — "연말정산 미리보기"·"홈택스 연말정산
// 미리보기" 검색 의도 대응 (2026-08-23 예비 신설 — 색인 숙성 목적).
// ★갱신 체크포인트(10월 말): 국세청 오픈 공지 시 오픈일·메뉴 경로·올해
// 변경점을 확정 반영 (growth-playbook 10월 말 슬롯). 절차는 예년 서비스
// 기준 텍스트 서술 — 스크린샷 없음, 확정 전 수치 단정 금지.
// 차별점: 오픈 전에도 가능한 자가 시뮬레이션(/year-end-tax) CTA.

import type { Metadata } from "next";
import ShareSection from "@/components/ShareSection";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import YearEndTaxCluster from "@/components/YearEndTaxCluster";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd, faqLd, speakableLd } from "@/lib/structuredData";
import { ArrowRight, Calculator, MonitorSmartphone, ListChecks } from "lucide-react";
import { HomeTopAd, GuideMidAd, InArticleAd, CalcResultAd } from "@/components/AdPlacement";
// 부활 팩 ④ (운영자 승인 2026-08-31) — CPA 오퍼 슬롯
import { OfferSlot } from "@/components/affiliate/AffiliateSlot";

export const dynamic = "force-static";

const PAGE_PATH = "/year-end-tax-preview";

export const metadata: Metadata = buildPageMetadata({
  title: "홈택스 연말정산 미리보기 이용법 — 오픈 시점·절차·확인 포인트",
  description:
    "국세청 홈택스 '연말정산 미리보기'는 1~9월 신용카드 사용액으로 예상 세액을 미리 보여주는 서비스입니다(예년 기준 10월 말~11월 중순 오픈). 이용 절차, 꼭 확인할 3가지, 오픈 전에 예상 환급액을 계산하는 방법까지 정리했습니다.",
  path: PAGE_PATH,
  keywords: [
    "연말정산 미리보기",
    "홈택스 연말정산 미리보기",
    "연말정산 미리보기 오픈",
    "연말정산 예상 환급액",
  ],
});

const STEPS = [
  {
    title: "홈택스 로그인",
    body: "hometax.go.kr 접속 후 공동·금융인증서 또는 간편인증(카카오·네이버 등)으로 로그인합니다.",
  },
  {
    title: "연말정산 미리보기 메뉴 진입",
    body: "예년 기준 '장려금·연말정산·전자기부금 → 연말정산 미리보기' 경로로 들어갑니다. (오픈 후 메뉴 위치가 바뀌면 본 문서를 갱신합니다)",
  },
  {
    title: "1~9월 신용카드 자료 확인",
    body: "국세청이 수집한 1~9월 결제수단별 사용액이 자동으로 채워집니다. 10~12월 예상 사용액을 입력하면 카드 소득공제 예상액이 계산됩니다.",
  },
  {
    title: "총급여·기납부세액 입력 후 예상 세액 확인",
    body: "작년 연말정산 값이 기본으로 들어가 있으므로 올해 총급여로 수정해야 정확합니다. 항목별 공제를 조정하며 예상 환급·추가납부를 확인합니다.",
  },
];

const CHECKS = [
  {
    title: "카드 공제 문턱(총급여 25%)을 넘겼는가",
    body: "못 넘겼다면 남은 기간 지출을 한 카드로 몰고, 넘겼다면 공제율 높은 체크카드(30%)·전통시장(40%) 위주로 쓰는 것이 유리합니다.",
    href: "/credit-card-deduction-2026",
    cta: "신용카드 공제 계산기",
  },
  {
    title: "연금계좌 세액공제 한도가 남았는가",
    body: "연금저축·IRP는 12월 31일 입금분까지 올해 공제 대상입니다. 한도(합산 900만원)가 남았다면 가장 확실한 연말 절세 수단입니다.",
    href: "/year-end-tax",
    cta: "절세 시뮬레이터로 확인",
  },
  {
    title: "월세·의료비 등 자동 수집 안 되는 항목",
    body: "월세 세액공제, 안경·렌즈 구입비 일부 등은 간소화에 빠질 수 있습니다. 계약서·영수증을 미리 모아두면 1월에 허둥대지 않습니다.",
    href: "/rent-tax-credit-2026",
    cta: "월세 세액공제 계산기",
  },
];

const FAQS = [
  {
    question: "연말정산 미리보기는 언제 열리나요?",
    answer:
      "최근 3년은 2023년 10월 31일, 2024년 11월 15일, 2025년 11월 5일에 열렸습니다(국세청 발표). 국세청 공지가 나오면 본 문서에 확정 일자를 반영합니다. 오픈 전에도 머니샐러리 연말정산 계산기로 예상 환급액을 미리 계산할 수 있습니다.",
  },
  {
    question: "미리보기 숫자는 왜 실제 정산 결과와 다른가요?",
    answer:
      "미리보기는 1~9월 카드 자료와 작년 공제 내역을 바탕으로 한 추정치입니다. 10~12월 지출, 올해 급여 변동, 부양가족 변화가 반영되지 않았으므로 '방향을 잡는 도구'로 쓰고, 최종 수치는 1월 간소화 자료로 다시 계산해야 합니다.",
  },
  {
    question: "미리보기에서 추가 납부가 나왔는데 어떻게 줄이나요?",
    answer:
      "12월 31일까지 가능한 액션은 연금저축·IRP 추가 납입, 공제율 높은 결제수단으로 전환, 기부금, 월세 서류 준비 등입니다. 연말정산 계산기의 절세 시뮬레이터에서 항목별로 넣어보면 환급 변화를 바로 확인할 수 있습니다.",
  },
];

// 국세청 발표 기준 미리보기 개통일 — 세 행 모두 대한민국 정책브리핑(korea.kr)의 국세청 발표 기사로 확인(2026-11-01):
//   2023: newsId=148922048(2023-10-31, 31일 개통) · 2024: newsId=148936216(2024-11-13 발표, 15일 개통) ·
//   2025: newsId=148954010(2025-11-05, 5일 개통). 아래 2025년 메뉴 경로: newsId=148954467(2025-11-10).
// ★2026년 귀속 행은 국세청 보도자료(nts.go.kr 보도자료 게시판)로 개통일을 확인한 뒤에만 넣는다 — 2026-11-01 현재
//   개통 보도자료 없음(게시판 10/29 자까지 확인). 블로그 등 비공식 날짜는 쓰지 않는다. 제목의 'N년'은 행 수에서 만든다.
const PREVIEW_OPEN_HISTORY = [
  { year: "2023년 귀속", opened: "2023년 10월 31일", source: "국세청 발표(대한민국 정책브리핑)" },
  { year: "2024년 귀속", opened: "2024년 11월 15일", source: "국세청 발표(대한민국 정책브리핑)" },
  { year: "2025년 귀속", opened: "2025년 11월 5일", source: "국세청 발표(대한민국 정책브리핑)" },
];

export default function YearEndTaxPreviewPage() {
  return (
    <>
      <JsonLd
        data={[
          autoBreadcrumbLd(PAGE_PATH, { leafName: "홈택스 연말정산 미리보기" }),
          faqLd(FAQS),
          speakableLd({ url: PAGE_PATH, cssSelectors: [".speakable-summary", ".faq-answer"] }),
        ]}
      />
      <main className="min-h-screen bg-canvas pb-20 pt-28">
        <div className="page-width">
          <Breadcrumbs path={PAGE_PATH} leafName="홈택스 연말정산 미리보기" className="mb-4" />

          <div className="max-w-3xl mx-auto">
            {/* 히어로 */}
            <header className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy leading-tight mb-3">
                홈택스 연말정산 미리보기
                <span className="block text-lg sm:text-xl mt-2 text-electric">
                  오픈 시점·이용 절차·꼭 확인할 3가지
                </span>
              </h1>
              <p className="speakable-summary text-sm sm:text-[15px] leading-7 text-muted-blue">
                &lsquo;연말정산 미리보기&rsquo;는 국세청이 수집한 1~9월 신용카드 사용액으로
                올해 예상 세액을 미리 보여주는 홈택스 서비스입니다. 예년 기준{" "}
                <strong className="text-navy">10월 말~11월 중순 오픈</strong>하며, 12월
                31일 지출 마감 전에 절세 전략을 세울 수 있는 마지막 안내판입니다. 오픈
                공지가 나오면 본 문서에 확정 일정을 반영합니다.
              </p>
            </header>

            <HomeTopAd />

            {/* 오픈 전 CTA — 차별점 */}
            <section className="my-8 rounded-2xl border border-electric/30 bg-electric/5 p-6" aria-labelledby="cta-heading">
              <h2 id="cta-heading" className="text-lg font-black text-navy mb-2 inline-flex items-center gap-2">
                <Calculator size={18} className="text-electric" aria-hidden="true" />
                오픈을 기다릴 필요 없습니다
              </h2>
              <p className="text-sm leading-7 text-muted-blue mb-4">
                총급여와 지금까지의 지출만 있으면 머니샐러리 연말정산 계산기로 예상
                환급·추가납부를 지금 바로 계산할 수 있습니다. 절세 시뮬레이터로
                &lsquo;연금저축을 100만원 더 넣으면?&rsquo; 같은 가정도 즉시 확인됩니다.
              </p>
              <Link
                href="/year-end-tax"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:opacity-90 transition"
              >
                예상 환급액 지금 계산하기
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </section>

            {/* 절차 */}
            <section className="mb-10" aria-labelledby="steps-heading">
              <h2 id="steps-heading" className="text-2xl font-black text-navy mb-4 inline-flex items-center gap-2">
                <MonitorSmartphone size={20} className="text-electric" aria-hidden="true" />
                이용 절차 (예년 서비스 기준)
              </h2>
              <ol className="space-y-3">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="rounded-xl border border-canvas-200 bg-white p-5">
                    <p className="font-bold text-navy text-sm mb-1">
                      <span className="text-electric font-black mr-1.5">{i + 1}.</span>
                      {s.title}
                    </p>
                    <p className="text-sm leading-7 text-muted-blue">{s.body}</p>
                  </li>
                ))}
              </ol>
            </section>

            <GuideMidAd />

            {/* 확인 포인트 3 */}
            <section className="my-10" aria-labelledby="checks-heading">
              <h2 id="checks-heading" className="text-2xl font-black text-navy mb-4 inline-flex items-center gap-2">
                <ListChecks size={20} className="text-electric" aria-hidden="true" />
                미리보기에서 꼭 확인할 3가지
              </h2>
              <div className="space-y-3">
                {CHECKS.map((c) => (
                  <div key={c.title} className="rounded-xl border border-canvas-200 bg-white p-5">
                    <p className="font-bold text-navy text-sm mb-1">{c.title}</p>
                    <p className="text-sm leading-7 text-muted-blue mb-3">{c.body}</p>
                    <Link href={c.href} className="text-sm font-bold text-electric hover:underline">
                      {c.cta} →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* 시즌 보강 광고(운영자 승인 2026-08-30, 제안 C) — 체크포인트와 FAQ 사이 */}
            <InArticleAd />

            {/* 부활 팩 ④ (운영자 승인 2026-08-31): 광고 직후 CPA 오퍼 */}
            <OfferSlot vertical="loan" />

            {/* FAQ */}
            <section className="mb-8" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="text-2xl font-black text-navy mb-4">자주 묻는 질문</h2>
              <div className="space-y-3">
                {FAQS.map((f) => (
                  <details key={f.question} className="group rounded-xl border border-canvas-200 bg-white p-5">
                    <summary className="cursor-pointer text-sm font-bold text-navy">{f.question}</summary>
                    <p className="faq-answer mt-3 text-sm leading-7 text-muted-blue">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* FAQ 직후 보강 광고 — 전면 최적화 (운영자 지시 2026-09-02) */}
            <CalcResultAd />
            {/* 공유 버튼 — 광고 아래(하이드레이션 뒤 나타나도 광고가 밀리지 않게). 광고 위로 되돌리지 말 것. */}
            <ShareSection contentType="guide" className="mt-8 mb-8" />
            {/* 클러스터 칩 — 광고 아래 배치 준수 */}
            <YearEndTaxCluster />

            {/* 최근 개통일·메뉴 경로 — 페이지 마지막 광고(CalcResultAd)·공유·클러스터 칩 아래 맨 끝
                (TS-06 2026-09-29 작성, 2026-11-01 B30 이식). 광고 위 형제 요소는 그대로라 광고 위 높이 불변.
                ★2026년 귀속 행은 국세청 개통 보도자료 확인 뒤 PREVIEW_OPEN_HISTORY 에만 추가(동결기 허용 데이터 갱신). */}
            <section className="mt-10" aria-labelledby="open-history-heading">
              <h2 id="open-history-heading" className="text-2xl font-black text-navy mb-4">
                {`최근 ${PREVIEW_OPEN_HISTORY.length}년 연말정산 미리보기 개통일`}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-canvas-200 bg-white">
                <table className="w-full text-sm">
                  <caption className="sr-only">국세청 발표 기준 연말정산 미리보기 개통일</caption>
                  <thead>
                    <tr className="border-b border-canvas-200 text-left text-xs text-faint-blue">
                      <th scope="col" className="py-2.5 px-3 font-bold">귀속 연도</th>
                      <th scope="col" className="py-2.5 px-3 font-bold">개통일</th>
                      <th scope="col" className="py-2.5 px-3 font-bold">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PREVIEW_OPEN_HISTORY.map((row) => (
                      <tr key={row.year} className="border-b border-canvas-200/60 last:border-0">
                        <td className="py-2 px-3 font-bold text-navy whitespace-nowrap">{row.year}</td>
                        <td className="py-2 px-3 font-bold text-electric whitespace-nowrap">{row.opened}</td>
                        <td className="py-2 px-3 text-muted-blue">{row.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-blue">
                2026년 귀속분 개통일은 국세청 공지 후 이 표에 추가합니다. 2025년 기준 메뉴 경로는
                홈택스 로그인 → 장려금·연말정산·기부금 → 편리한 연말정산 → 연말정산 미리보기였습니다(대한민국
                정책브리핑 안내). 위 이용 절차의 전자기부금은 예전 메뉴 이름입니다.
              </p>
              <p className="mt-3 text-sm">
                <Link
                  href="/guides/hometax-year-end-preview-2026"
                  className="font-bold text-electric hover:underline"
                >
                  홈택스 연말정산 미리보기 100% 활용법 — 미리보기 숫자 읽는 법 →
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
