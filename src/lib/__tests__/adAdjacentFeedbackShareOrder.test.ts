// 결과 광고 바로 위 의견 폼·공유 버튼 금지 가드 (IVT-02 / ADS-04)
//
// /civil-servant-pay-2027 의 PrivateFeedback(제출 뒤 접수 화면으로 줄어듦)과 /year-end-tax-preview 의
// ShareSection(하이드레이션 뒤 나타남)이 CalcResultAd 바로 위에 있으면 광고가 사용자의 손가락 아래로 움직인다.
// 두 블록은 광고 바로 아래에 둔다 — 광고 컴포넌트의 종류·순서·개수는 그대로.
//
// OF4 A1 (2026-11-02): 같은 무늬 — ShareSection 은 SSR·하이드레이션 첫 렌더에서 null 이고 그 뒤에 나타나
// 아래 광고(페이지의 마지막 광고)를 공유 블록 높이 + 여백만큼 밀어냈다. 공유 블록을 마지막 광고 바로 아래로 옮겼다.
//
// A1 범위 축소 (2026-11-02, 운영자 규칙 적용 — 새 설계 아님): 승인된 15곳 중 10곳은 공유 블록을 빼면 광고 두 개가
// 래퍼만 사이에 두고 붙는다(HomeTopAd→MultiplexAd 6곳, CoupangBanner→MultiplexAd 3곳, GuideMidAd→HomeTopAd 1곳).
// 9월에 기각·재제안 금지된 'HomeTop 직후 Multiplex 연속 배치'(docs/ad-experiments.md)와 연속 광고 금지 규칙에 걸리므로
// A1 은 광고가 붙지 않는 5곳에만 남기고, 10곳은 운영(2cab06bc)과 같은 배치 — 공유 블록이 두 광고 사이 — 로 되돌렸다.
// 10곳의 공유 블록을 옮기는 일은 결정 K(멀티플렉스 배치 축소·철회)와 함께 다시 정한다. 그 전까지 아래 셋째 묶음이
// 공유 블록을 두 광고 사이에 고정한다. 저장소 전체의 연속 광고 가드는 adUnitAdjacency.test.ts.
// (year-end-tax-checklist 의 데스크톱 전용 aside SidebarAd 는 별도 열이라 광고 순서 목록 끝에만 들어가고 공유 블록 이웃 판정과는 무관하다.)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function body(file: string) {
  const src = readFileSync(resolve(process.cwd(), file), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  // async 페이지(hub/[id]·industry/[slug]·job/[slug]·region/[slug])도 본문을 찾도록 — 못 찾으면 실패시킨다.
  const at = src.search(/export default (?:async )?function/);
  expect(at, file).toBeGreaterThan(-1);
  return src.slice(at);
}
const adOrder = (text: string) => [...text.matchAll(/<([A-Z][A-Za-z0-9]*Ad)\b/g)].map((m) => m[1]);
/** 광고 유닛·쿠팡 배너·공유 블록 태그 순서(주석 제외) */
const slotOrder = (text: string) =>
  [...text.matchAll(/<(ShareSection|CoupangBanner|[A-Z][A-Za-z0-9]*Ad)\b/g)].map((m) => m[1]);

describe("광고 바로 위에 의견 폼·공유 버튼을 두지 않는다", () => {
  it("/civil-servant-pay-2027: 의견 폼은 CalcResultAd 바로 다음", () => {
    const text = body("src/app/civil-servant-pay-2027/page.tsx");
    expect(adOrder(text)).toEqual(["HomeTopAd", "CalcResultAd", "InArticleAd", "GuideMidAd", "MultiplexAd"]);
    expect(text).toMatch(/<CalcResultAd \/>\s*<PrivateFeedback target="civil_pay_2027" \/>/);
    expect(text).not.toMatch(/<PrivateFeedback\b[^>]*\/>\s*<[A-Za-z]*Ad \/>/);
  });

  it("/year-end-tax-preview: 공유 버튼은 CalcResultAd 바로 다음", () => {
    const text = body("src/app/year-end-tax-preview/page.tsx");
    expect(adOrder(text)).toEqual(["HomeTopAd", "GuideMidAd", "InArticleAd", "CalcResultAd"]);
    expect(text).toMatch(/<CalcResultAd \/>\s*<ShareSection\b/);
    expect(text).not.toMatch(/<ShareSection\b[^>]*\/>\s*<[A-Za-z]*Ad \/>/);
  });
});

