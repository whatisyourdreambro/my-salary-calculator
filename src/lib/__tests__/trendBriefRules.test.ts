// 트렌드 브리프 게이트 규칙 테스트 (2026-09-26 R5 publisher)
//
// - 합성 픽스처(fixtures/trendBriefDrafts.json + trendBriefSourceSnapshot.txt)의 good 초안은 모든 규칙을 통과하고,
//   cases 는 규칙마다 일부러 실패시킨다(gate.ts --self-test 와 같은 픽스처).
// - 한도·달력·숫자 토큰·출처 호스트·'확정' 부정 문맥 단위 검사.
// - 드리프트 가드: GUIDESPEC_FORBIDDEN ↔ guideSpec.test.ts FORBIDDEN, rules.ts ↔ scripts/trend-publish/daily.mjs(한도·달력·해시).
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import {
  GUIDESPEC_FORBIDDEN,
  RULE_IDS,
  addDays,
  calendarBlocks,
  capViolations,
  fixtureCase,
  isBriefCitationUrl,
  isoWeekKey,
  numericTokens,
  parseVerifyTaxPatterns,
  runRules,
  updateCalendarBlocks,
  type BriefFixture,
  type CalendarConfig,
  type LedgerEntry,
} from "@/lib/trendBriefs/rules";
import { autoConstText, draftToHtml } from "@/lib/trendBriefs/render";
import { impactTable, provisionalDisclosure, stripProvisionalDisclosures } from "@/lib/trendBriefs/impacts";
import { visibleText } from "@/lib/trendBriefs/text";
import {
  FIRST_PUBLISH_NOT_BEFORE,
  HARD_CAPS,
  TREND_BRIEF_TAG,
  canonicalJson,
  draftHashInput,
  draftSha256,
  sha256Hex,
  validateDraft,
  type TrendBriefDraft,
} from "@/lib/trendBriefs/types";

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const FX = JSON.parse(read("src/lib/__tests__/fixtures/trendBriefDrafts.json")) as BriefFixture;
const SNAP = read("src/lib/__tests__/fixtures/trendBriefSourceSnapshot.txt");
const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const BASE = {
  existingGuides: koGuides.map((g) => ({ key: g.slug, title: g.title, text: visibleText(g.content) })),
  existingSlugs: koGuides.map((g) => g.slug),
  redirectSlugs: [] as string[],
  routeExists: (p: string) => p === "/" || existsSync(join(ROOT, "src/app", p, "page.tsx")),
  taxPatterns: parseVerifyTaxPatterns(read("scripts/verify-tax-constants.mjs")),
};

describe("합성 픽스처 — good 통과 · 규칙별 실패", () => {
  it("good 초안은 스키마 검증과 모든 규칙을 통과한다", () => {
    const v = validateDraft(FX.good);
    expect(v.ok && v.draft).toBeTruthy();
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE);
    const failed = runRules(draft, ctx).filter((r) => !r.ok);
    expect(failed.map((r) => `${r.id}: ${r.detail}`)).toEqual([]);
  });

  it("규칙 목록 전부에 실패 픽스처가 하나 이상 있다 (목록 밖 규칙 이름 없음)", () => {
    expect([...new Set(FX.cases.map((c) => c.rule))].sort()).toEqual([...RULE_IDS].sort());
  });

  for (const [i, c] of FX.cases.entries()) {
    it(`${c.rule} #${i} — 심어 둔 위반을 잡는다`, () => {
      const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE, c);
      const hit = runRules(draft, ctx).find((r) => r.id === c.rule);
      expect(hit, c.rule).toBeDefined();
      expect(hit!.ok, `${c.rule}: ${hit!.detail}`).toBe(false);
    });
  }

  it("dry-run 모드에서는 한도·달력이 참고로만 나온다", () => {
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE, { rule: "calendar", contextPatch: { mode: "dryrun", today: "2026-10-01" } });
    const res = runRules({ ...draft, publishedDate: "2026-10-01", modifiedDate: "2026-10-01", sources: draft.sources.map((s) => (s.role === "primary" ? { ...s, publishedDate: "2026-09-30" } : s)), event: { ...draft.event, announcedDate: "2026-09-30" } }, ctx);
    const cal = res.find((r) => r.id === "calendar")!;
    expect(cal.ok).toBe(true);
    expect(cal.detail).toContain("[dry-run 참고]");
  });
});

