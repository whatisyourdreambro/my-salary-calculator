import { describe, expect, it } from "vitest";
import { clampToSentence } from "@/lib/seo";
import { GUIDE_CATEGORY_HUBS } from "@/lib/guideCategories";
import { hubs } from "@/lib/hubs";

// 2026-11-13 lens-meta-F05 — 가이드 카테고리 허브(155자)·주제 허브(158자) 메타 설명은 문장 중간에서 자르지 않는다.
// 이전: 카테고리 허브는 intro.slice(0, 120)(급여·세금 허브가 문장 중간에서 잘림), 주제 허브는 155자 + '…'(/hub/fire).
// 이후: 세 곳만 바뀌고 나머지 카테고리 5곳·주제 허브 7곳은 이전과 바이트가 같다. /calc 설명(seoText.ts)은 손대지 않는다.
const oldCategory = (intro: string) => intro.slice(0, 120);
const oldHub = (intro: string) => (intro.length > 158 ? `${intro.slice(0, 155)}…` : intro);

describe("lens-meta-F05 clampToSentence — 허브 메타 설명", () => {
  it("짧은 글은 그대로, 긴 글은 문장 끝에서, 문장 끝이 없으면 낱말 경계 + '…'", () => {
    expect(clampToSentence("짧은 문장입니다.", 155)).toBe("짧은 문장입니다.");
    expect(clampToSentence("첫 문장입니다. 두 번째 문장은 아주 깁니다.", 14)).toBe("첫 문장입니다.");
    const noStop = "가나다 라마바 사아자 차카타 파하 가나다 라마바 사아자";
    const out = clampToSentence(noStop, 20);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(20);
  });

  it("카테고리 허브: 급여·세금 허브만 통째 소개 글이 되고 나머지는 이전과 같다", () => {
    const changed: string[] = [];
    for (const hub of GUIDE_CATEGORY_HUBS) {
      const next = clampToSentence(hub.intro, 155);
      expect(next.length, hub.slug).toBeLessThanOrEqual(155);
      if (next !== oldCategory(hub.intro)) {
        changed.push(hub.slug);
        expect(next, hub.slug).toBe(hub.intro.trim());
        expect(/[.!?]$/.test(next), hub.slug).toBe(true);
      }
    }
    expect(changed.sort()).toEqual(["salary", "tax"]);
  });

  it("주제 허브: /hub/fire 만 문장 끝(142자 안팎)에서 끊기고 나머지는 이전과 같다", () => {
    const changed: string[] = [];
    for (const hub of hubs) {
      const intro = hub.intro[0];
      const next = clampToSentence(intro, 158);
      expect(next.length, hub.id).toBeLessThanOrEqual(158);
      if (next !== oldHub(intro)) changed.push(hub.id);
    }
    expect(changed).toEqual(["fire"]);
    const fire = hubs.find((h) => h.id === "fire")!;
    const desc = clampToSentence(fire.intro[0], 158);
    expect(desc.endsWith("보장하지 않습니다.")).toBe(true);
    expect(desc.endsWith("…")).toBe(false);
  });
});
