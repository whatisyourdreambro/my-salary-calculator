// 2026-11-18 R4 재착지(RL-16, 10월 1da170cd3) — 2026-09-29 CB-05(calc 그룹) — bonusData 연도 규칙(지급 연도)을 고치면서 basePct 조회 연도만 옮긴 가이드 2편의
// 본문이 byte 단위로 그대로이고, 광고 분할(GuidePageClient.splitContentByH2 — 4,000자 기준 2/3분할, 조각 사이 GuideMidAd·InArticleAd)이
// 바뀌지 않았음을 고정한다. 두 슬러그는 guideSpec.test.ts 의 KEEPERS 라 guidesMayH2.snapshot.json 분할 검사에서 빠져 있어 여기서 따로 본다.
// 기대값은 기준 커밋 4ef59a4b(프로덕션)에서 계산한 값이다. 2026-11-18 R4 기준 ce2463cda 에서 다시 계산해 같은 값임을 확인했다.
// ★ 가이드 그룹이 이 두 글의 본문을 고치면 SHA·길이는 새 값으로 갱신하되, 분할 수·분할 H2 순번과 4,000자 기준의 같은 쪽은 그대로여야 한다
//   (바뀌면 광고 위치가 움직인다 — 광고 스윕 필요).
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";

const sha16 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
/** guideSpec.test.ts 와 같은 원본 해시 — GuidePageClient.splitContentByH2 가 바뀌면 아래 복제본도 맞출 것 */
const SPLIT_FN_SHA = "4d42b3f5b6e0f4e9";
const H2_OPEN_RE = /<h2[\s>]/gi;

/** GuidePageClient.splitContentByH2 복제(guideSpec.test.ts splitStarts 와 같은 로직) — 분할 지점(본문 문자 위치) */
function splitStarts(html: string): number[] {
  const indices = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  if (indices.length < 2) return [];
  const candidates = indices.filter((i) => i > 0);
  if (candidates.length === 0) return [];
  const nearest = (target: number, pool: number[]) =>
    pool.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best));
  if (html.length < 4000 || candidates.length === 1) return [nearest(html.length / 2, candidates)];
  const p1 = nearest(html.length / 3, candidates);
  const after = candidates.filter((i) => i > p1);
  if (after.length === 0) return [p1];
  return [p1, nearest((html.length * 2) / 3, after)];
}

/** 기준 4ef59a4b 에서 계산 — 본문 UTF-16 길이, H2 개수, 분할 H2 순번(0부터), 본문 SHA-256 앞 16자 */
const PINS: Record<string, { length: number; h2Count: number; split: number[]; sha16: string }> = {
  // src/lib/guides/hot-news-2026-may.ts — LGES_Y25·LGES_Y24 조회 연도만 한 해씩 옮김
  "lgensol-wage-negotiation-2026": { length: 5128, h2Count: 6, split: [2, 4], sha16: "57dcf723464b37b6" },
  // src/lib/guides/hot-bonus-tax-complete.ts — LGES_25 와 2024년 실적분 조회 연도만 한 해씩 옮김
  "lg-hyundai-posco-bonus-2026": { length: 5751, h2Count: 6, split: [1, 4], sha16: "2250c8b236e75a1d" },
};

describe("CB-05 bonusData 지급연도 정정 — 가이드 2편 본문·광고 분할 불변", () => {
  it("GuidePageClient.splitContentByH2 가 이 파일의 복제본과 같은 코드다", () => {
    const src = fs.readFileSync(path.resolve(process.cwd(), "src/app/guides/[slug]/GuidePageClient.tsx"), "utf8").replace(/\r\n/g, "\n");
    const start = src.indexOf("function splitContentByH2(");
    expect(start).toBeGreaterThanOrEqual(0);
    const fn = src.slice(start, src.indexOf("\n}\n", start) + 2);
    expect(sha16(fn)).toBe(SPLIT_FN_SHA);
  });

  for (const [slug, pin] of Object.entries(PINS)) {
    it(`${slug}: 3분할(4,000자 이상 쪽)·분할 H2 순번 ${pin.split.join("·")}·본문 byte 동일`, () => {
      const html = koGuides.find((g) => g.slug === slug)?.content;
      expect(html, slug).toBeDefined();
      const body = html!;
      const opens = [...body.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
      expect(body.length >= 4000, "4,000자 기준 같은 쪽(3분할)").toBe(pin.length >= 4000);
      expect(opens).toHaveLength(pin.h2Count);
      expect(splitStarts(body).map((p) => opens.indexOf(p))).toEqual(pin.split);
      expect(body.length).toBe(pin.length);
      expect(sha16(body)).toBe(pin.sha16);
    });
  }
});
