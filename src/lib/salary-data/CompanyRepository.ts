import type { CompanyProfile } from "@/types/company";
import { allCompanies } from "@/data/companies";
import { companyAliases, companySearchAliases } from "@/data/companyAliases";
import { normalizeIndustry } from "./industryTaxonomy";
import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";
import { TAX_TABLE_EFFECTIVE_DATE } from "@/config/siteDates";

/** 지주회사 본사 공시만 주입된 회사 — 페이지 이름은 그룹명(예: KB금융그룹)이지만 DART 수치는
 *  지주회사 본사 직원(48~144명) 평균이라 계열사(은행·조선 등) 직원 평균으로 읽히면 안 된다 (COMP-12).
 *  업종·이름 휴리스틱은 KB금융그룹(Finance)·HD현대·SK스퀘어를 놓치므로 id 명시 목록으로 관리.
 *  회사명은 바꾸지 않는다 — 이름이 동결된 회사 <title> 을 만든다. */
const HOLDING_COMPANY_DART_IDS = new Set([
 "kb-financial",
 "hd-hyundai",
 "sk-square",
 "nice-holdings",
 "bnk-financial",
 "jb-financial",
]);

/** DART 공시 요약(dartInjection)으로 disclosed 블록 조립.
 *  수기 disclosed 가 있는 회사에는 절대 적용하지 않는다(수기 우선 —
 *  수기 43곳은 언론 교차확인·산정기준 note 가 붙은 큐레이션 값).
 *  헤드라인 산정 기준(A19, 2026-09-25 운영자 승인): 주입 항목에 b 가 없으면 회사가 공시한
 *  1인평균급여액의 인원 가중 평균(basis "reported"), b="c" 이면 연간 급여총액÷인원 산정치
 *  (basis "computed" — '공식 수치' 라벨 없음). 플래그는 소수인 산정치 쪽에만(클라이언트 번들 절약).
 *  note 는 기준별 문구, 길이는 종전 이하(광고 위 높이 불변).
 *  갱신: 매년 4월 scripts/dart-etl.mjs 재실행(골든 diff 통과 후 커밋). */
