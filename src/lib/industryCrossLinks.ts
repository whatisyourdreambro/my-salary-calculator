// 두 업종 분류의 교차 링크 — 정적 표 (2026-11-15 SEASONC, app-data-pages ideas[3]).
//
// /industry/[slug](업계 추정 연봉·경력별, 27쪽)와 /salary-db/listed/industry/[industryId](DART 사업보고서 공시 평균연봉 순위,
// 28쪽)는 같은 검색('반도체 업계 연봉')을 받지만 서로 링크가 없었다. 짝은 사이트 자체 분류 industriesData 의 industryIds 와
// 공시 업종 id 가 정확히 같은 경우만 싣는다(각 공시 업종은 업계 한 곳에만 속한다). 공시 업종이 없는 업계(공기업·의료·외국계·
// 스타트업·대기업)와 업계 짝이 없는 공시 업종(소비재)은 싣지 않는다. 테스트(industryCrossLinks1115)가 두 데이터와 대조한다.
//
// 이 모듈은 가볍게 둔다 — dartRanking(공시 원자료)·industriesData 를 import 하지 않아 /industry 쪽 번들과 salary-db layout 의
// 클라이언트 청크에 데이터가 실리지 않는다. 링크 블록은 두 쪽 모두 마지막 광고 아래에서만 렌더한다.

export interface IndustryListedPair {
  /** /industry/{industry} */
  industry: string;
  /** 업계 페이지 이름 (industriesData name) */
  industryName: string;
  /** /salary-db/listed/industry/{listed} */
  listed: string;
  /** 공시 업종 이름 (dartRanking industryKo) */
  listedName: string;
}

export const INDUSTRY_LISTED_PAIRS: readonly IndustryListedPair[] = [
  { industry: "it-software", industryName: "IT·소프트웨어", listed: "it-software", listedName: "IT·인터넷" },
  { industry: "semiconductor", industryName: "반도체·전자", listed: "semiconductor", listedName: "반도체·디스플레이" },
  { industry: "semiconductor", industryName: "반도체·전자", listed: "electronics", listedName: "전자·전기" },
  { industry: "finance-banking", industryName: "금융·은행", listed: "bank", listedName: "은행" },
  { industry: "finance-banking", industryName: "금융·은행", listed: "securities", listedName: "증권·자산운용" },
  { industry: "finance-banking", industryName: "금융·은행", listed: "finance", listedName: "금융" },
  { industry: "pharmaceutical-biotech", industryName: "제약·바이오", listed: "pharma-bio", listedName: "제약·바이오" },
  { industry: "automotive", industryName: "자동차·모빌리티", listed: "automotive", listedName: "자동차·부품" },
  { industry: "construction", industryName: "건설·건축", listed: "construction", listedName: "건설·부동산" },
  { industry: "game", industryName: "게임", listed: "game", listedName: "게임" },
  { industry: "media-entertainment", industryName: "미디어·엔터테인먼트", listed: "media-entertainment", listedName: "미디어·엔터테인먼트" },
  { industry: "telecom", industryName: "통신", listed: "telecom", listedName: "통신" },
  { industry: "education", industryName: "교육", listed: "education", listedName: "교육" },
  { industry: "ecommerce-retail", industryName: "이커머스·유통", listed: "retail-commerce", listedName: "유통·이커머스" },
  { industry: "consulting-accounting", industryName: "컨설팅·회계법인", listed: "consulting", listedName: "컨설팅·회계" },
  { industry: "steel-heavy-industry", industryName: "철강·중공업", listed: "steel", listedName: "철강·금속" },
  { industry: "steel-heavy-industry", industryName: "철강·중공업", listed: "heavy-industry", listedName: "중공업·조선" },
  { industry: "manufacturing", industryName: "기계·제조", listed: "manufacturing", listedName: "제조" },
  { industry: "chemical-energy", industryName: "화학·에너지·정유", listed: "chemical", listedName: "화학·소재" },
  { industry: "chemical-energy", industryName: "화학·에너지·정유", listed: "energy", listedName: "에너지·전력" },
  { industry: "chemical-energy", industryName: "화학·에너지·정유", listed: "battery", listedName: "2차전지·배터리" },
  { industry: "insurance", industryName: "보험", listed: "insurance", listedName: "보험" },
  { industry: "food-beverage", industryName: "식품·음료", listed: "food-beverage", listedName: "식품·음료" },
  { industry: "logistics", industryName: "물류·운송", listed: "logistics", listedName: "물류·운송" },
  { industry: "fashion-beauty", industryName: "패션·뷰티", listed: "fashion-beauty", listedName: "패션·뷰티" },
  { industry: "defense-aerospace", industryName: "방위산업·항공우주", listed: "defense-aerospace", listedName: "방위산업·항공우주" },
  { industry: "travel-leisure", industryName: "여행·레저", listed: "travel-leisure", listedName: "여행·레저" },
];

/** /industry/{slug} 아래에 걸 공시 순위 링크 (없으면 빈 배열) */
export function listedRankingLinksForIndustry(slug: string): { href: string; name: string }[] {
  return INDUSTRY_LISTED_PAIRS.filter((p) => p.industry === slug).map((p) => ({
    href: `/salary-db/listed/industry/${p.listed}`,
    name: p.listedName,
  }));
}

/** /salary-db/listed/industry/{id} 아래에 걸 업계 추정 연봉 링크 (없으면 null) */
export function industryLinkForListed(listedId: string): { href: string; name: string } | null {
  const pair = INDUSTRY_LISTED_PAIRS.find((p) => p.listed === listedId);
  return pair ? { href: `/industry/${pair.industry}`, name: pair.industryName } : null;
}
