// 2026-09-30 메타 사실 정정(운영자 결정 11(1), 9/29 승인) 가운데 가이드 제목·설명(TL;DR) 몫을 고정한다.
// 모두 title·description 문자열이고, 광고 위 줄 수는 10/5 크롬 1,123폭 what-if 로 같은 폭을 확인했다(게시 전 가드 스윕으로 다시 잰다).
//
// 2026-11-02 재착지(운영자 2026-11-01 승인 7번, 분류표 RL-02): 10월 테스트 커밋 6db22814625b(신설)·4c0818c3e8ce(③ 개인사업자 vs 법인 단언 삭제)·
// 72110d7c0663(카카오 CB-02 단언 삭제)·f20a7b90ec80(⑤ 30대 노후를 10/4 문구로)의 끝판에서 가이드 블록만 옮겼다. 같은 파일의 계산기·카카오·
// 미리보기·Q&A 블록(CS-08, CS-23, CB-02, TS-28, MI-09)은 다른 묶음 몫이라 넣지 않는다.
// 새로 더한 것: 수정일이 없는 4편에 날짜 칩이 생기지 않는지(새 칩은 GuideMidAd 위 UI — guideContentRevisions.factFix1101.ts 머리 주석),
// 쿠팡 실수령 291~296만원이 지금 엔진(calculateSalary2026) 값과 같은지.
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { GUIDE_CONTENT_REVISED } from "@/lib/guideContentRevisions";
import { calculateSalary2026 } from "@/lib/TaxLogic";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`guide ${slug} missing`);
  return g;
};

describe("가이드 제목·설명(TL;DR) 사실 정정 — GA-10·GA-16·GA-24·GB-31 ②⑤⑥", () => {
  it("삼성메디슨: 비상장사 공시 공백이 아니라 공시 평균", () => {
    const d = guide("samsung-medison-salary-2026").description;
    expect(d).toContain("비상장사의 공시 평균을 짚고");
    expect(d).not.toContain("공시 공백");
  });
  it("SK하이닉스 PS 전망: 검토 변수가 아니라 9/16 가결 결과", () => {
    const d = guide("sk-hynix-ps-forecast-2027").description;
    expect(d).toContain("자사주 지급 가결 결과까지");
    expect(d).not.toContain("전환 검토 변수");
  });
  it("신혼부부: 한시 한도가 아니라 공제 한도 1.5억", () => {
    const d = guide("newlywed-tax-benefits-2026").description;
    expect(d).toContain("증여세 공제 한도 1.5억");
    expect(d).not.toContain("한시");
  });
  it("미국 국채: 연준 9/16 인상 뒤라 금리 인하 시기가 아니라 금리 변동 시기", () => {
    const d = guide("us-treasury-bond").description;
    expect(d).toContain("금리 변동 시기");
    expect(d).not.toContain("금리 인하 시기");
  });
  // 2026-10-05 재기반: 10/4 배포가 이 가이드 제목·설명·리드를 통째로 다시 써(월 50만원 → 60세 10억 주장 삭제, 월 50만원 = 약 6.1억 가정 명시)
  // GB-31 ⑤(82만 → 80만) 설명 교체는 대상 문장이 없어 싣지 않았다 — 10/4 문구가 정본.
  it("30대 노후: 설명이 월 50만원 → 60세 10억 을 말하지 않고 연 7% 적립 가정으로 쓴다", () => {
    const d = guide("retirement-planning-30s").description;
    expect(d).toContain("30세부터 월 50만원을 연 7%로 적립하는 가정");
    expect(d).not.toMatch(/매달 50만 적립.*10억/);
    const r = 0.07 / 12;
    const fv = (m: number) => m * ((Math.pow(1 + r, 360) - 1) / r);
    expect(fv(800_000)).toBeGreaterThan(970_000_000);
    expect(fv(500_000)).toBeLessThan(620_000_000);
  });
  it("가상자산: 양도세가 아니라 소득세 22%(지방세 포함)", () => {
    const d = guide("crypto-tax-2026").description;
    expect(d).toContain("소득세 22%");
    expect(d).not.toContain("양도세 22%");
  });
  it("수정일이 없는 4편은 날짜 칩을 만들지 않는다(modifiedDate·본문 정정일 표 모두 없음)", () => {
    for (const slug of ["samsung-medison-salary-2026", "newlywed-tax-benefits-2026", "sk-hynix-ps-forecast-2027", "crypto-tax-2026"]) {
      expect(guide(slug).modifiedDate, slug).toBeUndefined();
      expect(GUIDE_CONTENT_REVISED[slug], slug).toBeUndefined();
    }
  });
});

describe("쿠팡 야간 알바 — GA-19 (주휴수당은 야간가산 없는 기본 시급, 209시간 기준)", () => {
  const g = guide("coupang-fulfillment-night-pay-2026");
  const week = 209 / 48;
  const work = 17_000 * 40 * week;
  const holiday = (17_000 / 1.5) * 8 * week;
  it("계산식이 본문 숫자와 맞는다", () => {
    expect(Math.round(work / 10_000)).toBe(296);
    expect(Math.round(holiday / 10_000)).toBe(39);
    expect(Math.round((work + holiday) / 10_000)).toBe(336);
    expect(Math.round(17_000 / 1.5)).toBe(11_333);
  });
  it("실수령 291~296만원은 사이트 엔진으로 월 336만원·비과세 0~20만원을 넣은 값이다", () => {
    const net = (nonTaxable: number) => calculateSalary2026(3_360_000 * 12, nonTaxable, 1, 0).netPay;
    expect(Math.floor(net(0) / 10_000)).toBe(291);
    expect(Math.round(net(200_000) / 10_000)).toBe(296);
  });
  it("제목·설명·본문이 같은 336만원·실수령 291~296만원을 쓰고 옛 354만원·59만원·4.345주가 남지 않는다", () => {
    expect(g.title).toContain("월 336만원");
    expect(g.description).toContain("월 약 336만원, 실수령 291~296만원");
    expect(g.description).toContain("종소세 신고 없음");
    expect(g.description).not.toContain("종소세 신고 의무");
    expect(g.content).toContain("× 4.354주 = 약 296만원");
    expect(g.content).toContain("주휴수당 (주 8시간분 11,333원): 월 약 39만원 추가");
    expect(g.content).toContain("월 총수입: 약 336만원");
    expect(g.content).toContain("실수령 약 291~296만원");
    expect(g.content).toContain("월 약 310~340만원");
    for (const s of ["354만원", "59만원", "4.345주", "305~315", "280~330"]) expect(`${g.title} ${g.description} ${g.content}`).not.toContain(s);
  });
});