describe("critic fix 2026-09-26 — 출처 전체 유사도 · 레이더 후보 대조 · 결정 전 값 고지", () => {
  const rule = (draft: TrendBriefDraft, ctx: ReturnType<typeof fixtureCase>["ctx"], id: string) => runRules(draft, ctx).find((r) => r.id === id)!;

  it("similarity-source 는 인용한 출처 전부와 합집합을 잰다 (good 은 통과)", () => {
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE);
    const r = rule(draft, ctx, "similarity-source");
    expect(r.ok, r.detail).toBe(true);
    expect(r.detail).toContain("출처 2건");
    expect(r.detail).toContain("합산");
  });

  it("인용하지 않았어도 그날 writer 가 본 스냅숏에서 옮겨 적으면 막는다", () => {
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE);
    const briefText = visibleText(draftToHtml(draft));
    const extra = { id: "secondary-1", url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=77777", fetchedAt: "", sha256: "x", text: briefText, robotsAllowed: true };
    const r = rule(draft, { ...ctx, snapshots: [...ctx.snapshots, extra] }, "similarity-source");
    expect(r.ok).toBe(false);
    expect(r.detail).toContain("secondary-1");
  });

  it("레이더 후보 대조 — --update 는 후보 없이도 되고, dryrun 이어도 후보 없는 새 브리프는 실패", () => {
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE);
    expect(rule(draft, { ...ctx, candidate: undefined, updateOf: draft.slug }, "citations").detail).not.toContain("레이더 후보 기록 없음");
    expect(rule(draft, { ...ctx, candidate: undefined, mode: "dryrun" }, "citations").ok).toBe(false);
    // finalUrl(리디렉트 도착지)로 적어도 같은 문서면 통과
    const moved = { ...ctx, snapshots: ctx.snapshots.map((s) => (s.id === "primary" ? { ...s, url: "https://www.moel.go.kr/old?news_seq=99999", finalUrl: s.url } : s)) };
    expect(rule(draft, moved, "citations").detail).not.toContain("레이더 후보 문서가 아님");
    // 후보 route 가 update-existing 이면 canonical-release 가 막는다(--candidate-route 없이도)
    expect(rule(draft, { ...ctx, candidate: { ...ctx.candidate!, route: "update-existing" } }, "canonical-release").ok).toBe(false);
  });

  it("예고·정부안 후보면 event.kind 가 예고 종류이고 status 가 proposed 여야 한다", () => {
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE);
    const cand = { ...ctx.candidate!, sourceKind: "행정예고" };
    expect(rule(draft, { ...ctx, candidate: cand }, "unannounced-facts").ok).toBe(false);
    const honest = { ...draft, event: { ...draft.event, kind: "행정예고" as const, status: "proposed" as const } };
    const r = rule(honest, { ...ctx, candidate: cand }, "unannounced-facts");
    expect(r.ok, r.detail).toBe(true);
  });

  it("영향 표 base 기본값은 2026 — 2027 은 명시할 때만, 그때 결정 전 값 고지가 표 설명에 자동으로 붙는다", () => {
    const params = FX.good.impact.table.params as Record<string, unknown>;
    const noBase = { ...params };
    delete noBase.base;
    expect(impactTable("insurance-rate-change", noBase).provisional).toEqual([]);
    const y27 = { ...FX.good, impact: { ...FX.good.impact, table: { ...FX.good.impact.table, params: { ...params, base: "2027" } } } } as TrendBriefDraft;
    expect(impactTable("insurance-rate-change", y27.impact.table.params).provisional).toEqual(["INSURANCE_RATES_2027.LONG_TERM_CARE_RATIO"]);
    const html = draftToHtml(y27);
    expect(html).toContain("표의 장기요양보험 비율 2027년 값은 아직 결정 전이라 2026년 값을 그대로 넣었습니다.");
    expect(draftToHtml(FX.good as TrendBriefDraft)).not.toContain("아직 결정 전이라");
    const noOverride = { monthlyPays: [2000000, 3000000, 4000000], base: "2027" };
    expect(provisionalDisclosure(impactTable("insurance-rate-change", noOverride).provisional)).toBe(
      "표의 장기요양보험 비율·고용보험 요율 2027년 값은 아직 결정 전이라 2026년 값을 그대로 넣었습니다."
    );
    // 고지 문장은 '확정' 이라는 낱말을 쓰지 않는다(정부안 글의 확정 표현 검사와 부딪히지 않게)
    for (const k of ["RAISE_2027_BUDGET", "UNEMPLOYMENT_BENEFIT_2027", "INSURANCE_RATES_2027.EMPLOYMENT_INSURANCE", "UNKNOWN_FLAG"]) {
      expect(provisionalDisclosure([k])).not.toContain("확정");
      expect(provisionalDisclosure([k]).length).toBeGreaterThan(10);
    }
    const { ctx } = fixtureCase(FX, SNAP, sha, BASE);
    const r = rule(y27, { ...ctx, renderedHtml: html }, "unannounced-facts");
    expect(r.ok, r.detail).toBe(true);
    expect(r.detail).toContain("결정 전 값 고지 있음");
    // 분량 한도는 writer 글만 — 고지 문장은 빼고 잰다(등록 본문 검사와 같은 기준)
    const s = rule(y27, ctx, "structure");
    expect(s.ok, s.detail).toBe(true);
    expect(s.detail).toMatch(/\(\+고지 \d+자\)/);
    const full = visibleText(html);
    expect(stripProvisionalDisclosures(full)).not.toContain("아직 결정 전");
    expect(stripProvisionalDisclosures(full).length).toBe(s.value);
    for (const k of ["RAISE_2027_BUDGET", "UNEMPLOYMENT_BENEFIT_2027", "UNKNOWN_FLAG"]) {
      expect(stripProvisionalDisclosures(`앞 문장. ${provisionalDisclosure([k])} 뒤 문장.`)).toBe("앞 문장. 뒤 문장.");
    }
  });
});

