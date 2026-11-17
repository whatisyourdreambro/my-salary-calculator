// E1(이원) 뒤 조사 — 'E1로' 가 아니라 'E1으로' (R4 COMPANY 2026-11-18, n2 leftovers.md DATAB 항목)
//
// josa.ts 는 숫자 1 을 일(ㄹ받침)로 읽어 '으로/로' 에서 '로' 를 냈다. 회사명 E1 은 이원(ㄴ받침)이라 '으로' 가 맞다.
// ㄹ받침과 일반 받침은 '으로/로' 에서만 갈리므로 다른 조사 출력은 바뀌지 않는다.
// 이 이름이 '으로/로' 로 쓰이는 곳은 공시 업종 순위 쪽 FAQ 답(/salary-db/listed/industry/retail-commerce, 닫힌 details 와
// FAQPage JSON-LD) 하나뿐이라 첫 화면·광고 위치는 그대로다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { josa, josaParticle } from "@/lib/josa";

describe("E1 조사", () => {
  it("으로/로 는 E1으로, 소문자·괄호 병기도 같은 판정", () => {
    expect(josa("E1", "으로/로")).toBe("E1으로");
    expect(josa("e1", "으로/로")).toBe("e1으로");
    expect(josaParticle("E1 (이원)", "으로/로")).toBe("으로");
  });

  it("다른 조사는 종전과 같은 출력(받침 있음)", () => {
    expect(josa("E1", "은/는")).toBe("E1은");
    expect(josa("E1", "이/가")).toBe("E1이");
    expect(josa("E1", "과/와")).toBe("E1과");
    expect(josa("E1", "을/를")).toBe("E1을");
    expect(josa("E1", "이란/란")).toBe("E1이란");
  });

  it("숫자 1 로 끝나는 다른 말은 그대로 ㄹ받침(일) — 예외는 말 전체가 E1 일 때만", () => {
    expect(josa("SE1", "으로/로")).toBe("SE1로");
    expect(josa("21", "으로/로")).toBe("21로");
    expect(josa("클래스101", "으로/로")).toBe("클래스101로");
  });

  it("'으로/로' 를 회사명에 쓰는 곳은 접힌 FAQ 답 두 곳뿐(업종 순위·직원 수 순위) — 화면 첫 줄·광고 위 문장에 없음", () => {
    const industry = readFileSync("src/app/salary-db/listed/industry/[industryId]/page.tsx", "utf8");
    const employees = readFileSync("src/app/salary-db/listed/top-employees/page.tsx", "utf8");
    expect(industry).toContain('answer: `${josa(top1.nameKo, "으로/로")}, ${DART_RANKING_YEAR} 공시 평균연봉 ');
    expect(industry).toMatch(/<details key=\{item\.question\}/);
    expect(employees).toContain('josa(top1.nameKo, "으로/로")');
  });
});
