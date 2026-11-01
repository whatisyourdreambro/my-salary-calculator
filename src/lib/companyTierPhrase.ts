// src/lib/companyTierPhrase.ts
//
// 회사 페이지 핵심 요약(CompanyInsights) 첫 문장 '{회사}({영문})는 {업종} 업종의 {분류}로,' 조사 정정
// (2026-10-05, 10/30 회사 묶음).
//
// 종전 문구는 조사를 고정으로 붙여 두 군데가 틀렸다.
//  - '({영문})는' — 받침 있는 회사명 219쪽에서 '쿠팡(Coupang)는'. 조사는 괄호 앞 한글 이름에 맞춘다(은/는 1음절끼리, 폭 같음).
//  - '{분류}로' — 받침 있는 분류(대기업·유니콘·스타트업·공기업/공공기관) 412쪽에서 '대기업로'·'유니콘로'.
// 이 요약은 페이지 끝 광고(HomeTopAd) 위라 띄어쓰기로 나뉜 단어마다 종전보다 넓어지지 않게 고른다
// (본문은 keep-all 줄바꿈 — 단어마다 폭이 같거나 좁으면 줄 수가 늘지 않는다).
// 단어 = 줄바꿈 자리로 나뉜 묶음. 띄어쓰기뿐 아니라 '/' 뒤도 줄바꿈 자리라 '공기업/' 은 따로 한 묶음이다
// (11/1 통합 실측: '공공기관으로,' 는 그 자리를 없앤 6음절 한 묶음이라 공공기관 5쪽 398-410px 에서 한 줄 늘어
//  HomeTopAd +22~23px — k-water·korea-post·komsco·hira·ebs-korea. 종전 묶음 '공기업/' 을 되살렸다).
//   대기업로(4)            -> 대형사로(4)      받침 없는 같은 뜻의 말로 바꿔 '로'를 살린다
//   유니콘로(4)            -> 유니콘,(3)       '으로'를 붙이면 5음절이라 조사 없이 쉼표로 잇는다
//   스타트업로(5)          -> 스타트업,(4)     위와 같음
//   공기업/공공기관로(3/+5) -> 공기업/공공기관,(3/+4)  '/' 뒤 자리를 지키고 '으로'(뒤 묶음 6음절) 없이 쉼표로 잇는다
//   외국계로(4)            -> 그대로
// 클라이언트 번들에 실려도 되는 작은 순수 모듈 — 데이터 import 금지.
import type { CompanyProfile } from "@/types/company";
import { josaParticle } from "@/lib/josa";

/**
 * [분류 낱말, 조사] — 화면은 종전과 같은 텍스트 노드 구조(분류 낱말 노드 + '조사,' 노드)로 낸다.
 * 사이트 본문은 letter-spacing 이 있어 텍스트 노드(글자 묶음)마다 폭이 1/64px 단위로 반올림된다 — 같은 글자 폭이라도
 * 노드를 더 잘게 나누면 문장 폭이 0.03px 늘 수 있고, 그 폭에 꼭 맞던 문장은 한 줄 늘어난다
 * (조기 실측 ① 재측정: 우리카드 632px 요약 문장 550.00 -> 550.03px, 한 줄 증가로 HomeTopAd +23px).
 */
const INSIGHTS_TIER_PARTS: Record<CompanyProfile["tier"], readonly [string, string]> = {
  conglomerate: ["대형사", "로"],
  unicorn: ["유니콘", ""],
  startup: ["스타트업", ""],
  public: ["공기업/공공기관", ""],
  foreign: ["외국계", "로"],
};

/** '{업종} 업종의 ' 뒤 분류 문구를 [낱말, 조사]로. 모르는 tier 는 종전처럼 원문 + '로'. */
export function insightsTierParts(tier: CompanyProfile["tier"] | string): readonly [string, string] {
  return INSIGHTS_TIER_PARTS[tier as CompanyProfile["tier"]] ?? [String(tier), "로"];
}

/** '{업종} 업종의 ' 뒤에 오는 분류 문구(조사 포함, 쉼표 제외). */
export function insightsTierPhrase(tier: CompanyProfile["tier"] | string): string {
  return insightsTierParts(tier).join("");
}

/** '{회사}({영문})' 뒤 은/는 — 괄호 앞 한글 이름 기준. 판정 불가(병기 형식)면 종전 '는' 그대로(폭 유지). */
export function insightsTopicParticle(koName: string): string {
  const particle = josaParticle(koName, "은/는");
  return particle.length === 1 ? particle : "는";
}