function buildDartDisclosed(id: string): CompanyProfile["disclosed"] | undefined {
 const d = dartInjection[id];
 if (!d) return undefined;
 const reported = d.b !== "c";
 const employees = d.e.toLocaleString("ko-KR");
 const staff = `직원 ${employees}명 기준.`;
 return {
 avgSalaryManwon: d.a,
 fiscalYear: d.y,
 ...(d.t != null ? { avgTenureYears: d.t } : {}),
 source: `금융감독원 전자공시(DART) 사업보고서(${d.y} 사업연도) '직원 등의 현황' — OpenDART 수집`,
 sourceUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${d.r}`,
 // 지주회사는 덧붙이지 않고 교체 — 공시 카드(GuideMidAd 위) 높이를 기존 문구와 같게 유지 (B12 COMP-12).
 // 산정 기준(B13 A19)도 기준별로 밝힌다 — 공시 1인평균 기준 문구는 괄호를 줄여 종전 길이 이하로.
 note: HOLDING_COMPANY_DART_IDS.has(id)
 ? reported
 ? `지주회사 본사 직원 ${employees}명 기준(계열사 미포함). 1인평균급여액을 인원 가중 평균(등기임원 제외).`
 : `지주회사 본사 직원 ${employees}명 기준(계열사 직원 평균 아님). 연간급여총액÷인원 가중(등기임원 제외).`
 : reported
 ? HOLDING_SAME_WIDTH_NOTE_IDS.has(id)
 ? `본사 ${employees}명 기준. 계열사·자회사를 제외한 1인평균급여액을 인원 가중 평균한 값(등기임원 제외).`
 : `${staff} 사업부문·성별로 공시된 1인평균급여액을 인원 가중 평균한 값(등기임원 제외).`
 : `${staff} 사업부문·성별 구분 공시를 연간급여총액÷인원으로 가중 평균한 값(등기임원 제외).`,
 basis: reported ? "reported" : "computed",
 };
}

/** 지주회사 본사 공시인데 HOLDING_COMPANY_DART_IDS 에 없는 곳 (2026-09-29 CM-04) — 포스코홀딩스(POSCO홀딩스
 *  본사 524명)·에코프로(지주 185명)·쿠쿠홀딩스(82명). 페이지 이름·별칭(포스코·POSCO·밥솥 1위)이 사업회사처럼
 *  읽혀 계열사 직원 평균으로 오인될 수 있다. 위 지주회사 문구는 일반 문구와 폭이 달라 공시 카드(GuideMidAd 위)
 *  줄바꿈이 바뀌므로, 일반 문구와 단어마다 같은 폭인 문구로 바꾼다(직원→본사, 사업부문·성별로→계열사·자회사를,
 *  공시된→제외한 — 한글 음절끼리). HOLDING_COMPANY_DART_IDS 에 넣지 않는 이유: 그 목록은 문구 폭이 다르고
 *  meta 2차 판정 제외에도 쓰일 예정이라(회사 meta 불변 원칙) 이 목록의 출력은 note 문구만 바뀌어야 한다.
 *  2026-10-30 A8: HD한국조선해양(조선 중간지주, 본사 1,543명 — DART 2025 사업보고서 rcpNo 20260320001032, 공시
 *  1인평균 기준)을 추가 — 같은 폭 문구 '본사 1,543명 기준. 계열사·자회사를 제외한 …'. */
const HOLDING_SAME_WIDTH_NOTE_IDS: ReadonlySet<string> = new Set(["posco", "ecopro", "cuckoo", "hd-ksoe"]);

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

/** 회사 객체에 검색 별칭(aliases·검색 전용 searchAliases)·표준 업종 id(industryId)·DART 공시를 주입하고,
 *  lastUpdated 를 "페이지 내용이 실제로 바뀐 마지막 날"로 파생한다:
 *  max(데이터 파일 lastUpdated, DART 주입일(주입사만), 실수령액 표 재계산일 TAX_TABLE_EFFECTIVE_DATE).
 *  — 실수령액 열(CompanySalaryTable)은 세법 상수 갱신 커밋으로 전 회사가 함께 바뀌므로
 *    데이터 파일 날짜만 쓰면 sitemap·RSS·배지·Dataset 이 실제 변경보다 오래된 날짜를 신고한다
 *    (2026-09-05, naver-onpage-6). max() 라 멱등이며 today() 승격은 절대 금지. */
function enrich(company: CompanyProfile): CompanyProfile {
 const aliases = companyAliases[company.id];
 // 검색 전용 별칭(NAVER-05) — 검색 매칭·메타 keywords·JSON-LD alternateName 에만 쓴다. 화면 문장
 // (CompanyNarrative)은 aliases 만 읽는다. 빈 목록이면 키 자체를 넣지 않는다(회사 객체·출력 불변).
 const searchAliases = companySearchAliases[company.id];
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
 ...(searchAliases && searchAliases.length > 0 ? { searchAliases } : {}),
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
 (c.aliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ?? false) ||
 (c.searchAliases?.some((a) => a.toLowerCase().includes(lowerQuery)) ?? false)
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

/** 회사 페이지 Organization JSON-LD alternateName — 별칭(aliases) + 검색 전용 별칭(searchAliases).
 *  검색 전용 별칭이 없으면 aliases 를 그대로(없으면 undefined) 돌려준다 — 종전 출력과 바이트 동일. */
export function companyAlternateNames(
 company: Pick<CompanyProfile, "aliases" | "searchAliases">
): string[] | undefined {
 const { aliases, searchAliases } = company;
 if (!searchAliases || searchAliases.length === 0) return aliases;
 return Array.from(new Set([...(aliases ?? []), ...searchAliases]));
}