describe("스키마 검증 (validateDraft)", () => {
  it("skip 초안 · metaDescription 거부 · 필드 누락 · 태그 자동 추가", () => {
    expect(validateDraft({ skip: true, reason: "공식 출처 1건뿐" })).toEqual({ ok: true, skip: { skip: true, reason: "공식 출처 1건뿐" } });
    expect(validateDraft({ skip: true }).ok).toBe(false);
    const withMeta = validateDraft({ ...FX.good, metaDescription: "x" });
    expect(withMeta.ok).toBe(false);
    expect(withMeta.errors?.join()).toContain("metaDescription");
    const missing = { ...FX.good } as Record<string, unknown>;
    delete missing.lead;
    expect(validateDraft(missing).errors?.join()).toContain("lead");
    expect(validateDraft({ ...FX.good, slug: "Bad Slug" }).ok).toBe(false);
    expect(validateDraft({ ...FX.good, publishedDate: "2026-02-30" }).ok).toBe(false);
    const ok = validateDraft(FX.good);
    expect(ok.draft?.tags).toContain(TREND_BRIEF_TAG);
  });
});

describe("승인 해시 (draftSha256)", () => {
  const d = FX.good as TrendBriefDraft;
  it("순수 JS SHA-256 이 node:crypto 와 같다", () => {
    for (const s of ["", "abc", "한글 테스트 — 공식발표해설", "x".repeat(1000)]) expect(sha256Hex(s)).toBe(sha(s));
    expect(draftSha256(d)).toBe(sha(canonicalJson(draftHashInput(d))));
  });
  it("날짜·fetchedAt·humanReview 는 해시에서 빠지고, 본문 변경은 해시를 바꾼다", () => {
    const moved = { ...d, publishedDate: "2026-10-14", modifiedDate: "2026-10-14", humanReview: "operator-approved" as const, sources: d.sources.map((s) => ({ ...s, fetchedAt: "2026-10-14T01:00:00+09:00" })) };
    expect(draftSha256(moved)).toBe(draftSha256(d));
    expect(draftSha256({ ...d, lead: `${d.lead} ` })).not.toBe(draftSha256(d));
  });
});

