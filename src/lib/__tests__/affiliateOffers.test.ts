// src/lib/__tests__/affiliateOffers.test.ts
//
// 제휴 오퍼 매칭 회귀 가드.
// 규칙표(VERTICAL_RULES)는 클라 번들 안전을 위해 정적 목록 — 여기서
// simpleCalculators 실데이터와 대조해 드리프트를 잡는다.
import { describe, expect, it } from "vitest";

import offersJson from "@/data/offers.json";
import {
  BLOCKED_PATHS,
  PHASE2_VERTICALS,
  getAllOffers,
  inferVertical,
  interpolate,
  isBlockedPath,
  matchOffers,
  validateOffers,
  type Offer,
} from "@/lib/affiliateOffers";
import { allCalculators } from "@/lib/simpleCalculators";
import { BONUS_CALCS } from "@/data/bonusCalcHub";

describe("offers.json 스키마", () => {
  it("검증 통과 + 무시 항목 0", () => {
    const { offers, ignored } = validateOffers(offersJson);
    expect(ignored).toEqual([]);
    expect(offers.length).toBeGreaterThan(0);
  });

  it("유니크 id 위반은 throw", () => {
    const dup = [...(offersJson as Offer[]), (offersJson as Offer[])[0]];
    expect(() => validateOffers(dup)).toThrow(/중복/);
  });

  it("active 오퍼는 https url 필수", () => {
    const bad: Offer[] = [
      { ...(offersJson as Offer[])[0], id: "x-active-bad", active: true, url: "PLACEHOLDER" },
    ];
    expect(() => validateOffers(bad)).toThrow(/https/);
  });
});

describe("BLOCKED_PATHS — 취약 방문자 보호 (vertical:none)", () => {
  const blocked = [
    "/unemployment-benefit",
    "/earned-income-credit",
    "/parental-leave",
    "/basic-pension-2026",
    "/fun",
    "/fun/salary-battle",
    "/calc/unemployment-benefit", // [slug] 중복 실업급여 — 지시서 누락분
    "/lotto",
    "/fortune-2026",
    "/mbti-salary",
  ];
  it.each(blocked)("%s 는 차단", (p) => {
    expect(isBlockedPath(p)).toBe(true);
    expect(inferVertical(p)).toBeNull();
  });

  it("pages 에 차단 경로를 강제 주입해도 오퍼가 나오지 않는다 (최우선 단락)", () => {
    // matchOffers 는 offers.json 전역을 읽으므로, 차단 경로가 어떤 오퍼의
    // pages 에 있더라도 결과는 항상 빈 배열이어야 한다.
    for (const p of blocked) {
      expect(matchOffers(p)).toEqual([]);
    }
  });

  it("BLOCKED_PATHS 는 실업급여 [slug] 라우트를 커버한다 (실데이터 대조)", () => {
    const unemployment = allCalculators.filter((c) => c.slug.includes("unemployment"));
    for (const c of unemployment) {
      expect(isBlockedPath(`/calc/${c.slug}`)).toBe(true);
    }
    expect(BLOCKED_PATHS.length).toBeGreaterThanOrEqual(9);
  });
});

describe("inferVertical — 규칙표 vs 실데이터", () => {
  it("보험 [slug] 8종 전수는 insurance", () => {
    const insuranceSlugs = allCalculators
      .filter((c) => c.category === "insurance")
      .map((c) => c.slug);
    expect(insuranceSlugs.length).toBe(8);
    for (const slug of insuranceSlugs) {
      expect(inferVertical(`/calc/${slug}`)).toBe("insurance");
    }
  });

  it("loan 카테고리 [slug] 전수는 loan", () => {
    const loanSlugs = allCalculators
      .filter((c) => c.category === "loan")
      .map((c) => c.slug);
    expect(loanSlugs.length).toBeGreaterThanOrEqual(10);
    for (const slug of loanSlugs) {
      expect(inferVertical(`/calc/${slug}`)).toBe("loan");
    }
  });

  it("성과급 계산기 전수(BONUS_CALCS)는 securities", () => {
    for (const c of BONUS_CALCS) {
      expect(inferVertical(`/calc/${c.slug}`)).toBe("securities");
    }
    expect(inferVertical("/calc/bonus-calculators")).toBe("securities");
  });

  it("핵심 고정 매핑", () => {
    expect(inferVertical("/home-loan")).toBe("loan");
    expect(inferVertical("/car-loan")).toBe("loan");
    expect(inferVertical("/tools/real-estate/dsr")).toBe("loan");
    expect(inferVertical("/credit-card-deduction-2026")).toBe("card");
    expect(inferVertical("/year-end-tax")).toBe("card");
    expect(inferVertical("/tools/finance/irp")).toBe("securities");
    expect(inferVertical("/retirement-pension-2026")).toBe("securities");
    expect(inferVertical("/savings-interest-2026")).toBe("savings");
    expect(inferVertical("/en")).toBe("remittance");
    expect(inferVertical("/en/flat-tax")).toBe("remittance");
    expect(inferVertical("/global")).toBe("remittance");
  });

  it("가이드 증권 규칙은 하이픈 토큰 경계 — refund/visa 오탐 없음 (2026-08 점검 회귀)", () => {
    // 실존 슬러그 기준: 'refund'의 fund, 'visa'의 isa 부분 문자열 오탐 방지
    for (const p of [
      "/guides/tax-refund-mistakes-2026",
      "/guides/year-end-tax-refund-secrets-2026",
      "/guides/vat-refund-2026",
      "/guides/annual-leave-refund-2026",
      "/guides/digital-nomad-visa-korea-2026",
    ]) {
      expect(inferVertical(p)).not.toBe("securities");
    }
    // 정상 매칭은 유지
    for (const p of [
      "/guides/samsung-electronics-stock-2026",
      "/guides/isa-vs-pension-savings",
      "/guides/irp-pension-year-end-2026",
      "/guides/fund-vs-etf-2026",
      "/guides/korean-bond-investment",
      "/guides/reits-investment",
    ]) {
      expect(inferVertical(p)).toBe("securities");
    }
  });

  it("함정 경로 — 잘못 매핑되면 안 되는 페이지", () => {
    // /year-end-tax-2026 은 종합소득세(5월) 페이지 — card 아님
    expect(inferVertical("/year-end-tax-2026")).toBeNull();
    // 국민건강보험 페이지 — 사보험(insurance) 아님
    expect(inferVertical("/health-insurance-2026")).toBeNull();
    expect(inferVertical("/social-insurance-rates-2026")).toBeNull();
    // 일반 페이지
    expect(inferVertical("/salary/50000000")).toBeNull();
    expect(inferVertical("/glossary")).toBeNull();
  });
});

