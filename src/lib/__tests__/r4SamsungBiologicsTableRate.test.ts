// /calc/samsung-biologics-bonus 지급 이력 표 — TAI 2025 하반기 지급률 '미확정 (확정치 보도 미확보)' -> '50% 수준 (보도)' (R4 SAMSUNG, N2-calc-13 calc-03-F04, 2026-11-18)
//
// 쿠키뉴스 2026-06-11: 지난해(2025년) 하반기 TAI 50% 수준. 글은 짧아지지만(150.94px -> 92.19px) 이 칸이 '지급률' 열의 최대 내용
// 폭이었다 — 다음 최장 칸 '월 기본급의 100% (최대치)'(149.39px)와 1.55px 차이라, 자동 표 배치 근사 시뮬레이션에서 표 폭이 최대
// 내용 합과 거의 같은 887~891px 다섯 폭에서 3행이 한 줄(20px) 늘 수 있다. 사실 정정이라 이 커밋을 따로 두고 스윕이 판정한다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-biologics-bonus/page.tsx"), "utf8").replace(/\r\n/g, "\n");

describe("삼성바이오로직스 지급 이력 표 — TAI 2025 하반기 지급률", () => {
  it("50% 수준 (보도)", () => {
    expect(page).toContain('<td className="py-2 pr-4">TAI 2025년 하반기</td>\n                    <td className="py-2 pr-4">50% 수준 (보도)</td>');
    expect(page).not.toContain("확정치 보도 미확보");
  });
});
