// 공유 상태 URL 해시 인코딩/디코딩 (2026-09-21 S2-0, CALC-06 흡수). jsdom 없음.
import { describe, expect, it } from "vitest";
import { buildShareHash, parseShareHash, type SamsungShareState } from "./shareState";
import { calcSamsungBonusNet, computeDivisionPool, DIVISIONS } from "./model";

const DEFAULTS: SamsungShareState = { d: "memory", s: 80_000_000, p: 350, y: 2026, o1: 50, ac: 0, ins: true };
const OPTS = { divisionIds: ["memory", "common", "foundry"], maxOpi1: 50 };
const POOL_DEFAULTS: SamsungShareState = {
  ...DEFAULTS,
  counts: Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultCount])),
  ratios: Object.fromEntries(DIVISIONS.map((d) => [d.id, d.defaultRatio])),
};

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

describe("사업부 인원·가중치를 바꾼 결과 링크", () => {
  it("기본 풀은 해시 없이 유지하고 인원만 바꿔도 모든 계산 조건을 저장한다", () => {
    expect(buildShareHash(POOL_DEFAULTS, POOL_DEFAULTS)).toBe("");
    const state = { ...POOL_DEFAULTS, counts: { ...POOL_DEFAULTS.counts, memory: 30_000 } };
    expect(parseShareHash(buildShareHash(state, POOL_DEFAULTS), OPTS)).toEqual(state);
  });

  it("사용자 인원·소수 가중치로 계산한 세전·세후 결과가 링크 재개방 후 같다", () => {
    const state = { ...POOL_DEFAULTS, s: 95_000_000,
      counts: { memory: 30_000, common: 28_000, foundry: 20_000 },
      ratios: { memory: 1, common: 0.7, foundry: 0 },
    };
    const restored = { ...POOL_DEFAULTS, ...parseShareHash(buildShareHash(state, POOL_DEFAULTS), OPTS) };
    function personalResult(input: SamsungShareState) {
      const pool = computeDivisionPool(input.p, input.counts!, input.ratios!);
      const gross = (pool.perDivision.find((d) => d.id === input.d)!.total * 10_000) * (input.s / 80_000_000) + input.s * input.o1 / 100;
      return { pool, gross, ...calcSamsungBonusNet(input.s, gross, input.ac, input.ins) };
    }
    expect(personalResult(restored)).toEqual(personalResult(state));
    expect(personalResult(state).gross).not.toBe(personalResult({ ...state, counts: POOL_DEFAULTS.counts, ratios: POOL_DEFAULTS.ratios }).gross);
  });

  it("옛 7키 링크에 새 풀 조건을 임의로 추가하지 않는다", () => {
    const old = parseShareHash(buildShareHash({ ...DEFAULTS, d: "foundry" }, DEFAULTS), OPTS);
    expect(old).toEqual({ ...DEFAULTS, d: "foundry" });
    expect({ ...POOL_DEFAULTS, ...old }.counts).toEqual(POOL_DEFAULTS.counts);
  });

  it("0은 복원하고 소수 인원·음수·비수치·무한대·알 수 없는 사업부는 버린다", () => {
    expect(parseShareHash("#n_memory=0&n_common=1.5&n_foundry=-1&r_memory=0&r_common=.7&r_foundry=Infinity&n_unknown=2&r___proto__=1", OPTS)).toEqual({ counts: { memory: 0 }, ratios: { memory: 0, common: 0.7 } });
    expect(parseShareHash("#n_memory=NaN&n_common=&n_foundry=0x10&r_memory=-1&r_common=1e309&r_foundry=%20", OPTS)).toBeNull();
  });

  it("합계 0도 그대로 복원해 화면의 기존 결과 유효성 검사가 기본값으로 숨기지 않게 한다", () => {
    const state = { ...POOL_DEFAULTS, counts: { memory: 0, common: 0, foundry: 0 }, ratios: { memory: 0, common: 0, foundry: 0 } };
    expect(parseShareHash(buildShareHash(state, POOL_DEFAULTS), OPTS)).toEqual(state);
  });

  it("UI가 받는 유한 수의 지수 표기를 보존하고 URL의 +를 공백으로 잃지 않는다", () => {
    const state = { ...POOL_DEFAULTS, counts: { ...POOL_DEFAULTS.counts, memory: 1e21 }, ratios: { ...POOL_DEFAULTS.ratios, foundry: 1e-7 } };
    expect(parseShareHash(buildShareHash(state, POOL_DEFAULTS), OPTS)).toEqual(state);
    expect(buildShareHash(state, POOL_DEFAULTS)).toContain("1e%2B21");
  });

  it("과도한 해시/값 길이를 거절한다", () => {
    expect(parseShareHash(`#n_memory=${"0".repeat(4096)}&d=memory`, OPTS)).toBeNull();
    expect(parseShareHash(`#n_memory=${"0".repeat(321)}&d=common`, OPTS)).toEqual({ d: "common" });
  });
});
