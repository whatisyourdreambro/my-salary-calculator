// /lotto 번호 공 색·입력 이름 가드 (2026-11-15 감사 app-tools-fun-b02-M01·F06, N2-app-tools-fun-04)
//
// - 기본(라이트) 테마에서 21~30 공은 흰 글자 + 연회색(bg-canvas-deeper, 1.40:1), 41~45 공은 흰 글자 + 반투명 파랑(2.60:1)이었다.
//   고정 예시 상자(24·45)가 매 페이지에 보이고, 생성 세트마다 21~30 이 평균 1.33개 나온다.
//   공 크기는 고정(w-8 h-8 / sm:w-12 sm:h-12)이라 색만 바꾸면 아무것도 움직이지 않는다.
// - 포함/제외 숫자 입력에 이름이 없었다(라벨 htmlFor·입력 id 없음).
// 소스 문자열만 읽는다(렌더·광고 요청 없음).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const src = readFileSync("src/app/lotto/page.tsx", "utf8").replace(/\r\n/g, "\n");

describe("/lotto number ball colours", () => {
  const helper = /const getNumberColorClass = [\s\S]*?\n\};/.exec(src)?.[0] ?? "";

  it("finds the colour helper", () => {
    expect(helper).toContain("number >= 21 && number <= 30");
  });

  it("21-30 and 41-45 use solid slate fills under white digits", () => {
    expect(helper).toMatch(/number >= 21 && number <= 30\)\s*return "bg-slate-500 text-white shadow-inner shadow-black\/20";/);
    expect(helper).toMatch(/number >= 41 && number <= 45\)\s*return "bg-slate-700 text-white shadow-inner shadow-black\/20";/);
  });

  it("no ball range puts white digits on the light border colour or a half-transparent fill", () => {
    expect(helper).not.toContain("bg-canvas-deeper text-white");
    expect(helper).not.toContain("bg-primary/50 text-white");
  });
});

describe("/lotto include/exclude fields have names", () => {
  it.each(["lotto-include", "lotto-exclude"])("label htmlFor %s matches an input id", (id) => {
    expect(src).toContain(`<label htmlFor="${id}"`);
    expect(src.match(new RegExp(`\\bid="${id}"`, "g"))).toHaveLength(1);
    const input = src.slice(src.indexOf(`id="${id}"`) - 40, src.indexOf(`id="${id}"`) + 60);
    expect(input).toContain("<input");
    expect(input).toContain('type="text"');
  });
});
