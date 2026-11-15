// /national-pension-estimate-2026 — 2027 보험료율 안내 한 줄 (2026-11-15 SEASONB, app-pages ideas[5]).
// 마지막 광고(MultiplexAd) 아래 맨 끝 한 줄(운영자 결정 2번). 광고 위 '7월 급여명세서 체크' 상자는 N2-app-pages-21(운영자 질문,
// 1/1 RL-44)이 맡으므로 손대지 않는다.
// 근거: 국민연금법 [법률 제22096호, 시행 2026. 10. 20.] 부칙 <법률 제20903호, 2025. 4. 2.> 제4조 제1항(사업장가입자 기여금·부담금
// 2026년 1만분의 475, 2027년 1만분의 500)·제2항(지역·임의·임의계속 2026년 1천분의 95, 2027년 1천분의 100) — 2026-11-15 확인.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/national-pension-estimate-2026/page.tsx"), "utf8");
const AD_TAG = /<(HomeTopAd|InArticleAd|CalcResultAd|GuideMidAd|MultiplexAd|Display2Ad|CoupangBanner|OfferSlot)\b/g;

describe("/national-pension-estimate-2026 — 2027 보험료율 한 줄 (SEASONB ideas[5])", () => {
  const at = src.indexOf('href="/social-insurance-rates-2027"');

  it("모든 광고 태그보다 아래(맨 끝)에 한 번만", () => {
    expect(at).toBeGreaterThan(-1);
    const ads = [...src.matchAll(AD_TAG)].map((m) => m.index ?? Infinity);
    expect(ads.length).toBeGreaterThanOrEqual(6);
    for (const a of ads) expect(a).toBeLessThan(at);
    expect(src.match(/href="\/social-insurance-rates-2027"/g)).toHaveLength(1);
  });

  it("요율은 법정 일정 그대로 — 9.5% -> 10%, 본인 4.75% -> 5%", () => {
    const flat = src.replace(/\s+/g, " ");
    expect(flat).toContain(
      "2027년 1월부터 국민연금 보험료율은 9.5%에서 10%(직장가입자 본인 4.75% → 5%)로 오릅니다(국민연금법 부칙 제4조, 법률 제20903호).",
    );
  });

  it("광고 위 7월 상자와 쪽 날짜는 그대로", () => {
    expect(src).toContain("7월 급여명세서 체크");
    expect(src).toContain('modifiedTime: "2026-07-16"');
  });
});
