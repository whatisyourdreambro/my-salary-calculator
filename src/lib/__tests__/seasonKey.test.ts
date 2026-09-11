// 시즌 세트 키 자동 선택 회귀 가드 (S1-1, 2026-09-11)
//
// 배경: 세트 교체가 3파일 수동 한 줄이라 2026-08-17 감사에서 7월 세트 만료 방치가 적발됐다.
// 이제 키는 빌드 시점에 src/lib/seasonKey.ts 가 고르고, 코드젠 상수 SEASON_KEY 로 3소비자가
// 세트를 선택한다. 여기서 고정하는 것:
//  (1) KST 경계(9/26·12/1)와 JAN 자동 선택 금지
//  (2) 오버라이드(1/2 JAN·긴급 되돌림) 동작
//  (3) TS ↔ scripts/season-key.mjs 중복 날짜표의 일치 — 헬스체크는 TS 를 import 못해 사본이 존재
//  (4) 소비자 3파일이 SEASON_KEY 로 세트를 고르고 SEP 를 활성값으로 하드코딩하지 않음
//  (5) OCT·DEC·JAN 세트에 '추석' 문구 0건 (2026-08 만료 세트 사고 유형)

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  JAN_MANUAL_FROM_KST,
  SEASON_BOUNDARIES,
  SEASON_EXPIRES_KST,
  SEASON_KEY_OVERRIDE,
  daysToNextBoundary,
  isJanManualWindow,
  isSeasonKeyExpired,
  pickSeasonKey,
  resolveSeasonKey,
  type SeasonKey,
} from "@/lib/seasonKey";
import { SEASON_KEY } from "@/config/seasonKey.generated";
import {
  SEASON_TOP_DEC,
  SEASON_TOP_JAN,
  SEASON_TOP_OCT,
  type SeasonLink,
} from "@/config/seasonLinks";
import {
  SEASONAL_LINKS_DEC,
  SEASONAL_LINKS_JAN,
  SEASONAL_LINKS_OCT,
  type SeasonalLinkSet,
} from "@/app/table/2026/SeasonalLinks";
import * as mjs from "../../../scripts/season-key.mjs";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
/** "YYYY-MM-DDTHH:mm:ss" 를 KST 시각으로 */
const kst = (iso: string) => new Date(`${iso}+09:00`);
const DAY_MS = 86_400_000;
const KEYS: SeasonKey[] = ["SEP", "OCT", "DEC", "JAN"];

const CONSUMERS = {
  seasonLinks: "src/config/seasonLinks.ts",
  seasonalLinks: "src/app/table/2026/SeasonalLinks.tsx",
  headerSearch: "src/components/header/HeaderSearch.tsx",
} as const;

describe("pickSeasonKey — KST 자정 경계", () => {
  it.each([
    ["2026-09-01T00:00:00", "SEP"],
    ["2026-09-11T12:00:00", "SEP"],
    ["2026-09-25T23:59:59", "SEP"],
    ["2026-09-26T00:00:00", "OCT"],
    ["2026-10-15T12:00:00", "OCT"],
    ["2026-11-30T23:59:59", "OCT"],
    ["2026-12-01T00:00:00", "DEC"],
    ["2026-12-31T23:59:59", "DEC"],
    ["2027-01-05T12:00:00", "DEC"],
    ["2027-02-28T23:59:59", "DEC"],
  ] as const)("%s KST → %s", (iso, expected) => {
    expect(pickSeasonKey(kst(iso))).toBe(expected);
  });

  it("UTC 자정이 아니라 KST 자정에 바뀐다 (9/25 15:00Z = 9/26 00:00 KST)", () => {
    expect(pickSeasonKey(new Date("2026-09-25T14:59:59Z"))).toBe("SEP");
    expect(pickSeasonKey(new Date("2026-09-25T15:00:00Z"))).toBe("OCT");
    expect(pickSeasonKey(new Date("2026-11-30T14:59:59Z"))).toBe("OCT");
    expect(pickSeasonKey(new Date("2026-11-30T15:00:00Z"))).toBe("DEC");
  });

  it("JAN 은 어떤 날짜에도 자동 선택되지 않는다 (2026~2027 전 일자)", () => {
    const end = Date.UTC(2028, 0, 1);
    for (let t = Date.UTC(2026, 0, 1); t < end; t += DAY_MS) {
      expect(pickSeasonKey(new Date(t))).not.toBe("JAN");
    }
  });

  it("경계표는 오름차순이고 JAN 수동 창은 마지막 자동 경계 뒤다", () => {
    const toUtc = ([y, m, d]: readonly [number, number, number]) => Date.UTC(y, m - 1, d);
    const times = SEASON_BOUNDARIES.map((b) => toUtc(b.fromKst));
    for (let i = 1; i < times.length; i++) expect(times[i]).toBeGreaterThan(times[i - 1]);
    expect(toUtc(JAN_MANUAL_FROM_KST)).toBeGreaterThan(times[times.length - 1]);
    expect(SEASON_BOUNDARIES.map((b) => b.key)).toEqual(["OCT", "DEC"]);
  });
});

