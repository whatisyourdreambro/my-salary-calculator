// 네이버 리퍼러 검색어 집계기 — 합성 행만 사용(실제 GA4 내보내기 미사용).
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  aggregateNaverRows,
  compareCodeUnits,
  extractNaverQuery,
  findHeader,
  isPathInside,
  NO_QUERY_MESSAGE,
  normalizeLanding,
  parseCliArgs,
  parseCsv,
  parseGa4NaverExport,
  renderMarkdown,
  runNaverReferrerCli,
  sanitizeForTerminal,
  type CliIo,
  type NaverRow,
} from "../naverReferrerQueries";

const enc = (s: string) => encodeURIComponent(s);
const SAMSUNG = enc("삼성전자 연봉"); // %EC%82%BC... 공백은 %20
const PC = "https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=0&ie=utf8&query=";
const MO = "https://m.search.naver.com/search.naver?sm=mtp_hty.top&where=m&query=";

/** GA4 자유 형식 내보내기 모양: BOM + '#' 머리 주석 + 빈 줄 + 헤더 + 데이터(CRLF). */
function ga4Csv(dataLines: string[], header = "페이지 리퍼러,방문 페이지 + 쿼리 문자열,세션수,조회수"): string {
  return (
    "\uFEFF# ----------------------------------------\r\n" +
    "# 자유 형식\r\n" +
    "# 속성: 합성 테스트\r\n" +
    "# 시작일: 20260829\r\n" +
    "# 종료일: 20260925\r\n" +
    "# ----------------------------------------\r\n" +
    "\r\n" +
    `${header}\r\n` +
    dataLines.join("\r\n") +
    "\r\n"
  );
}

describe("parseCsv / findHeader", () => {
  it("strips the BOM, skips '#' comment lines and blank lines, and finds the header after the offset", () => {
    const rows = parseCsv(ga4Csv([`${PC}${SAMSUNG},/salary-db/1,3,4`]));
    expect(rows[0]).toEqual(["페이지 리퍼러", "방문 페이지 + 쿼리 문자열", "세션수", "조회수"]);
    const found = findHeader(rows);
    expect(found).toEqual({ index: 0, columns: { referrer: 0, landing: 1, sessions: 2, views: 3 } });
  });

  it("finds a header that is not the first record and keeps quoted commas, quotes and newlines in one cell", () => {
    const text = 'note,only\n"a,b","say ""hi""","line1\nline2"\nPage referrer,Landing page + query string,Sessions,Views\n';
    const rows = parseCsv(text);
    expect(rows[1]).toEqual(["a,b", 'say "hi"', "line1\nline2"]);
    expect(findHeader(rows)?.index).toBe(2);
  });

  it("matches column names exactly, so 참여 세션수 / Engaged sessions / 세션당 조회수 are never picked", () => {
    const ko = parseCsv("참여 세션수,세션당 조회수,페이지 리퍼러,방문 페이지 + 쿼리 문자열,세션수,조회수\n");
    expect(findHeader(ko)?.columns).toEqual({ referrer: 2, landing: 3, sessions: 4, views: 5 });
    const en = parseCsv("Engaged sessions,Views per session,Page referrer,Landing page + query string,Sessions,Views\n");
    expect(findHeader(en)?.columns).toEqual({ referrer: 2, landing: 3, sessions: 4, views: 5 });
  });

  it("treats the views column as optional and returns null without the required columns", () => {
    expect(findHeader(parseCsv("페이지 리퍼러,방문 페이지,세션수\n"))?.columns.views).toBeNull();
    expect(findHeader(parseCsv("페이지 리퍼러,세션수\n"))).toBeNull();
  });
});

