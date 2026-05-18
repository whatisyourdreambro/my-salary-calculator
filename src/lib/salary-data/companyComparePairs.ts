// src/lib/salary-data/companyComparePairs.ts
//
// 회사 비교 페이지(/salary-db/compare/[slug])용 페어 화이트리스트.
// "A vs B 연봉 비교" 검색을 노린다. 전 조합(N×N)을 만들면 도어웨이 스팸이 되므로,
// 같은 업종 내에서 연봉 인접한 회사 + 업종 상위 3개사끼리만 페어를 생성한다.
// 모든 페어는 (1) 같은 업종이라 비교 의미가 있고 (2) 양쪽 모두 실제 데이터를 가진다.

import type { CompanyProfile } from "@/types/company";
import { companyRepository } from "./CompanyRepository";

export interface ComparePair {
  /** companyA-vs-companyB 형태 슬러그 (A가 신입 영끌 기준 상위) */
  slug: string;
  aId: string;
  bId: string;
}

/** 업종별 인접 페어를 생성할 때 상위 몇 개사까지 볼지 (대형 업종 페이지 폭증 방지) */
const ADJACENT_CAP = 30;

function entryTotalOf(c: CompanyProfile): number {
  return c.salary.entry.base + (c.salary.entry.incentive.avgAmount || 0);
}

let cached: ComparePair[] | null = null;

/** 화이트리스트 페어 전체. */
export function getComparePairs(): ComparePair[] {
  if (cached) return cached;

  const all = companyRepository.getAll();
  const byIndustry = new Map<string, CompanyProfile[]>();
  for (const c of all) {
    const key = c.industryId ?? "etc";
    if (key === "etc") continue; // 분류 불명 업종은 비교 페어 제외
    const list = byIndustry.get(key);
    if (list) list.push(c);
    else byIndustry.set(key, [c]);
  }

  const seen = new Set<string>();
  const pairs: ComparePair[] = [];

  const addPair = (a: CompanyProfile, b: CompanyProfile) => {
    if (a.id === b.id) return;
    const key = [a.id, b.id].sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    // A는 신입 영끌 상위 회사로 고정 → 슬러그·표기 일관성
    const [hi, lo] =
      entryTotalOf(a) >= entryTotalOf(b) ? [a, b] : [b, a];
    pairs.push({ slug: `${hi.id}-vs-${lo.id}`, aId: hi.id, bId: lo.id });
  };

  for (const companies of byIndustry.values()) {
    if (companies.length < 2) continue;
    const sorted = [...companies].sort(
      (x, y) => entryTotalOf(y) - entryTotalOf(x)
    );
    // 업종 상위 3개사는 서로 모두 비교 (대표 라이벌 매칭 보장)
    const topN = Math.min(3, sorted.length);
    for (let i = 0; i < topN; i++) {
      for (let j = i + 1; j < topN; j++) {
        addPair(sorted[i], sorted[j]);
      }
    }
    // 나머지는 연봉 인접 페어 (상위 ADJACENT_CAP개사 한정)
    const capped = sorted.slice(0, ADJACENT_CAP);
    for (let i = 0; i < capped.length - 1; i++) {
      addPair(capped[i], capped[i + 1]);
    }
  }

  cached = pairs;
  return pairs;
}

/** 슬러그로 페어 조회 (화이트리스트에 없으면 undefined). */
export function getComparePairBySlug(slug: string): ComparePair | undefined {
  return getComparePairs().find((p) => p.slug === slug);
}
