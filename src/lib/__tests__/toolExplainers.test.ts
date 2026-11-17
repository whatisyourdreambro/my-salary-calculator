// 도구·재미 페이지 맨 아래 설명 글 (2026-11-13 lens-meta-F10, 운영자 질문 2 승인).
// - 대상은 검증 의견이 고른 6곳뿐(재미용 /fun 17쪽 제외), 쪽마다 보이는 글자 300~600자.
// - 렌더 위치는 그 쪽의 마지막 광고 뒤 — 광고 위 높이 불변.
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

let currentPath = "/";
vi.mock("next/navigation", () => ({ usePathname: () => currentPath }));

import ToolExplainerSection from "@/components/ToolExplainerSection";
import { TOOL_EXPLAINERS, getToolExplainer } from "@/lib/toolExplainers";
import { CURRENT_RATES_YEAR } from "@/config/currentRates";
import { GlobalTaxEngine } from "@/lib/global/taxEngine";
import { calculateSalary2026 } from "@/lib/TaxLogic";

const PAGES: Record<string, { file: string; adTags: string[] }> = {
  "/global": { file: "src/app/global/page.tsx", adTags: ["<PageFooterAds", "<GuideMidAd"] },
  "/mbti-salary": { file: "src/app/mbti-salary/page.tsx", adTags: ["<PageFooterAds", "<GuideMidAd"] },
  "/lotto": { file: "src/app/lotto/page.tsx", adTags: ["<PageFooterAds", "<CalcResultAd"] },
  "/fortune-2026": { file: "src/app/fortune-2026/page.tsx", adTags: ["<PageFooterAds", "<GuideMidAd"] },
  "/tools/math": { file: "src/app/tools/layout.tsx", adTags: ["<HomeTopAd", "<InArticleAd", "<CoupangBanner"] },
  "/company/simulator": { file: "src/app/company/layout.tsx", adTags: ["<PageFooterAds"] },
  // 2026-11-15 app-tools-fun-b04-F05: 계산기에 없는 세대생략 할증(상증법 제57조)을 마지막 광고 아래에서 알린다.
  "/tools/real-estate/gift-tax": { file: "src/app/tools/layout.tsx", adTags: ["<HomeTopAd", "<InArticleAd", "<CoupangBanner"] },
  // 2026-11-18 R4 CALCMISC: 입력칸 '퇴사일'이 마지막 근무일이라는 것(고용노동부 계산기의 퇴직일자는 그다음 날)을 마지막 광고 아래에서 알린다.
  "/tools/finance/severance": { file: "src/app/tools/layout.tsx", adTags: ["<HomeTopAd", "<InArticleAd", "<CoupangBanner"] },
};

const visibleText = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