describe("extractNaverQuery", () => {
  it("keeps the PC and mobile Naver search hosts", () => {
    expect(extractNaverQuery(`${PC}${SAMSUNG}`)).toEqual({ naver: true, query: "삼성전자 연봉" });
    expect(extractNaverQuery(`${MO}${SAMSUNG}`)).toEqual({ naver: true, query: "삼성전자 연봉" });
    expect(extractNaverQuery("HTTPS://M.SEARCH.NAVER.COM./search.naver?query=a")).toEqual({ naver: true, query: "a" });
  });

  it("decodes '+' as a space and percent-encoded Korean, then NFC-normalizes", () => {
    expect(extractNaverQuery(`${PC}${enc("연봉")}+${enc("실수령액")}`).query).toBe("연봉 실수령액");
    expect(extractNaverQuery(`${PC}삼성전자+연봉`).query).toBe("삼성전자 연봉");
    const nfd = enc("하이닉스 성과급".normalize("NFD"));
    const q = extractNaverQuery(`${PC}${nfd}`).query;
    expect(q).toBe("하이닉스 성과급");
    expect(q).toBe(q?.normalize("NFC"));
    expect(extractNaverQuery(`${PC}%20%20a%20%20%20b%20`).query).toBe("a b");
  });

  it("falls back to oquery when query is missing or empty", () => {
    expect(extractNaverQuery(`https://search.naver.com/search.naver?oquery=${enc("연봉 계산기")}&tqi=x`).query).toBe("연봉 계산기");
    expect(extractNaverQuery(`${PC}&oquery=${enc("퇴직금")}`).query).toBe("퇴직금");
    expect(extractNaverQuery(`${PC}${enc("현재")}&oquery=${enc("직전")}`).query).toBe("현재");
  });

  it("marks a Naver search referrer without query/oquery as Naver with a null query", () => {
    expect(extractNaverQuery("https://search.naver.com/search.naver")).toEqual({ naver: true, query: null });
    expect(extractNaverQuery(`${PC}`)).toEqual({ naver: true, query: null });
  });

  it("drops non-Naver-search referrers, including look-alike hosts", () => {
    for (const ref of [
      "https://www.google.com/",
      "https://blog.naver.com/someone/123",
      "https://www.naver.com/",
      "https://search.naver.com.example.com/search.naver?query=a",
      "https://example.com/?u=search.naver.com&query=a",
      "android-app://com.nhn.android.search/",
      "(not set)",
      "",
    ]) {
      expect(extractNaverQuery(ref)).toEqual({ naver: false, query: null });
    }
  });
});

describe("normalizeLanding", () => {
  it("returns the path without query string or hash", () => {
    expect(normalizeLanding("/salary-db/1?from=naver")).toBe("/salary-db/1");
    expect(normalizeLanding("/salary-db/1#faq")).toBe("/salary-db/1");
    expect(normalizeLanding("https://www.moneysalary.com/salary-db/1/?x=1")).toBe("/salary-db/1");
    expect(normalizeLanding("/")).toBe("/");
    expect(normalizeLanding("/?x=1")).toBe("/");
    expect(normalizeLanding("")).toBe("(not set)");
    expect(normalizeLanding("(not set)")).toBe("(not set)");
  });

  it("decodes percent-encoded Korean paths so both spellings aggregate together", () => {
    expect(normalizeLanding(`/guides/${enc("연봉")}`)).toBe("/guides/연봉");
    expect(normalizeLanding("/bad/%E0%A4%A")).toBe("/bad/%E0%A4%A");
  });
});

describe("parseGa4NaverExport + aggregateNaverRows", () => {
  it("drops non-Naver rows and sums sessions and views by (query, landing)", () => {
    const text = ga4Csv([
      `${PC}${SAMSUNG},/salary-db/1,5,7`,
      `${MO}${SAMSUNG},/salary-db/1?from=a,3,4`,
      `"${PC}${SAMSUNG}&sm=x",/salary-db/1#top,2,2`,
      `${PC}${enc("연봉 계산기")},/,4,6`,
      `https://search.naver.com/search.naver?where=nexearch,/salary-db/1,6,6`,
      `https://www.google.com/,/salary-db/1,50,60`,
      `https://blog.naver.com/x,/,9,9`,
      `,,1000,2000`,
    ]);
    const parsed = parseGa4NaverExport(text);
    expect(parsed.droppedRows).toBe(3);
    expect(parsed.hasViews).toBe(true);
    const report = aggregateNaverRows(parsed.rows);
    expect(report.pairs).toEqual([
      { query: "삼성전자 연봉", landing: "/salary-db/1", sessions: 10, views: 13 },
      { query: "연봉 계산기", landing: "/", sessions: 4, views: 6 },
    ]);
    expect(report.totals).toEqual({ naverRows: 5, naverSessions: 20, querySessions: 14, coverage: 14 / 20, uniqueQueries: 2 });
    const salaryDb = report.landings.find((l) => l.landing === "/salary-db/1");
    expect(salaryDb).toMatchObject({ naverSessions: 16, querySessions: 10, views: 19 });
    expect(salaryDb?.coverage).toBeCloseTo(10 / 16);
    expect(report.landings.map((l) => l.landing)).toEqual(["/salary-db/1", "/"]);
  });

  it("reads quoted referrer cells that contain commas and thousands-separated numbers", () => {
    const parsed = parseGa4NaverExport(ga4Csv([`"${PC}a,b",/x,"1,234","2,000"`]));
    expect(parsed.rows).toEqual([{ query: "a,b", landing: "/x", sessions: 1234, views: 2000 }]);
  });

  it("sorts pairs by sessions desc, then query by UTF-16 code unit, then landing", () => {
    const rows: NaverRow[] = [
      { query: "가", landing: "/a", sessions: 5, views: 0 },
      { query: "a", landing: "/a", sessions: 5, views: 0 },
      { query: "B", landing: "/b", sessions: 5, views: 0 },
      { query: "B", landing: "/a", sessions: 5, views: 0 },
      { query: "zz", landing: "/a", sessions: 9, views: 0 },
      { query: "x", landing: "/c", sessions: 1, views: 0 },
    ];
    const order = aggregateNaverRows(rows).pairs.map((p) => `${p.query}${p.landing}`);
    expect(order).toEqual(["zz/a", "B/a", "B/b", "a/a", "가/a", "x/c"]);
    expect(compareCodeUnits("B", "a")).toBeLessThan(0);
    expect(compareCodeUnits("a", "가")).toBeLessThan(0);
  });
});

