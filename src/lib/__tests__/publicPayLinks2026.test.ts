// 봉급표 4쪽 하단 추천 카드 고정 (RL-09 재착지 2026-11-15 — 10월 dfcb3db24 의 PT-09 부분)
//
//  - 교사·경찰·소방·군인 봉급표의 RelatedCalculators 는 salary 폴백(홈·삼성 성과급·주휴수당·통상임금) 대신 공무원 봉급 묶음:
//    2027 봉급표(예산안 기준 '예상')·실수령 계산기를 앞에 두고 나머지는 형제 봉급표. limit 4 유지(카드 수 불변 = 높이 구성 불변).
//  - RelatedCalculators 는 네 페이지 모두 본문 컬럼 마지막 광고(쿠팡 리더보드) 아래에 있다.
//  - dfcb3db24 의 군인 장병내일준비적금 비과세 연장 문단(PT-06)은 세법 개정안 국회 의결 날(RL-22)로 미뤄 여기서 고정하지 않는다.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATEGORY_RECOMMENDATIONS, getRelatedCalculators } from "@/lib/relatedCalculators";

const paths = (p: string) => getRelatedCalculators(p).map((i) => i.path);

describe("공무원 봉급 묶음 추천 (PT-09)", () => {
  it("네 페이지의 카드 4장", () => {
    expect(paths("/teacher-pay-2026")).toEqual(["/civil-servant-pay-2027", "/calc/civil-servant-net-pay", "/police-pay-2026", "/firefighter-pay-2026"]);
    expect(paths("/police-pay-2026")).toEqual(["/civil-servant-pay-2027", "/calc/civil-servant-net-pay", "/teacher-pay-2026", "/firefighter-pay-2026"]);
    expect(paths("/firefighter-pay-2026")).toEqual(["/civil-servant-pay-2027", "/calc/civil-servant-net-pay", "/teacher-pay-2026", "/police-pay-2026"]);
    expect(paths("/military-pay-2026")).toEqual(["/civil-servant-pay-2027", "/calc/civil-servant-net-pay", "/teacher-pay-2026", "/police-pay-2026"]);
  });

  it("2027 카드는 예산안 기준 예상으로만 쓰고, 아이콘은 RelatedCalculators ICON_MAP 안, 목적지는 실재 라우트", () => {
    const items = CATEGORY_RECOMMENDATIONS.publicPay;
    expect(items.find((i) => i.path === "/civil-servant-pay-2027")?.description).toBe("예산안 기준 예상 월급·확정 일정");
    const src = readFileSync("src/components/RelatedCalculators.tsx", "utf8");
    const iconMap = /const ICON_MAP[^{]*\{([\s\S]*?)\};/.exec(src)![1];
    for (const i of items) {
      expect(iconMap, i.icon).toContain(`${i.icon},`);
      expect(existsSync(`src/app${i.path}/page.tsx`), i.path).toBe(true);
    }
  });

  it("2026·2027 공무원 봉급표 자체 추천은 바꾸지 않는다 (Multiplex 위)", () => {
    expect(paths("/civil-servant-pay-2026")).not.toContain("/civil-servant-pay-2027");
    expect(paths("/civil-servant-pay-2027")).not.toContain("/teacher-pay-2026");
  });

  it("네 페이지 모두 RelatedCalculators 는 본문 컬럼의 마지막 광고(쿠팡 리더보드) 뒤, 사이드바 앞", () => {
    for (const route of ["teacher", "police", "firefighter", "military"]) {
      const src = readFileSync(`src/app/${route}-pay-2026/page.tsx`, "utf8");
      const related = src.indexOf("<RelatedCalculators");
      const lastColumnAd = src.lastIndexOf('<CoupangBanner responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }} />');
      expect(related, route).toBeGreaterThan(lastColumnAd);
      expect(lastColumnAd, route).toBeGreaterThan(-1);
      expect(related, route).toBeLessThan(src.indexOf("<SidebarAd />"));
    }
  });
});
