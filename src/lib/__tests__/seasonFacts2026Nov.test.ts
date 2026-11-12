// 2026-11-13 시즌 사실 정정 묶음(lens-season, RL-14 재작성) 회귀 가드 — 원문 확인 출처:
//  · 국세청 정책뉴스 2026-10-23 「13월의 월급, 나는 얼마나 받을까?」(정책브리핑 newsId=148974171):
//    미리보기 이용 기간 2026.10.28.(수)~12.18.(금), 경로 장려금·연말정산·기부금 → 편리한 연말정산 → 연말정산 미리보기
//  · 국세청 보도자료 2026-11-02 「5월에 놓친 근로·자녀장려금, 12.1.까지 꼭 신청」(nts.go.kr nttSn=1355806)
//  · 조세특례제한법 시행령 제95조 제2항 제1호 가목·제5항, 제121조의2 제18항(개정·신설 2026. 2. 27.)
// 광고 위 문구는 같은 폭 이하로만 바꿨다 — 폭은 가드 스윕이 판정하고, 이 파일은 사실과 옛 문구 제거만 본다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { YEAR_END_CALENDAR, YEAR_END_STEPS } from "@/data/yearEndTaxHub";
import { EARNED_INCOME_CREDIT_FAQ } from "@/app/earned-income-credit/faq";
import { SEASONAL_LINKS_OCT } from "@/app/table/2026/SeasonalLinks";
import { YEAR_END_LIMIT_FAQS } from "@/lib/yearEndLimits2026";

const read = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

describe("연말정산 미리보기 2026년 귀속 운영 기간 10/28~12/18 (F02~F05)", () => {
  it("미리보기 페이지 히어로·CTA·절차 2단계에 옛 예년 오픈 문구가 없다", () => {
    const src = read("src/app/year-end-tax-preview/page.tsx");
    expect(src).toContain('<strong className="text-navy">10월 28일~12월 18일</strong>');
    expect(src).toMatch(/2026년 귀속분 운영 기간은\{" "\}/);
    expect(src).toMatch(/국세청\s+10월 23일 안내 기준\./);
    expect(src).toContain("'장려금·연말정산·기부금 → 편리한 연말정산 → 연말정산 미리보기' 경로로 들어갑니다(2026년 국세청 안내 기준).");
    for (const stale of ["오픈을 기다릴 필요 없습니다", "전자기부금", "확정 일정을 반영합니다", "확정 일자를 반영합니다"]) {
      expect(src, stale).not.toContain(stale);
    }
  });

  it("연말정산 허브 — 1단계 기간·캘린더 첫 행", () => {
    const preview = YEAR_END_STEPS.find((s) => s.id === "preview")!;
    expect(preview.period).toBe("지금 ~ 12월");
    expect(YEAR_END_CALENDAR[0]).toMatchObject({ period: "10월 28일~12월 18일", event: "홈택스 '연말정산 미리보기' 운영" });
  });

  it("12월 점검 페이지 팁 — 운영 기간", () => {
    const src = read("src/app/year-end-tax-settlement-2026/page.tsx");
    expect(src).toMatch(/운영 기간은 10월\s+28일~12월 18일입니다/);
    expect(src).not.toContain("예년 기준 10월");
  });

  it("미리보기 활용법 가이드 — 개통 미정·예상 문장이 없고 FAQ 는 접속 전 준비", () => {
    const src = read("src/lib/guides/autumn-2026-season.ts");
    const start = src.indexOf('slug: "hometax-year-end-preview-2026"');
    const body = src.slice(start, src.indexOf("slug:", start + 10));
    expect(body).toContain("<strong>2026년 10월 28일~12월 18일</strong>입니다(국세청 안내, 정책브리핑 2026-10-23)");
    expect(body).toContain("운영 기간(10월 28일~12월 18일)");
    expect(body).toContain("Q. 접속 전에 미리 할 수 있는 준비는요?");
    for (const stale of ["아직 공지되지 않았습니다", "개통 전인 지금", "10월 말~11월 중순(예상)", "개통 공지가 뜨면"]) {
      expect(body, stale).not.toContain(stale);
    }
  });
});

describe("근로장려금 기한 후 신청 마감 12월 1일 (F07)", () => {
  it("광고 위 상자와 FAQ", () => {
    expect(read("src/app/earned-income-credit/EarnedIncomeCreditContent.tsx")).toContain("기한 후 신청 (6월 2일 ~ 12월 1일)");
    const late = EARNED_INCOME_CREDIT_FAQ.find((f) => f.question.includes("기한 후 신청"))!;
    expect(late.answer).toContain("2026년 12월 1일(화)까지");
    expect(late.answer).toContain("95%만 지급");
    expect(late.answer).not.toContain("11월 30일");
  });
});

describe("2026 시행령 — 월세 100㎡·주말부부 요건·카드 자녀 요건 (F09, 검증 누락 2번)", () => {
  it("월세 페이지 접힌 FAQ·HowTo 와 /year-end-tax 한도 FAQ 에 3자녀 이상 100㎡", () => {
    const rent = read("src/app/rent-tax-credit-2026/page.tsx");
    expect(rent).toContain("국민주택규모(전용 85㎡, 기본공제 대상 자녀·손자녀가 3명 이상이면 100㎡) 이하 또는 기준시가 4억원 이하 주택 임차");
    expect(rent).toContain("전용 85㎡(자녀·손자녀 3명 이상은 100㎡) 이하 또는 기준시가 4억원 이하");
    expect(rent).toContain("조세특례제한법 시행령 제95조 제5항");
    const ye = YEAR_END_LIMIT_FAQS.find((f) => f.question.startsWith("월세 세액공제"))!;
    expect(ye.answer).toContain("자녀·손자녀가 3명 이상이면 100㎡ 이하");
  });

  it("카드 공제 FAQ — 한도에 세는 자녀 20세 이하·소득 요건·다른 거주자 기본공제 제외", () => {
    const card = read("src/app/credit-card-deduction-2026/page.tsx");
    expect(card).toContain("한도에 세는 자녀는 20세 이하(장애인은 나이 제한 없음)");
    expect(card).toContain("조세특례제한법 시행령 제121조의2 제18항");
  });
});

describe("2026 세법 변경사항 FAQ·시즌 블록 제목 (F10, F11)", () => {
  it("변경사항 FAQ 에 국세청 10월 안내 항목, 수정일 두 곳이 같다", () => {
    const src = read("src/app/tax-changes-2026/page.tsx");
    for (const s of ["고향사랑기부금 10만원 초과 20만원 이하 구간 40% 공제", "3자녀 이상 가구의 주택 면적 기준 완화(100㎡)", "국민참여형 국민성장펀드 소득공제"]) {
      expect(src, s).toContain(s);
    }
    const modified = src.match(/modifiedTime: "(\d{4}-\d{2}-\d{2})"/)?.[1];
    const updated = src.match(/updatedDate="(\d{4}-\d{2}-\d{2})"/)?.[1];
    expect(modified).toBe(updated);
  });

  it("OCT 시즌 세트 제목은 11월(11/30 까지 걸림)", () => {
    expect(SEASONAL_LINKS_OCT.heading).toBe("연말정산 미리 준비 — 11월 시즌 체크리스트");
  });
});
