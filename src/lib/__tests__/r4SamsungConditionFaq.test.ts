// /calc/samsung-bonus 접힌 FAQ — 지급일 중복 FAQ 를 특별경영성과급 지급 조건 FAQ 로 (R4 SAMSUNG, RL-18 = 10월 895334845·8ac89336a 재이식, 2026-11-18)
//
// 보도된 조건: DS부문 연간 영업이익 2026~2028년 200조원·2029~2035년 100조원(파이낸셜뉴스 2026-09-27, 뉴시스 2026-05-21).
// 세후 전액 자사주, 3분의 1 즉시·나머지 1년·2년 매각 제한, 지급 2027년 3월 말~4월 초(2026-10-07 보도, 2026-11-18 재확인).
// DART 반기보고서의 전사 연결 영업이익은 참고값으로만 쓰고 '조건 판정은 DS부문 영업이익'이라고 밝힌다(10월 리뷰 D1).
// 질문 줄(summary)은 접힌 상태에도 보인다 — 사이트 글꼴 700·16px 262.92px -> 251.41px, 줄 시뮬레이션 320~1920px 에서
// 줄이 느는 폭 0. 이 파일은 그 커밋 하나만 고정한다(되돌릴 때 함께 되돌린다).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SAMSUNG_DS_OP_2026, SAMSUNG_OP, toTril1 } from "@/lib/bonusHome/opActuals";

const page = readFileSync(resolve(process.cwd(), "src/app/calc/samsung-bonus/page.tsx"), "utf8");
const faq = page.slice(page.indexOf("const FAQ_ITEMS = ["), page.indexOf("export const metadata"));

describe("삼성 성과급 — 특별경영성과급 지급 조건 FAQ (RL-18)", () => {
  it("지급일 중복 FAQ 는 없고 조건 FAQ 가 있다", () => {
    expect(page).not.toContain("삼성전자 성과급은 언제, 몇 번 지급되나요?");
    expect(faq).toContain('question: "특별경영성과급 지급 조건은 무엇인가요?"');
  });

  it("조건은 DS부문 연간 영업이익 기준, 전사 연결 값은 참고값으로만", () => {
    const i = faq.indexOf('question: "특별경영성과급 지급 조건은 무엇인가요?"');
    const answer = faq.slice(i, faq.indexOf("},", i));
    expect(answer).toContain("DS부문 연간 영업이익 기준 2026~2028년 200조원 이상(2029~2035년은 100조원 이상)");
    // R4 수리(2026-11-20, 사실 확인 bonus-2): 참고 문장은 DART 3분기보고서의 DS부문 1~3분기 값(조건 판정 단위)과 전사 연결 값
    expect(answer).toContain("DART 분기보고서(${SAMSUNG_OP.q1q3_2026.source.filedAt} 접수)");
    expect(answer).toContain("삼성전자 DS부문 영업이익은 약 ${toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon)}조원입니다(전사 연결 약 ${toTril1(SAMSUNG_OP.q1q3_2026.millionWon)}조원).");
    expect(answer).not.toContain("SAMSUNG_OP.h1_2026");
    expect(answer).not.toContain("반기보고서");
    expect(answer).toContain("DS부문 특별경영성과급은 세후 전액을 자사주로");
    expect(answer).toContain("3월 정기 주총에서 지급 안건이 승인되면 2027년 3월 말~4월 초");
    expect(answer).not.toMatch(/컨센서스|전망치|연간·누적 판정 기준|2027년 1월/);
  });

  it("참고 값은 DART 3분기보고서(opActuals) 그대로 — DS부문 249.4조원, 전사 연결 254.2조원, 2026-11-16 접수", () => {
    expect(toTril1(SAMSUNG_DS_OP_2026.q1q3.millionWon)).toBe(249.4);
    expect(toTril1(SAMSUNG_OP.q1q3_2026.millionWon)).toBe(254.2);
    expect(SAMSUNG_OP.q1q3_2026.label).toBe("2026년 1~3분기");
    expect(SAMSUNG_OP.q1q3_2026.source).toMatchObject({ rcpNo: "20261116001482", filedAt: "2026-11-16" });
    expect(SAMSUNG_DS_OP_2026.q1q3.source).toMatchObject({ rcpNo: "20261116001482", filedAt: "2026-11-16" });
  });
});
