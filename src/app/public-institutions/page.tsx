import type { Metadata } from "next";
import { ArrowDown, ArrowRight, Building2, ExternalLink, FileCheck2, Landmark } from "lucide-react";
import Link from "@/components/AppLink";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import { PUBLIC_INSTITUTION_FAQ, PUBLIC_INSTITUTION_SALARY_PATH as PATH, PUBLIC_INSTITUTION_SALARY_TITLE as TITLE } from "@/lib/publicInstitutionSalary";
import PublicInstitutionSalaryClient from "./PublicInstitutionSalaryClient";

const DESCRIPTION = "공기업·준정부기관·기타공공기관과 지방공기업의 연봉 공시를 확인하고, 내 연보수와 성과급으로 월평균 실수령액을 계산하세요. 두 기관의 급여 조건 비교와 ALIO·클린아이 공식 조회 경로를 제공합니다.";

export const metadata: Metadata = buildPageMetadata({
  title: TITLE, description: DESCRIPTION, path: PATH,
  keywords: ["공기업 연봉 계산기", "공공기관 연봉", "알리오 평균보수", "공기업 신입 초임", "지방공기업 연봉", "공기업 실수령액"],
});

export default function PublicInstitutionsPage() {
  return (
    <div className="bg-background pt-[var(--header-height)] text-foreground">
      <JsonLd data={[autoBreadcrumbLd(PATH, { leafName: TITLE }), faqLd(PUBLIC_INSTITUTION_FAQ)]} />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6 sm:pt-10">
        <Breadcrumbs path={PATH} leafName="공기업·공공기관 연봉" className="mb-8" />
        <header className="mb-10 grid gap-7 py-3 lg:grid-cols-[1.5fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"><Building2 aria-hidden="true" className="h-4 w-4" />공공기관 급여 안내</p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">공기업·공공기관<br /><span className="text-link">연봉 계산기</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">기관의 공시를 읽고, 내 조건으로 계산해 보세요.<br />연보수와 성과급을 나누어 입력하고 두 기관의 실수령 추정치를 비교할 수 있어요.</p>
            <a href="#salary-calculator" className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">내 연봉 계산하기<ArrowDown aria-hidden="true" className="h-4 w-4" /></a>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <FileCheck2 className="mb-3 h-6 w-6 text-link" aria-hidden="true" />
            <h2 className="text-lg font-bold">평균보수와 내 연봉을 구분해요</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">공시의 직원 평균보수·신입 초임은 정해진 대상과 기준으로 작성됩니다. 실제 급여는 근속, 직급, 근무 형태와 지급 조건에 따라 달라져요.</p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">기관별 금액은 아래 공식 공시에서 확인한 뒤 입력하세요. 공무원 봉급과는 적용 체계가 달라요.</p>
          </div>
        </header>

        <section aria-labelledby="official-sources-heading" className="mb-12">
          <h2 id="official-sources-heading" className="mb-4 text-xl font-bold">어디에서 확인하면 될까요?</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="https://www.alio.go.kr/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Building2 aria-hidden="true" className="mb-3 h-5 w-5 text-link" /><h3 className="font-bold">공기업·준정부·기타공공기관</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">ALIO에서 기관을 찾아 ‘직원 평균보수’와 ‘신입사원 초임’을 확인하세요.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-link">ALIO 공식 조회<ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /></span>
            </a>
            <a href="https://www.cleaneye.go.kr/user/itemGongsi.do" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Landmark aria-hidden="true" className="mb-3 h-5 w-5 text-link" /><h3 className="font-bold">지방공기업·출자출연기관</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">클린아이에서 기관 유형을 선택하고 ‘직원 평균임금’ 등 인건비 공시를 확인하세요.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-link">클린아이 공식 조회<ExternalLink aria-hidden="true" className="h-3.5 w-3.5" /></span>
            </a>
            <Link href="/civil-servant-pay-2026" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary">
              <FileCheck2 aria-hidden="true" className="mb-3 h-5 w-5 text-link" /><h3 className="font-bold">공무원 봉급을 찾는다면</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">공무원은 직종·급수·호봉별 봉급표와 수당을 별도로 확인하세요.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-link">2026 공무원 봉급표<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></span>
            </Link>
          </div>
        </section>

        <PublicInstitutionSalaryClient />

        <section aria-labelledby="reading-disclosure-heading" className="mt-14 rounded-2xl border border-border bg-card p-5 sm:p-8">
          <h2 id="reading-disclosure-heading" className="text-2xl font-bold">기관별 공시를 비교할 때 확인할 네 가지</h2>
          <div className="mt-6 grid gap-7 md:grid-cols-2">
            {[
              ["01. 같은 연도·같은 기준", "공시한 날짜와 급여의 대상 연도는 다를 수 있어요. 전년도 결산과 올해 예산을 같은 실적처럼 비교하지 말고, 일반정규직·무기계약직 등 직원 구분도 맞추세요."],
              ["02. 평균보수와 신입 초임", "직원 평균에는 다양한 직급과 근속이 섞여 있습니다. 신입사원 초임의 학력·경력 등 공시 가정은 주석에서 확인하고, 실제 채용 공고의 조건과 나란히 보세요."],
              ["03. 성과급은 한 번만", "공시 합계에 성과상여금이나 경영평가 성과급이 포함되어 있는지 먼저 확인하세요. 이미 포함된 성과급을 다시 더하면 연보수가 부풀려집니다. 예산의 0원 표시는 주석까지 확인하세요."],
              ["04. 금액 단위와 지급 시점", "천원 단위의 공시 금액을 원으로 입력하려면 1,000을 곱합니다. 연보수를 12로 나눈 값은 비교용 월평균이며, 상여금이 없는 평소 월급이나 특정 월의 입금액과 다릅니다."],
            ].map(([title, description]) => <div key={title}><h3 className="font-bold text-link">{title}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p></div>)}
          </div>
          <p className="mt-7 border-t border-border pt-5 text-sm leading-7 text-muted-foreground">상장 공기업의 DART 직원 보수와 ALIO 공시는 대상·산정 기준이 다를 수 있습니다. 서로 다른 공시를 한 순위로 합치기 전에 원문의 기준을 확인하세요.</p>
        </section>

        <section aria-labelledby="public-faq-heading" className="mt-12">
          <h2 id="public-faq-heading" className="mb-5 text-2xl font-bold">자주 묻는 질문</h2>
          <div className="space-y-3">{PUBLIC_INSTITUTION_FAQ.map((faq) => <details key={faq.question} className="rounded-2xl border border-border bg-card p-5"><summary className="cursor-pointer font-semibold leading-7">{faq.question}</summary><p className="faq-answer mt-3 text-sm leading-7 text-muted-foreground">{faq.answer}</p></details>)}</div>
        </section>

        <section aria-labelledby="public-references-heading" className="mt-12 text-sm leading-7 text-muted-foreground">
          <h2 id="public-references-heading" className="font-bold text-foreground">공식 자료와 계산 기준</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><a href="https://job.alio.go.kr/information.do" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-4">JOB-ALIO 공공기관 유형 안내</a> · 공기업·준정부기관·기타공공기관 구분</li>
            <li><a href="https://www.alio.go.kr/" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-4">ALIO 공공기관 경영정보</a> · 기관별 직원 평균보수·신입사원 초임 및 원문 주석</li>
            <li><a href="https://www.cleaneye.go.kr/siteGuide/gongsiIntro.do" target="_blank" rel="noopener noreferrer" className="text-link underline underline-offset-4">클린아이 경영공시 안내</a> · 지방공기업·출자출연기관의 인건비 공시 항목</li>
            <li><Link href="/social-insurance-rates-2026" className="text-link underline underline-offset-4">2026 사회보험 요율 안내</Link> · 사이트의 일반 근로자 실수령 추정 모형 적용</li>
          </ul>
          <p className="mt-4">안내 확인일: 2026년 9월 19일. 기관 공시는 수정될 수 있으므로 입력 시 원문 기준을 다시 확인하세요. 이 페이지는 머니샐러리의 비교 도구이며 정부·개별 기관의 공식 급여 산정 서비스가 아닙니다.</p>
        </section>
      </div>
    </div>
  );
}
