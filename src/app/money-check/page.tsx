import type { Metadata } from "next";
import { ArrowDown, ArrowRight, Check, ClipboardCheck } from "lucide-react";
import Link from "@/components/AppLink";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareSection from "@/components/ShareSection";
import { GuideMidAd } from "@/components/AdPlacement";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd } from "@/lib/structuredData";
import { MONEY_CHECK_FAQ, MONEY_CHECK_ITEMS, MONEY_CHECK_PATH, MONEY_CHECK_TOPICS } from "@/lib/moneyCheck";
import MoneyCheckClient from "./MoneyCheckClient";

const TITLE = "내 돈 체크 | 월급·절세·이직·주거 체크리스트";
const DESCRIPTION = "월급, 연말정산, 이직, 주거, 저축, 가족까지 지금 확인할 돈 문제를 한곳에서 정리하세요. 상황별 무료 계산기와 준비 가이드를 연결하고 확인한 항목을 브라우저에 저장하는 내 돈 체크리스트입니다.";
const URL = `https://www.moneysalary.com${MONEY_CHECK_PATH}`;

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: MONEY_CHECK_PATH,
  keywords: ["내 돈 체크", "직장인 돈 관리", "재무 체크리스트", "연말정산 준비", "이직 체크리스트", "월급 관리"],
});

export default function MoneyCheckPage() {
  return (
    <div className="bg-background pt-[var(--header-height)] text-foreground">
      <JsonLd data={[
        autoBreadcrumbLd(MONEY_CHECK_PATH, { leafName: "내 돈 체크" }),
        {
          "@context": "https://schema.org", "@type": "CollectionPage", "@id": URL,
          url: URL, name: "내 돈 체크", description: DESCRIPTION, inLanguage: "ko-KR",
          mainEntity: {
            "@type": "ItemList", name: "상황별 돈 관리 체크리스트", numberOfItems: MONEY_CHECK_ITEMS.length,
            itemListElement: MONEY_CHECK_ITEMS.map((item, index) => ({
              "@type": "ListItem", position: index + 1, name: item.title, url: `${URL}#${item.id}`,
            })),
          },
        },
        {
          "@context": "https://schema.org", "@type": "FAQPage",
          mainEntity: MONEY_CHECK_FAQ.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
        },
      ]} />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6 sm:pt-10">
        <Breadcrumbs path={MONEY_CHECK_PATH} leafName="내 돈 체크" className="mb-8" />

        <header className="mb-12 grid items-center gap-8 py-4 lg:grid-cols-[1.45fr_1fr] lg:gap-16 lg:py-8">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"><ClipboardCheck aria-hidden="true" className="h-4 w-4" />내 돈 체크</p>
            <h1 className="text-4xl font-bold leading-[1.22] tracking-tight sm:text-5xl">내 돈 체크<br /><span className="text-link">직장인 돈 체크리스트</span></h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">하나씩 가볍게. 월급부터 이직, 연말정산까지.<br className="hidden sm:block" /> 지금 내 상황에 필요한 계산과 준비를 모았어요.</p>
            <a href="#checklist-heading" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary px-5 py-3 text-base font-semibold text-primary-foreground transition-colors hover:bg-[hsl(var(--primary-hover))]">내 체크리스트 보기<ArrowDown aria-hidden="true" className="h-4 w-4" /></a>
            <p className="mt-4 text-sm text-muted-foreground">로그인 없이 무료 · 확인 기록은 내 브라우저에</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <p className="text-sm font-semibold text-link">돈 관리, 어디서 시작할지 모르겠다면</p>
            <h2 className="mt-3 text-2xl font-bold leading-snug">계산하고, 이해하고,<br />확인한 만큼 체크해요.</h2>
            <ol className="mt-6 space-y-5">
              {[
                ["상황을 고르세요", `${MONEY_CHECK_TOPICS.length}가지 주제에서 지금 필요한 일을 찾아요.`],
                ["계산기와 가이드를 함께 보세요", "예상 금액을 구하고 준비할 자료를 확인해요."],
                ["확인한 항목을 체크하세요", "다음에 돌아와 남은 항목부터 이어가요."],
              ].map(([title, description], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{index + 1}</span>
                  <div><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </header>

        <MoneyCheckClient />

        <section aria-labelledby="next-step-heading" className="mt-14 rounded-3xl border border-border bg-card p-5 sm:p-8">
          <p className="mb-2 text-sm font-semibold text-link">확인 다음 단계</p>
          <h2 id="next-step-heading" className="text-2xl font-bold sm:text-3xl">계산 결과를 내 생활에 연결하는 법</h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">체크리스트는 예상 금액을 보는 데서 끝나지 않아요. 계산할 때 사용한 조건을 실제 자료와 맞추고, 다음에 해야 할 일을 정해 보세요. 모든 항목을 한 번에 끝내기보다 내 상황에 맞는 항목부터 확인하면 됩니다.</p>
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            {[
              ["입력 조건을 맞추기", "연봉과 총급여, 세전 금액과 세후 금액을 구분하세요. 계산기의 적용 연도와 입력 단위를 확인하고, 일회성 보상이나 비과세 수당은 안내에 따라 입력합니다."],
              ["실제 자료와 비교하기", "급여명세서·계약서·납입 내역을 계산 결과와 나란히 보세요. 차이가 나는 항목은 회사 정산 담당자나 금융회사, 담당 기관의 안내에서 확인합니다."],
              ["다음에 할 일을 정하기", "증빙 준비, 공제 신청, 상환 계획 조정처럼 실행할 일을 정리하세요. 이 페이지의 체크는 개인 확인 기록이며 실제 신청이나 계약 절차를 대신하지 않습니다."],
            ].map(([title, description]) => (
              <div key={title}>
                <Check aria-hidden="true" className="mb-3 h-5 w-5 text-link" />
                <h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="my-12 border-y border-border py-8"><GuideMidAd /></div>

        <section aria-labelledby="faq-heading" className="mt-12">
          <h2 id="faq-heading" className="mb-6 text-2xl font-bold sm:text-3xl">자주 묻는 질문</h2>
          <div className="space-y-3">
            {MONEY_CHECK_FAQ.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-border bg-card p-5 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold [&::-webkit-details-marker]:hidden">{faq.question}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" /></summary>
                <p className="faq-answer mt-4 max-w-4xl text-base leading-8 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="more-tools-heading" className="mt-12 flex flex-col gap-5 rounded-3xl bg-accent p-6 text-accent-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div><h2 id="more-tools-heading" className="text-xl font-bold">찾는 항목이 더 있나요?</h2><p className="mt-2 text-sm leading-6">전체 계산기와 금융 가이드에서 더 자세히 살펴보세요.</p></div>
          <div className="flex flex-wrap gap-2">
            <Link href="/calc" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary">계산기 모음<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            <Link href="/guides" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary">금융 가이드<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
        </section>
        <ShareSection contentType="page" shareMode="page" url={URL} title="내 돈 체크 | 머니샐러리" heading="이 체크리스트가 필요한 사람에게 알려주세요" className="mt-10" />
      </div>
    </div>
  );
}
