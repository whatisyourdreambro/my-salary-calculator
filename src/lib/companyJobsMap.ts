// src/lib/companyJobsMap.ts
//
// 회사 페이지 → 업종별 직업 연봉(/job/[slug]) 내부링크용 경량 맵 (google-clusters-2).
// 이 모듈은 순수 함수만 둔다(클라이언트 안전): 데이터 입력은 호출자(서버 layout)가
// companyRepository·listedCohort(dartLite → dartDisclosed 약 1.3MB, 서버 전용)를 읽어 넘긴다.
// ★이 파일에 dartLite/dartDisclosed/CompanyRepository 를 import 하지 말 것 —
//   CompanyRelatedJobs(클라)가 resolveHub 를 런타임 import 하므로 클라 번들이 오염된다.
//
// 구조: 허브(industriesData) 단위로 회사 id·상장 종목코드를 묶어 직렬화 크기를 줄인다
// (회사마다 hubId 를 반복 저장하면 ~30KB, 허브별 그룹화면 ~15KB — 테스트가 25KB 상한 게이트).
// 매핑 규칙은 CompanyConnections 와 동일: 표준 업종 id(industryIds) 1순위 → tier 집계 허브 폴백.
// 상장 lite 페이지는 KSIC → 표준 업종(ksicToIndustry) → industryIds 매핑이 있을 때만 포함
// (tier 정보가 없어 폴백 없음, "etc" 는 제외).

import { industriesData, type IndustryProfile } from "@/data/industriesData";
import { getJobById } from "@/data/jobsData";

/** 허브당 직업 링크 상한 — RelatedCompanies 등 기존 추천망과 경쟁 최소화 */
export const COMPANY_JOBS_LIMIT = 4;

export interface CompanyJobLink {
  /** /job/[slug] */
  slug: string;
  name: string;
  /** 전체 평균 연봉(만원) — jobsData.salary.overall */
  avg: number;
}

export interface CompanyJobsHub {
  /** industriesData id (/industry/[id]) */
  id: string;
  /** 업종 허브 한글명 */
  name: string;
  jobs: CompanyJobLink[];
  /** /salary-db/[id] 회사 id 목록 */
  companies: string[];
  /** /salary-db/listed/[stockCode] 종목코드 목록 */
  listed: string[];
}

export type CompanyJobsMap = CompanyJobsHub[];

/** 입력 최소 형태 — CompanyProfile(enrich 후 industryId 보유)·DartLiteCompany 가 그대로 만족 */
export interface CompanyJobsCompanyInput {
  id: string;
  industryId?: string;
  tier?: IndustryProfile["aggregateTier"];
}
export interface CompanyJobsListedInput {
  stockCode: string;
  industryId: string;
}

function hubByIndustryId(industryId: string | undefined): IndustryProfile | undefined {
  if (!industryId || industryId === "etc") return undefined;
  return industriesData.find((p) => p.industryIds?.includes(industryId));
}

function jobsOf(hub: IndustryProfile): CompanyJobLink[] {
  const out: CompanyJobLink[] = [];
  const seen = new Set<string>();
  for (const id of hub.topJobIds) {
    if (seen.has(id)) continue;
    const job = getJobById(id);
    if (!job) continue; // 허브에 오타 id 가 있어도 링크 깨짐 없이 건너뜀
    seen.add(id);
    out.push({ slug: job.id, name: job.name, avg: job.salary.overall });
    if (out.length >= COMPANY_JOBS_LIMIT) break;
  }
  return out;
}

/**
 * 회사 정본 + 상장 lite 코호트 → 허브별 경량 맵. 서버(layout 모듈 스코프)에서 1회 호출.
 */
export function buildCompanyJobsMap(
  companies: readonly CompanyJobsCompanyInput[],
  listed: readonly CompanyJobsListedInput[]
): CompanyJobsMap {
  const hubs = new Map<string, CompanyJobsHub>();
  const hubFor = (p: IndustryProfile): CompanyJobsHub | null => {
    const existing = hubs.get(p.id);
    if (existing) return existing;
    const jobs = jobsOf(p);
    if (jobs.length === 0) return null;
    const h: CompanyJobsHub = { id: p.id, name: p.name, jobs, companies: [], listed: [] };
    hubs.set(p.id, h);
    return h;
  };

  for (const c of companies) {
    const profile =
      hubByIndustryId(c.industryId) ??
      (c.tier ? industriesData.find((p) => p.aggregateTier === c.tier) : undefined);
    if (!profile) continue;
    const h = hubFor(profile);
    if (h && !h.companies.includes(c.id)) h.companies.push(c.id);
  }

  for (const l of listed) {
    const profile = hubByIndustryId(l.industryId);
    if (!profile) continue;
    const h = hubFor(profile);
    if (h && !h.listed.includes(l.stockCode)) h.listed.push(l.stockCode);
  }

  // 회사·상장 모두 비어 있는 허브는 직렬화에서 제외
  return [...hubs.values()].filter((h) => h.companies.length + h.listed.length > 0);
}

/**
 * pathname → 허브. 대상은 /salary-db/[id] 와 /salary-db/listed/[stockCode] 두 패턴뿐.
 * 인덱스·ranking·compare·submit·listed 인덱스·listed/industry·top-* 는 맵 키에 없으므로 null.
 */
export function resolveHub(pathname: string | null, map: CompanyJobsMap): CompanyJobsHub | null {
  if (!pathname) return null;
  const segs = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (segs[0] !== "salary-db") return null;

  if (segs.length === 3 && segs[1] === "listed") {
    const code = segs[2];
    return map.find((h) => h.listed.includes(code)) ?? null;
  }
  if (segs.length === 2) {
    // 한글 슬러그(정상 동작 — 오판 금지)는 인코딩된 채 올 수 있어 디코드 후 매칭
    let id = segs[1];
    try {
      id = decodeURIComponent(id);
    } catch {
      /* 잘못된 인코딩은 원문 그대로 매칭 */
    }
    return map.find((h) => h.companies.includes(id)) ?? null;
  }
  return null;
}
