import { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import type { CompanyProfile, JobLevel } from "@/types/company";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import {
  getComparePairs,
  getComparePairBySlug,
} from "@/lib/salary-data/companyComparePairs";
import {
  formatSalaryKorean,
  industryLabelKo,
  getIndustryBenchmark,
} from "@/lib/companyContentBuilder";
import { buildPageMetadata } from "@/lib/seo";
import { autoBreadcrumbLd, faqLd } from "@/lib/structuredData";
import JsonLd from "@/components/JsonLd";
import { CalcResultAd, HomeTopAd, InArticleAd } from "@/components/AdPlacement";
import CoupangBanner from "@/components/CoupangBanner";
import Breadcrumbs from "@/components/Breadcrumbs";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const dynamic = "force-static";
// 화이트리스트 외 슬러그는 생성하지 않는다 (도어웨이 페이지 방지).
export const dynamicParams = false;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getComparePairs().map((p) => ({ slug: p.slug }));
}

const LEVELS: { key: JobLevel; label: string }[] = [
  { key: "entry", label: "신입" },
  { key: "junior", label: "주니어 (3~5년)" },
  { key: "senior", label: "시니어 (10년+)" },
  { key: "lead", label: "리드·팀장" },
  { key: "executive", label: "임원" },
];

const TIER_LABEL: Record<CompanyProfile["tier"], string> = {
  conglomerate: "대기업",
  unicorn: "유니콘 스타트업",
  startup: "스타트업",
  foreign: "외국계",
  public: "공기업",
};

const REMOTE_LABEL: Record<
  CompanyProfile["workLife"]["remoteWork"]["policy"],
  string
> = {
  remote: "전면 재택",
  hybrid: "하이브리드",
  office: "출근 중심",
};

function levelTotal(c: CompanyProfile, key: JobLevel): number {
  return c.salary[key].base + (c.salary[key].incentive.avgAmount || 0);
}

function pct(hi: number, lo: number): number {
  if (lo <= 0) return 0;
  return Math.round(((hi - lo) / lo) * 100);
}

/** 두 금액 비교 문구: "{회사}가 약 N% 높음" 또는 "비슷한 수준". */
function compareText(aName: string, aVal: number, bName: string, bVal: number): string {
  const diff = pct(Math.max(aVal, bVal), Math.min(aVal, bVal));
  if (diff < 3) return "두 회사가 비슷한 수준";
  const higher = aVal >= bVal ? aName : bName;
  return `${higher}가 약 ${diff}% 높음`;
}

/** 직급별 격차 평균 — 단순 표 외에 "전반적으로 어느 쪽이 우세인가" 한 줄 요약. */
function overallGapText(a: CompanyProfile, b: CompanyProfile): string {
  const diffs = LEVELS.map(({ key }) => {
    const av = levelTotal(a, key);
    const bv = levelTotal(b, key);
    if (av === 0 || bv === 0) return 0;
    return ((av - bv) / bv) * 100;
  }).filter((d) => Number.isFinite(d));
  if (diffs.length === 0) return "직급별 격차가 제한적입니다";
  const avg = diffs.reduce((x, y) => x + y, 0) / diffs.length;
  const abs = Math.abs(Math.round(avg));
  if (abs < 3) return `${a.name.ko}와 ${b.name.ko}는 직급별 평균 격차가 ${abs}% 이내로 거의 동등한 수준`;
  if (avg > 0) return `직급 전반에 걸쳐 ${a.name.ko}가 평균 약 ${abs}% 높은 보상 수준`;
  return `직급 전반에 걸쳐 ${b.name.ko}가 평균 약 ${abs}% 높은 보상 수준`;
}

