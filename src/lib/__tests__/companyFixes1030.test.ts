// 회사 페이지 데이터·문구 정정 고정 (2026-10-05 작성, 10/30 회사 묶음 claude/fix-company-1030)
//
// 광고 위(페이지 끝 HomeTopAd 포함) 문구는 띄어쓰기로 나뉜 단어마다 종전 폭 이하로만 바꾼다.
// 폭 서명 = 단어마다 [한글 수, 숫자 수, 그 밖의 글자] (사이트 글꼴 한글 음절 폭은 모두 같다).
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/AppLink", () => ({
  default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children),
}));

import CompanyInsights from "@/components/CompanyInsights";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { insightsTierPhrase, insightsTopicParticle } from "@/lib/companyTierPhrase";
import { josaParticle } from "@/lib/josa";

const companies = companyRepository.getAll();

/** 사이트 글꼴 서브셋 6종의 unicode-range 합집합 — 새 문구에 서브셋 밖 글자가 없어야 한다 */
function siteFontCodepoints(): Set<number> {
  const source = readFileSync("src/app/fonts/siteFonts.generated.ts", "utf8");
  const set = new Set<number>();
  for (const range of source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}
const FONT = siteFontCodepoints();
const outsideFont = (text: string) =>
  [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];

function company(id: string) {
  const c = companyRepository.getById(id);
  if (!c) throw new Error(`missing company ${id}`);
  return c;
}

/** 단어별 폭 등급 — [한글 수, 숫자 수, 그 밖의 글자 수] */
function wordWidths(text: string): [number, number, number][] {
  return text.split(" ").map((word) => {
    const chars = [...word];
    const hangul = chars.filter((ch) => /[가-힣]/.test(ch)).length;
    const digits = chars.filter((ch) => /[0-9]/.test(ch)).length;
    return [hangul, digits, chars.length - hangul - digits];
  });
}

/** after 의 단어마다 before 보다 넓지 않다(같은 단어 수, 한글·숫자·기타 각각 이하) */
function notWiderPerWord(after: string, before: string): boolean {
  const a = wordWidths(after);
  const b = wordWidths(before);
  return a.length === b.length && a.every(([h, d, o], i) => h <= b[i][0] && d <= b[i][1] && o <= b[i][2]);
}

const OLD_TIER_WORD: Record<string, string> = {
  conglomerate: "대기업로,",
  unicorn: "유니콘로,",
  startup: "스타트업로,",
  public: "공기업/공공기관로,",
  foreign: "외국계로,",
};

const toText = (html: string) =>
  html
    .replace(/<\/?(strong|a|b|em)\b[^>]*>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&");

describe("복지 value 0 — 숫자 0 이 글자로 찍히던 && 단락 평가 (R09 code31-04·code33-08·code34-04·code35-02)", () => {
  it("value 0 복지를 가진 회사가 실제로 있고(sk-hynix 등), 렌더 조건은 불리언 비교다", () => {
    const withZero = companies.filter((c) => c.benefits.some((b) => b.value === 0)).map((c) => c.id);
    expect(withZero).toContain("sk-hynix");
    expect(withZero.length).toBeGreaterThanOrEqual(20);
    const src = readFileSync("src/app/salary-db/[id]/CompanyDetailClient.tsx", "utf8");
    expect(src).toContain("{benefit.value != null && benefit.value > 0 && (");
    expect(src).not.toMatch(/\{benefit\.value && /);
  });
});

describe("핵심 요약 첫 문장 조사 (CompanyInsights — '대기업로'·'쿠팡(Coupang)는' 412쪽)", () => {
  it("분류 문구는 조사가 맞고, 단어 폭이 종전 이하다", () => {
    for (const [tier, old] of Object.entries(OLD_TIER_WORD)) {
      const phrase = `${insightsTierPhrase(tier)},`;
      expect(notWiderPerWord(phrase, old), tier).toBe(true);
      expect(outsideFont(phrase), tier).toEqual([]);
      // 받침 있는 말 뒤 '로' 금지 (ㄹ 받침 제외)
      const m = phrase.match(/([가-힣])로,$/);
      if (m) expect(josaParticle(m[1], "으로/로"), `${tier}: ${phrase}`).toBe("로");
    }
    expect(insightsTierPhrase("conglomerate")).toBe("대형사로");
    expect(insightsTierPhrase("public")).toBe("공공기관으로");
    expect(insightsTierPhrase("foreign")).toBe("외국계로");
  });

  it("전 회사: '({영문})' 뒤 은/는이 한글 이름 받침과 맞고 1음절이다(종전 '는'과 같은 폭)", () => {
    for (const c of companies) {
      const p = insightsTopicParticle(c.name.ko);
      expect(p, c.id).toBe(josaParticle(c.name.ko, "은/는"));
      expect(p.length, c.id).toBe(1);
    }
  });

  it("렌더 문장 — 쿠팡은 '쿠팡(Coupang)은 … 업종의 유니콘,', 삼성전자는 '삼성전자(Samsung Electronics)는 … 대형사로,'", () => {
    const coupang = toText(renderToStaticMarkup(createElement(CompanyInsights, { company: company("coupang") })));
    expect(coupang).toMatch(/쿠팡\(Coupang\)은 \S+( \S+)? 업종의 유니콘, 신입 영끌 연봉/);
    const samsung = toText(
      renderToStaticMarkup(createElement(CompanyInsights, { company: company("samsung-electronics") }))
    );
    expect(samsung).toMatch(/삼성전자\(Samsung Electronics\)는 .+ 업종의 대형사로, 신입 영끌 연봉/);
    for (const text of [coupang, samsung]) {
      expect(text).not.toMatch(/대기업로|유니콘로|스타트업로|공공기관로/);
    }
  });
});

describe("한국투자증권 공시 카드 note — 증권업 전체 1위 수준 오기 (R09 code36-07)", () => {
  it("DART 2025 증권업(KSIC 6612) 24곳 중 4위 — 숫자만 바꿔 광고 위 카드 폭 같음", async () => {
    const note = company("korea-investment").disclosed?.note ?? "";
    // '전체' 를 뺐다(조기 실측 ①: '4' 가 '1' 보다 넓어 684-685px 에서 한 줄 늘었다) — '4위' 는 빠진 '전체' 자리보다 좁다
    expect(note.endsWith("증권업 평균연봉 4위 수준.")).toBe(true);
    expect(note).not.toContain("1위");
    expect(note).not.toContain("전체 4위");
    const { dartDisclosed } = await import("@/data/dart/dartDisclosed");
    const sec = dartDisclosed
      .filter((d) => d.fiscalYear === "2025" && (d.ksicCode ?? "").startsWith("6612"))
      .sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw);
    expect(sec.findIndex((d) => d.corpNameKo === "한국투자증권") + 1).toBe(4);
  });
});

describe("DB손해보험 공시 카드 — 원문에 없는 1억3,700만원 -> DART 2025 사업보고서 원문 1억370만원 (R09 code36-02, A5)", () => {
  /** 종전(운영 중) 카드 문구 — 바꾼 문구가 글자 종류마다 이보다 많지 않아야 한다(GuideMidAd 위) */
  const OLD = {
    headline: "1억 3,700만원",
    source:
      "뉴스투데이 2026-05-09 — 금융감독원 전자공시(DART) 2025년 사업보고서 기준 평균연봉 1억3,700만원, 근속 12년10개월",
    note: "전년 1억1,800만원 대비 16% 급등(CEO스코어데일리 2026-04-03 보도 교차 부합).",
  };
  /** [한글, 숫자, 라틴 문자, 그 밖(공백·기호)] 글자 수 */
  const classes = (text: string) => {
    const chars = [...text];
    const hangul = chars.filter((ch) => /[가-힣]/.test(ch)).length;
    const digits = chars.filter((ch) => /[0-9]/.test(ch)).length;
    const latin = chars.filter((ch) => /[A-Za-z]/.test(ch)).length;
    return [hangul, digits, latin, chars.length - hangul - digits - latin];
  };
  const notMoreByClass = (after: string, before: string) =>
    classes(after).every((n, i) => n <= classes(before)[i]);

  it("헤드라인·근속·출처·note 가 DART 원문(rcpNo 20260331003904)과 사이트 DART 수집값에 맞고, 종전 보도 수치는 남지 않는다", async () => {
    const c = company("db-insurance");
    const d = c.disclosed!;
    const { dartDisclosed } = await import("@/data/dart/dartDisclosed");
    const { dartCompanyStatsById } = await import("@/lib/salary-data/dartReport");
    const dart = dartDisclosed.find((x) => x.corpCode === "00159102")!;
    expect(dart.corpNameKo).toBe("DB손해보험");
    expect(dart.rceptNo).toBe("20260331003904");
    // 급여총액 489,059,308,000원 ÷ 4,716명 = 10,370.2만원 (남 2,033·여 2,683)
    expect(d.avgSalaryManwon).toBe(10370);
    expect(d.avgSalaryManwon).toBe(dart.avgSalaryManwonRaw);
    expect(Math.round(489_059_308_000 / 4_716 / 10_000)).toBe(10370);
    expect(d.fiscalYear).toBe("2025");
    // 근속 = 남 13년6월(2,033명)·여 12년4월(2,683명) 인원 가중 평균 12.84년
    expect(d.avgTenureYears).toBe(Math.round(((2033 * 13.5 + 2683 * (12 + 4 / 12)) / 4716) * 10) / 10);
    expect(d.sourceUrl).toBe(`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${dart.rceptNo}`);
    expect(d.basis).toBeUndefined(); // 수기 블록 그대로(DART 자동 주입 아님) — 카드 제목·라벨 규칙 불변
    expect(d.source).toContain(`${dart.employeeCount.toLocaleString("ko-KR")}명 급여총액÷인원`);
    const prev = dart.history!.find((h) => h.fiscalYear === "2024")!;
    expect(d.note).toBe(
      `전년 ${prev.avgSalaryManwonRaw.toLocaleString("ko-KR")}만원 대비 ${dartCompanyStatsById.get("db-insurance")!.yoyPct}% 상승(2024 사업보고서 급여총액÷인원).`
    );
    expect(JSON.stringify(c)).not.toMatch(/13,?700|1억1,800|news2day|CEO스코어/);
  });

  it("광고 위 카드: 헤드라인 숫자 폭이 줄고, 출처·note 는 글자 종류마다 종전 이하, 서브셋 밖 글자 없음", () => {
    const d = company("db-insurance").disclosed!;
    expect(classes("1억 370만원").every((n, i) => n <= classes(OLD.headline)[i])).toBe(true);
    expect(notMoreByClass(d.source, OLD.source)).toBe(true);
    expect(notMoreByClass(d.note!, OLD.note)).toBe(true);
    expect(outsideFont(`${d.source}${d.note}`)).toEqual([]);
  });

  it("카드 모양은 운영과 같다 — 배지·이력 표 없음(page.tsx 보류 목록), 괴리 병기 문장은 값이 맞아 사라짐, 라벨은 같은 폭 '원문:'", async () => {
    const { DISCLOSED_CORRECTION_HOLD_IDS } = await import("@/lib/companyMetaDisclosed");
    const { dartCompanyStatsById } = await import("@/lib/salary-data/dartReport");
    const { industryRankingByCompanyId } = await import("@/lib/salary-data/dartRanking");
    const { default: CompanyDisclosedSalary } = await import("@/components/CompanyDisclosedSalary");
    expect(DISCLOSED_CORRECTION_HOLD_IDS.has("db-insurance")).toBe(true);
    const page = readFileSync("src/app/salary-db/[id]/page.tsx", "utf8");
    expect(page).toContain("if (DISCLOSED_CORRECTION_HOLD_IDS.has(company.id)) return null;");
    const c = company("db-insurance");
    const stats = dartCompanyStatsById.get("db-insurance")!;
    // 보류가 없으면 값이 맞아 배지·이력 게이트(괴리 10% 이하)를 새로 통과한다 — 보류가 막는 것이 이것
    expect(Math.abs(stats.dartSalaryManwon - c.disclosed!.avgSalaryManwon)).toBeLessThanOrEqual(1);
    const html = renderToStaticMarkup(
      createElement(CompanyDisclosedSalary, {
        company: c,
        dartRank: null,
        dartSalaryManwon: stats.dartSalaryManwon,
        dartStats: null,
        industryLink: industryRankingByCompanyId.get("db-insurance") ?? null,
      })
    );
    const text = toText(html);
    expect(text).toContain("1억 370만원");
    expect(text).toContain("추정이 아닌 공식 수치");
    expect(text).toContain("평균 근속 12.8년");
    expect(text).toContain("은 10,370만원입니다.");
    expect(text).not.toContain("산정치 10,370만원"); // 종전 괴리 병기 '(DART 급여총액÷인원 산정치 10,370만원)' — 값이 같아 사라짐(짧아짐)
    expect(html).not.toContain("<table");
    expect(text).not.toContain("전년 대비 +");
    expect(html).toContain("원문: <a href=");
  });

  it("제목·meta description·페이지 수정일은 그대로 — 출처가 DART 원문이 돼도 L10' 후미 대상이 되지 않는다(메타 동결)", async () => {
    const { companyPageTitleAndDescription } = await import("@/lib/companyPageMetadata");
    const { companyMetaDisclosedFigure } = await import("@/lib/companyMetaDisclosed");
    const { companyPageModified } = await import("@/lib/pageModified");
    const c = company("db-insurance");
    expect(companyMetaDisclosedFigure(c)).toBeNull();
    // id 없이 보면 대상 조건(공시 원문·2025·신입~시니어 범위)을 채운다 — 보류 목록이 막는다
    expect(companyMetaDisclosedFigure({ salary: c.salary, disclosed: c.disclosed })).not.toBeNull();
    const { title, description } = companyPageTitleAndDescription(c);
    expect(title).toBe("DB손해보험 연봉 2026 — 신입 6,400만원~시니어 1억 1,200만원 직급별 연봉표 | 머니샐러리");
    expect(description).not.toContain("공시 평균연봉");
    const before = companyPageModified(c, new Date("2026-09-30T14:59:59.999Z")).getTime();
    expect(companyPageModified(c, new Date("2026-10-30T03:00:00Z")).getTime()).toBe(before);
  });

  it("연봉 FAQ 첫 답(FAQPage JSON-LD)이 1억 370만원과 DART 원문 출처를 인용한다", async () => {
    const { buildCompanySalaryFaq } = await import("@/lib/companySalaryBasis");
    const faq = buildCompanySalaryFaq(company("db-insurance"));
    expect(faq[0].answer).toContain("2025 사업연도 1억 370만원입니다.");
    expect(faq[0].answer).toContain("공시 인용 출처: 금융감독원 전자공시(DART) 2025 사업보고서 직원 현황");
    expect(JSON.stringify(faq)).not.toContain("1억 3,700만원");
  });
});
