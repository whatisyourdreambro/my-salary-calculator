// 재미 도구 결과 화면 — 결과 인접 광고 아래 32px 가드 (2026-10-05 운영자 승인 #5, 광고 아래만 여백)
//
// 감사 code26-02(/fun/salary-rank·/fun/weekend-duty)·code11-01(/fun/salary-slip·/fun/spending-test)·code10-02(/fun/reincarnation):
// InArticleAd 바로 아래 전폭 버튼이 광고 컨테이너 바깥 여백 1.5rem(24px)과 병합돼 24px 에 붙어 있었다.
// 광고 바로 다음 요소(부모는 모두 일반 블록 — flex·space-y 아님)에 mt-8 을 줘서 병합 결과가 32px 가 되게 했다.
// 광고·광고 래퍼는 그대로(광고 위 여백 추가 없음). 소스 스캔(jsdom 없음).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) =>
  readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

/** 광고 태그 다음에 오는 첫 여는 태그(사이의 닫는 태그·공백은 건너뜀)와 건너뛴 닫는 태그 수 */
function afterAd(file: string, ad: string, nth = 0) {
  const src = read(file);
  let at = -1;
  for (let k = 0; k <= nth; k++) {
    at = src.indexOf(ad, at + 1);
    expect(at, `${file}: ${ad} #${nth}`).toBeGreaterThan(-1);
  }
  const m = /^((?:\s|<\/[A-Za-z][\w.]*>)*)(<[A-Za-z][\w.]*\b[^>]*>)/.exec(src.slice(at + ad.length));
  expect(m, `${file}: 광고 다음 여는 태그`).not.toBeNull();
  return { tag: m![2], closed: (m![1].match(/<\//g) ?? []).length, before: src.slice(Math.max(0, at - 120), at) };
}

const CASES: { file: string; ad: string; wrapper: RegExp }[] = [
  { file: "src/components/calculators/SalaryRankCalculator.tsx", ad: "<InArticleAd />", wrapper: /<div className="mt-4">\s*$/ },
  { file: "src/components/WeekendDutyGame.tsx", ad: "<InArticleAd />", wrapper: /<div className="max-w-4xl mx-auto mt-6">\s*$/ },
  { file: "src/app/fun/salary-slip/page.tsx", ad: "<InArticleAd />", wrapper: /<div className="mt-4">\s*$/ },
  { file: "src/app/fun/spending-test/page.tsx", ad: "<InArticleAd />", wrapper: /<div className="mb-4">\s*$/ },
  { file: "src/app/fun/reincarnation/page.tsx", ad: "<InArticleAd />", wrapper: /<div className="mb-3">\s*$/ },
];

describe("재미 도구 결과 인접 광고 아래 32px", () => {
  it.each(CASES)("$file", ({ file, ad, wrapper }) => {
    const { tag, closed, before } = afterAd(file, ad);
    // 광고 래퍼는 그대로(위쪽 여백을 늘리지 않음) — 광고는 래퍼 하나에 싸여 있고 그 래퍼만 닫힌 뒤 다음 요소가 온다
    expect(before).toMatch(wrapper);
    expect(closed).toBe(1);
    // 광고 아래 요소는 mt-8 (= 32px, 광고 여백 24px 와 병합) 이상
    expect(tag).toMatch(/\bmt-(8|9|10|12)\b/);
  });
});
