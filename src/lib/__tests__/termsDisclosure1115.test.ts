// N2-app-pages-05 (2026-11-15 감사 app-pages-b07-F04·F05) — /terms 제휴 고지와 최종 업데이트 날짜 회귀 가드.
//
// 제7조가 가입한 적 없는 제휴망 '아이라이크클릭'을 적었다(src/data/offers.json 의 ilikeclick 항목은 PLACEHOLDER·active false,
// 운영자 상시 규칙상 가입 금지). '최종 업데이트: 2026년 6월'은 8/25·9/9·10/4 수정 뒤에도 그대로였다.
// -> '(링크프라이스)'만, 날짜는 이 수정의 실제 날짜(KST). offers.json·AffiliateSlot 등 제휴 코드는 건드리지 않는다.
// 한국어 /terms 는 수동 광고 유닛이 없다(영문 /en/terms 는 하단 광고가 있어 N2-app-pages-16 로 분리).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const src = readSrc("src/app/terms/page.tsx");

/** 오늘(KST) 자정 — 최종 업데이트 날짜가 미래가 아닌지 확인용 */
function todayKst(): Date {
  const now = new Date(Date.now() + 9 * 3600 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

describe("/terms 제7조 제휴 고지", () => {
  it("가입하지 않은 제휴망 이름이 없고 링크프라이스만 적는다", () => {
    expect(src).not.toContain("아이라이크클릭");
    expect(src).toContain("제휴 네트워크(링크프라이스)의 제휴 링크");
  });

  it("고지에서 뺀 제휴망(ilikeclick)의 오퍼는 활성 상태가 하나도 없다", () => {
    // 비활성 자리표시 항목이 남아 있든 운영자가 지우든(결정 묶음 A) 통과해야 한다 — 존재 개수는 고정하지 않는다.
    const offers = JSON.parse(readSrc("src/data/offers.json")) as Array<{ network: string; active: boolean }>;
    const ilike = offers.filter((o) => o.network === "ilikeclick");
    expect(ilike.every((o) => o.active === false)).toBe(true);
  });
});

describe("/terms 최종 업데이트 날짜", () => {
  it("연·월·일 형식이고 미래 날짜가 아니다", () => {
    const m = src.match(/최종 업데이트: 2026년 (\d+)월 (\d+)일/);
    expect(m).not.toBeNull();
    const shown = new Date(Date.UTC(2026, Number(m![1]) - 1, Number(m![2])));
    expect(shown.getTime()).toBeLessThanOrEqual(todayKst().getTime());
    // 마지막 실질 수정(2026-10-04 제5조)보다 앞설 수 없다
    expect(shown.getTime()).toBeGreaterThanOrEqual(Date.UTC(2026, 9, 4));
  });
});
