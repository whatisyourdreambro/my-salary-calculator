import type { ReactNode } from "react";
import type { CompanyProfile } from "@/types/company";
import SamsungCompanySummaryLinks from "./SamsungCompanySummaryLinks";

export function SamsungSectionAnchor({
  companyId, id, children,
}: {
  companyId: string;
  id: string;
  children?: ReactNode;
}) {
  return companyId === "samsung-electronics"
    ? <div id={id} tabIndex={-1} className="scroll-mt-28">{children}</div>
    : <>{children}</>;
}

export default function SamsungCompanySummary({ company, dartSalaryManwon }: {
  company: CompanyProfile;
  dartSalaryManwon: number | null;
}) {
  if (company.id !== "samsung-electronics") return null;
  const disclosed = company.disclosed;
  const entryTotal = company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
  const hasCareerLevels = Boolean(company.careerLevels?.length);
  const hasDartGap = disclosed && dartSalaryManwon != null && disclosed.avgSalaryManwon > 0 &&
    Math.abs(dartSalaryManwon - disclosed.avgSalaryManwon) / disclosed.avgSalaryManwon > 0.05;
  const linkClass = "inline-flex min-h-11 items-center rounded-xl border border-electric/25 px-3 py-2 text-sm font-bold text-electric hover:bg-electric/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric";

  return (
    <section aria-labelledby="samsung-company-summary-title" className="rounded-2xl border border-electric/20 bg-card p-5 sm:p-6 shadow-sm">
      <h2 id="samsung-company-summary-title" className="text-lg font-black text-foreground">삼성전자 연봉, 기준부터 확인하세요</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {disclosed && (
          <div>
            <dt className="text-sm font-bold text-muted-foreground">공시 기준 직원 평균 · {disclosed.fiscalYear} 사업연도</dt>
            <dd className="mt-1 text-2xl font-black tabular-nums">{disclosed.avgSalaryManwon.toLocaleString("ko-KR")}만원</dd>
            <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">여러 직급·연차의 직원 평균입니다. 신입 초봉이나 개인 지급액과 구분해서 보세요.</dd>
          </div>
        )}
        <div>
          <dt className="text-sm font-bold text-muted-foreground">본 DB 신입 총연봉 추정 · 세전</dt>
          <dd className="mt-1 text-2xl font-black tabular-nums">{(entryTotal / 10000).toLocaleString("ko-KR")}만원</dd>
          <dd className="mt-1 text-xs leading-relaxed text-muted-foreground">기본급 + 평균 인센티브. 아래 5단계 연봉표·회사 비교에 사용하는 추정값입니다.</dd>
        </div>
      </dl>
      {hasCareerLevels && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">CL 표는 보도·공개 자료와 성과급 가정을 반영한 별도 기준입니다. 같은 신입이라도 학력·직급·보상 범위가 달라 위 추정 초봉과 다를 수 있습니다.</p>
      )}
      {hasDartGap && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">DART 급여총액÷인원 산정치는 {dartSalaryManwon!.toLocaleString("ko-KR")}만원으로, 위 공시 인용값과 차이가 있습니다. 기존 공시 카드에 병기한 값이며 출처와 산정 범위를 함께 확인하세요.</p>
      )}
      {disclosed && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">출처: {disclosed.source}</p>}
      <SamsungCompanySummaryLinks>
        <a href="/calc/samsung-bonus" className="inline-flex min-h-11 items-center rounded-xl bg-electric px-4 py-2 text-sm font-bold text-white hover:bg-electric/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric">내 연봉으로 삼성 성과급 계산</a>
        <a href="#samsung-salary-table" className={linkClass}>5단계 연봉·실수령 표</a>
        {hasCareerLevels && <a href="#samsung-career-levels" className={linkClass}>CL 직급별 표</a>}
        {disclosed && <a href="#samsung-disclosed-salary" className={linkClass}>공시·출처 자세히</a>}
      </SamsungCompanySummaryLinks>
      {disclosed?.sourceUrl && (
        <a href={disclosed.sourceUrl} target="_blank" rel="nofollow noopener" className="mt-3 inline-flex min-h-11 items-center text-xs font-bold text-electric underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric">공시 인용 출처 열기 (새 창)</a>
      )}
    </section>
  );
}
