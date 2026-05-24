// src/components/CompanyCareerLevels.tsx
//
// 회사 페이지 — CL(Career Level) 세부 직급별 연봉표.
// 삼성전자처럼 CL1-1, CL1-2, CL2(2년 단위) 같은 세부 단계 체계가 있는
// 회사에서만 렌더링됨. careerLevels 데이터가 없으면 컴포넌트가 null 반환.
//
// SEO: server component + 직급 라벨·연봉 수치 모두 본문 텍스트.
//      "삼성전자 CL2 대리 연봉" 같은 long-tail 키워드 자연 매칭.

import type { CompanyProfile } from "@/types/company";

interface Props {
  company: CompanyProfile;
}

export default function CompanyCareerLevels({ company }: Props) {
  if (!company.careerLevels || company.careerLevels.length === 0) return null;

  const fmt = (manwon: number) => `${manwon.toLocaleString("ko-KR")}만원`;

  return (
    <section className="page-width py-12" aria-labelledby="career-levels-heading">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
          직급별 세부 연봉 — Career Level
        </p>
        <h2
          id="career-levels-heading"
          className="text-3xl sm:text-4xl font-black tracking-tight mb-4"
        >
          {company.name.ko} CL 직급별 연봉 (2026)
        </h2>
        <p className="text-base text-faint leading-relaxed">
          {company.name.ko}의 Career Level(CL) 체계 — <strong>CL1(고졸·전문대졸)</strong>{" "}
          / <strong>CL2(대졸 사원·대리)</strong> / <strong>CL3(과장·차장)</strong> /{" "}
          <strong>CL4(부장·수석)</strong> 4단계로 나뉘며, 각 CL 내에서 호봉이
          2년 단위로 단계적으로 상승합니다. <strong>셀러리캡(Salary Cap)</strong>은
          같은 CL에서 받을 수 있는 base(계약) 연봉 상한선으로, 진급 없이는 캡을
          넘을 수 없습니다.
        </p>
      </div>

      <div className="space-y-6">
        {company.careerLevels.map((group) => (
          <article
            key={group.group}
            className="rounded-2xl border border-canvas-deep bg-canvas/40 p-6 sm:p-8"
          >
            <header className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                  {group.group}
                </h3>
                {group.promotionNote && (
                  <p className="text-sm text-faint leading-relaxed max-w-2xl">
                    {group.promotionNote}
                  </p>
                )}
              </div>
              {typeof group.salaryCapManwon === "number" && (
                <div className="inline-flex items-center gap-2 rounded-full bg-electric/10 px-4 py-2 text-sm font-bold text-electric self-start whitespace-nowrap">
                  <span className="text-xs uppercase tracking-wider opacity-70">
                    셀러리캡
                  </span>
                  <span>base {fmt(group.salaryCapManwon)}</span>
                </div>
              )}
            </header>

            <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-canvas-deep text-left">
                    <th className="py-3 pr-4 font-bold text-faint text-xs uppercase tracking-wider">
                      직급·연차
                    </th>
                    <th className="py-3 pr-4 font-bold text-faint text-xs uppercase tracking-wider text-right">
                      base(계약)
                    </th>
                    <th className="py-3 pr-4 font-bold text-faint text-xs uppercase tracking-wider text-right">
                      영끌(평균)
                    </th>
                    <th className="py-3 font-bold text-faint text-xs uppercase tracking-wider hidden sm:table-cell">
                      설명
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.steps.map((step) => (
                    <tr
                      key={step.label}
                      className="border-b border-canvas-deep/60 last:border-0 align-top"
                    >
                      <td className="py-3 pr-4 font-bold whitespace-nowrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{step.label}</span>
                          {step.isCapReached && (
                            <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                              CAP
                            </span>
                          )}
                        </div>
                        <div className="sm:hidden mt-1 text-xs text-faint font-normal leading-relaxed">
                          {step.description}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums font-semibold">
                        {fmt(step.baseManwon)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums font-bold text-primary">
                        {step.totalManwon ? fmt(step.totalManwon) : "—"}
                      </td>
                      <td className="py-3 text-xs text-faint hidden sm:table-cell leading-relaxed">
                        {step.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      <aside className="mt-8 space-y-4">
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-sm leading-relaxed">
          <p className="font-black text-foreground mb-3">
            🆕 2026년 임금협약 잠정합의서 — 핵심 변경사항
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <p className="font-bold mb-1 text-primary">셀러리캡 전면 상향</p>
              <ul className="space-y-0.5 text-xs">
                <li>• CL2: <strong>0.76억 → 0.80억</strong></li>
                <li>• CL3: <strong>1.03억 → 1.10억</strong></li>
                <li>• CL4: <strong>(개발 1.22억 / 비개발 1.20억) → 통합 1.30억</strong></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1 text-primary">임금인상률</p>
              <ul className="space-y-0.5 text-xs">
                <li>• 기준인상률(Base-up): <strong>4.1%</strong></li>
                <li>• 성과인상률 평균: <strong>2.1%</strong> (CL·고과 차등)</li>
                <li>• 합산: <strong>약 6.2%</strong></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1 text-primary">자녀출산경조금 상향</p>
              <ul className="space-y-0.5 text-xs">
                <li>• 첫째: 30만 → <strong>100만원</strong></li>
                <li>• 둘째: 50만 → <strong>200만원</strong></li>
                <li>• 셋째 이상: 100만 → <strong>500만원</strong></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1 text-primary">기타 신규 항목</p>
              <ul className="space-y-0.5 text-xs">
                <li>• 사내 주택대부 제도 신설(무주택 조합원)</li>
                <li>• 변형교대 휴일근무 보상(통상시급 4시간분 추가)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-canvas-deep bg-canvas/20 p-5 text-xs leading-relaxed text-faint">
          <p className="font-bold text-foreground mb-2">📌 데이터 출처·주의사항</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              <strong>셀러리캡 수치</strong>는 2026년 임금협약 잠정합의서
              원문 명시값(추정 아님).
            </li>
            <li>
              <strong>base(계약 연봉)</strong>는 회사와 체결한 연 단위 기본
              급여, <strong>영끌(평균)</strong>은 base + 평균 OPI(연봉의 25~50%)
              + TAI(월 기본급의 100% × 2회) 합산 추정치.
            </li>
            <li>
              반도체 사이클·사업부 흑/적자에 따라 OPI는 ±30% 변동 — 다운사이클
              시 OPI 0% 지급 사례 있음(DS 사업부 2023·2024).
            </li>
            <li>
              실제 연봉은 사업부·직무·고과·성과·연차별 호봉에 따라 ±15% 차이
              가능. 보도값(머니투데이·아주경제·블라인드·잡코리아 등)으로 보강.
            </li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
