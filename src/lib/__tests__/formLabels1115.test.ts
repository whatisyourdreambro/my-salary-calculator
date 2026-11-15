// /fire-calculator·/pro/career-planner 입력 이름 가드 (2026-11-15 감사 app-tools-fun-b01-F09·b02-F07, N2-app-tools-fun-08)
//
// 라벨에 htmlFor 가 없고 입력·선택 상자·아이콘 버튼에 이름이 없어 스크린리더에는 '편집 텍스트'만 들렸다.
// 속성만 더한다 — 클래스·문구·배치 변화 없음. 소스 문자열만 읽는다(렌더·광고 요청 없음).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file: string) => readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const fire = read("src/app/fire-calculator/page.tsx");
const planner = read("src/app/pro/career-planner/page.tsx");

describe("/fire-calculator inputs have accessible names", () => {
  it("CurrencyInput ties its label to the field with useId", () => {
    expect(fire).toMatch(/import \{[^}]*\buseId\b[^}]*\} from "react";/);
    const currency = /const CurrencyInput = [\s\S]*?\n\};/.exec(fire)?.[0] ?? "";
    expect(currency).toContain("const id = useId();");
    expect(currency).toContain("<label htmlFor={id}");
    expect(currency).toMatch(/<NumberInput\s+id=\{id\}/);
  });

  it.each(["fire-age", "fire-growth", "fire-pension", "fire-withdrawal"])("%s appears once as htmlFor and once as an input id", (id) => {
    expect(fire.match(new RegExp(`<label htmlFor="${id}"`, "g"))).toHaveLength(1);
    expect(fire.match(new RegExp(`<NumberInput\\s+id="${id}"`, "g"))).toHaveLength(1);
  });

  it("every label in the page is tied to a field", () => {
    expect(fire).not.toMatch(/<label className=/);
  });

  it("life-event row fields and the icon-only delete button are named", () => {
    for (const name of ["이벤트 시점 (몇 년 후)", "이벤트명", "이벤트 종류", "이벤트 금액 (원)", "이벤트 삭제"]) {
      expect(fire, name).toContain(`aria-label="${name}"`);
    }
    expect(fire).toMatch(/<button onClick=\{\(\) => removeLifeEvent\(index\)\} aria-label="이벤트 삭제"/);
  });
});

describe("/pro/career-planner event cards have accessible names", () => {
  it("delete button and both selects carry a per-event aria-label", () => {
    expect(planner).toContain('<button type="button" aria-label={`이벤트 ${index + 1} 삭제`} onClick={() => removeEvent(index)}');
    expect(planner).toContain("<select aria-label={`이벤트 ${index + 1} 연차`} value={event.year}");
    expect(planner).toContain("<select aria-label={`이벤트 ${index + 1} 종류`} value={event.type}");
  });
});