/** 인센티브 비중 차이 분석. */
function incentiveAnalysis(c: CompanyProfile): {
  ratio: number;
  text: string;
} {
  const base = c.salary.entry.base;
  const avg = c.salary.entry.incentive.avgAmount || 0;
  const ratio = base > 0 ? Math.round((avg / base) * 100) : 0;
  let text: string;
  if (ratio === 0) text = "고정급 중심 (인센티브 비중이 미미)";
  else if (ratio < 10) text = "고정급 중심 (인센티브 보조)";
  else if (ratio < 25) text = "기본급 + 성과급 균형형";
  else if (ratio < 50) text = "성과급 비중 높음";
  else text = "성과급 압도형 (성과에 따라 변동성 큼)";
  return { ratio, text };
}

/** 두 회사의 인센티브 구조 비교 한 줄. */
function incentiveCompareText(a: CompanyProfile, b: CompanyProfile): string {
  const ai = incentiveAnalysis(a);
  const bi = incentiveAnalysis(b);
  if (ai.ratio === bi.ratio) {
    return `${a.name.ko}와 ${b.name.ko} 모두 ${ai.text}으로 인센티브 구조가 유사합니다.`;
  }
  if (Math.abs(ai.ratio - bi.ratio) < 5) {
    return `두 회사 모두 비슷한 인센티브 비중(${ai.ratio}% vs ${bi.ratio}%)으로 보상 구조가 유사합니다.`;
  }
  const higher = ai.ratio > bi.ratio ? a : b;
  const lower = ai.ratio > bi.ratio ? b : a;
  const hRatio = ai.ratio > bi.ratio ? ai.ratio : bi.ratio;
  const lRatio = ai.ratio > bi.ratio ? bi.ratio : ai.ratio;
  return `${higher.name.ko}는 기본급 대비 인센티브 비중이 약 ${hRatio}%로 ${lower.name.ko}(${lRatio}%)보다 변동성이 큰 구조입니다. 성과에 따라 보상 격차가 벌어질 수 있습니다.`;
}

/** 워라밸 비교 문구. */
function workLifeText(a: CompanyProfile, b: CompanyProfile): string {
  const ah = a.workLife.weeklyHours.real;
  const bh = b.workLife.weeklyHours.real;
  if (Math.abs(ah - bh) < 2) {
    return `평균 주당 실근무시간이 ${a.name.ko} ${ah}시간, ${b.name.ko} ${bh}시간으로 거의 비슷합니다.`;
  }
  const shorter = ah <= bh ? a : b;
  const longer = ah <= bh ? b : a;
  const diff = Math.abs(ah - bh);
  return `${shorter.name.ko}의 주당 실근무시간이 약 ${diff}시간 짧아 워라밸이 상대적으로 양호한 편이며, ${longer.name.ko}는 업무 강도가 높을 수 있습니다.`;
}

/** 가장 가치 있는 복지 1~2개 추출 (value 기준). */
function topBenefits(c: CompanyProfile, n = 2): string[] {
  return [...c.benefits]
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, n)
    .map((b) => b.title);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pair = getComparePairBySlug(params.slug);
  if (!pair) return { title: "회사 비교를 찾을 수 없습니다" };
  const a = companyRepository.getById(pair.aId);
  const b = companyRepository.getById(pair.bId);
  if (!a || !b) return { title: "회사 비교를 찾을 수 없습니다" };

  const aEntry = Math.round(levelTotal(a, "entry") / 10000).toLocaleString("ko-KR");
  const bEntry = Math.round(levelTotal(b, "entry") / 10000).toLocaleString("ko-KR");

  return buildPageMetadata({
    title: `${a.name.ko} vs ${b.name.ko} 연봉 비교 2026 — 초봉·직급별 어디가 높을까`,
    description: `${a.name.ko} 신입 영끌 약 ${aEntry}만원, ${b.name.ko} 약 ${bEntry}만원. ${a.name.ko}와 ${b.name.ko}의 신입·주니어·시니어 직급별 평균 연봉, 인센티브 구조, 워라밸, 복지를 2026년 기준으로 나란히 비교했습니다.`,
    path: `/salary-db/compare/${params.slug}`,
    keywords: [
      `${a.name.ko} ${b.name.ko}`,
      `${a.name.ko} vs ${b.name.ko}`,
      `${a.name.ko} ${b.name.ko} 연봉 비교`,
      `${b.name.ko} ${a.name.ko} 연봉`,
      `${a.name.ko} ${b.name.ko} 비교`,
      `${a.name.ko} 워라밸`,
      `${b.name.ko} 워라밸`,
    ],
  });
}

