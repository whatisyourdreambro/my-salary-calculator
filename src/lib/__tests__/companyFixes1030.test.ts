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
    expect(note.endsWith("증권업 평균연봉 전체 4위 수준.")).toBe(true);
    expect(note).not.toContain("1위");
    expect(notWiderPerWord(note, note.replace("전체 4위 수준.", "전체 1위 수준."))).toBe(true);
    const { dartDisclosed } = await import("@/data/dart/dartDisclosed");
    const sec = dartDisclosed
      .filter((d) => d.fiscalYear === "2025" && (d.ksicCode ?? "").startsWith("6612"))
      .sort((a, b) => b.avgSalaryManwonRaw - a.avgSalaryManwonRaw);
    expect(sec.findIndex((d) => d.corpNameKo === "한국투자증권") + 1).toBe(4);
  });
});
