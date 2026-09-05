import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";
import { companyAliases } from "@/data/companyAliases";
import { normalizeIndustry } from "./industryTaxonomy";
import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";
import { TAX_TABLE_EFFECTIVE_DATE } from "@/config/siteDates";

/** DART 공시 요약(dartInjection)으로 disclosed 블록 조립.
 *  수기 disclosed 가 있는 회사에는 절대 적용하지 않는다(수기 우선 —
 *  수기 43곳은 언론 교차확인·산정기준 note 가 붙은 큐레이션 값).
 *  갱신: 매년 4월 scripts/dart-etl.mjs 재실행(골든 diff 통과 후 커밋). */
function buildDartDisclosed(id: string): CompanyProfile["disclosed"] | undefined {
 const d = dartInjection[id];
 if (!d) return undefined;
 return {
 avgSalaryManwon: d.a,
 fiscalYear: d.y,
 ...(d.t != null ? { avgTenureYears: d.t } : {}),
 source: `금융감독원 전자공시(DART) 사업보고서(${d.y} 사업연도) '직원 등의 현황' — OpenDART 수집`,
 sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${d.r}`,
 note: `직원 ${d.e.toLocaleString("ko-KR")}명 기준. 사업부문·성별 구분 공시를 연간급여총액÷인원으로 가중 평균한 값(등기임원 제외).`,
 };
}

/** "YYYY-MM-DD" 문자열들 중 가장 늦은 날짜 — 날짜로 파싱해 비교(문자열 비교 금지),
 *  파싱 불가·빈 값은 무시. 후보가 전부 무효면 undefined. 반환값은 원본 문자열 그대로. */
function latestDate(...candidates: (string | undefined)[]): string | undefined {
 let best: string | undefined;
 let bestTime = Number.NEGATIVE_INFINITY;
 for (const c of candidates) {
 if (!c) continue;
 const t = new Date(c).getTime();
 if (Number.isNaN(t) || t <= bestTime) continue;
 best = c;
 bestTime = t;
 }
 return best;
}

/** 회사 객체에 검색 별칭(aliases)·표준 업종 id(industryId)·DART 공시를 주입하고,
 *  lastUpdated 를 "페이지 내용이 실제로 바뀐 마지막 날"로 파생한다:
 *  max(데이터 파일 lastUpdated, DART 주입일(주입사만), 실수령액 표 재계산일 TAX_TABLE_EFFECTIVE_DATE).
 *  — 실수령액 열(CompanySalaryTable)은 세법 상수 갱신 커밋으로 전 회사가 함께 바뀌므로
 *    데이터 파일 날짜만 쓰면 sitemap·RSS·배지·Dataset 이 실제 변경보다 오래된 날짜를 신고한다
 *    (2026-09-05, naver-onpage-6). max() 라 멱등이며 today() 승격은 절대 금지. */
function enrich(company: CompanyProfile): CompanyProfile {
 const aliases = companyAliases[company.id];
 const dartDisclosed = company.disclosed ? undefined : buildDartDisclosed(company.id);
 const lastUpdated =
 latestDate(
 company.lastUpdated,
 // 공시 카드가 새로 붙는 실질 콘텐츠 변경 — sitemap lastModified 정직 갱신
 dartDisclosed ? DART_INJECTION_DATE : undefined,
 TAX_TABLE_EFFECTIVE_DATE
 ) ?? company.lastUpdated;
 return {
 ...company,
 ...(aliases ? { aliases } : {}),
 ...(dartDisclosed ? { disclosed: dartDisclosed } : {}),
 lastUpdated,
 industryId: normalizeIndustry(company.industry),
 };
}

// 별칭·업종 id가 주입된 회사 목록 (모듈 로드 시 1회 생성).
const enrichedCompanies: CompanyProfile[] = allCompanies.map(enrich);

export const companyRepository = {
 getAll: (): CompanyProfile[] => {
 return enrichedCompanies;
 },

 getById: (id: string): CompanyProfile | undefined => {
 return enrichedCompanies.find((c) => c.id === id);
 },

 search: (query: string): CompanyProfile[] => {
 const lowerQuery = query.toLowerCase().trim();
 if (!lowerQuery) return enrichedCompanies;
 return enrichedCompanies.filter(
 (c) =>
 c.name.ko.toLowerCase().includes(lowerQuery) ||
 c.name.en.toLowerCase().includes(lowerQuery) ||
 c.industry.toLowerCase().includes(lowerQuery) ||
 (c.aliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ?? false)
 );
 },

 /** 표준 업종 id에 속한 회사 목록. */
 getByIndustry: (industryId: string): CompanyProfile[] => {
 return enrichedCompanies.filter((c) => c.industryId === industryId);
 },

 /** 데이터에 실제 존재하는 표준 업종 id 목록. */
 getIndustryIds: (): string[] => {
 return Array.from(new Set(enrichedCompanies.map((c) => c.industryId ?? "etc")));
 },
};
