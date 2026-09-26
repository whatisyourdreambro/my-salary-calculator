// src/lib/staleStatusScan.ts 단위 테스트 (R4 freshness-scan, 2026-09-26)
// 날짜 형식 5종 + --press, 상태 단어 없음, 미래 날짜, 경계일, CRLF, 경로 제외, CLI 인자, 보고서 형식.
import { describe, expect, it } from "vitest";

import {
  DEFAULT_DAYS,
  SNIPPET_MAX,
  codeSpan,
  daysBetween,
  evaluateLine,
  findStatusWords,
  formatReport,
  isScannableSourcePath,
  kstDateIso,
  makeSnippet,
  parseCliArgs,
  parseDateStamps,
  scanText,
  shouldFail,
  type StaleFinding,
} from "@/lib/staleStatusScan";

const TODAY = "2026-09-26";
const OPTS = { today: TODAY, days: 30 };

describe("parseDateStamps — 기본 날짜 형식 5종", () => {
  it.each([
    ["(YYYY-MM 기준)", "임협 미타결(2026-08 기준)", "2026-08-01", "2026-08 기준"],
    ["YYYY-MM-DD 기준", "2026-08-14 기준 교섭 중", "2026-08-14", "2026-08-14 기준"],
    ["YYYY년 M월 기준", "2026년 4월 기준 미타결 상태", "2026-04-01", "2026년 4월 기준"],
    ["YYYY년 M월 D일 기준", "2026년 8월 5일 기준 심의 중", "2026-08-05", "2026년 8월 5일 기준"],
    ["(YYYY-MM)", "작성 시점(2026-05) 전망", "2026-05-01", "(2026-05)"],
  ])("%s", (_form, line, iso, raw) => {
    const stamps = parseDateStamps(line);
    expect(stamps).toHaveLength(1);
    expect(stamps[0].iso).toBe(iso);
    expect(stamps[0].raw).toBe(raw);
    expect(line.slice(stamps[0].index, stamps[0].index + raw.length)).toBe(raw);
  });

  it("'기준' 형식은 괄호 유무·띄어쓰기 변형을 모두 받는다", () => {
    expect(parseDateStamps("2026-07 기준 미정")[0].iso).toBe("2026-07-01");
    expect(parseDateStamps("2026년8월 기준 예정")[0].iso).toBe("2026-08-01");
    expect(parseDateStamps("(2026년 12월 31일 기준)")[0].iso).toBe("2026-12-31");
  });

  it("'YYYY-MM-DD 보도' 는 --press 일 때만 날짜로 본다", () => {
    const line = "(헤럴드경제 2026-05-20 보도) 교섭이 진행 중";
    expect(parseDateStamps(line)).toHaveLength(0);
    const press = parseDateStamps(line, { press: true });
    expect(press.map((s) => s.iso)).toEqual(["2026-05-20"]);
  });

  it("스탬프가 아닌 날짜·달력에 없는 날짜·더 긴 숫자 속 부분 일치는 버린다", () => {
    expect(parseDateStamps("확정 지급(2026-02-05, 영업이익) 예정")).toHaveLength(0); // 괄호 속 일자는 형식 밖
    expect(parseDateStamps("2027-01 시행 예정")).toHaveLength(0); // '기준' 없는 연월
    expect(parseDateStamps("2026-02-30 기준 미정")).toHaveLength(0);
    expect(parseDateStamps("2026년 13월 기준 미정")).toHaveLength(0);
    expect(parseDateStamps("코드 12026-08 기준 미정")).toHaveLength(0);
  });
});

describe("findStatusWords", () => {
  it("상태 단어를 등장 순·중복 제거로 돌려주고 두 단어짜리는 붙여 쓴 것도 잡는다", () => {
    expect(findStatusWords("장기화로 미타결, 또 미타결 — 교섭중·심의 중")).toEqual(["장기화", "미타결", "교섭중", "심의 중"]);
    expect(findStatusWords("발표 전·고시 전·확정 전·진행 중·예정·미정·전망")).toHaveLength(7);
  });
});

