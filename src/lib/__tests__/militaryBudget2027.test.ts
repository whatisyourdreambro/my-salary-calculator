// src/lib/__tests__/militaryBudget2027.test.ts
// /military-pay-2026 #budget-2027 (2027 군 초급간부 처우 — 정부 예산안) 데이터·렌더·배치 가드 (2026-09-26).
// - 모든 행: status ∈ {정부안, 확정}, 공식 도메인 https 출처, 발표 부처, asOf ≥ 2026-09-01.
// - 화면 값(value)의 금액·비율·개월 수가 원문 문장(sourceQuote)에 그대로 있는지(원문 밖 수치 차단).
// - 2026 하사 1호봉 봉급은 civilServantPay 에서 가져오고 섹션 소스에 리터럴이 없어야 한다.
// - 섹션은 본문 컬럼의 모든 광고 아래(ShareButtons 뒤), aside 앞에 한 번만 — 광고 위 삽입 금지(2026-08-16 규칙).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  MILITARY_BUDGET_2027_ROWS,
  MILITARY_BUDGET_2027_MND_SOURCE,
  MILITARY_BUDGET_2027_SOURCE,
  MILITARY_BUDGET_2027_STATUS_LINE,
  ENLISTED_PAY_2027_LINE,
  SERGEANT_STARTING_PAY_2026,
  militaryBudget2027Row,
} from "@/lib/militaryBudget2027";
import { MILITARY_OFFICER_STARTING_2026 } from "@/lib/civilServantPay";
import Budget2027Section from "@/app/military-pay-2026/Budget2027Section";

const OFFICIAL_HOSTS = [
  "korea.kr",
  "mnd.go.kr",
  "moef.go.kr",
  "mpm.go.kr",
  "law.go.kr",
  "nts.go.kr",
  "hometax.go.kr",
  "mohw.go.kr",
  "moel.go.kr",
  "nps.or.kr",
  "nhis.or.kr",
  "minimumwage.go.kr",
  "dart.fss.or.kr",
];