describe("renderMarkdown", () => {
  const rows: NaverRow[] = [
    { query: "q|1", landing: "/a", sessions: 3, views: 4 },
    { query: "q2", landing: "/a", sessions: 2, views: 2 },
    { query: "q3", landing: "/b", sessions: 1, views: 1 },
    { query: null, landing: "/b", sessions: 1, views: 1 },
  ];
  it("prints the top-N pair table with escaped cells and the per-landing coverage table", () => {
    const md = renderMarkdown(aggregateNaverRows(rows), { top: 2, by: "query", hasViews: true, droppedRows: 0 });
    expect(md).toContain("| 1 | q\\|1 | /a | 3 | 4 |");
    expect(md).toContain("| 2 | q2 | /a | 2 | 2 |");
    expect(md).not.toContain("| q3 |");
    expect(md).toContain("_...외 1건_");
    expect(md).toContain("| 1 | /a | 5 | 5 | 100.0% |");
    expect(md).toContain("| 2 | /b | 2 | 1 | 50.0% |");
  });
  it("groups by landing with coverage and top queries", () => {
    const md = renderMarkdown(aggregateNaverRows(rows), { top: 10, by: "landing", hasViews: false, droppedRows: 0 });
    expect(md).toContain("| 1 | /a | 5 | 6 | 5 | 100.0% | q\\|1 (3) · q2 (2) |");
    expect(md).toContain("| 2 | /b | 2 | 2 | 1 | 50.0% | q3 (1) |");
    expect(md).toContain("조회수 열 없음");
  });
});

describe("isPathInside", () => {
  it("detects paths inside the repo on win32 (case-insensitive) and posix", () => {
    expect(isPathInside("C:\\repo\\docs\\x.csv", "C:\\repo", path.win32)).toBe(true);
    expect(isPathInside("c:\\REPO\\x.csv", "C:\\repo", path.win32)).toBe(true);
    expect(isPathInside("C:\\repo", "C:\\repo", path.win32)).toBe(true);
    expect(isPathInside("C:\\repo2\\x.csv", "C:\\repo", path.win32)).toBe(false);
    expect(isPathInside("D:\\repo\\x.csv", "C:\\repo", path.win32)).toBe(false);
    expect(isPathInside("C:\\repo\\..\\x.csv", "C:\\repo", path.win32)).toBe(false);
    expect(isPathInside("/repo/a/b.csv", "/repo", path.posix)).toBe(true);
    expect(isPathInside("/home/u/..csv", "/home/u/repo", path.posix)).toBe(false);
    expect(isPathInside("/repo/..data/x.csv", "/repo", path.posix)).toBe(true);
  });
});