describe("resolveSeasonKey — 오버라이드", () => {
  it("오버라이드가 null 이면 자동 키", () => {
    expect(resolveSeasonKey(kst("2026-09-11T12:00:00"), null)).toBe("SEP");
    expect(resolveSeasonKey(kst("2027-01-05T12:00:00"), null)).toBe("DEC");
  });

  it("오버라이드가 있으면 날짜와 무관하게 그 키 (1/2 JAN 절차·긴급 전환)", () => {
    expect(resolveSeasonKey(kst("2027-01-05T12:00:00"), "JAN")).toBe("JAN");
    expect(resolveSeasonKey(kst("2026-09-11T12:00:00"), "OCT")).toBe("OCT"); // 선행 전환
    expect(resolveSeasonKey(kst("2026-12-15T12:00:00"), "SEP")).toBe("SEP"); // 긴급 되돌림
  });

  it("기본 인자는 모듈 상수 SEASON_KEY_OVERRIDE 를 따른다", () => {
    const now = kst("2026-10-15T12:00:00");
    expect(resolveSeasonKey(now)).toBe(SEASON_KEY_OVERRIDE ?? pickSeasonKey(now));
  });

  it("isJanManualWindow 는 1/2 00:00 KST 부터 true", () => {
    expect(isJanManualWindow(kst("2027-01-01T23:59:59"))).toBe(false);
    expect(isJanManualWindow(kst("2027-01-02T00:00:00"))).toBe(true);
  });

  it("daysToNextBoundary — 임박 알림용 일수", () => {
    expect(daysToNextBoundary(kst("2026-09-25T00:00:00"))).toMatchObject({ key: "OCT", days: 1 });
    expect(daysToNextBoundary(kst("2026-09-19T00:00:00"))).toMatchObject({ key: "OCT", days: 7 });
    expect(daysToNextBoundary(kst("2026-09-26T00:00:00"))).toMatchObject({ key: "DEC" });
    expect(daysToNextBoundary(kst("2026-12-01T00:00:00"))).toBeNull();
  });
});