export default function ComparePage({ params }: Props) {
  const pair = getComparePairBySlug(params.slug);
  // GSC 404 출혈 차단(7차): 화이트리스트 외 비교 슬러그 → /salary-db 메인 308
  if (!pair) permanentRedirect("/salary-db");
  const a = companyRepository.getById(pair.aId);
  const b = companyRepository.getById(pair.bId);
  if (!a || !b) permanentRedirect("/salary-db");

  const aEntry = levelTotal(a, "entry");
  const bEntry = levelTotal(b, "entry");
  const aSenior = levelTotal(a, "senior");
  const bSenior = levelTotal(b, "senior");
  const entryWinner = aEntry >= bEntry ? a : b;
  const seniorWinner = aSenior >= bSenior ? a : b;
  const aIndustry = industryLabelKo(a.industry);
  const bIndustry = industryLabelKo(b.industry);
  const sameIndustry = a.industry === b.industry;

  const aBench = getIndustryBenchmark(a);
  const bBench = getIndustryBenchmark(b);
  const aIncentive = incentiveAnalysis(a);
  const bIncentive = incentiveAnalysis(b);

  const aTopBenefits = topBenefits(a);
  const bTopBenefits = topBenefits(b);

  const faqItems = [
    {
      question: `${a.name.ko}와 ${b.name.ko} 중 신입 연봉이 더 높은 곳은?`,
      answer: `신입 영끌 연봉(기본급+평균 인센티브) 기준 ${a.name.ko}는 약 ${formatSalaryKorean(
        aEntry
      )}, ${b.name.ko}는 약 ${formatSalaryKorean(bEntry)}입니다. ${compareText(
        a.name.ko,
        aEntry,
        b.name.ko,
        bEntry
      )}입니다.`,
    },
    {
      question: `${a.name.ko}와 ${b.name.ko} 시니어 연봉은 어디가 높나요?`,
      answer: `시니어(10년+) 영끌 연봉은 ${a.name.ko} 약 ${formatSalaryKorean(
        aSenior
      )}, ${b.name.ko} 약 ${formatSalaryKorean(bSenior)} 수준으로 ${compareText(
        a.name.ko,
        aSenior,
        b.name.ko,
        bSenior
      )}입니다.`,
    },
    {
      question: `${a.name.ko}와 ${b.name.ko}의 인센티브·성과급 구조 차이는?`,
      answer: `${a.name.ko}는 기본급 대비 평균 인센티브 비중이 약 ${aIncentive.ratio}%로 ${aIncentive.text} 구조이며, ${b.name.ko}는 ${bIncentive.ratio}%로 ${bIncentive.text} 구조입니다. 인센티브 비중이 높을수록 성과에 따라 연봉 변동성이 커집니다.`,
    },
    {
      question: `${a.name.ko}와 ${b.name.ko} 워라밸 비교는?`,
      answer: `평균 주당 실근무시간은 ${a.name.ko} ${a.workLife.weeklyHours.real}시간, ${b.name.ko} ${b.workLife.weeklyHours.real}시간입니다. 연차는 각각 ${a.workLife.vacation.days}일·${b.workLife.vacation.days}일 부여되며, 실제 사용률은 ${a.workLife.vacation.usageRate}% vs ${b.workLife.vacation.usageRate}%입니다. 근무시간이 짧고 연차 사용률이 높을수록 워라밸이 양호한 편입니다.`,
    },
    {
      question: `${a.name.ko}와 ${b.name.ko}의 재택근무·근무 형태는 어떻게 다른가요?`,
      answer: `${a.name.ko}는 ${REMOTE_LABEL[a.workLife.remoteWork.policy]}${a.workLife.remoteWork.daysPerWeek ? ` (주 ${a.workLife.remoteWork.daysPerWeek}일)` : ""}, ${b.name.ko}는 ${REMOTE_LABEL[b.workLife.remoteWork.policy]}${b.workLife.remoteWork.daysPerWeek ? ` (주 ${b.workLife.remoteWork.daysPerWeek}일)` : ""} 정책을 운영합니다. 입사 전 본인 라이프스타일과 맞는지 확인하세요.`,
    },
    {
      question: `${a.name.ko} vs ${b.name.ko} 기업 문화는 어떻게 다른가요?`,
      answer: `직원이 평가하는 기업 문화 점수는 ${a.name.ko} ${a.culture.score}점, ${b.name.ko} ${b.culture.score}점(10점 만점)입니다. ${a.name.ko}는 '${a.culture.keywords.slice(0, 2).join(", ")}', ${b.name.ko}는 '${b.culture.keywords.slice(0, 2).join(", ")}'를 핵심 키워드로 합니다.`,
    },
  ];

  if (aBench && bBench) {
    faqItems.push({
      question: `${a.name.ko}와 ${b.name.ko}는 업종 평균 대비 어디에 위치하나요?`,
      answer: `${a.name.ko}는 ${aIndustry} 업종 ${aBench.sampleSize}개사 중 상위 ${100 - aBench.percentile}% 수준(평균 ${formatSalaryKorean(aBench.averageEntry)}), ${b.name.ko}는 ${bIndustry} 업종 ${bBench.sampleSize}개사 중 상위 ${100 - bBench.percentile}% 수준(평균 ${formatSalaryKorean(bBench.averageEntry)})으로 평가됩니다.`,
    });
  }

  faqItems.push({
    question: `${a.name.ko} vs ${b.name.ko} 어디로 입사하는 게 좋을까요?`,
    answer: `초봉을 우선시한다면 ${entryWinner.name.ko}, 장기 커리어와 시니어 연봉 상승을 본다면 ${seniorWinner.name.ko}가 유리할 수 있습니다. 워라밸은 주당 실근무시간이 짧은 회사를, 안정성은 ${a.tier === "conglomerate" || a.tier === "public" ? a.name.ko : b.tier === "conglomerate" || b.tier === "public" ? b.name.ko : "두 회사 모두 동일 tier"}를 고려하세요. 최종 결정은 본인 커리어 목표·연봉 외 보상·복지 가치와 함께 종합 판단해야 합니다.`,
  });

  const breadcrumb = autoBreadcrumbLd(`/salary-db/compare/${params.slug}`, {
    leafName: `${a.name.ko} vs ${b.name.ko} 연봉 비교`,
  });

  return (
    <>
      <JsonLd data={[breadcrumb, faqLd(faqItems)]} />
      <div className="page-width pt-24 pb-3">
        <Breadcrumbs
          path={`/salary-db/compare/${params.slug}`}
          leafName={`${a.name.ko} vs ${b.name.ko}`}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-navy dark:text-canvas-50 mb-3">
          {a.name.ko} vs {b.name.ko} 연봉 비교
        </h1>
        <p className="text-[15px] leading-7 text-muted-blue dark:text-canvas-300 mb-6">
          {sameIndustry ? `${aIndustry} 업종 내` : `${aIndustry}와 ${bIndustry} 업종에 속한`}{" "}
          <strong>{a.name.ko}</strong>({TIER_LABEL[a.tier]})와 <strong>{b.name.ko}</strong>
          ({TIER_LABEL[b.tier]})의 직급별 평균 연봉·인센티브 구조·워라밸·복지를 2026년 최신 기준으로
          나란히 비교합니다. 신입 영끌 연봉 기준{" "}
          <strong className="text-electric">{entryWinner.name.ko}</strong>가 더 높으며, 시니어
          기준으로는 <strong className="text-electric">{seniorWinner.name.ko}</strong>가 앞섭니다.{" "}
          {overallGapText(a, b)}.
        </p>

        <HomeTopAd />

        {/* 직급별 비교 표 */}
        <section className="my-6">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            직급별 영끌 연봉 비교
          </h2>
          <div className="overflow-hidden rounded-2xl border border-canvas-200 dark:border-canvas-700">
            <div className="grid grid-cols-3 bg-canvas-50 dark:bg-canvas-800 text-xs font-bold text-muted-blue dark:text-canvas-300">
              <div className="px-3 py-3">직급</div>
              <div className="px-3 py-3 text-center">{a.name.ko}</div>
              <div className="px-3 py-3 text-center">{b.name.ko}</div>
            </div>
            {LEVELS.map(({ key, label }) => {
              const av = levelTotal(a, key);
              const bv = levelTotal(b, key);
              return (
                <div
                  key={key}
                  className="grid grid-cols-3 border-t border-canvas-100 dark:border-canvas-700 text-sm"
                >
                  <div className="px-3 py-3 font-medium text-navy dark:text-canvas-100">
                    {label}
                  </div>
                  <div
                    className={`px-3 py-3 text-center font-bold ${
                      av >= bv ? "text-electric" : "text-muted-blue dark:text-canvas-300"
                    }`}
                  >
                    {formatSalaryKorean(av)}
                  </div>
                  <div
                    className={`px-3 py-3 text-center font-bold ${
                      bv >= av ? "text-electric" : "text-muted-blue dark:text-canvas-300"
                    }`}
                  >
                    {formatSalaryKorean(bv)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-faint-blue">
            ※ 영끌 연봉 = 기본급 + 평균 인센티브. 공개 자료 기반 추정치이며 부서·성과에 따라 다를 수 있습니다.
          </p>
        </section>

        {/* 상세 분석 (확장) */}
        <section className="my-8 prose prose-slate dark:prose-invert max-w-none text-[15px] leading-7 text-muted-blue dark:text-canvas-300">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50">
            상세 분석: {a.name.ko}와 {b.name.ko}의 보상 격차는 어디서 오는가
          </h2>
          <p>
            <strong>신입 비교</strong> — {a.name.ko}의 신입 영끌 연봉은{" "}
            {formatSalaryKorean(aEntry)}, {b.name.ko}는 {formatSalaryKorean(bEntry)}로{" "}
            {compareText(a.name.ko, aEntry, b.name.ko, bEntry)}입니다. 첫 입사 시 받는 보상을
            중시한다면 이 격차가 가장 직접적인 비교 지표입니다. 다만 신입 연봉은 시작점일 뿐이며, 다음
            단계인 주니어·시니어 연봉 상승 곡선까지 함께 보는 것이 중요합니다.
          </p>
          <p>
            <strong>시니어 비교</strong> — 경력 10년 이상 시니어급은 {a.name.ko}{" "}
            {formatSalaryKorean(aSenior)}, {b.name.ko} {formatSalaryKorean(bSenior)}로{" "}
            {compareText(a.name.ko, aSenior, b.name.ko, bSenior)}입니다. 신입 대비 시니어의 연봉
            상승률은 {a.name.ko} 약 {pct(aSenior, aEntry)}%, {b.name.ko} 약 {pct(bSenior, bEntry)}%
            수준으로, 장기 커리어 관점에서의 보상 잠재력을 보여줍니다.
          </p>
          <p>
            <strong>인센티브 구조</strong> — {incentiveCompareText(a, b)} {a.name.ko}의 인센티브
            타깃은 기본급의 {a.salary.entry.incentive.target}%·최대{" "}
            {a.salary.entry.incentive.max}%이며, {b.name.ko}는 타깃 {b.salary.entry.incentive.target}
            %·최대 {b.salary.entry.incentive.max}% 수준으로 책정되어 있습니다.
          </p>
          <p>
            <strong>워라밸·근무 환경</strong> — {workLifeText(a, b)} 연차는 각각{" "}
            {a.workLife.vacation.days}일·{b.workLife.vacation.days}일이며, 실제 사용률은{" "}
            {a.workLife.vacation.usageRate}% vs {b.workLife.vacation.usageRate}%입니다.
            재택근무 정책은 {a.name.ko}가 {REMOTE_LABEL[a.workLife.remoteWork.policy]}, {b.name.ko}는{" "}
            {REMOTE_LABEL[b.workLife.remoteWork.policy]}로 운영됩니다.
          </p>
          <p>
            <strong>기업 문화</strong> — 직원이 평가하는 기업 문화 점수는 {a.name.ko}{" "}
            {a.culture.score}점, {b.name.ko} {b.culture.score}점(10점 만점)입니다. {a.name.ko}의
            핵심 키워드는 '{a.culture.keywords.join(", ")}'이며, {b.name.ko}는 '
            {b.culture.keywords.join(", ")}'을 강조합니다. 본인 성향과 일치하는 문화 키워드를
            선택하는 것이 만족도에 큰 영향을 줍니다.
          </p>
        </section>

        <InArticleAd />

        {/* 인센티브·주식 보상 구조 */}
        <section className="my-8">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            인센티브·주식·사인온 구조 비교
          </h2>
          <div className="overflow-hidden rounded-2xl border border-canvas-200 dark:border-canvas-700">
            <div className="grid grid-cols-3 bg-canvas-50 dark:bg-canvas-800 text-xs font-bold text-muted-blue dark:text-canvas-300">
              <div className="px-3 py-3">항목</div>
              <div className="px-3 py-3 text-center">{a.name.ko}</div>
              <div className="px-3 py-3 text-center">{b.name.ko}</div>
            </div>
            <div className="grid grid-cols-3 border-t border-canvas-100 dark:border-canvas-700 text-sm">
              <div className="px-3 py-3 font-medium text-navy dark:text-canvas-100">
                인센티브 타깃·최대
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {a.salary.entry.incentive.target}% / {a.salary.entry.incentive.max}%
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {b.salary.entry.incentive.target}% / {b.salary.entry.incentive.max}%
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-canvas-100 dark:border-canvas-700 text-sm">
              <div className="px-3 py-3 font-medium text-navy dark:text-canvas-100">
                평균 인센티브 (신입)
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {a.salary.entry.incentive.avgAmount
                  ? formatSalaryKorean(a.salary.entry.incentive.avgAmount)
                  : "—"}
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {b.salary.entry.incentive.avgAmount
                  ? formatSalaryKorean(b.salary.entry.incentive.avgAmount)
                  : "—"}
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-canvas-100 dark:border-canvas-700 text-sm">
              <div className="px-3 py-3 font-medium text-navy dark:text-canvas-100">
                주식 보상
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {a.salary.entry.stock
                  ? `${a.salary.entry.stock.type} ${formatSalaryKorean(a.salary.entry.stock.amount)} (${a.salary.entry.stock.vesting})`
                  : "—"}
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {b.salary.entry.stock
                  ? `${b.salary.entry.stock.type} ${formatSalaryKorean(b.salary.entry.stock.amount)} (${b.salary.entry.stock.vesting})`
                  : "—"}
              </div>
            </div>
            <div className="grid grid-cols-3 border-t border-canvas-100 dark:border-canvas-700 text-sm">
              <div className="px-3 py-3 font-medium text-navy dark:text-canvas-100">
                사인온 보너스
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {a.salary.entry.signOn ? formatSalaryKorean(a.salary.entry.signOn) : "—"}
              </div>
              <div className="px-3 py-3 text-center text-muted-blue dark:text-canvas-300">
                {b.salary.entry.signOn ? formatSalaryKorean(b.salary.entry.signOn) : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* 업종 평균 대비 위치 */}
        {(aBench || bBench) && (
          <section className="my-8">
            <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
              업종 평균 대비 어디에 위치하나
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aBench && (
                <div className="p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700">
                  <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                    {a.name.ko}
                  </p>
                  <p className="text-xs text-muted-blue dark:text-canvas-300 leading-6">
                    {aIndustry} 업종 {aBench.sampleSize}개사 중 신입 영끌{" "}
                    <strong className="text-electric">상위 {100 - aBench.percentile}%</strong>
                    <br />
                    업종 평균: {formatSalaryKorean(aBench.averageEntry)}
                  </p>
                </div>
              )}
              {bBench && (
                <div className="p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700">
                  <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-1">
                    {b.name.ko}
                  </p>
                  <p className="text-xs text-muted-blue dark:text-canvas-300 leading-6">
                    {bIndustry} 업종 {bBench.sampleSize}개사 중 신입 영끌{" "}
                    <strong className="text-electric">상위 {100 - bBench.percentile}%</strong>
                    <br />
                    업종 평균: {formatSalaryKorean(bBench.averageEntry)}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 기업 문화·복지 비교 */}
        <section className="my-8">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            기업 문화·복지 비교
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[a, b].map((c) => {
              const benefits = c === a ? aTopBenefits : bTopBenefits;
              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700"
                >
                  <p className="text-sm font-bold text-navy dark:text-canvas-50 mb-2">
                    {c.logo} {c.name.ko}
                  </p>
                  <p className="text-xs text-muted-blue dark:text-canvas-300 leading-6 mb-2">
                    문화 점수: <strong className="text-electric">{c.culture.score}/10</strong>{" "}
                    · {REMOTE_LABEL[c.workLife.remoteWork.policy]}
                  </p>
                  {c.culture.pros.length > 0 && (
                    <p className="text-xs text-muted-blue dark:text-canvas-300 leading-6 mb-1">
                      <strong className="text-emerald-600 dark:text-emerald-400">장점</strong>:{" "}
                      {c.culture.pros.slice(0, 2).join(" · ")}
                    </p>
                  )}
                  {c.culture.cons.length > 0 && (
                    <p className="text-xs text-muted-blue dark:text-canvas-300 leading-6 mb-1">
                      <strong className="text-rose-600 dark:text-rose-400">단점</strong>:{" "}
                      {c.culture.cons.slice(0, 2).join(" · ")}
                    </p>
                  )}
                  {benefits.length > 0 && (
                    <p className="text-xs text-muted-blue dark:text-canvas-300 leading-6 mt-2">
                      <strong>대표 복지</strong>: {benefits.join(" · ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <CalcResultAd />

        {/* 개별 회사 상세 링크 */}
        <section className="my-8">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-3">
            각 회사 상세 연봉 보기
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[a, b].map((c) => (
              <Link
                key={c.id}
                href={`/salary-db/${c.id}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 hover:border-electric transition-colors"
              >
                <span className="text-2xl">{c.logo}</span>
                <span>
                  <span className="block text-sm font-bold text-navy dark:text-canvas-50">
                    {c.name.ko} 연봉 상세
                  </span>
                  <span className="block text-xs text-faint-blue">
                    직급별 실수령액·복지·워라밸
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <Link href="/salary-db" className="text-electric font-bold hover:underline">
              ← 회사별 연봉 DB 전체 보기
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <section className="my-8">
          <h2 className="text-lg font-black text-navy dark:text-canvas-50 mb-4">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-canvas-900 border border-canvas-200 dark:border-canvas-700 rounded-2xl p-5"
              >
                <h3 className="font-bold text-navy dark:text-canvas-50 text-sm mb-2">
                  Q. {faq.question}
                </h3>
                <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <CoupangBanner
          responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
        />

        {/* 관련 계산기 — 비교 페이지 방문자의 다음 액션 동선 (세션당 PV ↑) */}
        <RelatedCalculators
          currentPath={`/salary-db/compare/${params.slug}`}
          limit={4}
          title="비교한 연봉으로 시뮬레이션해보세요"
        />

        <div className="my-8">
          <ShareButtons
            title={`${a.name.ko} vs ${b.name.ko} 연봉 비교`}
            description={`${a.name.ko}과 ${b.name.ko}의 직급별 영끌 연봉·복지·문화를 한눈에 비교`}
          />
        </div>
      </div>
    </>
  );
}