describe("lens-meta-F10 도구 설명 글", () => {
  it("대상은 8곳뿐이다(11/13 6곳 + 11/15 증여세 계산기 + 11/18 퇴직금 세금 계산기)", () => {
    expect(Object.keys(TOOL_EXPLAINERS).sort()).toEqual(Object.keys(PAGES).sort());
  });

  it.each(Object.keys(PAGES))("%s: 본문 300~600자, 링크 없음", (path) => {
    const e = getToolExplainer(path)!;
    const chars = e.paragraphs.join("").length;
    expect(chars, path).toBeGreaterThanOrEqual(300);
    expect(chars, path).toBeLessThanOrEqual(600);
    const html = renderToStaticMarkup(createElement(ToolExplainerSection, { path }));
    expect(html).toContain(`<h2`);
    expect(html).not.toContain("<a ");
    expect(visibleText(html)).toContain(e.paragraphs[0]);
  });

  it.each(Object.entries(PAGES))("%s: 마지막 광고 뒤에서만 렌더한다", (_path, { file, adTags }) => {
    const src = readFileSync(file, "utf8");
    const at = src.indexOf("<ToolExplainerSection");
    expect(at, file).toBeGreaterThan(-1);
    expect(src.split("<ToolExplainerSection").length - 1, file).toBe(1);
    for (const tag of adTags) expect(src.lastIndexOf(tag), `${file} ${tag}`).toBeLessThan(at);
    expect(src.lastIndexOf("Ad "), file).toBeLessThan(at);
    expect(src.lastIndexOf("Ads "), file).toBeLessThan(at);
  });

  it("레이아웃에 둔 경우 등록 경로에서만 렌더한다(같은 레이아웃의 다른 쪽은 그대로)", () => {
    currentPath = "/tools/math";
    expect(renderToStaticMarkup(createElement(ToolExplainerSection))).toContain("퍼센트·단위 계산은");
    for (const other of ["/tools/math/percent", "/tools/finance/bonus", "/company/compare", "/company"]) {
      currentPath = other;
      expect(renderToStaticMarkup(createElement(ToolExplainerSection)), other).toBe("");
    }
    currentPath = "/company/simulator";
    expect(renderToStaticMarkup(createElement(ToolExplainerSection))).toContain("중소기업·대기업 실수령액");
    currentPath = "/tools/real-estate/gift-tax";
    expect(renderToStaticMarkup(createElement(ToolExplainerSection))).toContain("증여세 계산 방식과 계산에 없는 항목");
    for (const other of ["/tools/real-estate/acquisition-tax", "/tools/real-estate", "/tools/real-estate/ltv"]) {
      currentPath = other;
      expect(renderToStaticMarkup(createElement(ToolExplainerSection)), other).toBe("");
    }
  });

  // 상속세 및 증여세법(시행 2026. 1. 2., law.go.kr 2026-11-15 확인) 제26조 세율·제57조 할증·제69조 신고세액공제로
  // 설명 글의 예시 금액을 다시 계산한다. 할증은 계산기(calcGiftTax)에 없으므로 '들어 있지 않다'고 적어야 한다.
  it("증여세 설명은 세대생략 할증(제57조, 30%·40%)과 예시 금액을 법 조문대로 적는다", () => {
    const [p1, p2] = getToolExplainer("/tools/real-estate/gift-tax")!.paragraphs;
    expect(p2).toContain("제57조");
    expect(p2).toContain("30%");
    expect(p2).toContain("20억원을 넘으면 40%");
    expect(p2).toContain("이 계산기 결과에는 들어 있지 않습니다");
    for (const fact of ["배우자는 6억원", "성년 5천만원·미성년 2천만원", "기타 친족은 1천만원", "1억원을 더 뺍니다", "10~50% 다섯 단계", "산출세액의 3%"]) {
      expect(p1).toContain(fact);
    }
    const brackets: [number, number, number][] = [
      [100_000_000, 0.1, 0],
      [500_000_000, 0.2, 10_000_000],
      [1_000_000_000, 0.3, 90_000_000],
      [3_000_000_000, 0.4, 240_000_000],
      [Infinity, 0.5, 1_040_000_000],
    ];
    const statutoryTax = (base: number) => {
      let lower = 0;
      for (const [upper, rate, fixed] of brackets) {
        if (base <= upper) return fixed + (base - lower) * rate;
        lower = upper;
      }
      return NaN;
    };
    const base = 300_000_000 - 50_000_000; // 성년 손자녀가 조부모에게서 3억원(직계존속 공제 5천만원)
    const tax = statutoryTax(base);
    const withoutSurcharge = tax - Math.round(tax * 0.03);
    const withSurcharge = tax * 1.3 - Math.round(tax * 1.3 * 0.03);
    expect(withoutSurcharge).toBe(38_800_000);
    expect(withSurcharge).toBe(50_440_000);
    expect(p2).toContain("계산기는 3,880만원을 보여 주지만 할증을 더한 납부세액은 5,044만원입니다");
    const page = readFileSync("src/app/tools/real-estate/gift-tax/page.tsx", "utf8");
    expect(page, "계산기에 할증 단계가 생기면 설명 글을 고친다").not.toMatch(/1\.3\b|0\.3\s*\*\s*tax|할증/);
  });

  it("로또 확률은 45개 중 6개 조합 수와 같다", () => {
    let c = 1;
    for (let i = 0; i < 6; i++) c = (c * (45 - i)) / (i + 1);
    expect(c).toBe(8_145_060);
    expect(getToolExplainer("/lotto")!.paragraphs[0]).toContain("8,145,060분의 1");
  });

  // 리뷰 정정: 포인터를 따르는 계산을 가리키는 문장에 연도를 글자로 박으면 1/1 전환(CURRENT_RATES_YEAR 한 줄) 뒤
  // 낡은 연도가 남고, verify:tax 의 switch_scan 이 전환 당일 실패한다(전환 전에는 경고). 연도는 포인터에서 만든다.
  it("연도 표기는 현행 요율 포인터에서 만든다 — 소스에 연도 라벨을 글자로 두지 않는다", () => {
    const code = readFileSync("src/lib/toolExplainers.ts", "utf8")
      .split(/\r?\n/)
      .filter((line) => !/^\s*(?:\/\/|\*|\/\*)/.test(line))
      .join("\n");
    expect(code, "연도 고정 사실을 새로 쓰려면 이 단언과 verify:tax switch_scan 을 함께 본다").not.toMatch(/20\d\d ?년/);
    const year = `${CURRENT_RATES_YEAR}년`;
    expect(getToolExplainer("/global")!.paragraphs[0]).toContain(`한국은 ${year} 기준으로`);
    expect(getToolExplainer("/mbti-salary")!.paragraphs[1]).toContain(`${year} 기준 세후 월급`);
    expect(getToolExplainer("/company/simulator")!.paragraphs[0]).toContain(`연봉 계산기와 같은 ${year} 세법(`);
  });

  // /global 의 한국 계산은 연말정산식 연간 추정(estimateAnnualIncomeTax2026)이고, 연봉 계산기는 월별 간이세액표와
  // 비과세 식대 20만원을 쓴다. 두 금액이 다르므로 설명 글은 '연봉 계산기와 같다'고 쓰지 않는다.
  // 엔진을 연봉 계산기로 맞추면 첫 단언이 실패한다 — 그때 문장도 함께 고친다.
  it("/global 한국 설명은 엔진 그대로다 — 연간 추정이라 연봉 계산기 금액과 다르다고 적는다", () => {
    for (const gross of [30_000_000, 60_000_000]) {
      const engine = Math.round(GlobalTaxEngine.calculate(gross, "KR").net);
      const calculator = calculateSalary2026(gross, 200_000, 1, 0).netPay * 12;
      expect(Math.abs(engine - calculator), `연봉 ${gross}`).toBeGreaterThan(100_000);
    }
    const text = getToolExplainer("/global")!.paragraphs[0];
    expect(text).toContain("연간 소득세를 추정");
    expect(text).toContain("연봉 계산기 결과와는 조금 다를 수 있습니다");
    expect(text).not.toContain("연봉 계산기와 같은");
  });
});
