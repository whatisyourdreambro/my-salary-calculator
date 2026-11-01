// 결과 광고 바로 위 의견 폼·공유 버튼 금지 가드 (IVT-02 / ADS-04)
//
// /civil-servant-pay-2027 의 PrivateFeedback(제출 뒤 접수 화면으로 줄어듦)과 /year-end-tax-preview 의
// ShareSection(하이드레이션 뒤 나타남)이 CalcResultAd 바로 위에 있으면 광고가 사용자의 손가락 아래로 움직인다.
// 두 블록은 광고 바로 아래에 둔다 — 광고 컴포넌트의 종류·순서·개수는 그대로.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function body(file: string) {
  const src = readFileSync(resolve(process.cwd(), file), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  return src.slice(src.indexOf("export default function"));
}
const adOrder = (text: string) => [...text.matchAll(/<([A-Z][A-Za-z0-9]*Ad)\b/g)].map((m) => m[1]);

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
