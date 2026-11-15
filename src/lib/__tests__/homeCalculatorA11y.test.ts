// 홈 계산기 접근성 이름·상태 회귀 가드 (2026-11-15 감사 components-b04-F01·components-b03-F04, N2-components-06)
//
// - 홈(/)·/calc/2026-year 연봉 계산기: −/+ 단추가 '빼기·더하기 단추'로만 읽히고 부양가족·8세~20세 자녀와
//   연결되지 않았다. 직장인/프리랜서/알바 탭은 어느 쪽이 선택됐는지 알리지 않았다.
// - /?tab=freelancer 프리랜서·아르바이트 전환, 환율 탭 금융 지식 아코디언: 눌림·펼침 상태가 없고 접힌 칸도 읽혔다.
// 속성만 더했다(글자·클래스·요소·간격 그대로) — 화면에 보이는 것과 광고 위치는 바뀌지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8").replace(/\r\n/g, "\n");

describe("홈 연봉 계산기 단추 이름 (components-b04-F01)", () => {
  const src = readSrc("src/components/SalaryCalculator.tsx");

  it("−/+ 네 단추가 무엇을 바꾸는지 이름을 갖고 type=button 이다", () => {
    for (const label of ["부양가족 수 줄이기", "부양가족 수 늘리기", "8세~20세 자녀 수 줄이기", "8세~20세 자녀 수 늘리기"]) {
      expect(src).toContain(`<button type="button" aria-label="${label}" onClick=`);
    }
  });

  it("두 단추 묶음이 보이는 제목과 group 으로 이어진다", () => {
    expect(src).toContain('<p id="home-dependents-label" className="text-xs font-bold text-faint-blue mb-2">부양가족 수 (본인 포함)</p>');
    expect(src).toContain('<div role="group" aria-labelledby="home-dependents-label" className="flex items-center gap-2">');
    expect(src).toContain('<p id="home-children-label" className="text-xs font-bold text-faint-blue mb-2">8세~20세 자녀</p>');
    expect(src).toContain('<div role="group" aria-labelledby="home-children-label" className="flex items-center gap-2">');
  });

  it("바뀐 숫자를 알리고, 소득 유형 탭은 눌림 상태를 낸다", () => {
    expect(src).toContain('<span aria-live="polite" className="font-bold text-navy text-base w-6 text-center">{dependents}</span>');
    expect(src).toContain('<span aria-live="polite" className="font-bold text-navy text-base w-6 text-center">{children}</span>');
    expect(src).toMatch(/key=\{type\}\s*type="button"\s*aria-pressed=\{incomeType === type\}/);
  });
});

describe("토글·아코디언 상태 (components-b03-F04)", () => {
  it("프리랜서/아르바이트 전환 단추가 눌림 상태를 낸다", () => {
    const src = readSrc("src/components/FreelancerCalculator.tsx");
    expect(src).toMatch(/type="button"\s*aria-pressed=\{taxType === "freelancer"\}\s*onClick=\{\(\) => setTaxType\("freelancer"\)\}/);
    expect(src).toMatch(/type="button"\s*aria-pressed=\{taxType === "part_time"\}\s*onClick=\{\(\) => setTaxType\("part_time"\)\}/);
  });

  it("금융 지식 아코디언은 펼침 상태·대상 칸을 알리고 접힌 칸은 inert", () => {
    const src = readSrc("src/components/FinancialKnowledgeArchive.tsx");
    expect(src).toMatch(/type="button"\s*aria-expanded=\{activeIndex === index\}\s*aria-controls=\{`fka-panel-\$\{index\}`\}/);
    expect(src).toMatch(/id=\{`fka-panel-\$\{index\}`\}\s*inert=\{activeIndex !== index\}/);
    expect(src).toMatch(/<svg\s*aria-hidden="true"/);
  });
});