describe("늦게 나타나는 공유 블록은 마지막 광고 아래 (OF4 A1 — 광고가 붙지 않는 5곳)", () => {
  const CASES: Array<[file: string, lastAd: string, ads: string[]]> = [
    ["src/app/samsung-negotiation-2026/page.tsx", "<HomeTopAd />", ["GuideMidAd", "InArticleAd", "HomeTopAd"]],
    ["src/app/year-end-tax-2027/page.tsx", "<MultiplexAd />", ["GuideMidAd", "CalcResultAd", "InArticleAd", "MultiplexAd"]],
    ["src/app/about/page.tsx", "<HomeTopAd />", ["GuideMidAd", "HomeTopAd"]],
    ["src/app/hub/[id]/page.tsx", "<MultiplexAd />", ["HomeTopAd", "CalcResultAd", "InArticleAd", "GuideMidAd", "MultiplexAd"]],
    ["src/app/region/[slug]/page.tsx", "<MultiplexAd />", ["HomeTopAd", "GuideMidAd", "CalcResultAd", "InArticleAd", "MultiplexAd"]],
  ];

  it.each(CASES)("%s: 광고 순서 그대로, ShareSection 한 번, %s 보다 뒤", (file, lastAd, ads) => {
    const text = body(file);
    expect(adOrder(text)).toEqual(ads);
    expect(text.split("<ShareSection").length - 1).toBe(1);
    expect(text.lastIndexOf(lastAd)).toBeGreaterThan(-1);
    expect(text.indexOf("<ShareSection")).toBeGreaterThan(text.lastIndexOf(lastAd));
  });
});

describe("결정 K 전까지 10곳의 공유 블록은 두 광고 사이 (운영 2cab06bc 배치 그대로)", () => {
  // [파일, 공유 블록 바로 앞 슬롯, 바로 뒤 슬롯, 광고 순서] — 앞·뒤 슬롯은 공유 블록을 빼면 래퍼만 사이에 두고 붙는다.
  const BETWEEN: Array<[file: string, before: string, after: string, ads: string[]]> = [
    ["src/app/hub/page.tsx", "GuideMidAd", "HomeTopAd", ["GuideMidAd", "HomeTopAd"]],
    ["src/app/industry/[slug]/page.tsx", "CoupangBanner", "MultiplexAd", ["HomeTopAd", "CalcResultAd", "InArticleAd", "GuideMidAd", "MultiplexAd"]],
    ["src/app/job/[slug]/page.tsx", "CoupangBanner", "MultiplexAd", ["HomeTopAd", "CalcResultAd", "InArticleAd", "GuideMidAd", "MultiplexAd"]],
    ["src/app/retirement-pension-2026/page.tsx", "HomeTopAd", "MultiplexAd", ["InArticleAd", "CalcResultAd", "GuideMidAd", "HomeTopAd", "MultiplexAd"]],
    ["src/app/social-insurance-rates-2027/page.tsx", "HomeTopAd", "MultiplexAd", ["InArticleAd", "GuideMidAd", "CalcResultAd", "HomeTopAd", "MultiplexAd"]],
    ["src/app/tax-rates-2026/page.tsx", "HomeTopAd", "MultiplexAd", ["InArticleAd", "CalcResultAd", "GuideMidAd", "HomeTopAd", "MultiplexAd"]],
    ["src/app/tips/page.tsx", "CoupangBanner", "MultiplexAd", ["HomeTopAd", "InArticleAd", "GuideMidAd", "MultiplexAd"]],
    ["src/app/year-end-tax-2026/page.tsx", "HomeTopAd", "MultiplexAd", ["CalcResultAd", "InArticleAd", "GuideMidAd", "HomeTopAd", "MultiplexAd"]],
    ["src/app/year-end-tax-checklist/page.tsx", "HomeTopAd", "MultiplexAd", ["CalcResultAd", "GuideMidAd", "InArticleAd", "HomeTopAd", "MultiplexAd", "SidebarAd"]],
    ["src/app/year-end-tax-settlement-2026/page.tsx", "HomeTopAd", "MultiplexAd", ["InArticleAd", "CalcResultAd", "GuideMidAd", "HomeTopAd", "MultiplexAd"]],
  ];

  it.each(BETWEEN)("%s: 광고 순서 그대로, ShareSection 한 번, %s 와 %s 사이", (file, before, after, ads) => {
    const text = body(file);
    expect(adOrder(text)).toEqual(ads);
    expect(text.split("<ShareSection").length - 1).toBe(1);
    const slots = slotOrder(text);
    const at = slots.indexOf("ShareSection");
    expect(slots.slice(at - 1, at + 2)).toEqual([before, "ShareSection", after]);
  });
});
