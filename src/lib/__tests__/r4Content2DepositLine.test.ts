// R4 CONTENT2 (2026-11-18) N2-lib-13 2단계 (lib-b10-F03) — /tools/deposit '비과세로 넣을 수 있는 조건' 목록의
// 조합예탁금 줄. 운영자 승인(2026-11-17): 광고(GuideMidAd) 위 이 한 줄은 글자 폭이 늘지 않는 짧은 문장으로 바꾸되,
// 화면 폭별 측정에서 광고가 1px 도 안 내려갈 때만 반영한다 — 그래서 이 줄은 따로 되돌릴 수 있는 커밋에 있다.
// 문장은 검증자 후보 그대로(조세특례제한법 제89조의3: 농어민이 아닌 총급여 7천만원 초과자의 2026년 이후 가입분 5~9%).
import { describe, expect, it } from "vitest";
import { getToolContent } from "@/lib/toolContent";

const OLD_LINE = "상호금융 조합예탁금: 새마을금고·신협·단위농협 등의 조합원이 3,000만원 한도로 가입하면 이자소득세는 면제되고 농어촌특별세 1.4%만 부담합니다.";
const hangul = (s: string) => (s.match(/[가-힣]/g) ?? []).length;

describe("N2-lib-13 /tools/deposit 조합예탁금 목록 줄", () => {
  const items = getToolContent("/tools/deposit")!.sections
    .flatMap((s) => s.list?.items ?? []);
  const line = items.find((it) => it.startsWith("상호금융 조합예탁금:"));

  it("names the 5~9% separate tax for higher-income non-farmers", () => {
    expect(line).toBeDefined();
    expect(line).toContain("5~9%");
    expect(line).toContain("총급여 7천만원 초과자");
    expect(items).not.toContain(OLD_LINE);
  });

  it("is not longer and carries fewer Hangul syllables than the old line (above GuideMidAd)", () => {
    expect(line!.length).toBeLessThanOrEqual(OLD_LINE.length);
    expect(hangul(line!)).toBeLessThan(hangul(OLD_LINE));
  });
});