describe("runNaverReferrerCli", () => {
  const csv = ga4Csv([
    `${PC}${SAMSUNG},/salary-db/1,5,7`,
    `https://search.naver.com/search.naver?where=nexearch&ssc=SECRETTOKEN123,/salary-db/1,1,1`,
  ]);
  const io = (over: Partial<CliIo> = {}): CliIo => ({
    repoRoot: "/work/repo",
    cwd: "/work/repo",
    realpath: (p) => p,
    readText: vi.fn(() => csv),
    pathImpl: path.posix,
    ...over,
  });

  it("refuses an input inside the repo working tree with exit 2 before reading it", () => {
    const readText = vi.fn(() => csv);
    for (const file of ["docs/ga4.csv", "/work/repo/ga4.csv", "../repo/x.csv"]) {
      const res = runNaverReferrerCli([file], io({ readText }));
      expect(res.code).toBe(2);
      expect(res.stdout).toBe("");
      expect(res.stderr).toContain("저장소 작업 트리 안");
    }
    // 저장소 밖 경로처럼 보여도 실제 경로(정션·링크 해제)가 저장소 안이면 거부
    const viaLink = runNaverReferrerCli(["/tmp/link.csv"], io({ readText, realpath: (p) => (p === "/tmp/link.csv" ? "/work/repo/data/x.csv" : p) }));
    expect(viaLink.code).toBe(2);
    expect(readText).not.toHaveBeenCalled();
  });

  it("prints the table for an outside path and never echoes raw referrer strings", () => {
    const res = runNaverReferrerCli(["/tmp/ga4.csv", "--top", "5"], io());
    expect(res.code).toBe(0);
    expect(res.stdout).toContain("| 1 | 삼성전자 연봉 | /salary-db/1 | 5 | 7 |");
    expect(res.stdout).toContain("| 1 | /salary-db/1 | 6 | 5 | 83.3% |");
    for (const raw of ["search.naver.com", "SECRETTOKEN123", "nexearch", "query=", "%EC"]) {
      expect(res.stdout).not.toContain(raw);
      expect(res.stderr).not.toContain(raw);
    }
  });

  it("prints the Search Advisor message and exits 0 when no Naver referrer carries a query", () => {
    const noQuery = ga4Csv([
      "https://search.naver.com/search.naver?where=nexearch,/salary-db/1,4,4",
      "https://www.google.com/,/,9,9",
    ]);
    const res = runNaverReferrerCli(["/tmp/ga4.csv"], io({ readText: () => noQuery }));
    expect(res).toMatchObject({ code: 0, stdout: `${NO_QUERY_MESSAGE}\n` });
    const empty = runNaverReferrerCli(["/tmp/ga4.csv"], io({ readText: () => ga4Csv([]) }));
    expect(empty).toMatchObject({ code: 0, stdout: `${NO_QUERY_MESSAGE}\n` });
  });

  it("reports header, read and usage errors with exit 1 without echoing URL cells", () => {
    const headerless = runNaverReferrerCli(["/tmp/x.csv"], io({ readText: () => `${PC}${SAMSUNG},/a,1\n` }));
    expect(headerless.code).toBe(1);
    expect(headerless.stderr).toContain("헤더 인식 실패");
    expect(headerless.stderr).not.toContain("search.naver.com");
    const unreadable = runNaverReferrerCli(["/tmp/x.csv"], io({ readText: () => { throw new Error("ENOENT"); } }));
    expect(unreadable.code).toBe(1);
    expect(runNaverReferrerCli([], io()).code).toBe(1);
    expect(runNaverReferrerCli(["--help"], io()).code).toBe(0);
  });
});