describe("evaluateLine / scanText — 판정", () => {
  it("상태 단어가 없으면 날짜가 오래돼도 표시하지 않는다", () => {
    expect(evaluateLine("평균 연봉 1억원 (2025-12 기준)", OPTS)).toBeNull();
  });

  it("날짜 스탬프가 없으면 상태 단어가 있어도 표시하지 않는다", () => {
    expect(evaluateLine("2026년분은 임단협 미타결로 미확정입니다.", OPTS)).toBeNull();
  });

  it("오래된 스탬프 + 상태 단어 → 경과일과 함께 표시", () => {
    const hit = evaluateLine("2026년분 임단협은 미타결(2026-08 기준).", OPTS);
    expect(hit).not.toBeNull();
    expect(hit!.ageDays).toBe(56); // 월 단위 스탬프는 그 달 1일
    expect(hit!.statusWords).toEqual(["미타결"]);
    expect(hit!.comment).toBe(false);
  });

  it("미래 날짜는 표시하지 않는다", () => {
    expect(evaluateLine("2026년 12월 1일 기준 발표 전", OPTS)).toBeNull();
    expect(evaluateLine("교섭 중 (2027-01 기준)", OPTS)).toBeNull();
  });

  it("경계일: 경과일 = days 면 제외, days + 1 이면 표시", () => {
    expect(daysBetween("2026-08-27", TODAY)).toBe(30);
    expect(evaluateLine("2026-08-27 기준 교섭 중", OPTS)).toBeNull();
    const hit = evaluateLine("2026-08-26 기준 교섭 중", OPTS);
    expect(hit?.ageDays).toBe(31);
    // --days 0: 오늘 스탬프는 제외, 어제 스탬프는 표시
    expect(evaluateLine(`${TODAY} 기준 예정`, { today: TODAY, days: 0 })).toBeNull();
    expect(evaluateLine("2026-09-25 기준 예정", { today: TODAY, days: 0 })?.ageDays).toBe(1);
  });

  it("한 줄에 스탬프가 여럿이면 가장 최근 날짜로 판정한다", () => {
    expect(evaluateLine("(2025-12 기준) 미정 → (2026-09 기준) 미정", OPTS)).toBeNull();
    const hit = evaluateLine("(2026-05 기준) 전망, (2026-07 기준) 전망", OPTS);
    expect(hit?.stamp.iso).toBe("2026-07-01");
  });

  it("주석 줄은 표시하되 comment 로 구분한다", () => {
    expect(evaluateLine("  // 교섭 진행 중 (2026-05 기준)", OPTS)?.comment).toBe(true);
    expect(evaluateLine("   * 고시 전 (2026-05 기준)", OPTS)?.comment).toBe(true);
  });

  it("CRLF 입력도 LF 와 같은 줄 번호·같은 발췌를 낸다 (발췌에 \\r 없음)", () => {
    const lines = ["const a = 1;", "// 미타결(2026-08 기준)", "", "  text: '장기화 중 (2026년 7월 기준)',", "끝"];
    const lf = scanText(lines.join("\n"), "src/app/x/page.tsx", OPTS);
    const crlf = scanText(lines.join("\r\n"), "src/app/x/page.tsx", OPTS);
    expect(crlf).toEqual(lf);
    expect(crlf.map((f) => f.line)).toEqual([2, 4]);
    for (const f of crlf) expect(f.snippet).not.toMatch(/\r/);
  });

  it("긴 줄의 발췌는 120자(코드포인트) 이하이고 스탬프와 상태 단어를 함께 담는다", () => {
    const long = `${"가".repeat(200)} 부분파업으로 장기화 중이라(2026년 8월 기준) 모비스도 ${"나".repeat(200)}`;
    const hit = evaluateLine(long, OPTS);
    expect(hit).not.toBeNull();
    expect(Array.from(hit!.snippet).length).toBeLessThanOrEqual(SNIPPET_MAX);
    expect(hit!.snippet).toContain("장기화");
    expect(hit!.snippet).toContain("2026년 8월 기준");
    expect(hit!.snippet.startsWith("…")).toBe(true);
    expect(hit!.snippet.endsWith("…")).toBe(true);
  });
});

describe("makeSnippet", () => {
  it("짧은 줄은 그대로, 이모지(서로게이트)도 코드포인트로 센다", () => {
    expect(makeSnippet("짧은 줄", 0)).toBe("짧은 줄");
    const s = makeSnippet("📢".repeat(300), 250 * 2, 250 * 2, 50);
    expect(Array.from(s).length).toBeLessThanOrEqual(50);
    expect(s).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/); // 짝 잃은 상위 서로게이트 없음
  });
});

