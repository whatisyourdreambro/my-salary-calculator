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
 * 지주회사 KSIC(64992 지주회사, 세분류가 비어 3자리로만 온 649) — DART 업종이 '금융'으로 매핑되지만 실제로는
 * SK·효성·한국앤컴퍼니·동원산업·웅진·GRT·로스웰 같은 사업 지주회사다. 금융·은행 허브에 넣으면
 * 은행 회사 페이지에 'SK·효성'이 금융 업계로, 지주회사 lite 에 금융·은행 직업 블록이 붙는다
 * (2026-09-29 MISSED-lite-1). 업종 재분류(광고 위·메타)는 하지 않고 허브 소속만 뺀다.
 */
export function isHoldingCompanyKsic(ksicCode: string | undefined): boolean {
  if (!ksicCode) return false;
  // 64999(그 외 분류 안 된 금융업) 등 실제 금융사는 빼지 않는다 — 지주회사 세세분류 64992 만
  return ksicCode === "649" || ksicCode.startsWith("64992");
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