describe("terminal escape injection (forged GA4 referrer / landing)", () => {
  // C0·DEL·C1 제어 문자와 양방향 재정렬 서식 문자 — 출력에 '\n' 외에는 하나도 없어야 한다.
  const UNSAFE = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u202A-\u202E\u2066-\u2069\u200B-\u200F\u2028\u2029\uFEFF]/;
  const OSC52 = "%1B]52;c;ZWNobyBwd24%3D%07abc"; // ESC ] 52 ; c ; <base64> BEL — 클립보드 쓰기
  const RLO = "%E2%80%AE"; // U+202E RIGHT-TO-LEFT OVERRIDE
  const csv = ga4Csv([
    `${PC}${OSC52}${RLO}x,/x%1B%5B31m${RLO}y%1B]52;c;eA%3D%3D%07,5,6`,
    `${PC}a%E2%81%A6b%E2%80%8Bc%C2%9B31m%7F,/salary-db/1,3,3`,
    `${PC}ok,(not set)\u001b[31m\u202E,2,2`,
    `${PC}ok2,/raw\u001b[2J\u0085\u009b31m\u2066z,1,1`,
  ]);
  const io: CliIo = { repoRoot: "/work/repo", cwd: "/work/repo", realpath: (p) => p, readText: () => csv, pathImpl: path.posix };

  it("replaces control, format and bidi characters in queries and landings with U+FFFD", () => {
    expect(extractNaverQuery(`${PC}${OSC52}`).query).toBe("\uFFFD]52;c;ZWNobyBwd24=\uFFFDabc");
    expect(extractNaverQuery(`${PC}a${RLO}b`).query).toBe("a\uFFFDb");
    expect(normalizeLanding(`/x%1B%5B31m${RLO}y`)).toBe("/x\uFFFD[31m\uFFFDy");
    expect(normalizeLanding("(not set)\u001b[31m")).toBe("(not set)\uFFFD[31m");
    expect(normalizeLanding("https://www.moneysalary.com/a%07b/")).toBe("/a\uFFFDb");
    expect(sanitizeForTerminal("가\u0000\u001b\u007f\u0085\u009b\u200B\u200D\u202A\u202E\u2066\u2069\u2028\u2029\uFEFF\ud800나")).toBe(
      `가${"\uFFFD".repeat(15)}나`,
    );
    // 정상 한글·기호는 그대로
    expect(sanitizeForTerminal("삼성전자 연봉 · 성과급 — 2026 ★")).toBe("삼성전자 연봉 · 성과급 — 2026 ★");
  });

  it("prints no escape or bidi character to stdout or stderr in either --by mode", () => {
    for (const by of ["query", "landing"]) {
      const res = runNaverReferrerCli(["/tmp/ga4.csv", "--by", by], io);
      expect(res.code).toBe(0);
      expect(res.stdout).toContain("\uFFFD\\]52;c;ZWNobyBwd24=\uFFFDabc"); // ']' 는 cell() 이 이스케이프
      expect(res.stdout.replace(/\n/g, "")).not.toMatch(UNSAFE);
      expect(res.stderr).not.toMatch(UNSAFE);
    }
  });

  it("sanitizes the header-failure diagnostic that echoes the first record", () => {
    const res = runNaverReferrerCli(["/tmp/x.csv"], { ...io, readText: () => "a\u001b[31m,b\u202Ec\u0007,d\u009b\n" });
    expect(res.code).toBe(1);
    expect(res.stderr).toContain("a\uFFFD[31m | b\uFFFDc\uFFFD | d\uFFFD");
    expect(res.stderr.replace(/\n/g, "")).not.toMatch(UNSAFE);
  });

  it("sanitizes argv-derived error text as well", () => {
    const res = runNaverReferrerCli(["/tmp/x.csv", "--by", "q\u001b]52;c;eA==\u0007"], io);
    expect(res.code).toBe(1);
    expect(res.stderr.replace(/\n/g, "")).not.toMatch(UNSAFE);
  });

  it("escapes square brackets and backslashes so a forged query cannot render as a markdown link or image", () => {
    const rows: NaverRow[] = [
      { query: "![x](https://evil.example/p.png)", landing: "/a", sessions: 2, views: 0 },
      { query: "\\[y\\](https://evil.example/)", landing: "/a", sessions: 1, views: 0 },
    ];
    const md = renderMarkdown(aggregateNaverRows(rows), { top: 5, by: "query", hasViews: true, droppedRows: 0 });
    expect(md).toContain("| 1 | !\\[x\\](https://evil.example/p.png) | /a | 2 | 0 |");
    expect(md).toContain("| 2 | \\\\\\[y\\\\\\](https://evil.example/) | /a | 1 | 0 |");
    expect(md).not.toMatch(/(^|[^\\])\[x\]/);
  });
});

describe("parseCliArgs", () => {
  it("accepts --top N / --top=N and --by query|landing, rejecting bad values", () => {
    expect(parseCliArgs(["a.csv"])).toEqual({ ok: true, args: { file: "a.csv", top: 200, by: "query" } });
    expect(parseCliArgs(["a.csv", "--top", "5", "--by", "landing"])).toEqual({ ok: true, args: { file: "a.csv", top: 5, by: "landing" } });
    expect(parseCliArgs(["--top=7", "a.csv"])).toEqual({ ok: true, args: { file: "a.csv", top: 7, by: "query" } });
    for (const bad of [["a.csv", "--top", "0"], ["a.csv", "--top", "x"], ["a.csv", "--by", "page"], ["a.csv", "--top"], ["a.csv", "b.csv"], ["a.csv", "--out", "x"]]) {
      expect(parseCliArgs(bad).ok).toBe(false);
    }
  });
});
