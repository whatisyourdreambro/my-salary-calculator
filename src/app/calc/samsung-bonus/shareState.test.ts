// 공유 상태 URL 해시 인코딩/디코딩 (2026-09-21 S2-0, CALC-06 흡수). jsdom 없음.
import { describe, expect, it } from "vitest";
import { buildShareHash, parseShareHash, type SamsungShareState } from "./shareState";

const DEFAULTS: SamsungShareState = { d: "memory", s: 80_000_000, p: 350, y: 2026, o1: 50, ac: 0, ins: true };
const OPTS = { divisionIds: ["memory", "common", "foundry"], maxOpi1: 50 };

describe("buildShareHash", () => {
  it("전부 기본값이면 빈 문자열 (URL 깨끗)", () => {
    expect(buildShareHash(DEFAULTS, DEFAULTS)).toBe("");
  });
  it("하나라도 다르면 7키 전부 기록 — 자기완결 링크", () => {
    expect(buildShareHash({ ...DEFAULTS, d: "common" }, DEFAULTS)).toBe(
      "#d=common&s=80000000&p=350&y=2026&o1=50&ac=0&ins=1"
    );
    expect(buildShareHash({ ...DEFAULTS, s: 95_000_000, ins: false, p: 400.5 }, DEFAULTS)).toBe(
      "#d=memory&s=95000000&p=400.5&y=2026&o1=50&ac=0&ins=0"
    );
  });
  it("쿼리 파라미터(?v=)를 만들지 않는다", () => {
    expect(buildShareHash({ ...DEFAULTS, y: 2027 }, DEFAULTS)).not.toContain("?");
  });
});

describe("parseShareHash", () => {
  it("앵커 해시(#tai-title)·빈 해시는 null", () => {
    expect(parseShareHash("#tai-title", OPTS)).toBeNull();
    expect(parseShareHash("", OPTS)).toBeNull();
    expect(parseShareHash("#multi-year-bonus", OPTS)).toBeNull();
  });
  it("왕복: build → parse 가 같은 상태", () => {
    const state = { ...DEFAULTS, d: "foundry", s: 120_000_000, p: 280, y: 2028, o1: 37, ac: 10, ins: false };
    expect(parseShareHash(buildShareHash(state, DEFAULTS), OPTS)).toEqual(state);
  });
  it("범위 밖·알 수 없는 값은 키 단위로 버린다", () => {
    expect(parseShareHash("#d=hbm&s=-5&p=99999&y=2040&o1=99&ac=80&ins=maybe", OPTS)).toBeNull();
    expect(parseShareHash("#d=common&s=abc&o1=51&ac=50", OPTS)).toEqual({ d: "common", ac: 50 });
    expect(parseShareHash("#s=1e3&p=350.55&y=2026.5", OPTS)).toEqual({ s: 1000, p: 350.6 });
  });
  it("ins 는 1/0 만", () => {
    expect(parseShareHash("#ins=0", OPTS)).toEqual({ ins: false });
    expect(parseShareHash("#ins=1", OPTS)).toEqual({ ins: true });
    expect(parseShareHash("#ins=true", OPTS)).toBeNull();
  });
});

describe("parseShareHash — 2026-09-25 이전 링크의 cr(세액공제율) 하위호환 (A18)", () => {
  it("옛 기본값 cr=30 링크는 그대로 열리고 추가 공제 0(새 기본값)으로 복원된다", () => {
    expect(parseShareHash("#d=common&s=80000000&p=350&y=2026&o1=50&cr=30&ins=1", OPTS)).toEqual({
      d: "common",
      s: 80_000_000,
      p: 350,
      y: 2026,
      o1: 50,
      ac: 0,
      ins: true,
    });
  });
  it("30 을 넘긴 옛 값은 초과분만 추가 공제로, 30 미만은 0 으로 옮긴다", () => {
    expect(parseShareHash("#cr=50", OPTS)).toEqual({ ac: 20 });
    expect(parseShareHash("#cr=10", OPTS)).toEqual({ ac: 0 });
  });
  it("새 키 ac 가 있으면 cr 보다 우선, 범위 밖 cr 은 버린다", () => {
    expect(parseShareHash("#cr=50&ac=5", OPTS)).toEqual({ ac: 5 });
    expect(parseShareHash("#cr=80", OPTS)).toBeNull();
  });
  it("새 링크는 cr 을 쓰지 않는다", () => {
    expect(buildShareHash({ ...DEFAULTS, ac: 15 }, DEFAULTS)).not.toContain("cr=");
  });
});
