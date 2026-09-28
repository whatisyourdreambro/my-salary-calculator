// Q&A 상세 CTA 목적지·사실 정정 고정 (SEO 신선도 정비 2026-09-29, MI-06·MI-08·MI-10)
//
//  - MI-06 CTA 는 범용 허브(/calc·/guides) 대신 질문·라벨에 맞는 전용 계산기·가이드로(문구 불변).
//    모든 action.href 는 실재 라우트여야 한다(정적 /salary 격자·가이드 슬러그·/calc 간편 계산기 슬러그 포함).
//  - MI-08 중소기업 취업 청년 감면 연령: 15~34세 + 병역 최대 6년 차감 → 최대 만 40세 (국세청)
//  - MI-10 ISA 비과세 한도는 일반형 200만원(서민형 400만원) — 2,000만원은 오기 (조세특례제한법 제91조의18)
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { qnaData } from "@/data/qnaData";
import { getAllSlugs } from "@/lib/simpleCalculators";
import { guideCards } from "@/lib/guidesMeta.generated";
import { isStaticSalaryAmount } from "@/lib/salaryStaticParams";

function routeExists(href: string): boolean {
  const path = href.split("#")[0].split("?")[0];
  if (path === "/") return true;
  const salary = /^\/salary\/(\d+)$/.exec(path);
  if (salary) return isStaticSalaryAmount(Number(salary[1]));
  const guide = /^\/guides\/([^/]+)$/.exec(path);
  if (guide) return guideCards.some((g) => g.slug === guide[1]);
  const calc = /^\/calc\/([^/]+)$/.exec(path);
  if (calc && getAllSlugs().includes(calc[1])) return true;
  return existsSync(`src/app${path}/page.tsx`);
}

describe("Q&A CTA 목적지 (MI-06)", () => {
  it("모든 action.href 가 실재 라우트", () => {
    for (const item of qnaData) expect(routeExists(item.answer.action.href), `${item.question} → ${item.answer.action.href}`).toBe(true);
  });

  it("범용 허브(/calc·/guides)로 가는 CTA 는 0", () => {
    const generic = qnaData.filter((i) => i.answer.action.href === "/calc" || i.answer.action.href === "/guides");
    expect(generic.map((i) => i.question)).toEqual([]);
  });

  it("대표 교체: 야근·퇴직금·맞벌이·주휴·연봉 1억", () => {
    const hrefOf = (text: string) => qnaData.find((i) => i.answer.action.text === text)?.answer.action.href;
    expect(hrefOf("내 야근수당 계산해보기")).toBe("/calc/overtime-pay-quick");
    expect(hrefOf("퇴직금 계산기 바로가기")).toBe("/calc/severance-pay-quick");
    expect(hrefOf("연말정산 미리보기")).toBe("/year-end-tax-preview");
    expect(hrefOf("연말정산 절세 시뮬레이션")).toBe("/calc/dual-income-year-end");
    expect(hrefOf("시급·주휴수당 계산기")).toBe("/weekly-holiday-allowance-2026");
    expect(hrefOf("연봉 1억 실수령액 계산")).toBe("/salary/100000000");
  });
});

describe("Q&A 사실 정정 (MI-08·MI-10)", () => {
  it("중소기업 취업 청년 감면 연령 상한은 만 40세", () => {
    const item = qnaData.find((i) => i.question.startsWith("중소기업 취업 청년 소득세 감면"))!;
    const text = item.answer.details.join(" ");
    expect(text).toContain("최대 만 40세까지");
    expect(text).not.toContain("만 39세");
  });

  it("배당소득세 팁의 ISA 비과세 한도는 200만원", () => {
    const item = qnaData.find((i) => i.question.startsWith("배당소득세가 뭔가요"))!;
    expect(item.answer.tip).toContain("200만원 한도 이내 비과세");
    expect(item.answer.tip).not.toContain("2,000만원");
  });
});
