// /donation-tax-credit-2026 결과 카드 — 산출세액(최대치) 초과분 줄 렌더 (2026-11-01 B26, 413091de5 이식)
// 기본 입력(총급여 5,000만·일반 120만·고향사랑 10만)은 상한 아래라 줄이 없어 기본 화면 높이가 그대로다.
// 큰 기부(총급여 3,000만·특례 2,000만)일 때만 '한도 초과분 안내' 칸이 열리고 그 안에 줄 하나가 생긴다.
// 화면 입력을 바꿀 수 없는 SSR 이라 엔진 호출만 큰 기부 입력으로 바꿔 렌더한다 (dualIncomeTieRender 와 같은 방식).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const engine = vi.hoisted(() => ({ largeDonation: false }));

vi.mock("next/navigation", () => ({ usePathname: () => "/donation-tax-credit-2026" }));
vi.mock("@/lib/donationCredit", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/donationCredit")>();
  return {
    ...real,
    calcDonationCredit2026: (input: Parameters<typeof real.calcDonationCredit2026>[0]) =>
      real.calcDonationCredit2026(engine.largeDonation
        ? { grossSalary: 30_000_000, statutory: 20_000_000, general: 0, religious: 0, political: 0, hometown: 0 }
        : input),
  };
});

import DonationTaxCreditClient from "@/app/donation-tax-credit-2026/Client";

const LABEL = "산출세액(최대치) 초과 미공제분(특례·일반은 이월)";

describe("기부금 계산기 — 산출세액(최대치) 초과분 줄 (B26)", () => {
  it("기본 입력에서는 줄도 한도 초과분 안내 칸도 없다 (기본 화면 그대로)", () => {
    engine.largeDonation = false;
    const html = renderToStaticMarkup(createElement(DonationTaxCreditClient));
    expect(html).toContain(">270,909원<"); // 기본 머리 금액 (일반 120만 × 15% + 고향사랑 10만 × 100/110)
    expect(html).not.toContain(LABEL);
    expect(html).not.toContain("원 이상");
    expect(html).not.toContain("mt-3 pt-3 border-t border-electric-20 space-y-1 text-sm");
  });

  it("공제액 450만원이 산출세액 최대치 1,552,500원을 넘으면 2,947,500원 이상 줄이 근거 접기보다 앞에 나온다", () => {
    engine.largeDonation = true;
    const html = renderToStaticMarkup(createElement(DonationTaxCreditClient));
    expect(html).toContain(">4,500,000원<");
    expect(html).toContain(`<span>${LABEL}</span><span>2,947,500원 이상</span>`);
    // 이월·소멸 줄은 없다 (특례 2,000만은 근로소득금액 2,025만 한도 안) — 칸은 이 줄 때문에만 열린다
    expect(html).not.toContain("이월공제 가능");
    expect(html).not.toContain("이월 불가");
    expect(html.indexOf(LABEL)).toBeLessThan(html.indexOf("계산 근거 자세히 보기"));
    expect(html).toContain("(산출세액 한도 미반영)");
  });
});