describe("한도·달력", () => {
  const entry = (publishedDate: string, extra: Partial<LedgerEntry> = {}): LedgerEntry => ({
    slug: `s-${publishedDate}-${extra.cluster ?? "x"}`,
    publishedDate,
    cluster: "year-end-tax",
    eventName: "e",
    eventKind: "보도자료",
    eventStatus: "final",
    primary: { url: `https://www.nts.go.kr/${publishedDate}`, sha256: publishedDate, fetchedAt: "", publishedDate },
    sources: [],
    reviewBy: addDays(publishedDate, 60),
    status: "live",
    ...extra,
  });
  it("하루 1·ISO 주 5·월 16·첫 90일 30·문서 1·군집 30일 1", () => {
    expect(capViolations("2026-10-13", [], undefined)).toEqual([]);
    expect(capViolations("2026-10-13", [entry("2026-10-13")], undefined).join()).toContain("하루");
    const week = ["2026-10-12", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17"].map((x) => entry(x));
    expect(capViolations("2026-10-18", week, undefined).join()).toContain("주 5편");
    expect(isoWeekKey("2026-10-18")).toBe(isoWeekKey("2026-10-12"));
    expect(isoWeekKey("2026-10-19")).not.toBe(isoWeekKey("2026-10-18"));
    const month = Array.from({ length: 16 }, (_, i) => entry(`2026-12-${String(i + 1).padStart(2, "0")}`));
    expect(capViolations("2026-12-30", month, undefined).join()).toContain("월 16편");
    expect(capViolations("2026-10-20", [entry("2026-10-13", { cluster: "minimum-wage" })], undefined, { cluster: "minimum-wage" }).join()).toContain("군집");
    expect(capViolations("2026-11-20", [entry("2026-10-13", { cluster: "minimum-wage" })], undefined, { cluster: "minimum-wage" })).toEqual([]);
    expect(capViolations("2026-10-20", [entry("2026-10-13")], undefined, { primaryUrl: "https://www.nts.go.kr/2026-10-13" }).join()).toContain("공식 문서");
    // config 는 조이기만 — 하루 0편이면 전부 막힌다, 더 큰 값은 무시
    expect(capViolations("2026-10-13", [], { perKstDay: 0 }).join()).toContain("하루 0편");
    expect(capViolations("2026-10-13", [entry("2026-10-13")], { perKstDay: 5 }).join()).toContain("하루 1편");
    const live30 = Array.from({ length: 30 }, (_, i) => entry(addDays("2026-10-13", i * 2), { slug: `l${i}` }));
    expect(capViolations(addDays("2026-10-13", 61), live30, { perIsoWeek: 99, perMonth: 99 } as never).join()).toContain("첫 90일");
    expect(HARD_CAPS.perKstDay).toBe(1);
  });

  const cal: CalendarConfig = FX.context.calendar as CalendarConfig;
  it("첫 발행일·동결·판정일·배포 배치 +2일·로컬 차단·파일럿 판정", () => {
    expect(FIRST_PUBLISH_NOT_BEFORE).toBe("2026-10-13");
    expect(calendarBlocks("2026-10-09", cal).join()).toContain("첫 발행일");
    expect(calendarBlocks("2026-10-12", cal).join()).toContain("첫 발행일 2026-10-13");
    expect(calendarBlocks("2026-10-10", cal).join()).toContain("배포 배치");
    expect(calendarBlocks("2026-10-12", cal).join()).toContain("배포 배치");
    expect(calendarBlocks("2026-10-13", cal)).toEqual([]);
    expect(calendarBlocks("2026-11-01", cal).join()).toContain("동결");
    expect(calendarBlocks("2027-01-31", cal).join()).toContain("동결");
    expect(calendarBlocks("2026-10-20", cal, { blackouts: ["2026-10-20"] }).join()).toContain("calendar.local");
    expect(calendarBlocks("2026-10-21", cal, { blackouts: [{ from: "2026-10-20", to: "2026-10-22" }] }).join()).toContain("calendar.local");
    const withResume = { ...cal, resumeRequiresPilotVerdictAfter: "2027-01-31" };
    expect(calendarBlocks("2027-02-02", withResume).join()).toContain("파일럿");
    expect(calendarBlocks("2027-02-02", withResume, undefined, true)).toEqual([]);
    // calendar.json 이 첫 발행일을 앞당겨도 하드 상수가 이긴다
    expect(calendarBlocks("2026-10-05", { ...cal, firstPublishNotBefore: "2026-10-01" }).join()).toContain("첫 발행일");
  });

  it("파일럿 10/13~10/31 (운영자 결정 2026-09-27): 시작 전 차단 · 기간 중 통과 · 끝나면 판정 전까지 차단 · 수정(--update)은 무관", () => {
    const withPilot: CalendarConfig = { ...cal, pilot: { from: "2026-10-13", to: "2026-10-31" } };
    expect(calendarBlocks("2026-10-13", withPilot)).toEqual([]);
    expect(calendarBlocks("2026-10-31", withPilot)).toEqual([]);
    // pilot.from 이 더 늦으면 그것이 첫 발행일
    expect(calendarBlocks("2026-10-14", { ...withPilot, pilot: { from: "2026-10-15", to: "2026-10-31" } }).join()).toContain("첫 발행일 2026-10-15");
    // 동결이 없어도(가정) 파일럿이 끝나면 판정 전까지 막힌다
    const noFreeze: CalendarConfig = { ...withPilot, freezes: [] };
    expect(calendarBlocks("2026-11-01", noFreeze).join()).toContain("파일럿 2026-10-13~2026-10-31 종료");
    expect(calendarBlocks("2026-11-01", noFreeze, undefined, true)).toEqual([]);
    expect(calendarBlocks("2027-02-01", withPilot).join()).toContain("파일럿");
    expect(calendarBlocks("2027-02-01", withPilot, undefined, true)).toEqual([]);
    expect(updateCalendarBlocks(calendarBlocks("2027-02-01", withPilot))).toEqual([]);
    // 저장소 calendar.json 이 운영자 결정과 같다
    const repoCal = JSON.parse(read("scripts/trend-publish/calendar.json")) as CalendarConfig;
    expect(repoCal.pilot).toMatchObject({ from: "2026-10-13", to: "2026-10-31" });
    expect(repoCal.firstPublishNotBefore).toBe("2026-10-13");
    expect(repoCal.freezes).toEqual([expect.objectContaining({ from: "2026-11-01", to: "2027-01-31" })]);
    expect(calendarBlocks("2026-10-12", repoCal).length).toBeGreaterThan(0);
    expect(calendarBlocks("2026-10-13", repoCal)).toEqual([]);
    expect(calendarBlocks("2026-11-01", repoCal).join()).toContain("동결");
    expect(calendarBlocks("2027-01-31", repoCal).join()).toContain("동결");
    expect(calendarBlocks("2027-02-01", repoCal).join()).toContain("파일럿");
    const cfg = JSON.parse(read("scripts/trend-publish/config.json")) as { caps: Record<string, number> };
    expect(cfg.caps).toMatchObject({ perKstDay: 1, perIsoWeek: 5 });
  });
});

describe("숫자 토큰 · 출처 호스트 · 정본 치환", () => {
  it("날짜·연도·조항·서수는 숫자 출처 검사에서 빠진다", () => {
    expect(numericTokens("2027년 1월 1일부터 적용될 예정입니다")).toEqual([]);
    expect(numericTokens("제46조와 §59의2, 9급 1호봉, 2차 개정, 4대보험")).toEqual([]);
    expect(numericTokens("2026-10-08 발표, 10월 8일")).toEqual([]);
    expect(numericTokens("월 보수 300만원, 0.9%에서 1.0%로, 1,500만 명")).toEqual(["300만원", "0.9%", "1.0%", "1,500만"]);
  });
  it("공식 인용 호스트 — korea.kr 은 개별 페이지만, 공용 도메인·http 불가", () => {
    expect(isBriefCitationUrl("https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=1")).toBe(true);
    expect(isBriefCitationUrl("https://www.korea.kr/briefing/pressReleaseView.do?newsId=156700000")).toBe(true);
    expect(isBriefCitationUrl("https://www.korea.kr/briefing/pressReleaseList.do")).toBe(false);
    expect(isBriefCitationUrl("http://www.moel.go.kr/")).toBe(false);
    expect(isBriefCitationUrl("https://www.molit.go.kr/x")).toBe(false); // 공식이지만 브리프 인용 목록 밖
    expect(isBriefCitationUrl("https://evil-nts.go.kr.example.com/")).toBe(false);
  });
  it("정본 표기 자동 치환은 숫자 경계를 지킨다", () => {
    const got: { name: string; token: string }[] = [];
    expect(autoConstText("시급 10,320원과 상한 68,100원", got)).toBe("시급 {{const:MINIMUM_WAGE_2026_HOURLY}}과 상한 {{const:UNEMPLOYMENT_UPPER_2026}}");
    expect(autoConstText("110,320원", [])).toBe("110,320원");
    expect(autoConstText("10,320,000원", [])).toBe("10,320,000원");
    expect(autoConstText("68,100", [])).toBe("{{const:UNEMPLOYMENT_UPPER_2026_NUM}}");
    expect(got.map((g) => g.name)).toEqual(["MINIMUM_WAGE_2026_HOURLY", "UNEMPLOYMENT_UPPER_2026"]);
  });
});

describe("드리프트 가드", () => {
  it("GUIDESPEC_FORBIDDEN 은 guideSpec.test.ts FORBIDDEN 과 같은 id·정규식이다", () => {
    const spec = read("src/lib/__tests__/guideSpec.test.ts").replace(/\r\n/g, "\n");
    const block = spec.slice(spec.indexOf("const FORBIDDEN"), spec.indexOf("const ALLOW_TAGS"));
    const ids = [...block.matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(GUIDESPEC_FORBIDDEN.map((p) => p.id)).toEqual(ids);
    const literals = [...block.matchAll(/\bre:\s*\/((?:\\.|[^/\\\n])+)\/g/g)].map((m) => m[1]);
    const mine = GUIDESPEC_FORBIDDEN.map((p) => p.re.source);
    for (const src of literals) expect(mine, src).toContain(src);
  });

  it("daily.mjs 의 한도·달력·해시·상수 읽기가 rules.ts·types.ts 와 같은 결과를 낸다", async () => {
    const daily = await import("../../../scripts/trend-publish/daily.mjs");
    const consts = daily.readTypesConstants(ROOT);
    expect(consts.hardCaps).toEqual({ ...HARD_CAPS });
    expect(consts.firstPublishNotBefore).toBe(FIRST_PUBLISH_NOT_BEFORE);
    const cal = FX.context.calendar as CalendarConfig;
    const ledger: LedgerEntry[] = [
      { ...(FX.cases.find((c) => c.rule === "caps")!.contextPatch!.ledger as LedgerEntry[])[0] },
    ];
    for (let i = 0; i < 140; i++) {
      const day = addDays("2026-10-01", i);
      expect(daily.calendarBlocks(day, cal, { blackouts: ["2026-10-20"] }, false, consts.firstPublishNotBefore), day).toEqual(
        calendarBlocks(day, cal, { blackouts: ["2026-10-20"] }, false)
      );
      const piloted = { ...cal, freezes: [], pilot: { from: "2026-10-14", to: "2026-10-31" } };
      for (const verdict of [false, true]) {
        expect(daily.calendarBlocks(day, piloted, {}, verdict, consts.firstPublishNotBefore), `${day} pilot ${verdict}`).toEqual(
          calendarBlocks(day, piloted, {}, verdict)
        );
      }
      expect(daily.capViolations(day, ledger, { perIsoWeek: 3 }, { cluster: "year-end-tax" }, consts.hardCaps), day).toEqual(
        capViolations(day, ledger, { perIsoWeek: 3 }, { cluster: "year-end-tax" })
      );
    }
    expect(daily.draftSha256(FX.good)).toBe(draftSha256(FX.good as TrendBriefDraft));
  });
});

describe("렌더 뒤 게이트 문맥 (원장·등록부에 자기 자신이 있음)", () => {
  it("render --write 가 원장에 올린 자기 자신은 한도에서 빠진다", () => {
    const self: LedgerEntry = {
      slug: FX.good.slug,
      publishedDate: "2026-10-13",
      cluster: FX.good.cluster,
      eventName: FX.good.event.name,
      eventKind: FX.good.event.kind,
      eventStatus: FX.good.event.status,
      primary: { url: FX.good.sources[0].url, sha256: FX.good.sources[0].sha256, fetchedAt: "", publishedDate: "2026-10-08" },
      sources: [],
      reviewBy: "2026-12-12",
      status: "live",
    };
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE, { rule: "caps", contextPatch: { ledger: [self] } });
    expect(runRules(draft, ctx).find((r) => r.id === "caps")!.ok).toBe(true);
  });

  it("--update 는 동결·첫 발행일과 무관하고 판정일·배포 배치·로컬 차단만 본다 (daily.mjs 와 같은 규칙)", async () => {
    const daily = await import("../../../scripts/trend-publish/daily.mjs");
    const reasons = ["동결 2026-11-01~2027-01-31", "첫 발행일 2026-10-10 이전", "판정일 2026-10-09", "배포 배치 2026-10-10 + 2일", "calendar.local.json 차단 2026-10-20"];
    expect(updateCalendarBlocks(reasons)).toEqual(daily.updateCalendarBlocks(reasons));
    const { draft, ctx } = fixtureCase(FX, SNAP, sha, BASE, { rule: "calendar", contextPatch: { today: "2026-11-20" } });
    const upd = { ...draft, publishedDate: "2026-10-13", modifiedDate: "2026-11-20" };
    const res = runRules(upd, { ...ctx, updateOf: draft.slug });
    expect(res.find((r) => r.id === "calendar")!.ok).toBe(true);
    expect(runRules(upd, ctx).find((r) => r.id === "calendar")!.ok).toBe(false);
  });

  it("gate 로더 — 레이더 headlines-<날짜>.json·감시기 sentinel-<날짜>.json 계약", async () => {
    const gate = await import("../../../scripts/trend-publish/gate");
    const dir = mkdtempSync(join(tmpdir(), "trend-gate-"));
    try {
      writeFileSync(join(dir, "headlines-2026-10-12.json"), JSON.stringify({ date: "2026-10-12", titles: ["최근 헤드라인"] }));
      writeFileSync(join(dir, "headlines-2026-09-01.json"), JSON.stringify({ date: "2026-09-01", titles: ["오래된 헤드라인"] }));
      writeFileSync(join(dir, "radar-2026-10-12.json"), JSON.stringify({ candidates: [{ title: "후보는 헤드라인이 아니다" }] }));
      expect(gate.loadHeadlines(dir, "2026-10-13").map((h: { title?: string }) => h.title)).toEqual(["최근 헤드라인"]);
      writeFileSync(join(dir, "sentinel-2026-10-11.json"), JSON.stringify({ staleRoutes: ["/old"] }));
      writeFileSync(join(dir, "sentinel-2026-10-12.json"), JSON.stringify({ staleRoutes: ["/savings-interest-2026", "/guides/x"] }));
      expect(gate.loadStaleRoutes(dir, { linkFreshness: { staticStale: ["/static"] } }).sort()).toEqual(["/guides/x", "/savings-interest-2026", "/static"]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("render: 원장에 있는 slug 를 새 브리프로 덮어쓰지 않는다(같은 날 재렌더는 멱등)", async () => {
    const mod = await import("../../../scripts/trend-publish/render");
    const repo = mkdtempSync(join(tmpdir(), "trend-render-"));
    try {
      for (const f of ["src/lib/guides/trend-briefs.ts", "scripts/trend-publish/ledger.json", "src/lib/__tests__/fixtures/trendBriefNumbers.json", "scripts/verify-tax-constants.mjs"]) {
        mkdirSync(join(repo, f, ".."), { recursive: true });
        writeFileSync(join(repo, f), read(f));
      }
      const plan = mod.planRender(repo, FX.good as TrendBriefDraft, { today: "2026-10-13" });
      expect(plan.taxHits).toEqual([]);
      for (const c of plan.changes) writeFileSync(join(repo, c.path), c.after);
      expect(mod.planRender(repo, FX.good as TrendBriefDraft, { today: "2026-10-13" }).changes.every((c: { before: string | null; after: string }) => c.before === c.after)).toBe(true);
      expect(() => mod.planRender(repo, FX.good as TrendBriefDraft, { today: "2026-10-20" })).toThrow(/이미 원장/);
      const upd = mod.planRender(repo, FX.good as TrendBriefDraft, { today: "2026-10-20", update: true });
      expect(upd.draft.publishedDate).toBe("2026-10-13");
      expect(upd.draft.modifiedDate).toBe("2026-10-20");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

describe("source-snapshot (스텁 네트워크)", () => {
  it("허용 호스트·robots·RSS 우회·TREND_HOME 밖 쓰기 금지", async () => {
    const mod = await import("../../../scripts/trend-publish/source-snapshot");
    const home = mkdtempSync(join(tmpdir(), "trend-snap-"));
    try {
      mkdirSync(join(home, "snapshots"), { recursive: true });
      const html = "<html><head><title>보도자료</title></head><body><p>공공누리 제1유형</p><p>실업급여 보험료율 0.9%에서 1.0%로</p><script>x()</script></body></html>";
      const net = {
        robotsAllowed: async (url: string) => !/act=view/.test(url),
        fetchText: async (url: string) => ({ status: 200, finalUrl: url, body: url.includes("rss") ? `<rss><channel><item><title>제목</title><link>https://www.mohw.go.kr/board.es?mid=a1&act=view&list_no=9</link><description>&lt;p&gt;복지부 본문 0.5%&lt;/p&gt;</description></item></channel></rss>` : html }),
      };
      const ok = await mod.snapshotSource({ url: "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=1", outDir: join(home, "snapshots"), trendHome: home }, net);
      expect(ok.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(ok.kogl).toBe(1);
      expect(ok.text).toContain("1.0%");
      expect(ok.text).not.toContain("x()");
      await expect(mod.snapshotSource({ url: "https://example.com/a", outDir: join(home, "snapshots"), trendHome: home }, net)).rejects.toThrow(/허용 호스트/);
      await expect(mod.snapshotSource({ url: "https://www.mohw.go.kr/board.es?mid=a1&act=view&list_no=9", outDir: join(home, "snapshots"), trendHome: home }, net)).rejects.toThrow(/--from-rss/);
      const viaRss = await mod.snapshotSource({ url: "https://www.mohw.go.kr/board.es?mid=a1&act=view&list_no=9", fromRss: "https://www.mohw.go.kr/rss/board.es?mid=a1", outDir: join(home, "snapshots"), trendHome: home }, net);
      expect(viaRss.text).toContain("0.5%");
      await expect(mod.snapshotSource({ url: "https://www.moel.go.kr/x", outDir: join(ROOT, "tmp-snap"), trendHome: home }, net)).rejects.toThrow(/TREND_HOME/);
      writeFileSync(join(home, "marker"), "");
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  });
});