describe("scripts/season-key.mjs ↔ src/lib/seasonKey.ts 일치 (헬스체크용 사본 드리프트 방지)", () => {
  it("경계표·JAN 창·키 목록이 같다", () => {
    expect(mjs.SEASON_BOUNDARIES).toEqual(
      SEASON_BOUNDARIES.map((b) => ({ key: b.key, fromKst: [...b.fromKst] })),
    );
    expect(mjs.JAN_MANUAL_FROM_KST).toEqual([...JAN_MANUAL_FROM_KST]);
    expect(mjs.SEASON_KEYS).toEqual(KEYS);
    expect(mjs.SEASON_EXPIRES_KST).toEqual(JSON.parse(JSON.stringify(SEASON_EXPIRES_KST)));
  });

  it("만료표 — JAN 은 2027-03-11 00:00 KST 부터 만료, 그 전·다른 키는 false (mjs 동일, 2026-09-12 리뷰)", () => {
    expect(isSeasonKeyExpired("JAN", kst("2027-03-10T23:59:59"))).toBe(false);
    expect(isSeasonKeyExpired("JAN", kst("2027-03-11T00:00:00"))).toBe(true);
    expect(isSeasonKeyExpired("DEC", kst("2027-03-11T00:00:00"))).toBe(false);
    for (const k of KEYS) {
      for (const d of ["2026-09-12T00:00:00", "2027-03-10T23:59:59", "2027-03-11T00:00:00", "2027-06-01T12:00:00"]) {
        expect(mjs.isSeasonKeyExpired(k, kst(d)), `${k} ${d}`).toBe(isSeasonKeyExpired(k, kst(d)));
      }
    }
  });

  it("health-check 가 엣지 캐시 경로(/salary/50000000)에서도 마커를 대조하고 만료 경고를 낸다", () => {
    const hc = read("scripts/health-check.mjs");
    expect(hc).toContain('"/salary/50000000"');
    expect(hc).toContain("isSeasonKeyExpired(EXPECTED_SEASON_KEY, NOW)");
    const gen = read("scripts/gen-season-key.ts");
    expect(gen).toContain("isSeasonKeyExpired(key, now)");
  });

  it("2026-09-01~2027-02-28 일별 스윕(KST 00:00·12:00·23:59)에서 같은 키를 낸다", () => {
    const start = kst("2026-09-01T00:00:00").getTime();
    const end = kst("2027-02-28T23:59:59").getTime();
    const offsets = [0, 12 * 3_600_000, 23 * 3_600_000 + 59 * 60_000];
    let days = 0;
    for (let t = start; t <= end; t += DAY_MS) {
      days++;
      for (const off of offsets) {
        const d = new Date(t + off);
        const tag = d.toISOString();
        expect(mjs.pickSeasonKey(d), tag).toBe(pickSeasonKey(d));
        expect(mjs.isJanManualWindow(d), tag).toBe(isJanManualWindow(d));
        for (const ov of [null, "JAN", "OCT"] as const) {
          expect(mjs.resolveSeasonKey(d, ov), `${tag} override=${ov}`).toBe(resolveSeasonKey(d, ov));
        }
      }
    }
    expect(days).toBe(181);
  });

  it("readSeasonKeyOverride 가 TS 의 SEASON_KEY_OVERRIDE 와 같은 값을 읽는다 (1/2 한 줄 절차 보장)", () => {
    const r = mjs.readSeasonKeyOverride(process.cwd());
    expect(r.source).toBe("file");
    expect(r.override).toBe(SEASON_KEY_OVERRIDE);
  });
});

