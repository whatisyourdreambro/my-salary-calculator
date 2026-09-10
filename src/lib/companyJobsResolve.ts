// src/lib/companyJobsResolve.ts
//
// companyJobsMap 의 "클라이언트 안전" 절반 — 타입과 pathname→허브 조회만 있고 데이터 import 가 없다.
//
// 배경 (2026-09-11 번들 실측): CompanyRelatedJobs("use client")가 resolveHub 를 companyJobsMap.ts 에서
// import 했는데, 그 모듈은 industriesData·jobsData(118KB) 를 최상위에서 import 한다. 결과적으로
// /salary-db/* 900여 쪽의 layout 청크(111KB raw / 30KB br)에 직업 프로필 전체가 실려 갔다 —
// 회사 페이지는 사이트 최대 유입 엔진("{회사명} 연봉")이라 첫 로드마다 이 비용을 냈다.
// 서버 전용 빌더(buildCompanyJobsMap)는 companyJobsMap.ts 에 남고, 이 파일은 데이터에 의존하지 않는다.
// ★ 이 파일에 @/data/* 를 import 하지 말 것 (테스트 src/lib/__tests__/companyJobs.test.ts 가 검사).

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
