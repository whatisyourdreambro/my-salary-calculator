// 감사 #5 목록 밖 같은 유형 — 결과/인아티클 광고 바로 아래 전폭 CTA 카드 링크 32px 가드 (2026-10-05 운영자 승인 #5 '광고 아래만 여백')
//
// 승인 문구는 '광고 아래 32px 안에 탭 대상이 있는 곳 어디든'. 감사 25건 밖에서 소스 스캔으로 같은 모양
// (광고 > 전폭 Link 카드 묶음, 부모는 일반 블록, 간격 24px)을 6곳 더 찾아 같은 방식(mt-8)으로 고쳤다.
// 광고·광고 위는 그대로. 소스 스캔(jsdom 없음).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) =>
  readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

function afterAd(file: string, ad: string) {
  const src = read(file);
  const at = src.indexOf(ad);
  expect(at, `${file}: ${ad}`).toBeGreaterThan(-1);
  const rest = src.slice(at + ad.length);
  const m = /^((?:\s|<\/[A-Za-z][\w.]*>)*)(<[A-Za-z][\w.]*\b[^>]*>)/.exec(rest);
  expect(m, `${file}: 광고 다음 여는 태그`).not.toBeNull();
  return { tag: m![2], closed: (m![1].match(/<\//g) ?? []).length, rest: rest.slice(m![0].length) };
}

const CASES = [
  { file: "src/app/civil-servant-pay-2027/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/minimum-wage-2026/page.tsx", ad: "<CalcResultAd />" },
  { file: "src/app/minimum-wage-2027/page.tsx", ad: "<CalcResultAd />" },
  { file: "src/app/teacher-pay-2026/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/year-end-tax-settlement-2026/page.tsx", ad: "<CalcResultAd />" },
  { file: "src/app/new-employee-salary-2026/page.tsx", ad: "<InArticleAd />" },
];

describe("광고 바로 아래 CTA 카드 링크 32px (감사 목록 밖 같은 유형)", () => {
  it.each(CASES)("$file", ({ file, ad }) => {
    const { tag, closed, rest } = afterAd(file, ad);
    expect(closed).toBe(0);
    expect(tag).toMatch(/\bmt-(8|9|10|12)\b/);
    // 다음 요소는 카드 링크 자체이거나 첫 자식이 카드 링크 — 바로 그 탭 대상에 간격을 준 것
    expect(/^<Link\b/.test(tag) || /^\s*<Link\b/.test(rest)).toBe(true);
  });
});
