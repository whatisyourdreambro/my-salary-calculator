// RL-08 재착지(2026-11-15) — 10월 claude/fix-content-1030 의 부동산 세금 가이드·LTV 계산기·복지 가이드 사실 정정 가드.
//
// 10월 커밋 522f2fab2·cb6845365·8b46a5e36·0864b0d3a·1385d7937·170f75eeb·25bc65494·cf268e726 을 지금 base(bda78b0da) 위에 다시
// 얹었다. 10월 contentFix1102AdNeutral.test.ts(광고 위 같은 폭 이하 문구·보강 가드)를 이 파일로 옮겨 왔다.
// - 광고 위 문구는 운영 문구보다 넓지 않게 고쳤다(사이트 글꼴 hmtx 폭 — 커밋 메시지). 광고 위치 판정은 가드 스윕이 한다.
// - 원 단위 공식 수치·지역별 금액은 마지막 광고 아래 보강(supplements-2026-11.ts)에 있다.
// - 수치 출처는 각 커밋 메시지(국세청·보건복지부·기후에너지환경부·금융위·국토부, 2026-11-15 다시 확인).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { getCalculatorBySlug } from "@/lib/simpleCalculators";
import { LTV_NO_HOME, MORTGAGE_CAP_TIERS } from "@/lib/bonusHome/loanRules";
import { getGuideContentDate } from "@/lib/guideContentRevisions";
import { GUIDE_SITEMAP_ONLY_REVISED, RL08_EDIT_DAY, getGuideSitemapDate } from "@/lib/guideSitemapDates";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`no guide ${slug}`);
  return g;
};

describe("상가·오피스텔 양도세 — 장기보유공제 20%, 약 1.46억 (522f2fab2·cb6845365·170f75eeb)", () => {
  const g = guide("commercial-office-capital-gains-2026");
  it("본문 시뮬·제목·설명이 정정 값이다", () => {
    expect(g.content).toContain("<li>· 장기보유공제 20% (보유 10년)</li>");
    expect(g.content).toContain("<li>· 과세표준 3.975억</li>");
    expect(g.content).toContain("<li>· 양도세 1억 3,306만원 + 지방세 1,331만원 = <strong>약 1.46억</strong></li>");
    expect(g.title).toBe("상가·오피스텔 양도세 — 7억→12억 매도 1.46억 부담");
    expect(g.description).toContain("차익 5억, 장기보유공제 20% 시 약 1.46억 세금.");
    for (const s of [g.title, g.description, g.content]) {
      expect(s).not.toContain("1.25억");
      expect(s).not.toContain("공제 30%");
    }
  });
  it("사이트 양도세 간편 계산기와 같은 값이다(7억 → 12억, 10년: 146,366,000원)", () => {
    const calc = getCalculatorBySlug("real-estate-capital-gains-quick");
    expect(calc).toBeDefined();
    const r = calc!.compute({ buy: 700_000_000, sell: 1_200_000_000, years: 10 });
    expect(r.primary.value).toBe(146_366_000);
    // 과세표준 3.975억 = 5억 x (1 - 20%) - 250만, 국세 1억 3,306만 + 지방세 1,331만(반올림)
    expect(500_000_000 * 0.8 - 2_500_000).toBe(397_500_000);
    expect(Math.round(397_500_000 * 0.4 - 25_940_000)).toBe(133_060_000);
  });
});

describe("전세권·임차권 양도세 — 2년 이상 기본세율, 2년 미만 단기 40~50% (522f2fab2)", () => {
  const g = guide("lease-right-transfer-tax-2026");
  it("사례·설명", () => {
    expect(g.content).toContain("보유 3년이라 기본 세율 6~45% 적용.</p>");
    expect(g.description).toContain("2년 미만은 단기 세율 40~50%.");
    expect(g.content).not.toContain("단기 세율 45%");
    expect(g.description).not.toContain("단기 세율 45%");
  });
});

describe("자녀 증여 10년 룰 — 신고기한 증여월 말일부터 3개월 (522f2fab2)", () => {
  const g = guide("child-gift-10year-rule-2026");
  it("신고 줄", () => {
    expect(g.content).toContain("<li>· <strong>증여세 신고</strong>: 비과세라도 신고 권장 (증여월 말일부터 3개월)</li>");
    expect(g.content).not.toContain("다음달 말일");
  });
});