describe("matchOffers — LinkPrice 활성 2종 (nice-zikimi·allcredit) 시대", () => {
  const LINKPRICE_DISCLOSURE =
    "이 포스팅은 제휴마케팅이 포함된 광고로 커미션을 지급 받습니다.";

  it("활성 오퍼는 정확히 2종이고 전부 lase.kr https + LinkPrice 필수 대가성 문구", () => {
    const active = getAllOffers().filter((o) => o.active);
    expect(active.map((o) => o.id).sort()).toEqual(["allcredit-01", "nice-zikimi-01"]);
    for (const o of active) {
      expect(o.url).toMatch(/^https:\/\/lase\.kr\/click\.php\?m=/);
      expect(o.disclosure).toBe(LINKPRICE_DISCLOSURE);
    }
  });

  it("loan 광역 지면(주담대·DSR 등)은 NICE지키미", () => {
    for (const p of ["/home-loan", "/calc/dsr-quick", "/tools/real-estate/ltv"]) {
      expect(matchOffers(p)[0]?.id).toBe("nice-zikimi-01");
    }
  });

  it("pages 명시 4곳은 올크레딧 우선 (구체 지정 > 광역 정렬 규칙)", () => {
    for (const p of [
      "/credit-card-deduction-2026",
      "/car-loan",
      "/calc/loan-affordability",
      "/calc/prepayment-fee-quick",
    ]) {
      const matched = matchOffers(p);
      expect(matched[0]?.id).toBe("allcredit-01");
    }
    // /car-loan 은 loan 버티컬이기도 하므로 NICE 가 차순위로 공존
    expect(matchOffers("/car-loan").map((o) => o.id)).toEqual([
      "allcredit-01",
      "nice-zikimi-01",
    ]);
  });

  it("무관 페이지·BLOCKED 페이지는 오퍼 0 (쿠팡 폴백 유지)", () => {
    for (const p of ["/", "/salary/50000000", "/glossary", "/unemployment-benefit", "/fun/salary-battle"]) {
      expect(matchOffers(p)).toEqual([]);
    }
  });

  it("성과급·보험 등 미승인 버티컬 지면에는 아직 오퍼 없음", () => {
    for (const p of ["/calc/samsung-bonus", "/calc/auto-insurance-quick", "/tools/finance/irp"]) {
      expect(matchOffers(p)).toEqual([]);
    }
  });

  it("pages 포함 ‖ vertical 일치 매칭 스키마 (시드 오퍼 구조 검증)", () => {
    const { offers } = validateOffers(offersJson);
    const seedLoan = offers.find((o) => o.id === "loan-compare-01")!;
    expect(seedLoan.pages).toContain("/home-loan");
    expect(seedLoan.pages).toContain("/calc/dsr-quick");
    expect(inferVertical("/calc/dsr-quick")).toBe("loan");
  });

  it("PHASE2 게이트 — savings/remittance 는 active 여도 미노출", () => {
    expect(PHASE2_VERTICALS).toEqual(["savings", "remittance"]);
    // 시드에 savings/remittance 오퍼가 존재함을 확인 (게이트 해제 준비 완료 상태)
    const all = getAllOffers();
    expect(all.some((o) => o.vertical === "savings")).toBe(true);
    expect(all.some((o) => o.vertical === "remittance")).toBe(true);
  });
});

describe("interpolate — calcResult 보간", () => {
  it("숫자 ko-KR 포맷 치환", () => {
    expect(
      interpolate("성과급 {amount}만원 — IRP 환급 확인", { amount: 3200 }),
    ).toBe("성과급 3,200만원 — IRP 환급 확인");
  });
  it("값 없는 키는 원문 유지, calcResult 없으면 원문", () => {
    expect(interpolate("성과급 {amount}만원", {})).toBe("성과급 {amount}만원");
    expect(interpolate("성과급 {amount}만원")).toBe("성과급 {amount}만원");
  });
});
