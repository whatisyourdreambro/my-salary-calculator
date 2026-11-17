// /calc/samsung-biologics-bonus 지급 이력 표 — TAI 2025 하반기 행 출처 칸 '—' -> '쿠키뉴스 2026-06-11' (R4 SAMSUNG, N2-calc-13 calc-03-F04, 2026-11-18)
//
// 검증안: 이 칸만 글이 늘어(+113px) 스윕이 GuideMidAd 하향을 보이면 '—'로 되돌리고 출처는 접힌 FAQ 에만 둔다 — 그래서
// 이 커밋과 이 파일만 따로 되돌릴 수 있게 했다. 출처 열의 최대 내용 폭은 첫 행(아시아경제 … 357.49px)이고, 새 칸은 2행
// '한국경제 2025-07-08'(127.95px)보다 좁으며 낱말 구조가 같다(4음절 + 날짜) — 자동 표 배치 근사 시뮬레이션에서 표 높이가 느는 폭 0.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/page.tsx"), "utf8").replace(/\r\n/g, "\n");

describe("삼성바이오로직스 지급 이력 표 — TAI 2025 하반기 출처 칸", () => {
  it("쿠키뉴스 2026-06-11", () => {
    expect(page).toContain('<td className="py-2 pr-4">2025년 12월 지급분</td>\n                    <td className="py-2">쿠키뉴스 2026-06-11</td>');
  });
});
