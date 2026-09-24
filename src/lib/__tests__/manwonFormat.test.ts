// 1억 이상 만원 금액의 억 표기 통일 (2026-09-25 B14 META-06).
//
// - formatManwonKorean: 1억 미만은 종전 `${n.toLocaleString("ko-KR")}만원` 과 바이트 동일,
//   1억 이상은 "1억 2,000만원" (원 단위 formatSalaryKorean 과 정수 입력에서 같은 결과).
// - /job·/industry·/region 제목·설명, /salary·/monthly FAQ(JSON-LD 원천)에
//   "12,000만원" 같은 다섯 자리 만원 표기가 남지 않는다. 비교(compare) 페이지는 범위 밖.
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("not found"); },
  permanentRedirect: () => { throw new Error("redirect"); },
}));
vi.mock("@/components/AppLink", () => ({ default: ({ children, ...props }: { children: ReactNode }) => createElement("a", props, children) }));
vi.mock("@/components/AdPlacement", () => ({ CalcResultAd: () => null, Display2Ad: () => null, GuideMidAd: () => null, HomeTopAd: () => null, InArticleAd: () => null, MultiplexAd: () => null, SidebarAd: () => null }));
vi.mock("@/components/CoupangBanner", () => ({ default: () => null }));
vi.mock("@/components/ShareSection", () => ({ default: () => null }));
vi.mock("@/components/JobOfficialStats", () => ({ default: () => null }));
vi.mock("@/components/SalaryResultCard", () => ({ default: () => null }));
vi.mock("@/components/SalaryTierCard", () => ({ default: () => null }));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/RelatedGuides", () => ({ default: () => null }));
vi.mock("@/components/RelatedCompanies", () => ({ default: () => null }));
vi.mock("@/components/ListedSalaryBandTable", () => ({ default: () => null }));
vi.mock("@/components/FavoritesButton", () => ({ default: () => null }));
vi.mock("@/components/NextActions", () => ({ default: () => null }));
vi.mock("@/components/WealthChartLazy", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/app/table/2026/SeasonalLinks", () => ({ default: () => null }));
vi.mock("@/lib/relatedGuides", () => ({ getRelatedGuides: () => [] }));

import { formatManwonKorean } from "@/lib/manwonFormat";
import { formatSalaryKorean } from "@/lib/seo";
import { jobsData } from "@/data/jobsData";
import { industriesData } from "@/data/industriesData";
import { regionsData } from "@/data/regionsData";
import { guideCards } from "@/lib/guidesMeta.generated";
import { getStaticSalaryAmounts } from "@/lib/salaryStaticParams";
import { generateMetadata as jobMetadata } from "@/app/job/[slug]/page";
import { generateMetadata as industryMetadata } from "@/app/industry/[slug]/page";
import { generateMetadata as regionMetadata } from "@/app/region/[slug]/page";
import SalaryPage from "@/app/salary/[amount]/page";
import MonthlyPage from "@/app/monthly/[amount]/page";

/** 게이트 정규식 — 1억 이상을 다섯·여섯 자리 만원으로 쓴 표기 */
const FIVE_DIGIT_MANWON = /\d{2,3},\d{3}만원/;
const legacy = (n: number) => `${n.toLocaleString("ko-KR")}만원`;

type Faq = { "@type": string; mainEntity?: { name: string; acceptedAnswer: { text: string } }[] };
const faqOf = (html: string) =>
  [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .flatMap((m) => {
      const parsed = JSON.parse(m[1]) as Faq | Faq[];
      return Array.isArray(parsed) ? parsed : [parsed];
    })
    .find((d) => d["@type"] === "FAQPage")!;

describe("formatManwonKorean", () => {
  it("1억 미만은 종전 문자열과 바이트 단위로 같다", () => {
    for (const n of [0, 1, 99, 100, 999, 1000, 4800, 5200, 9500, 9999, 2345.6, 9999.5]) {
      expect(formatManwonKorean(n)).toBe(legacy(n));
    }
  });

  it("1억 이상은 억 표기", () => {
    expect(formatManwonKorean(10000)).toBe("1억원");
    expect(formatManwonKorean(10283)).toBe("1억 283만원");
    expect(formatManwonKorean(12000)).toBe("1억 2,000만원");
    expect(formatManwonKorean(15800)).toBe("1억 5,800만원");
    expect(formatManwonKorean(18700)).toBe("1억 8,700만원");
    expect(formatManwonKorean(20000)).toBe("2억원");
    expect(formatManwonKorean(100000)).toBe("10억원");
    expect(formatManwonKorean(123456)).toBe("12억 3,456만원");
    // 공시 원값의 소수 만원은 반올림하지 않는다
    expect(formatManwonKorean(12345.6)).toBe("1억 2,345.6만원");
  });

  it("표시 정밀도(소수 3자리) 반올림 경계에서 '10,000만원'·'1억 10,000만원' 이 나오지 않는다", () => {
    expect(formatManwonKorean(9999.9994)).toBe(legacy(9999.9994)); // "9,999.999만원"
    expect(formatManwonKorean(9999.9996)).toBe("1억원");
    expect(formatManwonKorean(10000.0004)).toBe("1억원");
    expect(formatManwonKorean(19999.9999)).toBe("2억원");
    expect(formatManwonKorean(29999.9996)).toBe("3억원");
    for (const n of [9999.9996, 19999.9999, 29999.9996, 109999.9999]) {
      expect(formatManwonKorean(n), String(n)).not.toMatch(/10,000만원/);
    }
  });

  it("정수 입력에서 원 단위 formatSalaryKorean 과 같고, 다섯 자리 만원이 없다", () => {
    for (let n = 10000; n <= 120000; n += 7) {
      const out = formatManwonKorean(n);
      expect(out).toBe(formatSalaryKorean(n * 10000));
      expect(out).not.toMatch(FIVE_DIGIT_MANWON);
    }
  });
});

describe("/job·/industry·/region 제목·설명", () => {
  it("/job: 다섯 자리 만원이 없고, 1억 미만 직업은 종전 문자열 그대로", async () => {
    let eok = 0;
    for (const job of jobsData) {
      const meta = await jobMetadata({ params: { slug: job.id } });
      const title = String((meta.title as { absolute?: string })?.absolute ?? meta.title);
      const text = `${title}\n${meta.description}`;
      expect(text, job.id).not.toMatch(FIVE_DIGIT_MANWON);
      const s = job.salary;
      if ([s.overall, s.entry.avg, s.junior.avg, s.senior.avg].every((v) => v < 10000)) {
        expect(meta.description, job.id).toBe(
          `${job.name} 연봉 참고 자료: 평균 ${s.overall.toLocaleString()}만원, 신입 ${s.entry.avg.toLocaleString()}만원, 3~5년 ${s.junior.avg.toLocaleString()}만원, 10년 이상 ${s.senior.avg.toLocaleString()}만원. 자료 기준과 경력별 차이를 확인하고 개인 조건으로 실수령액을 계산하세요.`,
        );
        expect(title, job.id).toContain(`${job.name} 연봉 2026 — 평균 ${s.overall.toLocaleString()}만원·경력별 급여 비교`);
      } else {
        eok++;
      }
    }
    expect(eok).toBeGreaterThan(0);
    const doctor = jobsData.find((j) => j.salary.overall >= 10000)!;
    const meta = await jobMetadata({ params: { slug: doctor.id } });
    expect(String(meta.description)).toContain(`평균 ${formatManwonKorean(doctor.salary.overall)}`);
  });

  it("/industry: 다섯 자리 만원이 없고, 1억 미만 업계는 종전 문자열 그대로", async () => {
    for (const ind of industriesData) {
      const meta = await industryMetadata({ params: { slug: ind.id } });
      const title = String((meta.title as { absolute?: string })?.absolute ?? meta.title);
      expect(`${title}\n${meta.description}`, ind.id).not.toMatch(FIVE_DIGIT_MANWON);
      const s = ind.salary;
      if ([s.overall, s.entry.avg, s.senior.avg].every((v) => v < 10000)) {
        expect(title, ind.id).toContain(`평균 ${s.overall.toLocaleString()}만원·회사별 TOP 순위`);
        expect(String(meta.description), ind.id).toContain(`신입 ${s.entry.avg.toLocaleString()}만원~, 시니어 ${s.senior.avg.toLocaleString()}만원~.`);
      }
    }
  });

  it("/region: 다섯 자리 만원이 없다", async () => {
    for (const region of regionsData) {
      const meta = await regionMetadata({ params: { slug: region.id } });
      const title = String((meta.title as { absolute?: string })?.absolute ?? meta.title);
      expect(`${title}\n${meta.description}`, region.id).not.toMatch(FIVE_DIGIT_MANWON);
    }
  });

  it("/job·/industry·/region FAQ(FAQPage JSON-LD 원천) 질문·답에도 다섯 자리 만원이 없다", () => {
    const sets = [
      ["job", jobsData],
      ["industry", industriesData],
      ["region", regionsData],
    ] as const;
    for (const [kind, list] of sets) {
      for (const entry of list) {
        for (const [i, faq] of entry.faqs.entries()) {
          expect(`${faq.q}\n${faq.a}`, `${kind}/${entry.id} faq#${i}`).not.toMatch(FIVE_DIGIT_MANWON);
        }
      }
    }
    const yeouido = regionsData.find((r) => r.id === "yeouido")!;
    expect(yeouido.faqs[0].a).toContain("시니어는 1억 2,000만원 수준");
  });
});

describe("가이드 카드 설명 (meta description·핵심 요약 원천)", () => {
  it("다섯 자리 만원이 없다 — lgensol 은 원문보다 짧은 '9,500만~1.2억원' (핵심 요약 박스는 광고 위)", () => {
    for (const card of guideCards) {
      expect(card.description, card.slug).not.toMatch(FIVE_DIGIT_MANWON);
    }
    const lgensol = guideCards.find((c) => c.slug === "lgensol-wage-negotiation-2026")!;
    expect(lgensol.description).toContain("시니어 9,500만~1.2억원.");
    // 종전 설명("시니어 9,500~12,000만원.")보다 길어지면 핵심 요약이 한 줄 늘어 아래 광고를 민다
    expect(lgensol.description.length).toBeLessThanOrEqual(
      "전기차 캐즘 종료 + ESS 본격화로 LG엔솔 2026 임금협상 인상률 5%+ 전망. 신입 영끌 5,500~6,500만원, 시니어 9,500~12,000만원. 미국 파견 인센티브 확대.".length,
    );
  });
});

describe("/salary·/monthly FAQ (FAQPage JSON-LD 원천)", () => {
  const renderSalary = (amount: number) =>
    faqOf(renderToStaticMarkup(createElement(SalaryPage, { params: { amount: String(amount) } })));

  it("1억 미만 연봉 페이지의 FAQ 질문은 종전 문자열 그대로", () => {
    for (const amount of [30_000_000, 50_000_000, 99_000_000]) {
      const label = legacy(Math.round(amount / 10000));
      const names = renderSalary(amount).mainEntity!.map((q) => q.name);
      expect(names.slice(0, 3)).toEqual([
        `연봉 ${label}의 월 실수령액은 얼마인가요?`,
        `연봉 ${label}일 때 대출 상환 부담은 어떻게 비교하나요?`,
        `연봉 ${label}이면 한국 직장인 중 어느 정도 위치인가요?`,
      ]);
    }
  });

  it("1억 이상 전 정적 연봉 페이지의 FAQ 에 다섯 자리 만원이 없고, 제목과 같은 억 표기를 쓴다", () => {
    const big = getStaticSalaryAmounts().filter((a) => a >= 100_000_000);
    expect(big.length).toBeGreaterThan(100);
    for (const amount of big) {
      const faq = renderSalary(amount);
      const text = JSON.stringify(faq);
      expect(text, String(amount)).not.toMatch(FIVE_DIGIT_MANWON);
      expect(faq.mainEntity![0].name, String(amount)).toContain(`연봉 ${formatSalaryKorean(amount)}`);
    }
  });

  it("1억 이상 질문은 화면 줄 수가 늘지 않도록 줄인 문형을 쓴다 (접힌 FAQ 의 summary 는 GuideMidAd 위)", () => {
    const names = renderSalary(120_000_000).mainEntity!.map((q) => q.name);
    expect(names.slice(0, 3)).toEqual([
      "연봉 1억 2,000만원의 월 실수령액은?",
      "연봉 1억 2,000만원일 때 대출 상환 부담은?",
      "연봉 1억 2,000만원이면 직장인 중 어느 정도 위치인가요?",
    ]);
    const repayment = renderSalary(250_000_000).mainEntity![1].acceptedAnswer.text;
    expect(repayment).toContain("가정하면 연 1억원입니다");
  });

  it("G9: 출처 미확인 통계 수치(2024년 국세청 평균 4,200만원·중위 3,200만원)를 싣지 않는다", () => {
    const text = JSON.stringify(renderSalary(50_000_000));
    expect(text).not.toMatch(/국세청 통계|4,200만원|3,200만원/);
    expect(text).toContain("자체 참고표");
    expect(text).toContain("공식 전국 순위가 아닙니다");
  });

  it("/monthly FAQ 의 상여 400% 환산 연봉은 1억 이상에서 억 표기, 미만은 종전 그대로", () => {
    const answerOf = (monthly: number) =>
      faqOf(renderToStaticMarkup(createElement(MonthlyPage, { params: { amount: String(monthly) } })))
        .mainEntity!.find((q) => q.name.includes("연봉 ÷ 12"))!.acceptedAnswer.text;
    expect(answerOf(3_000_000)).toContain("연봉은 약 4,800만원이 됩니다");
    expect(answerOf(7_500_000)).toContain("연봉은 약 1억 2,000만원이 됩니다");
    expect(answerOf(20_000_000)).toContain("연봉은 약 3억 2,000만원이 됩니다");
    for (const monthly of [6_300_000, 10_000_000, 15_000_000, 20_000_000]) {
      const faq = faqOf(renderToStaticMarkup(createElement(MonthlyPage, { params: { amount: String(monthly) } })));
      expect(JSON.stringify(faq), String(monthly)).not.toMatch(FIVE_DIGIT_MANWON);
    }
  });

  it("/monthly 상여금 환산표 셀은 종전 '약 N,NNN만원' 그대로 — 억 표기는 Display2Ad 위 표 높이를 늘린다", () => {
    // 월 750만원: 상여 400% → 연봉 1억 2,000만원. 폰트 실측(320~460px)에서 억 표기 셀이
    // 371~379px·450~460px 폭에서 행마다 한 줄씩 늘어 아래 Display2Ad 를 최대 120px 밀었다.
    const html = renderToStaticMarkup(createElement(MonthlyPage, { params: { amount: "7500000" } }));
    const table = html.slice(html.indexOf("<table"), html.indexOf("</table>"));
    expect(table).toContain("약 12,000만원");
    expect(table).toContain("약 9,000만원");
    expect(table).not.toContain("억");
  });
});