describe("isScannableSourcePath", () => {
  it.each([
    ["src/app/calc/hyundai-mobis-bonus/page.tsx", true],
    ["src/data/industriesData.ts", true],
    ["src/config/currentRates.ts", true],
    ["src/lib/guides/hot-news-2026-may.ts", true],
    ["src\\lib\\seasonKey.ts", true],
    ["src/components/SalaryCalculator.tsx", false], // 스캔 루트 밖
    ["scripts/gen-season-key.ts", false],
    ["src/lib/__tests__/seasonKey.test.ts", false],
    ["src/lib/__tests__/fixtures/x.ts", false],
    ["src/lib/fixtures/sample.ts", false],
    ["src/lib/__tests__/payFull2027.fixture.ts", false],
    ["src/config/seasonKey.generated.ts", false],
    ["src/app/calc/samsung-bonus/model.test.ts", false],
    ["src/app/fonts/README.md", false],
    ["src/app/globals.css", false],
  ])("%s → %s", (p, expected) => {
    expect(isScannableSourcePath(p)).toBe(expected);
  });
});

describe("parseCliArgs / shouldFail", () => {
  it("기본값: 기준일=넘긴 오늘, 30일, fail-on 없음", () => {
    expect(parseCliArgs([], TODAY)).toEqual({ kind: "run", today: TODAY, days: DEFAULT_DAYS, failOn: null, press: false, root: null });
  });

  it("값 인자는 공백·= 두 형식을 모두 받는다", () => {
    expect(parseCliArgs(["--today", "2026-10-01", "--days=45", "--fail-on", "3", "--press", "--root=../x"], TODAY)).toEqual({
      kind: "run",
      today: "2026-10-01",
      days: 45,
      failOn: 3,
      press: true,
      root: "../x",
    });
  });

  it("잘못된 인자는 error", () => {
    expect(parseCliArgs(["--today", "2026-02-30"], TODAY).kind).toBe("error");
    expect(parseCliArgs(["--today"], TODAY).kind).toBe("error");
    expect(parseCliArgs(["--days", "-1"], TODAY).kind).toBe("error");
    expect(parseCliArgs(["--fail-on", "0"], TODAY).kind).toBe("error");
    expect(parseCliArgs(["--fail-on", "--press"], TODAY).kind).toBe("error");
    expect(parseCliArgs(["--bogus"], TODAY).kind).toBe("error");
    expect(parseCliArgs(["--help"], TODAY).kind).toBe("help");
  });

  it("--fail-on 은 발견 수가 그 이상일 때만 실패", () => {
    expect(shouldFail(5, null)).toBe(false);
    expect(shouldFail(2, 3)).toBe(false);
    expect(shouldFail(3, 3)).toBe(true);
  });
});

describe("kstDateIso", () => {
  it("UTC 15:00 이후는 KST 다음 날", () => {
    expect(kstDateIso(new Date("2026-09-25T14:59:59Z"))).toBe("2026-09-25");
    expect(kstDateIso(new Date("2026-09-25T15:00:00Z"))).toBe("2026-09-26");
  });
});

describe("formatReport", () => {
  const f = (file: string, line: number, ageDays: number, snippet = "미타결(2026-08 기준)"): StaleFinding => ({
    file,
    line,
    ageDays,
    stamp: { raw: "2026-08 기준", iso: "2026-08-01", index: 4 },
    statusWords: ["미타결"],
    snippet,
    comment: false,
  });

  it("파일별로 묶고 가장 오래된 발견이 있는 파일부터, 파일 안에서는 줄 순서", () => {
    const md = formatReport([f("src/app/b.tsx", 9, 56), f("src/app/a.tsx", 3, 56), f("src/app/b.tsx", 2, 178)], {
      today: TODAY,
      days: 30,
      press: false,
      filesScanned: 3,
      elapsedMs: 120,
    });
    expect(md).toContain("발견 3건 (2개 파일)");
    expect(md.indexOf("## src/app/b.tsx (2건)")).toBeLessThan(md.indexOf("## src/app/a.tsx (1건)"));
    expect(md.indexOf("src/app/b.tsx:2")).toBeLessThan(md.indexOf("src/app/b.tsx:9"));
    expect(md).toContain("· 178일 ·");
    expect(md).toContain("0.12초");
  });

  it("발견이 없으면 '발견 없음'", () => {
    expect(formatReport([], { today: TODAY, days: 30, press: true, filesScanned: 0 })).toContain("발견 없음.");
  });

  it("발췌 속 백틱은 더 긴 펜스로 감싼다", () => {
    expect(codeSpan("a`b")).toBe("``a`b``");
    expect(codeSpan("`x`")).toBe("`` `x` ``");
    const md = formatReport([f("src/app/c.tsx", 1, 40, "`${year}` 미정(2026-08 기준)")], {
      today: TODAY,
      days: 30,
      press: false,
      filesScanned: 1,
    });
    expect(md).toContain("`` `${year}` 미정(2026-08 기준) ``");
  });
});
