// 회사 페이지 본문 자동 생성.
// companyContentBuilder의 기존 헬퍼들을 조합해 7~9 문단의 SEO용 텍스트 본문을 만들어
// "회사명 + 연봉" long-tail 검색에 thin content가 아닌 deep content로 응답.

import Link from "next/link";
import type { CompanyProfile } from "@/types/company";
import {
  getIndustryBenchmark,
  getSimilarSalaryCompanies,
  formatSalaryKorean,
  describeSalaryGrowth,
  describeWorkLife,
} from "@/lib/companyContentBuilder";

interface Props {
  company: CompanyProfile;
}

const TIER_LABEL: Record<CompanyProfile["tier"], string> = {
  conglomerate: "대기업 계열",
  unicorn: "유니콘 IT/스타트업",
  startup: "성장 단계 스타트업",
  foreign: "외국계",
  public: "공기업/공공기관",
};

const REMOTE_LABEL: Record<CompanyProfile["workLife"]["remoteWork"]["policy"], string> = {
  remote: "전면 원격 가능",
  hybrid: "하이브리드(주 일부 출근)",
  office: "전면 사무실 근무",
};

export default function CompanyNarrative({ company }: Props) {
  const koName = company.name.ko;
  const entryTotal =
    company.salary.entry.base + (company.salary.entry.incentive.avgAmount || 0);
  const juniorTotal =
    company.salary.junior.base + (company.salary.junior.incentive.avgAmount || 0);
  const seniorTotal =
    company.salary.senior.base + (company.salary.senior.incentive.avgAmount || 0);
  const leadTotal =
    company.salary.lead.base + (company.salary.lead.incentive.avgAmount || 0);
  const executiveTotal =
    company.salary.executive.base +
    (company.salary.executive.incentive.avgAmount || 0);
  const monthlyEntry = Math.round(entryTotal / 12);
  const monthlyJunior = Math.round(juniorTotal / 12);
  const monthlySenior = Math.round(seniorTotal / 12);
  const monthlyLead = Math.round(leadTotal / 12);
  const benchmark = getIndustryBenchmark(company);
  const similar = getSimilarSalaryCompanies(company, 4);
  const remotePolicy = REMOTE_LABEL[company.workLife.remoteWork.policy];
  const vacation = company.workLife.vacation;
  const dsrCapacity = Math.round((entryTotal * 0.4) / 10000);

  return (
    <section
      className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      aria-label={`${koName} 상세 분석`}
    >
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-navy dark:text-canvas-50 mb-6">
        {koName} 연봉·복지 한눈에 보기
      </h2>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-5 text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
        <p>
          <strong className="text-navy dark:text-canvas-50">{koName}</strong>은(는){" "}
          <strong>{TIER_LABEL[company.tier]}</strong> 분류의{" "}
          <strong>{company.industry}</strong> 기업입니다. 신입 영끌 평균 연봉은{" "}
          <strong>{formatSalaryKorean(entryTotal)}</strong> 수준이며, 시니어급은{" "}
          <strong>{formatSalaryKorean(seniorTotal)}</strong>까지 올라갑니다. 본 페이지는
          기본급·인센티브·스톡옵션·복지·워라밸을 종합해 {koName}이(가) 본인 커리어에 맞는
          회사인지 판단할 수 있는 1차 자료를 제공합니다.
        </p>

        {company.aliases && company.aliases.length > 0 && (
          <p className="text-sm text-faint-blue">
            참고로 {koName}은(는) <strong>{company.aliases.join(", ")}</strong> 등의
            이름·표기로도 검색됩니다. 모두 같은 회사이며, 이 페이지에서 통합 연봉
            정보를 제공합니다.
          </p>
        )}

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          1. {koName} 신입 vs 시니어 연봉 격차
        </h3>
        <p>
          {describeSalaryGrowth(company)}. 평균적으로 동종업계가 신입→시니어 1.8~2.5배
          격차를 보이는 점을 감안하면 {koName}의 격차는{" "}
          {seniorTotal / entryTotal >= 2.3
            ? "업계 평균보다 큰 편"
            : seniorTotal / entryTotal >= 1.8
            ? "업계 평균 수준"
            : "다소 완만한 편"}
          입니다. 인센티브는 신입 평균{" "}
          {Math.round((company.salary.entry.incentive.avgAmount || 0) / 10000).toLocaleString("ko-KR")}만원,
          시니어 평균{" "}
          {Math.round((company.salary.senior.incentive.avgAmount || 0) / 10000).toLocaleString("ko-KR")}만원
          수준이 보고됩니다.
        </p>

        {benchmark && (
          <>
            <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
              2. 같은 업종 평균 대비 위치
            </h3>
            <p>
              {company.industry} 업종 내 {benchmark.sampleSize}개 회사 데이터 기준,{" "}
              {koName}의 신입 평균은 업종 평균(
              {formatSalaryKorean(benchmark.averageEntry)}) 대비{" "}
              <strong>
                {entryTotal > benchmark.averageEntry
                  ? `+${Math.round(((entryTotal - benchmark.averageEntry) / benchmark.averageEntry) * 100)}% 높은`
                  : `${Math.round(((benchmark.averageEntry - entryTotal) / benchmark.averageEntry) * 100)}% 낮은`}
              </strong>{" "}
              수준이며, 업종 내 상위{" "}
              <strong>{100 - benchmark.percentile}%</strong> 구간에 위치합니다. 시니어
              기준으로도 업종 평균(
              {formatSalaryKorean(benchmark.averageSenior)})과 비교해 본인 커리어 후반의
              기대치를 가늠할 수 있습니다.
            </p>
          </>
        )}

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          3. {koName} 워라밸·근무 환경
        </h3>
        <p>
          {describeWorkLife(company)}. 원격 근무 정책은{" "}
          <strong>{remotePolicy}</strong>
          {company.workLife.remoteWork.policy === "hybrid" &&
            company.workLife.remoteWork.daysPerWeek !== undefined &&
            ` (주 ${company.workLife.remoteWork.daysPerWeek}일 출근)`}
          이며, 연차는 연 {vacation.days}일 부여되고 실사용률은 약 {vacation.usageRate}%로
          보고됩니다. 워라밸을 우선시한다면 이 수치를 동종사와 직접 비교해 본 뒤
          판단하는 것을 권장합니다.
        </p>

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          4. 신입 첫 달 실수령액 & 대출 한도 시뮬레이션
        </h3>
        <p>
          {koName} 신입 영끌 {formatSalaryKorean(entryTotal)} 기준 세전 월 평균은 약{" "}
          <strong>{Math.round(monthlyEntry / 10000).toLocaleString("ko-KR")}만원</strong>
          입니다. 4대보험·소득세 공제 후 실수령액은 머니샐러리{" "}
          <Link
            href={`/salary/${entryTotal}`}
            className="text-electric font-bold underline-offset-2 hover:underline"
          >
            연봉 {Math.round(entryTotal / 10000).toLocaleString("ko-KR")}만원 실수령액
            페이지
          </Link>
          에서 정확 산출이 가능합니다. 같은 연봉 기준 DSR 40% 적용 시 연 약{" "}
          <strong>{dsrCapacity.toLocaleString("ko-KR")}만원</strong>의 원리금 상환 여력이
          있어, 주택담보대출 한도는{" "}
          <Link
            href="/tools/real-estate/dsr"
            className="text-electric font-bold underline-offset-2 hover:underline"
          >
            DSR 계산기
          </Link>
          로 본인 상황 시뮬이 가능합니다.
        </p>

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          5. {koName} 직급별 연봉 — 사원·대리·과장·부장·임원
        </h3>
        <p>
          {koName}의 직급별 연봉(영끌 기준)은 다음과 같이 분포합니다. 신입(사원)은{" "}
          <strong>{formatSalaryKorean(entryTotal)}</strong>, 주니어(사원·대리,
          3~5년차)는 <strong>{formatSalaryKorean(juniorTotal)}</strong>, 시니어(과장·
          차장, 6~10년차)는 <strong>{formatSalaryKorean(seniorTotal)}</strong>,
          리드(차장·부장, 11~15년차)는 <strong>{formatSalaryKorean(leadTotal)}</strong>,
          임원급은 <strong>{formatSalaryKorean(executiveTotal)}</strong> 수준에
          도달합니다. {koName} 대리 연봉, {koName} 과장 연봉, {koName} 부장 연봉을
          검색하는 분이라면 위 표를 본인 연차에 대입해 시장가를 가늠할 수 있습니다.
          단, 인센티브·성과급 비중이 큰 회사일수록 기본급과 영끌 합산의 격차가 크니
          연봉 협상 시에는 두 수치를 모두 확인하세요.
        </p>

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          6. {koName} 월급 실수령액 — 직급별 세전 환산
        </h3>
        <p>
          {koName} 월급은 직급별로 다음과 같이 환산됩니다(세전, 영끌 ÷ 12). 신입{" "}
          <strong>약 {Math.round(monthlyEntry / 10000).toLocaleString("ko-KR")}만원</strong>,
          주니어 <strong>약 {Math.round(monthlyJunior / 10000).toLocaleString("ko-KR")}만원</strong>,
          시니어 <strong>약 {Math.round(monthlySenior / 10000).toLocaleString("ko-KR")}만원</strong>,
          리드 <strong>약 {Math.round(monthlyLead / 10000).toLocaleString("ko-KR")}만원</strong>{" "}
          수준입니다. 세후 실수령액은 4대보험(국민연금·건강보험·고용·산재) + 소득세·
          지방세 공제 후 약 82~87% 수준이며, 부양가족 수와 비과세 항목에 따라 변동
          폭이 있습니다. {koName} 월급 실수령액의 정확한 금액은{" "}
          <Link
            href={`/salary/${entryTotal}`}
            className="text-electric font-bold underline-offset-2 hover:underline"
          >
            연봉 {Math.round(entryTotal / 10000).toLocaleString("ko-KR")}만원
            실수령액 페이지
          </Link>
          에서 확인하거나, 본인 연차 평균 연봉을 위 표에서 골라 머니샐러리 연봉
          계산기로 시뮬레이션할 수 있습니다.
        </p>

        {similar.length > 0 && (
          <>
            <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
              7. 비슷한 연봉대의 다른 회사
            </h3>
            <p>
              {koName}과(와) ±15% 이내의 신입 영끌 연봉을 제공하는 회사로는{" "}
              {similar.map((c, i) => (
                <span key={c.id}>
                  <Link
                    href={`/salary-db/${c.id}`}
                    className="text-electric font-bold underline-offset-2 hover:underline"
                  >
                    {c.name.ko}
                  </Link>
                  {i < similar.length - 1 ? ", " : ""}
                </span>
              ))}{" "}
              등이 있습니다. 동종사 비교는 연봉 협상이나 이직 의사결정에 유용한
              레퍼런스입니다.
            </p>
          </>
        )}

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          8. {koName} 연봉 협상 시 활용 팁
        </h3>
        <p>
          연봉 협상에서는 다음 3가지 자료를 준비하는 것이 일반적입니다. ① 본 페이지의{" "}
          {koName} 시니어 평균(
          <strong>{formatSalaryKorean(seniorTotal)}</strong>) 등 동급 직무 시장가 자료, ②
          본인 직무의 핵심 성과 수치(매출 기여·프로젝트 성과·기술 수준), ③ 인근 동종사{" "}
          {similar[0]?.name.ko && `(예: ${similar[0].name.ko})`} 의 보상 수준. 자세한
          전략은 머니샐러리{" "}
          <Link
            href="/guides/salary-negotiation-secret"
            className="text-electric font-bold underline-offset-2 hover:underline"
          >
            연봉 협상의 비밀
          </Link>{" "}
          가이드에서 확인할 수 있습니다.
        </p>

        <h3 className="text-lg font-black text-navy dark:text-canvas-50 !mt-8">
          9. 다음에 확인할 것
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Link href="/salary-db" className="text-electric hover:underline">
              ← 회사별 연봉 DB 전체 보기
            </Link>
          </li>
          <li>
            <Link href={`/salary/${entryTotal}`} className="text-electric hover:underline">
              {Math.round(entryTotal / 10000).toLocaleString("ko-KR")}만원 실수령액 시뮬레이션
            </Link>
          </li>
          <li>
            <Link href="/guides/year-end-tax-2026" className="text-electric hover:underline">
              연말정산 환급액 가이드 — 본인 케이스 예시
            </Link>
          </li>
          <li>
            <Link href="/tools/real-estate/dsr" className="text-electric hover:underline">
              DSR 계산기 — 본인 연봉 기준 대출 한도 확인
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
