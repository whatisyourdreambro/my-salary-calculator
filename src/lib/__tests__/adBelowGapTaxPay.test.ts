// 세금·급여·도구 페이지 — 결과/인아티클 광고 아래 32px 가드 (2026-10-05 운영자 승인 #5, 광고 아래만 여백)
//
// 감사 #5 목록(code8-04·code12-07·code15-02·code10-02·code16-04·code20-03·code22-05)에서 광고 바로 아래 탭 대상
// (전폭 CTA 카드 링크·제휴 오퍼 카드 링크·프리셋/탭 버튼)이 광고 컨테이너 바깥 여백 1.5rem(24px)에 붙어 있던 곳.
// 광고 다음 요소(또는 그 요소를 싼 새 래퍼)에 mt-8 을 줘 병합 결과 32px. 부모는 모두 일반 블록. 광고·광고 위는 그대로.
// 소스 스캔(jsdom 없음).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) =>
  readFileSync(resolve(process.cwd(), p), "utf8").replace(/\r\n/g, "\n").replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

/** 광고 태그 다음에 오는 첫 여는 태그(사이의 닫는 태그·공백은 건너뜀)와 그 뒤 원문 */
function afterAd(file: string, ad: string, nth = 0) {
  const src = read(file);
  let at = -1;
  for (let k = 0; k <= nth; k++) {
    at = src.indexOf(ad, at + 1);
    expect(at, `${file}: ${ad} #${nth}`).toBeGreaterThan(-1);
  }
  const rest = src.slice(at + ad.length);
  const m = /^((?:\s|<\/[A-Za-z][\w.]*>)*)(<[A-Za-z][\w.]*\b[^>]*>)/.exec(rest);
  expect(m, `${file}: 광고 다음 여는 태그`).not.toBeNull();
  return { tag: m![2], closed: (m![1].match(/<\//g) ?? []).length, rest: rest.slice(m![0].length) };
}

const MT8 = /\bmt-(8|9|10|12)\b/;

const CTA_CASES = [
  { file: "src/app/firefighter-pay-2026/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/new-employee-2026/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/police-pay-2026/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/health-insurance-2026/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/tools/finance/installment/page.tsx", ad: "<CalcResultAd />" },
];

const OFFER_CASES = [
  { file: "src/app/credit-card-deduction-2026/page.tsx", ad: "<CalcResultAd />" },
  { file: "src/app/rent-tax-credit-2026/page.tsx", ad: "<CalcResultAd />" },
  { file: "src/app/year-end-tax/page.tsx", ad: "<InArticleAd />" },
  { file: "src/app/year-end-tax-preview/page.tsx", ad: "<InArticleAd />" },
];

describe("광고 바로 아래 CTA·버튼 32px", () => {
  it.each(CTA_CASES)("$file", ({ file, ad }) => {
    const { tag, closed } = afterAd(file, ad);
    expect(closed, "광고는 래퍼 없이 형제 — 다음 요소가 곧바로 온다").toBe(0);
    expect(tag).toMatch(MT8);
  });
});

describe("광고 바로 아래 제휴 오퍼 카드 32px (mt-8 래퍼)", () => {
  it.each(OFFER_CASES)("$file", ({ file, ad }) => {
    const { tag, closed, rest } = afterAd(file, ad);
    expect(closed).toBe(0);
    expect(tag).toBe('<div className="mt-8">');
    // 래퍼 안에는 오퍼 슬롯 하나만 — 슬롯 자체·제휴 코드는 무접촉
    expect(rest).toMatch(/^\s*<OfferSlot vertical="loan" \/>\s*<\/div>/);
  });
});

describe("/tools/math 탭 버튼 32px", () => {
  it("CalcResultAd 바로 다음이 MathCalculators 이고, 그 루트가 mt-8", () => {
    const { tag, closed } = afterAd("src/app/tools/math/page.tsx", "<CalcResultAd />");
    expect(closed).toBe(0);
    expect(tag).toBe("<MathCalculators />");
    const root = /export default function MathCalculators\(\)[\s\S]*?return \([\s\S]*?(<div className="[^"]*">)/.exec(
      read("src/components/calculators/MathCalculators.tsx"),
    );
    expect(root?.[1]).toMatch(MT8);
  });
});
