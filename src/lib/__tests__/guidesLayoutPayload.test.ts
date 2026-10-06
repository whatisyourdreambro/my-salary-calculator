// guides/layout.tsx 가 /guides/* 약 300쪽의 RSC·HTML 에 통째로 싣는 guideSupplements 맵 크기 게이트 (2026-09-30 WP-01 PC-04)
// layout 은 params 가 없어 맵 전체를 클라 컴포넌트 GuideSupplement 에 넘기고, 클라가 pathname 으로 한 항목만 고른다 —
// 그래서 항목 하나를 더하면 모든 가이드 쪽의 페이로드가 그만큼 는다(1차 SEO seo-int 뒤 가이드 RSC +86~92%, 쪽당 약 53KB).
// salaryDbLayoutPayload(salary-db 맵 합계 게이트)와 같은 방식이다.
//
// 상한 = 이미 예정된 추가분을 합친 예상치 +10% (통합자 보정, r2 round2-plan WP-01):
//   main 4ef59a4b 2항목 11,745B(br 3,994) · seo-int 167d6faa 48항목 53,209B(br 15,336)
//   + R8-D(10/5, r8-int 0cda8678) samsung-wage-negotiation-2026 4,625B + R4-B3(10/19, f39121d8) civil-servant-net-pay-2026 435B
//   = 50항목 58,363B, brotli(품질 11) 16,632B → +10% 올림 64,200B / 18,300B.
//   '현재 +10%' 로 두면 10/19 R4-B3 보강 추가가 이 게이트에서 막힐 수 있어서다. 10/22 WP-06 이 항목 2개를 더하는데
//   남은 여유(약 5.8KB·br 1.6KB)를 넘으면 그 커밋에서 근거와 함께 상한을 올린다.
// WP-08(가이드 슬롯 PC-02)이 layout 을 쪽별 항목만 넘기게 바꾸면 아래 첫 단언이 실패한다 — 그때 이 게이트를
//   항목당 상한(약 12KB, 현재 최대 nurse-salary 9,967B 통과)으로 바꾼다.
import { readFileSync } from "node:fs";
import { brotliCompressSync, constants } from "node:zlib";
import { describe, expect, it } from "vitest";

import { guideSupplements } from "@/lib/guides/supplements";

/** 원시 JSON 바이트 상한 (예정 합계 58,363B + 약 10%) */
const RAW_LIMIT = 64_200;
/** brotli(품질 11) 상한 (예정 합계 16,632B + 약 10%) */
const BR_LIMIT = 18_300;

describe("guides layout guideSupplements 맵 크기 게이트", () => {
  it("guides/layout.tsx 는 맵 전체를 GuideSupplement 에 넘긴다 (쪽별로 쪼개면 이 게이트를 항목당 상한으로 바꿀 것)", () => {
    const layout = readFileSync("src/app/guides/layout.tsx", "utf8");
    expect(layout).toMatch(/<GuideSupplement\s+map=\{guideSupplements\}/);
  });

  it(`JSON.stringify(guideSupplements) 원시 ${RAW_LIMIT.toLocaleString()}B 미만, brotli ${BR_LIMIT.toLocaleString()}B 미만`, () => {
    const json = JSON.stringify(guideSupplements);
    const raw = Buffer.byteLength(json);
    const br = brotliCompressSync(Buffer.from(json), {
      params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length;
    expect(raw).toBeLessThan(RAW_LIMIT);
    expect(br).toBeLessThan(BR_LIMIT);
  });
});