describe("임대 등록 종부세 합산배제 — 3주택 18억 산출 318만원 (522f2fab2·cb6845365)", () => {
  const g = guide("rental-business-prop-tax-exclusion-2026");
  it("요건·효과 예시·제목·설명", () => {
    expect(g.content).toContain("<li>· <strong>임대 기간</strong>: 10년 장기 또는 6년 단기 등록 (6년 단기는 아파트 제외)</li>");
    expect(g.content).toContain("<li>· <strong>등록 전</strong>: 18억 전체 종부세 산출 → 318만원/년</li>");
    expect(g.content).toContain("<li>· <strong>연 절감: 산출 318만원</strong></li>");
    expect(g.title).toBe("부동산 임대업 등록 종부세 합산 배제 — 다주택자 연 수백만 원 절세");
    expect(g.description).toContain("3주택자 종부세 318만원 → 본채만 0원으로 절감.");
    expect(g.content).not.toMatch(/1,800만원/);
    expect(g.title).not.toMatch(/1,800만원/);
    expect(g.description).not.toMatch(/1,800만원/);
    expect(g.content).not.toContain("10년 단기");
  });
  it("318만원 = (18억 - 공제 9억) x 공정시장가액비율 60% = 5.4억에 0.5%·0.7% 누진", () => {
    const base = (1_800_000_000 - 900_000_000) * 0.6;
    expect(base).toBe(540_000_000);
    expect(Math.round(300_000_000 * 0.005 + (base - 300_000_000) * 0.007)).toBe(3_180_000);
  });
});

describe("내 집 마련 로드맵 — 주담대는 5억×60%, 4억·4.5억은 자금 확보 (522f2fab2·cb6845365)", () => {
  const g = guide("first-home-2026-strategy");
  it("공식 두 줄", () => {
    expect(g.content).toContain("<li>종잣돈 1억 + 주담대 3억(5억×60%) = 4억 확보</li>");
    expect(g.content).toContain("<li>+ 신용대출 5,000만 = 4.5억 확보</li>");
    expect(g.content).not.toContain("(LTV 60%) = 4억 매수 가능");
  });
});

describe("LTV 계산기 — 규제지역 무주택 LTV 40%, 서울 25구·경기 15곳 (522f2fab2)", () => {
  const src = readFileSync(resolve(process.cwd(), "src/app/tools/real-estate/ltv/page.tsx"), "utf8");
  it("단계 1·한도 목록·접힌 FAQ 2개가 10·15 대책 기준이다", () => {
    expect(src).toContain('text: "매수 주택이 규제지역(서울 25구 등) vs 비규제. 지정은 수시 갱신."');
    expect(src).toContain("<strong>규제지역 1주택 매수</strong>: LTV 40% (서울·경기 15곳)");
    expect(src).toContain("무주택자(처분조건부 1주택자 포함) 기준 규제지역 40%(10·15 대책, 2025-10-16 시행), 비규제지역 70%");
    expect(src).toContain("시가 15억 이하 6억, 15억 초과~25억 4억, 25억 초과 2억");
    expect(src).toContain("2026-07-01부터 화성 동탄구·용인 기흥구·구리시가 추가");
    expect(src).not.toContain("규제지역 50%");
    expect(src).not.toContain("LTV 50% (강남3구");
    expect(src).not.toContain("강남3구·용산구 일부가 규제지역");
  });
  it("사이트 정본 loanRules 와 같은 값이다", () => {
    expect(LTV_NO_HOME.regulated).toBe(0.4);
    expect(LTV_NO_HOME.nonRegulated).toBe(0.7);
    expect(MORTGAGE_CAP_TIERS.map((t) => t.cap)).toEqual([600_000_000, 400_000_000, 200_000_000]);
    expect(MORTGAGE_CAP_TIERS.slice(0, 2).map((t) => t.maxPrice)).toEqual([1_500_000_000, 2_500_000_000]);
  });
});

describe("아동수당 — 대상·금액 줄과 지역별 금액 보강 (0864b0d3a·25bc65494·170f75eeb)", () => {
  const g = guide("child-support-100-2026");
  it("광고 위 대상·금액 줄은 만 0~8세·월 10만~12만원 범위다", () => {
    expect(g.content).toContain("<li>· 대상: 만 0~8세 모든 아동 (출생~만 9세 생일 전월)</li>");
    expect(g.content).toContain("<li>· 금액: 월 10만~12만원</li>");
    expect(g.title).toBe("아동수당 — 만 0~8세 월 10만원 + 부모급여 100만원 중복");
  });
  it("지역별 금액(수도권 10만원·비수도권 10만 5천원·인구감소지역 11만~12만원)은 마지막 광고 아래 보강에 있다", () => {
    const s = guideSupplements["child-support-100-2026"] ?? "";
    expect(s).toContain("만 9세 미만(만 0~8세)");
    expect(s).toContain("수도권 10만원, 비수도권 10만 5천원, 인구감소지역 11만~12만원");
    expect(s).toContain("2030년 13세 미만");
    expect(s).toContain("보건복지부 보도자료");
    expect(s).not.toMatch(/자주 묻는 질문/);
  });
});

