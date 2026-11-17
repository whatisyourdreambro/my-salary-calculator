// R4 CONTENT2 (2026-11-18) N2-lib-13 3단계 (lib-b10-F03) — /tools/deposit 유의사항(ToolDisclaimer).
// 유의사항은 GuideMidAd 아래, tools/layout 의 InArticleAd 위에 그려진다. 운영자 승인(2026-11-17)의 조건대로
// 더 좁은 문장으로만 바꾸고, 화면 폭별 측정에서 광고가 1px 이라도 내려가면 이 커밋만 되돌린다.
// 조세특례제한법 제89조의3: 조합예탁금 이자는 대부분 비과세(농어촌특별세 1.4%)지만, 농어민이 아닌 총급여
// 7천만원 초과자 등이 2026년 이후 가입한 몫은 5%(2026)·9%(2027~) 분리과세라 '1.4%'만 적으면 틀린다.
import { describe, expect, it } from "vitest";
import { getToolContent } from "@/lib/toolContent";

const OLD_DISCLAIMER_LENGTH = 229;
const hangul = (s: string) => (s.match(/[가-힣]/g) ?? []).length;
const OLD_DISCLAIMER_HANGUL = 156;

describe("N2-lib-13 /tools/deposit 유의사항 — 조합예탁금 1.4%·일부 5~9%", () => {
  const disclaimer = getToolContent("/tools/deposit")!.disclaimer!;

  it("no longer presents 조합예탁금 as 1.4% for everyone", () => {
    expect(disclaimer).toContain("상호금융 조합예탁금(농특세 1.4%, 일부 5~9%)");
    expect(disclaimer).toContain("1.4% 대상은 비과세를 고른 뒤 이자의 1.4%를 빼면 됩니다.");
    expect(disclaimer).not.toContain("상호금융 조합예탁금(농어촌특별세 1.4%)");
  });

  it("keeps the 세금우대 and closing sentences", () => {
    expect(disclaimer.startsWith("세금우대 9.5%는 2014년 말 일몰된 구 세금우대종합저축 기준입니다.")).toBe(true);
    expect(disclaimer.endsWith("가입 전 해당 금융기관에서 확인하시기 바랍니다.")).toBe(true);
  });

  it("is shorter than before (above InArticleAd)", () => {
    expect(disclaimer.length).toBeLessThan(OLD_DISCLAIMER_LENGTH);
    expect(hangul(disclaimer)).toBeLessThan(OLD_DISCLAIMER_HANGUL);
  });
});