describe("코드젠 상수 SEASON_KEY 와 소비자 3파일", () => {
  it("seasonKey.generated.ts 는 유효한 키 하나를 내보낸다", () => {
    expect(KEYS).toContain(SEASON_KEY);
    expect(read("src/config/seasonKey.generated.ts")).toMatch(
      /export const SEASON_KEY: SeasonKey = "(SEP|OCT|DEC|JAN)";/,
    );
  });

  it("3소비자가 SEASON_KEY 를 import 하고 SEP 를 활성값으로 하드코딩하지 않는다", () => {
    for (const f of Object.values(CONSUMERS)) {
      const src = read(f);
      expect(src, f).toMatch(/import \{ SEASON_KEY \} from "@\/config\/seasonKey\.generated"/);
      expect(src, f).not.toMatch(/=\s*SEASON_TOP_SEP\s*;/);
      expect(src, f).not.toMatch(/=\s*SEASONAL_LINKS_SEP\s*;/);
      expect(src, f).not.toMatch(/chips:\s*KO_CHIP_SETS\.(SEP|OCT|DEC|JAN)\b/);
    }
    expect(read(CONSUMERS.seasonLinks)).toMatch(/SEASON_TOP_BY_KEY\[SEASON_KEY\]/);
    expect(read(CONSUMERS.seasonalLinks)).toMatch(/SEASONAL_LINKS_BY_KEY\[SEASON_KEY\]/);
    expect(read(CONSUMERS.headerSearch)).toMatch(/chips:\s*KO_CHIP_SETS\[SEASON_KEY\]/);
  });

  it("SeasonalLinks 섹션이 data-season-key 를 노출한다 (프로덕션 헬스체크 대조점)", () => {
    expect(read(CONSUMERS.seasonalLinks)).toMatch(/data-season-key=\{SEASON_KEY\}/);
  });

  it("health-check.mjs 가 season-key.mjs 로 /table/2026/annual 의 data-season-key 를 검사한다", () => {
    const src = read("scripts/health-check.mjs");
    expect(src).toMatch(/from "\.\/season-key\.mjs"/);
    expect(src).toMatch(/readSeasonKeyOverride/);
    expect(src).toMatch(/data-season-key/);
    expect(src).toMatch(/"\/table\/2026\/annual"/);
  });

  it("package.json — prebuild 가 코드젠을, verify:site 가 --check 를 실행한다", () => {
    const pkg = JSON.parse(read("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts.prebuild).toContain("tsx scripts/gen-season-key.ts");
    expect(pkg.scripts["verify:site"]).toContain("tsx scripts/gen-season-key.ts --check");
  });
});

describe("OCT·DEC·JAN 세트에 '추석' 문구 0건 (2026-08 만료 세트 사고 유형)", () => {
  const BANNED = ["추석", "chuseok", "명절"];
  const expectClean = (label: string, text: string) => {
    for (const w of BANNED) expect(text, `${label} 에 '${w}' 포함`).not.toContain(w);
  };

  it("seasonLinks 상단 블록 (헤더 name·description·푸터 name·href)", () => {
    const sets: [string, SeasonLink[]][] = [
      ["SEASON_TOP_OCT", SEASON_TOP_OCT],
      ["SEASON_TOP_DEC", SEASON_TOP_DEC],
      ["SEASON_TOP_JAN", SEASON_TOP_JAN],
    ];
    for (const [label, set] of sets) {
      const text = set
        .flatMap((l) => [l.href, l.header?.name, l.header?.description, l.footer?.name])
        .filter(Boolean)
        .join("\n");
      expectClean(label, text);
      expect(set.length, label).toBeGreaterThan(0);
    }
  });

  it("SeasonalLinks 세트 (heading·title·description·href)", () => {
    const sets: [string, SeasonalLinkSet][] = [
      ["SEASONAL_LINKS_OCT", SEASONAL_LINKS_OCT],
      ["SEASONAL_LINKS_DEC", SEASONAL_LINKS_DEC],
      ["SEASONAL_LINKS_JAN", SEASONAL_LINKS_JAN],
    ];
    for (const [label, set] of sets) {
      const text = [set.heading, ...set.links.flatMap((l) => [l.href, l.title, l.description])].join(
        "\n",
      );
      expectClean(label, text);
      expect(set.links.length, label).toBeGreaterThan(0);
    }
  });

  it("검색 칩 세트 (소스 스캔 — use client 모듈이라 import 대신 정규식)", () => {
    const src = read(CONSUMERS.headerSearch);
    for (const k of ["OCT", "DEC", "JAN"]) {
      const m = src.match(new RegExp(`^\\s*${k}:\\s*\\[([^\\]]*)\\]`, "m"));
      expect(m, `KO_CHIP_SETS.${k} 정의를 찾지 못함`).not.toBeNull();
      expectClean(`KO_CHIP_SETS.${k}`, m![1]);
    }
  });
});
