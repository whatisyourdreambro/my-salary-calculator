import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";
import { companyAliases } from "@/data/companyAliases";
import { normalizeIndustry } from "./industryTaxonomy";
import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";

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

/** 회사 객체에 검색 별칭(aliases)·표준 업종 id(industryId)·DART 공시를 주입한다. */
function enrich(company: CompanyProfile): CompanyProfile {
 const aliases = companyAliases[company.id];
 const dartDisclosed = company.disclosed ? undefined : buildDartDisclosed(company.id);
 return {
 ...company,
 ...(aliases ? { aliases } : {}),
 ...(dartDisclosed
 ? {
 disclosed: dartDisclosed,
 // 공시 카드가 새로 붙는 실질 콘텐츠 변경 — sitemap lastModified 정직 갱신
 lastUpdated:
 company.lastUpdated && company.lastUpdated > DART_INJECTION_DATE
 ? company.lastUpdated
 : DART_INJECTION_DATE,
 }
 : {}),
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
