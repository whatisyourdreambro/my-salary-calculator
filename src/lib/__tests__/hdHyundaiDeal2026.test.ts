// /calc/hd-hyundai-bonus 2026 임단협 가결 반영 — 접힌 FAQ (2026-11-15 N2-calc-09 calc-02-F01)
//
// 2026 임단협 2차 잠정합의안은 10월 27일 조합원 투표에서 찬성 55.06%(4,253명)로 가결됐다: 기본급 월 12만원 인상
// (호봉승급분 5만5천원 포함), 격려금 등 일시금 1,150만원+약정임금 200%, 복지포인트 30만원, 성과급 지급(금액 미기재)
// — 경향신문 2026-10-27, 서울파이낸스 2026-10-27~28 보도. 노조의 '영업이익 30% 연동 성과급' 요구는 9월 30일 1차
// 잠정합의안에서 빠졌다(뉴스토마토 2026-09-30 보도). 2026년분 연말 성과급률은 아직 보도되지 않았다.
// 칩·배지·머리 문구·PAGE_DESC 는 운영자 결정(N2-calc-22) 몫이라 여기서 고정하지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/hd-hyundai-bonus/page.tsx"), "utf8");
const faqBlock = page.slice(page.indexOf("const FAQ_ITEMS"), page.indexOf("export const metadata")); // 2026-11-18 R4 RL-17: HOW_TO_STEPS 제거로 끝 앵커만 바꿈

describe("HD현대중공업 2026 임단협 가결 — 접힌 FAQ (calc-02-F01)", () => {
  it("가결일·찬성률·타결 내용과 보도 출처, 성과급률 미발표", () => {
    expect(faqBlock).toContain("2026년 임단협은 10월 27일 조합원 찬반투표(찬성 55.06%)로 가결됐습니다.");
    expect(faqBlock).toContain("기본급 월 12만원 인상(호봉승급분 5만5천원 포함), 격려금 등 일시금 1,150만원+200%, 복지포인트 30만원");
    expect(faqBlock).toContain("경향신문·서울파이낸스 2026-10-27~28 보도");
    expect(faqBlock).toContain("2026년 연말 성과급률은 아직 발표되지 않았습니다.");
    expect(faqBlock).toContain("9월 30일 1차 잠정합의안에서 빠졌고(뉴스토마토 2026-09-30 보도)");
    expect(faqBlock).toContain("2026년 임단협은 10/27 가결됐고, 2026년분 연말 성과급률은 미발표.");
  });

  it("지난 요구·추측 문장은 FAQ 에 없다", () => {
    expect(faqBlock).not.toContain("요구 중");
    expect(faqBlock).not.toContain("최종 합의안은 미확정");
    expect(faqBlock).not.toContain("30~50% 수준에서 타결됩니다");
    expect(faqBlock).not.toContain("14만 9,600원");
  });
});