const isOfficialUrl = (raw: string) => {
  const u = new URL(raw);
  return (
    u.protocol === "https:" &&
    OFFICIAL_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`))
  );
};

const isIsoDate = (s: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

// 'N백만원'·'A→B만원'·'월 30만원' 같은 표기를 '<숫자>만원' 목록으로 맞춘다.
const normalize = (s: string) =>
  s
    .replace(/\s+/g, "")
    .replace(/(\d)\s*,\s*(?=\d{3})/g, "$1")
    .replace(/(\d+(?:\.\d+)?)백만원/g, (_, n: string) => `${Number(n) * 100}만원`)
    .replace(/(\d+)→(\d+)만원/g, "$1만원→$2만원");
const manwon = (s: string) => [...normalize(s).matchAll(/(\d+(?:\.\d+)?)만원/g)].map((m) => Number(m[1]));
const percents = (s: string) => [...normalize(s).matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => Number(m[1]));
const months = (s: string) => [...normalize(s).matchAll(/(\d+)개월/g)].map((m) => Number(m[1]));

describe("militaryBudget2027 rows", () => {
  it("has exactly the four budget lines from the official 2027 예산안 text", () => {
    expect(MILITARY_BUDGET_2027_ROWS.map((r) => r.key)).toEqual([
      "raise",
      "target",
      "incentive",
      "savings",
    ]);
    expect(new Set(MILITARY_BUDGET_2027_ROWS.map((r) => r.label)).size).toBe(
      MILITARY_BUDGET_2027_ROWS.length,
    );
  });

  for (const row of MILITARY_BUDGET_2027_ROWS) {
    describe(row.label, () => {
      it("status is 정부안 or 확정", () => {
        expect(["정부안", "확정"]).toContain(row.status);
      });
      it("cites an official https host with a title and issuer", () => {
        expect(isOfficialUrl(row.sourceUrl)).toBe(true);
        expect(row.sourceTitle.trim().length).toBeGreaterThan(0);
        expect(row.issuer.trim().length).toBeGreaterThan(0);
      });
      it("asOf is a real date on or after 2026-09-01", () => {
        expect(isIsoDate(row.asOf)).toBe(true);
        expect(row.asOf >= "2026-09-01").toBe(true);
      });
      it("every amount, rate and month count shown is in the official sentence", () => {
        expect(row.sourceQuote.trim().length).toBeGreaterThan(0);
        const quote = row.sourceQuote;
        for (const n of manwon(row.value)) expect(manwon(quote)).toContain(n);
        for (const p of percents(row.value)) expect(percents(quote)).toContain(p);
        for (const m of months(row.value)) expect(months(quote)).toContain(m);
        expect(manwon(row.value).length + percents(row.value).length).toBeGreaterThan(0);
      });
    });
  }

  it("the 정부안 issuer is the ministry printed on the korea.kr page (기획예산처)", () => {
    for (const row of MILITARY_BUDGET_2027_ROWS) {
      if (row.status === "정부안") expect(row.issuer).toBe("기획예산처");
    }
    expect(MILITARY_BUDGET_2027_SOURCE.url).toBe(
      "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156776382",
    );
  });

  it("the 국방부 cross-check source is official, dated and states the same figures", () => {
    expect(isOfficialUrl(MILITARY_BUDGET_2027_MND_SOURCE.url)).toBe(true);
    expect(MILITARY_BUDGET_2027_MND_SOURCE.issuer).toBe("국방부");
    expect(isIsoDate(MILITARY_BUDGET_2027_MND_SOURCE.asOf)).toBe(true);
    expect(MILITARY_BUDGET_2027_MND_SOURCE.asOf >= "2026-09-01").toBe(true);
    const joined = MILITARY_BUDGET_2027_MND_SOURCE.quotes.join(" ");
    expect(percents(joined)).toContain(5.9);
    expect(manwon(joined.replace(/만 원/g, "만원"))).toEqual(expect.arrayContaining([300, 1000, 1200, 30]));
  });

  it("status and enlisted-pay lines keep the agreed wording (dated state as of the 2026-11-15 re-land)", () => {
    expect(MILITARY_BUDGET_2027_STATUS_LINE).toBe(
      "정부 예산안(2026-09-01 국무회의 의결) — 2026-11-15 현재 국회 심의 중(법정 처리기한 12월 2일), 국회 의결 전 · 확정은 국회 의결과 공무원보수규정 개정 뒤",
    );
    // 정부안·국회 의결 전임을 밝히고, 확정처럼 읽히는 낱말이 없다
    expect(MILITARY_BUDGET_2027_STATUS_LINE).toContain("정부 예산안");
    expect(MILITARY_BUDGET_2027_STATUS_LINE).toContain("국회 의결 전");
    expect(ENLISTED_PAY_2027_LINE).toBe("병 봉급 2027 — 보수규정 개정 전(아직 확정 전)");
  });

  it("2026 하사 1호봉 봉급 comes from civilServantPay (별표 13)", () => {
    const row = MILITARY_OFFICER_STARTING_2026.find((r) => r.rank === "하사 1호봉");
    expect(row).toBeDefined();
    expect(SERGEANT_STARTING_PAY_2026).toBe(row!.pay);
    expect(SERGEANT_STARTING_PAY_2026).toBeGreaterThan(0);
  });

  it("militaryBudget2027Row finds each key", () => {
    for (const row of MILITARY_BUDGET_2027_ROWS) expect(militaryBudget2027Row(row.key)).toBe(row);
  });
});

describe("Budget2027Section render", () => {
  const html = renderToStaticMarkup(createElement(Budget2027Section));
  const text = html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lsquo;|‘/g, "'")
    .replace(/&rsquo;|’/g, "'");

  it("is one section with the budget-2027 anchor and no structured data", () => {
    expect(html.match(/<section\b/g)).toHaveLength(1);
    expect(html).toContain('id="budget-2027"');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("application/ld+json");
  });

  it("shows the status line, every row and the enlisted-pay line", () => {
    expect(text).toContain(MILITARY_BUDGET_2027_STATUS_LINE);
    for (const row of MILITARY_BUDGET_2027_ROWS) {
      expect(text).toContain(row.label);
      expect(text).toContain(row.value);
    }
    expect(text.match(/정부안/g)?.length ?? 0).toBeGreaterThanOrEqual(MILITARY_BUDGET_2027_ROWS.length);
    expect(text).toContain(ENLISTED_PAY_2027_LINE);
  });

  it("contrasts the target with the 2026 하사 1호봉 봉급 and says it includes 수당", () => {
    expect(text).toContain(`${SERGEANT_STARTING_PAY_2026.toLocaleString("ko-KR")}원`);
    expect(text).toContain("수당을 포함한 목표");
    expect(text).toContain("총보수");
  });

  it("links only to the official sources in new tabs", () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    expect(hrefs).toEqual([MILITARY_BUDGET_2027_SOURCE.url, MILITARY_BUDGET_2027_MND_SOURCE.url]);
    for (const h of hrefs) expect(isOfficialUrl(h)).toBe(true);
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
  });

  it("does not render a 2027 pay table or forecast", () => {
    expect(html).not.toContain("<table");
    expect(text).not.toMatch(/예상|전망/);
  });
});

describe("Budget2027Section source and placement", () => {
  const section = readFileSync(
    resolve(__dirname, "../../app/military-pay-2026/Budget2027Section.tsx"),
    "utf8",
  );
  const page = readFileSync(resolve(__dirname, "../../app/military-pay-2026/page.tsx"), "utf8");

  it("has no literal 2026 pay figure (imported from civilServantPay)", () => {
    expect(section).not.toMatch(/2,?133,?000/);
    expect(section).not.toMatch(/JsonLd|faqLd|FAQ_ITEMS/);
  });

  it("sits once, below every main-column ad, ShareButtons and the calculator back-link, before the aside", () => {
    const uses = page.match(/<Budget2027Section\s*\/>/g) ?? [];
    expect(uses).toHaveLength(1);
    const at = page.indexOf("<Budget2027Section");
    const aside = page.indexOf("<aside");
    expect(aside).toBeGreaterThan(at);
    const mainColumn = page.slice(0, aside);
    // RL-13: 세후 계산기 역링크 문단(2026-09-27) 다음 = 본문 컬럼 맨 끝
    expect(at).toBeGreaterThan(mainColumn.lastIndexOf('href="/calc/civil-servant-net-pay#soldier"'));
    for (const ad of ["<HomeTopAd", "<InArticleAd", "<GuideMidAd", "<CoupangBanner", "<ShareButtons"]) {
      const last = mainColumn.lastIndexOf(ad);
      expect(last, ad).toBeGreaterThan(-1);
      expect(last, ad).toBeLessThan(at);
    }
    // 섹션과 aside 사이에 광고 태그가 없어야 한다(섹션 = 본문 컬럼 마지막 블록).
    expect(page.slice(at, aside)).not.toMatch(/Ad\b|Coupang|LinkPrice/);
  });
});
