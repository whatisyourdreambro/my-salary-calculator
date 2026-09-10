import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { guideCards } from "@/lib/guidesMeta.generated";
import { getMoneyCheckItems, MONEY_CHECK_ITEMS, MONEY_CHECK_TOPICS, parseMoneyCheckProgress, serializeMoneyCheckProgress, updateMoneyCheckCompletion } from "@/lib/moneyCheck";

describe("내 돈 체크", () => {
  it("각 상황은 계산기와 한국어 가이드가 있는 실제 확인 항목으로 연결된다", () => {
    const koGuideSlugs = new Set(guideCards.filter((guide) => guide.lang !== "en").map((guide) => guide.slug));
    expect(new Set(MONEY_CHECK_ITEMS.map((item) => item.id)).size).toBe(MONEY_CHECK_ITEMS.length);
    for (const topic of MONEY_CHECK_TOPICS) {
      const items = getMoneyCheckItems(topic.id);
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.every((item) => item.topic === topic.id)).toBe(true);
      for (const item of items) {
        expect(existsSync(join(process.cwd(), "src/app", item.calculator.href, "page.tsx")), item.calculator.href).toBe(true);
        expect(koGuideSlugs.has(item.guide.href.replace("/guides/", "")), item.guide.href).toBe(true);
      }
    }
    expect(getMoneyCheckItems("all")).toEqual(MONEY_CHECK_ITEMS);
  });

  it.each([null, "", "broken", "null", "[]", "false", '{"version":2,"completed":[]}', '{"version":1,"completed":"salary-take-home"}'])("잘못된 저장 기록은 안전하게 빈 목록으로 복구한다: %s", (raw) => {
    expect(parseMoneyCheckProgress(raw)).toEqual([]);
  });

  it("알려진 항목만 복원하고 중복·삭제된 항목·입력값을 제외한다", () => {
    const raw = JSON.stringify({ version: 1, completed: ["salary-take-home", "unknown", 123, null, "salary-take-home", "home-rent"], salary: 60000000 });
    expect(parseMoneyCheckProgress(raw)).toEqual(["salary-take-home", "home-rent"]);
    const saved = serializeMoneyCheckProgress(["salary-take-home", "home-rent", "unknown", "home-rent"]);
    expect(JSON.parse(saved)).toEqual({ version: 1, completed: ["salary-take-home", "home-rent"] });
    expect(parseMoneyCheckProgress(saved)).toEqual(["salary-take-home", "home-rent"]);
  });

  it("다른 탭의 최신 항목을 유지하면서 사용자의 체크·해제 의도만 반영한다", () => {
    const latest = ["salary-take-home", "home-rent"];
    expect(updateMoneyCheckCompletion(latest, "tax-year-end", true)).toEqual(["salary-take-home", "home-rent", "tax-year-end"]);
    expect(updateMoneyCheckCompletion(latest, "salary-take-home", false)).toEqual(["home-rent"]);
    expect(updateMoneyCheckCompletion(latest, "home-rent", true)).toEqual(latest);
    expect(updateMoneyCheckCompletion(latest, "tax-year-end", false)).toEqual(latest);
    expect(latest).toEqual(["salary-take-home", "home-rent"]);
  });
});
