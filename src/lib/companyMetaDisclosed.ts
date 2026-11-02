// src/lib/companyMetaDisclosed.ts
//
// L10'(승인⑧) 회사 meta description 의 공시 평균연봉 후미 주입 — 대상 판정 단일 소스 (2026-09-25 준비, 10/1 예약 재빌드에서 적용).
//
// 대상 = 아래 네 조건을 모두 만족하는 회사 (revenue-10x-plan L10' 축소판):
//  1) 공시 출처 URL 이 금감원 DART(dart.fss.or.kr) 또는 알리오(alio.go.kr) 원문 — 언론 보도 인용은 제외
//  2) 사업연도가 정확히 "2025" (과년도·회계연도 표기 변형 제외)
//  3) 산정 기준이 회사 공시 1인평균급여액(A19 basis "reported") 또는 수기 큐레이션 — 급여총액÷인원
//     자체 산정치(basis "computed")는 제외
//  4) 공시 평균이 회사 <title> 의 '신입 ~ 시니어' 범위 안 — 범위 밖 수치를 붙이면 제목과 충돌해 보인다
// 숫자는 공시 카드 헤드라인(company.disclosed.avgSalaryManwon)과 같은 값·같은 표기(formatManwonKorean).
//
// 이 판정 하나를 seo.ts(description 후미)와 pageModified.ts(대상 회사 수정일 승격)가 같이 쓴다 —
// description 이 바뀐 회사와 sitemap lastmod·RSS pubDate 가 오른 회사가 어긋나지 않게.
//
// ⚠️ 순수 함수만 — 회사 데이터·DART 배열 import 금지(호출부가 회사 객체를 넘긴다). sitemap·RSS·
//    generateMetadata 어디서 import 해도 번들이 불지 않게 siteDates.ts 처럼 가볍게 유지한다.

import type { CompanyProfile } from "@/types/company";
import { getCompanySalaryBasis } from "@/lib/companySalaryBasis";

// 빌드 시점 게이트는 잎 모듈 companyMetaGate.ts 에 있다(순환 import 방지) — 종전 import 경로 유지용 재수출
export {
  COMPANY_META_DISCLOSED_FROM_MS,
  isCompanyMetaDisclosedLive,
} from "@/lib/companyMetaGate";

/** description 에 싣는 공시 사업연도 — 매년 4월 DART 재수집(dart-etl) 뒤 다음 연도로 올릴지 재판단 */
export const COMPANY_META_DISCLOSED_FISCAL_YEAR = "2025";

/** 공시 원문 호스트(DART·알리오, 하위 도메인 포함)인가 — 파싱 불가·빈 값은 false */
export function isOfficialDisclosureUrl(url: string | undefined): boolean {
  if (!url) return false;
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  return (
    host === "dart.fss.or.kr" ||
    host.endsWith(".dart.fss.or.kr") ||
    host === "alio.go.kr" ||
    host.endsWith(".alio.go.kr")
  );
}

export interface CompanyMetaDisclosedFigure {
  /** 공시 평균연봉(만원) — 카드 헤드라인과 같은 값 */
  avgSalaryManwon: number;
  /** 공시 사업연도 — COMPANY_META_DISCLOSED_FISCAL_YEAR */
  fiscalYear: string;
}

/**
 * 수기 공시 카드 값을 원문 값으로 바로잡은 회사 — 바로잡기 때문에 새로 켜질 표면을 종전대로 꺼 둔다.
 *  - meta description 공시 후미·sitemap lastmod·RSS pubDate 승격(아래 판정이 null): 제목·설명 동결 규칙(35일 창)
 *  - 공시 카드의 DART 배지·과년도 이력 표(회사 page.tsx dartStats): GuideMidAd 위 카드가 길어진다
 * db-insurance(A5, 2026-10): 뉴스 인용 1억3,700만원 -> DART 원문 1억370만원. 출처가 DART 원문이 되어 L10' 대상 조건을
 * 새로 채우고, DART 산정치와의 괴리(종전 32%)가 사라져 배지·이력 게이트(10%)를 새로 통과한다.
 * meritz-fire(운영자 승인 15번, 2026-11-02): 세계일보 인용 -> DART 2025 사업보고서 원문 합 계 행(값 1억4,397만원 그대로, 출처·note 교체).
 * 출처가 DART 원문이 되어 L10' 대상 조건(2025·basis 없음·제목 범위 8,500만원~1억6,200만원 안)을 새로 채운다 — 보류가 없으면
 * meta description 후미·sitemap lastmod·RSS pubDate 가 움직인다. 배지·이력 표는 DART 두 산정 방식 괴리(V4) 플래그로 dartStats 가
 * 원래 없어(dartCompanyStatsById 미포함) 이 목록이 막는 것은 메타 쪽뿐이다.
 * 운영자가 메타·카드 모양 변경을 승인하면 여기서 id 를 지운다(2월 메타 동결 해제 때 재판단).
 */
export const DISCLOSED_CORRECTION_HOLD_IDS: ReadonlySet<string> = new Set(["db-insurance", "meritz-fire"]);

type MetaDisclosedInput = {
  /** 있으면 DISCLOSED_CORRECTION_HOLD_IDS 를 본다(회사 객체를 통째로 넘기는 호출부) */
  id?: string;
  salary?: CompanyProfile["salary"];
  disclosed?: CompanyProfile["disclosed"];
};

/**
 * description 후미에 실을 공시 평균연봉 — 대상이 아니면 null. 날짜 게이트와 무관한 데이터 판정만 한다
 * (게이트는 호출부가 isCompanyMetaDisclosedLive 로 건다).
 * '신입 ~ 시니어' 는 회사 <title> 과 같은 산식(companyMetadataInput: 신입 = getCompanySalaryBasis 의
 * entryTotalWon, 시니어 = senior.base + 평균 인센티브)으로 다시 계산한다.
 */
export function companyMetaDisclosedFigure(
  company: MetaDisclosedInput
): CompanyMetaDisclosedFigure | null {
  const d = company.disclosed;
  const salary = company.salary;
  if (!d || !salary) return null;
  if (company.id && DISCLOSED_CORRECTION_HOLD_IDS.has(company.id)) return null;
  if (!isOfficialDisclosureUrl(d.sourceUrl)) return null;
  if (d.fiscalYear !== COMPANY_META_DISCLOSED_FISCAL_YEAR) return null;
  if (d.basis === "computed") return null;
  if (!Number.isFinite(d.avgSalaryManwon) || d.avgSalaryManwon <= 0) return null;

  const entryTotalWon = getCompanySalaryBasis({ salary, disclosed: d }).entryTotalWon;
  const seniorTotalWon = salary.senior.base + (salary.senior.incentive.avgAmount || 0);
  if (!(entryTotalWon > 0) || !(seniorTotalWon > 0)) return null;
  const avgWon = d.avgSalaryManwon * 10_000;
  if (avgWon < entryTotalWon || avgWon > seniorTotalWon) return null;

  return { avgSalaryManwon: d.avgSalaryManwon, fiscalYear: d.fiscalYear };
}
