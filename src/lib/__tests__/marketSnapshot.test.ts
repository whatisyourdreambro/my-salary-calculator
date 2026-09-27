// 시세 스냅숏(src/data/marketSnapshot.json) 모양·범위·분류명 가드 (2026-09-27)
// 첫 커밋 값은 2026-09-27 R-ONE 공식 엔드포인트(표본 모드, CLS_ID 1행)·ECOS(공개 sample 키)에서 받은 값이며,
// 설계 단계에서 같은 호출로 옮겨 적은 표(천원)와 같아야 한다. 월 갱신 뒤에는 '2026-08 고정값' 블록을 새 기준월로 바꾼다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import snapshotJson from "@/data/marketSnapshot.json";
import { DEFAULT_REGION_ID, HOME_REGIONS } from "@/data/homePriceRegions";
import {
  ecosRange,
  monthCandidates,
  monthLabelOf,
  PRICE_MAX,
  PRICE_MIN,
  validateSnapshot,
  type MarketSnapshot,
} from "@/lib/bonusHome/marketSnapshotRules";

const snapshot = snapshotJson as MarketSnapshot;

describe("marketSnapshot.json — 모양·범위", () => {
  it("검증 규칙 통과(설정의 모든 지역·5천만~50억·CLS_FULLNM 일치·금리 범위)", () => {
    expect(validateSnapshot(snapshot, null)).toEqual([]);
  });
  it("지역 키 = 설정 지역, 분류 코드·전체 이름이 설정과 같다", () => {
    expect(Object.keys(snapshot.rone.regions).sort()).toEqual(HOME_REGIONS.map((r) => r.id).sort());
    for (const r of HOME_REGIONS) {
      expect(snapshot.rone.regions[r.id].clsId, r.id).toBe(r.rOneClsId);
      expect(snapshot.rone.regions[r.id].fullName, r.id).toBe(r.rOneFullName);
      expect(snapshot.rone.regions[r.id].median).toBeGreaterThanOrEqual(PRICE_MIN);
      expect(snapshot.rone.regions[r.id].median).toBeLessThanOrEqual(PRICE_MAX);
    }
    expect(HOME_REGIONS.some((r) => r.id === DEFAULT_REGION_ID)).toBe(true);
  });
  it("기준월 라벨·출처", () => {
    expect(snapshot.rone.monthLabel).toBe(monthLabelOf(snapshot.rone.month));
    expect(snapshot.ecos.monthLabel).toBe(monthLabelOf(snapshot.ecos.month));
    expect(snapshot.rone.medianStatblId).toBe("A_2024_00062");
    expect(snapshot.rone.meanStatblId).toBe("A_2024_00060");
    expect(snapshot.ecos).toMatchObject({ statCode: "121Y006", itemCode: "BECBLA0302" });
    expect(snapshot.rone.source).toContain("한국부동산원");
  });
});

describe("2026-08 고정값 — 옮겨 적은 표(천원)와 같다", () => {
  const MEDIAN_2026_08_THOUSAND: Record<string, number> = {
    "suwon-yeongtong": 683_000,
    "hwaseong-dongtan": 852_500,
    "hwaseong-byeongjeom": 389_500,
    "yongin-giheung": 627_000,
    "yongin-cheoin": 340_500,
    pyeongtaek: 242_000,
    icheon: 176_000,
    cheongju: 185_000,
    cheonan: 196_500,
    asan: 192_000,
    "seongnam-bundang": 1_729_500,
  };
  const MEAN_2026_08_THOUSAND_1DP: Record<string, number> = {
    "suwon-yeongtong": 854_015.6,
    "hwaseong-dongtan": 930_951.2,
    "hwaseong-byeongjeom": 444_618.6,
    "yongin-giheung": 660_823.2,
    "yongin-cheoin": 343_168.7,
    pyeongtaek: 273_860.7,
    icheon: 212_767.1,
    cheongju: 242_281.7,
    cheonan: 238_175.9,
    asan: 202_950.9,
    "seongnam-bundang": 1_759_079.9,
  };
  it.runIf(snapshot.rone.month === "202608")("중위·평균·전국·ECOS 2026년 7월 4.48%", () => {
    for (const [id, v] of Object.entries(MEDIAN_2026_08_THOUSAND)) expect(snapshot.rone.regions[id].median, id).toBe(v * 1000);
    for (const [id, v] of Object.entries(MEAN_2026_08_THOUSAND_1DP)) {
      expect(Math.round(snapshot.rone.regions[id].mean / 100) / 10, id).toBeCloseTo(v, 1);
    }
    expect(snapshot.rone.nationalMedian).toBe(329_000_000);
    expect(snapshot.ecos).toMatchObject({ month: "202607", ratePct: 4.48 });
  });
});

describe("갱신 규칙", () => {
  it("기준월 후보는 이번 달(KST) −1 ~ −3개월", () => {
    expect(monthCandidates(new Date("2026-09-27T03:00:00Z"))).toEqual(["202608", "202607", "202606"]);
    // KST 1월 1일 00:30 = UTC 12월 31일 15:30 → 이번 달은 1월
    expect(monthCandidates(new Date("2026-12-31T15:30:00Z"))).toEqual(["202612", "202611", "202610"]);
    expect(ecosRange(new Date("2026-09-27T03:00:00Z"))).toEqual({ from: "202511", to: "202608" });
  });
  it("전월 대비 ±15% 초과는 막고, --accept-jumps 면 허용", () => {
    const next: MarketSnapshot = JSON.parse(JSON.stringify(snapshot));
    const prev: MarketSnapshot = JSON.parse(JSON.stringify(snapshot));
    prev.rone.month = "202607";
    next.rone.regions["icheon"].median = Math.round(prev.rone.regions["icheon"].median * 1.2);
    expect(validateSnapshot(next, prev).some((e) => e.includes("이천시"))).toBe(true);
    expect(validateSnapshot(next, prev, { acceptJumps: true })).toEqual([]);
  });
  it("분류명이 바뀌면(행정구역 개편 등) 실패", () => {
    const next: MarketSnapshot = JSON.parse(JSON.stringify(snapshot));
    next.rone.regions["hwaseong-dongtan"].fullName = "경기>서해안권>화성시";
    expect(validateSnapshot(next, null).some((e) => e.includes("CLS_FULLNM"))).toBe(true);
    delete (next.rone.regions as Record<string, unknown>)["cheongju"];
    expect(validateSnapshot(next, null).some((e) => e.includes("청주시"))).toBe(true);
  });
  it("갱신 스크립트는 키를 로그에 남기지 않고, 빌드 스크립트에 연결돼 있지 않다", () => {
    const script = readFileSync(resolve(process.cwd(), "scripts/fetch-market-snapshot.ts"), "utf8");
    expect(script).toContain("redact(");
    expect(script).not.toMatch(/console\.(log|error)\([^)]*RONE_KEY|console\.(log|error)\([^)]*ECOS_KEY/);
    const pkg = readFileSync(resolve(process.cwd(), "package.json"), "utf8");
    expect(pkg).not.toContain("fetch-market-snapshot");
  });
});
