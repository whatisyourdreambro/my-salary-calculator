// META-07 2차 — 시즌 옛 글 14편의 검색 전용 설명 (2026-11-15 SEASONC, lib ideas[2])
//
// 설명(description)이 70자 미만이던 옛 글 가운데 최저임금·퇴직금·4대보험·연말정산·성과급 시즌 글에만 80~120자 검색 설명을 붙인다.
// 화면 카드·TL;DR·관련 글·RSS 는 description 그대로라 광고 위 높이가 바뀌지 않는다 — 아래 '화면에 안 뜬다' 단언이 증명.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { koGuideCards } from "@/lib/guidesData";
import { MINIMUM_WAGE_2026, MINIMUM_WAGE_2027 } from "@/config/minimumWage";
import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";
import { calculateSalary2026 } from "@/lib/TaxLogic";

const SEASON_14 = [
  "minimum-wage-2026",
  "minimum-wage-impact-2026",
  "severance-pay-guide",
  "salary-guide-2026",
  "social-insurance-reduction",
  "unemployment-insurance-2026",
  "tax-refund-mistakes-2026",
  "isa-vs-pension-savings",
  "child-education-tax-strategy",
  "semiconductor-performance-bonus-tax",
  "bonus-split-payout-1000-saving-2026",
  "retention-bonus-3year-split-2026",
  "stock-option-with-bonus-2026",
  "overtime-pay-calculation",
] as const;
const won = (n: number) => n.toLocaleString("ko-KR");
const guide = (slug: string) => koGuides.find((g) => g.slug === slug)!;
const meta = (slug: string) => guide(slug).metaDescription ?? "";

describe("시즌 옛 글 14편 검색 설명", () => {
  it("14편 모두 META-07 맵에 있고 80~120자·이모지 없음·화면 설명과 다르며, 화면 설명은 여전히 70자 미만이다", () => {
    const src = readFileSync("src/lib/guidesContent.ts", "utf8");
    const block = src.slice(src.indexOf("const guideMetaDescriptions"), src.indexOf("\n};", src.indexOf("const guideMetaDescriptions")));
    for (const slug of SEASON_14) {
      expect(block, slug).toContain(`"${slug}":`);
      const m = meta(slug);
      expect([...m].length, slug).toBeGreaterThanOrEqual(80);
      expect([...m].length, slug).toBeLessThanOrEqual(120);
      expect(/\p{Extended_Pictographic}/u.test(m), slug).toBe(false);
      expect(m, slug).not.toBe(guide(slug).description);
      expect([...guide(slug).description].length, slug).toBeLessThan(70);
    }
  });

  it("금액은 정본 상수·엔진과 같다 (최저임금 고시·구직급여 상·하한·연봉 1억 실수령)", () => {
    expect(meta("minimum-wage-2026")).toContain(`시급 ${won(MINIMUM_WAGE_2026.hourly)}원, 주휴 포함 월 ${won(MINIMUM_WAGE_2026.monthly)}원`);
    expect(meta("minimum-wage-2026")).toContain(`시급 ${won(MINIMUM_WAGE_2027.hourly)}원(월 ${won(MINIMUM_WAGE_2027.monthly)}원)`);
    expect(MINIMUM_WAGE_2026.hourly).toBe(10_320);
    expect(MINIMUM_WAGE_2027).toMatchObject({ hourly: 10_700, monthly: 2_236_300 });
    expect(meta("minimum-wage-impact-2026")).toContain(`${won(MINIMUM_WAGE_2027.hourly)}원이 기준`);
    expect(meta("unemployment-insurance-2026")).toContain(`하루 상한 ${won(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER)}원, 하한 ${won(unemploymentDailyLowerBound())}원`);
    expect(unemploymentDailyLowerBound()).toBe(66_048);
    const net1eok = calculateSalary2026(100_000_000, 200_000, 1, 0).netPay;
    expect(`약 ${Math.round(net1eok / 10_000)}만원`).toBe("약 653만원");
    expect(meta("salary-guide-2026")).toContain("월 실수령액은 약 653만원");
  });

  it("각 글 본문(보강 포함)에 있는 수치·사실만 쓴다", () => {
    const body = (slug: string) => guide(slug).content.replace(/<[^>]+>/g, "");
    expect(body("severance-pay-guide")).toContain("14일 이내");
    expect(body("severance-pay-guide")).toContain("30%가 감면");
    expect(body("tax-refund-mistakes-2026")).toContain("출산 1회당 200만 한도");
    expect(body("tax-refund-mistakes-2026")).toContain("1인당 연 50만 한도");
    expect(body("child-education-tax-strategy")).toContain("1인당 300만 한도 15% 세액공제");
    expect(body("social-insurance-reduction")).toContain("본인 부담 합계 약 9.7%");
    expect(body("semiconductor-performance-bonus-tax")).toContain("별도의 우대 세율은 없습니다");
    expect(body("overtime-pay-calculation")).toContain("5인 이상 사업장");
    expect(body("bonus-split-payout-1000-saving-2026")).toContain("매년 연봉 8,000만원에 성과급 총액 1억원");
    expect(body("isa-vs-pension-savings")).toContain("600만에 더해 IRP 추가 300만 = 합계 900만 한도");
  });

  it("화면에 안 뜬다 — 카드 메타에 없고, metaDescription 을 읽는 곳은 상세 generateMetadata·RSS 뿐", () => {
    for (const slug of SEASON_14) {
      const card = koGuideCards.find((c) => c.slug === slug)!;
      expect("metaDescription" in card, slug).toBe(false);
      expect(card.description, slug).toBe(guide(slug).description);
    }
    const readers: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
          if (name !== "__tests__") walk(p);
        } else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name) && readFileSync(p, "utf8").includes("metaDescription")) {
          readers.push(p.replaceAll("\\", "/"));
        }
      }
    };
    walk("src/app");
    walk("src/components");
    expect(readers.sort()).toEqual(["src/app/guides/[slug]/page.tsx", "src/app/rss.xml/route.ts"]);
    const page = readFileSync("src/app/guides/[slug]/page.tsx", "utf8");
    expect(page).toContain("description: guide.metaDescription ?? guide.description,");
    expect(readFileSync("src/app/guides/[slug]/GuidePageClient.tsx", "utf8")).toContain("{guide.description}");
  });
});