describe("에너지바우처 2026 — 공식 금액·기간·대상 (8b46a5e36·25bc65494·170f75eeb)", () => {
  const g = guide("energy-voucher-2026");
  it("광고 위 리드·자격·금액·기간·신청 문구와 제목·설명", () => {
    expect(g.content).toContain("1인 약 30만원, 4인 이상 약 70만원.");
    expect(g.content).toContain("2026년 다자녀 추가.</p>");
    expect(g.content).toContain("<li>· 기초수급 가구 중 노인·영유아 등</li>");
    expect(g.content).toContain("<li>· 여름 7~9월 + 겨울 10~5월 사용</li>");
    expect(g.content).toContain("<li>· 1인 약 30만·2인 41만·3인 53만·4인+ 70만원</li>");
    expect(g.content).toContain("<p>6~12월 주소지 주민센터 또는 복지로 신청.");
    expect(g.title).toBe("에너지바우처 — 4인 가구 70만원 + 여름/겨울 냉난방");
    expect(g.description).toBe("기초수급 7~9월·10~5월 사용. 1인 30만·2인 41만·3인 53만·4인+ 70만. 전기·가스·등유·연탄 결제.");
    for (const old of ["14만", "11~3월", "6~7월", "차상위·한부모"]) {
      expect(g.content, old).not.toContain(old);
      expect(g.description, old).not.toContain(old);
    }
  });
  it("공식 원문 수치는 보강에 그대로 있다", () => {
    const s = guideSupplements["energy-voucher-2026"] ?? "";
    expect(s).toContain("1인 295,200원·2인 407,500원·3인 532,700원·4인 이상 701,300원");
    expect(s).toContain("2026년 6월 15일부터 12월 31일까지");
    expect(s).toContain("2027년 5월 31일까지");
    expect(s).not.toMatch(/자주 묻는 질문/);
  });
  it("수정 칩 숫자는 운영 값 2026-10-03 그대로이고 사이트맵 날짜만 실제 수정일이다", () => {
    expect(g.modifiedDate).toBe("2026-10-03");
    expect(getGuideContentDate(g)).toBe("2026-10-03");
    expect(getGuideSitemapDate(g)).toBe(RL08_EDIT_DAY);
  });
});

describe("최저임금·부업 가이드 문장 (8b46a5e36·cf268e726)", () => {
  it("minimum-wage-2026: 월급제 유급 시간은 연 2,508시간(주휴 포함), 통상 월급 ÷ 209시간", () => {
    const g = guide("minimum-wage-2026");
    expect(g.content).toContain("(주 40시간 기준 연 2,508시간·주휴 포함, 통상 월급 ÷ 209시간)");
    expect(g.content).not.toContain("2,088~2,508시간");
    expect(209 * 12).toBe(2508);
  });
  it("side-hustle-tax-2026: IRP·연금저축은 세액공제(결정세액), 과세표준이 아니다", () => {
    const g = guide("side-hustle-tax-2026");
    expect(g.content).toContain("<li><strong>IRP·연금저축 추가 납입</strong>: 부업 소득 늘어도 세액공제로 결정세액 낮춤</li>");
    expect(g.content).not.toContain("IRP로 과세표준");
  });
});

describe("RL-08 날짜 — 화면 칩은 새로 생기거나 바뀌지 않고, 사이트맵 전용 행만 실제 수정일", () => {
  it("행이 있는 4편은 RL08_EDIT_DAY, 행 없는 5편은 화면·사이트맵 모두 종전 값(칩 없음)", () => {
    expect(RL08_EDIT_DAY).toBe("2026-11-15");
    for (const slug of ["child-support-100-2026", "energy-voucher-2026", "first-home-2026-strategy", "side-hustle-tax-2026"]) {
      expect(GUIDE_SITEMAP_ONLY_REVISED[slug], slug).toBe(RL08_EDIT_DAY);
    }
    for (const slug of [
      "commercial-office-capital-gains-2026", "lease-right-transfer-tax-2026", "child-gift-10year-rule-2026",
      "rental-business-prop-tax-exclusion-2026", "minimum-wage-2026",
    ]) {
      const g = guide(slug);
      expect(slug in GUIDE_SITEMAP_ONLY_REVISED, slug).toBe(false);
      expect(g.modifiedDate, slug).toBeUndefined();
      expect(getGuideContentDate(g), slug).toBe(g.publishedDate);
    }
  });
});
