// /civil-servant-pay-2027 광고 위 UI 내리기 가드 (2026-10-05 운영자 승인 #6, A06·ADS-06, 감사 code8-01·code8-02·code25-F1)
//
// 9/9 00780026e 가 급수·호봉 선택기를 HomeTopAd 바로 위에, 비공개 의견 폼을 CalcResultAd 바로 위에 넣었다.
// 두 블록은 각각 그 광고 바로 아래에 둔다 — 광고 컴포넌트 순서·개수는 그대로.
//  - 의견 폼: IVT-02(B04)가 먼저 CalcResultAd 바로 아래로 옮겼다. 그 묶음의 가드는 adAdjacentFeedbackShareOrder.test.ts.
//  - 선택기: 10/5 #6 묶음을 11/1 다시 적용(B05)하면서 HomeTopAd 바로 아래로 옮겼다.
// 이 파일은 두 블록의 최종 순서를 함께 고정한다(어느 쪽이든 광고 위로 되돌아가면 실패).
// payTableSnippets.test.ts 는 렌더 결과로 선택기 위치를 보지만 PrivateFeedback 을 null 로 모킹하므로, 폼 순서는 소스로 본다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/civil-servant-pay-2027/page.tsx"), "utf8")
  .replace(/\r\n/g, "\n")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const body = src.slice(src.indexOf("export default function"));
/** 본문 JSX 의 최상위 줄 순서 — 광고·선택기·폼·섹션 여는 태그만 */
const order = [...body.matchAll(/<(HomeTopAd|CalcResultAd|InArticleAd|GuideMidAd|MultiplexAd|CivilPayForecastSelector|PrivateFeedback)\b/g)].map((m) => m[1]);

describe("/civil-servant-pay-2027 — 선택기·의견 폼은 광고 아래", () => {
  it("광고 컴포넌트 순서는 그대로", () => {
    expect(order.filter((n) => n.endsWith("Ad"))).toEqual(["HomeTopAd", "CalcResultAd", "InArticleAd", "GuideMidAd", "MultiplexAd"]);
  });

  it("선택기는 HomeTopAd 바로 다음, 의견 폼은 CalcResultAd 바로 다음", () => {
    expect(order.slice(0, 4)).toEqual(["HomeTopAd", "CivilPayForecastSelector", "CalcResultAd", "PrivateFeedback"]);
    // 줄 단위로도 바로 다음(주석·빈 줄만 사이에)
    expect(body).toMatch(/<HomeTopAd \/>\s*<CivilPayForecastSelector \/>/);
    expect(body).toMatch(/<CalcResultAd \/>\s*<PrivateFeedback target="civil_pay_2027" \/>/);
  });

  it("어느 광고 바로 위에도 선택기·의견 폼이 오지 않는다", () => {
    expect(body).not.toMatch(/<(CivilPayForecastSelector|PrivateFeedback)\b[^>]*\/>\s*<[A-Za-z]*Ad \/>/);
  });
});
