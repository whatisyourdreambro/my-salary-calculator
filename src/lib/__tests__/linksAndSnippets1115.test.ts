// N2-app-pages-01 (2026-11-15 감사 app-pages-b01-F01·F02·F03, b02-F02) — 링크 대상과 검색·공유 문구 회귀 가드.
//
// 1) /auto-tax-2026 맨 끝 '함께 보면 좋은 계산기'(CoupangBanner 아래, 마지막 광고 아래): 첫 카드는
//    '자동차 취득세 계산기'라 적고 주택·토지 취득세 계산기로 갔다 → 차량 총보유비 계산기(/calc/car-total-ownership).
//    /car-loan 카드의 '체증 시뮬레이션'은 계산기에 없는 기능(원리금균등만) → '연봉별 차량 월 할부금 비교'.
// 2) /about 국민연금공단 출처 링크(옛 jsppage 주소는 2026-11-15 HTTP 500) → 보험료 안내
//    getOHAF0095M0.do(2026-11-15 열림, 9.5%·4.75%/4.75%·매년 0.5%p·2033년 13% 확인).
// 3) /chuseok-bonus-2026 검색 설명: 사람인 2025 조사 금액을 '2026 추석 상여금' 평균처럼 보이게 했고 '중소 59.1만원'은
//    실제로 100인 미만 행 → 경총 2026 조사(지급 계획 61.0%, 2026-09-17 발표)와 사람인 2025 규모별 평균을 나눠 적음.
// 4) /dashboard 검색 설명이 화면에 없는 '시간에 따른 자산 변화·이직 시나리오'를 약속 → 화면 문구(과거 이력 비교·
//    기기 간 동기화 없음)와 같게. 제목은 og:image 주소를 바꾸지 않도록 그대로.
// 모두 화면 높이가 바뀌지 않는 메타·링크이거나 마지막 광고 아래 카드다(광고 코드 무변경).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");
const flat = (s: string) => s.replace(/\s+/g, " ");

describe("/auto-tax-2026 함께 보면 좋은 계산기 카드", () => {
  const src = flat(readSrc("src/app/auto-tax-2026/page.tsx"));

  it("첫 카드는 차량 총보유비 계산기로 간다", () => {
    expect(src).toContain('href="/calc/car-total-ownership"');
    expect(src).toContain("차량 총보유비 계산기");
    expect(src).toContain("보험·세금·정비·연료비 월평균 비교");
  });

  it("없는 자동차 취득세 계산기·체증 시뮬레이션을 약속하지 않는다", () => {
    expect(src).not.toContain("자동차 취득세 계산기");
    expect(src).not.toContain("체증");
    expect(src).not.toContain('href="/tools/real-estate/acquisition-tax"');
    expect(src).toContain("연봉별 차량 월 할부금 비교");
  });
});

describe("/about 국민연금공단 출처 링크", () => {
  const src = readSrc("src/app/about/page.tsx");

  it("죽은 jsppage 주소 대신 보험료 안내 페이지를 쓴다", () => {
    expect(src).not.toContain("jsppage");
    expect(src).toContain('url: "https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do"');
  });
});

describe("/chuseok-bonus-2026 검색 설명", () => {
  const src = flat(readSrc("src/app/chuseok-bonus-2026/page.tsx"));

  it("사람인 2025 금액과 경총 2026 지급 계획 비율을 나눠 적는다", () => {
    expect(src).toContain(
      "2026 추석 상여금 지급 계획 61.0%(경총 2026 조사)와 사람인 2025 기업 규모별 평균(300인 이상 105.9만원·100인 미만 59.1만원)",
    );
    expect(src).not.toContain("중소 59.1만원");
    expect(src).toContain('description="300인 이상 평균 105.9만원(사람인 2025).');
  });
});

describe("/dashboard 검색 설명", () => {
  const src = flat(readSrc("src/app/dashboard/layout.tsx"));

  it("화면에 없는 이력·시나리오 기능을 약속하지 않는다", () => {
    expect(src).not.toContain("시간에 따른 자산 변화");
    expect(src).not.toContain("이직 시나리오");
    expect(src).toContain("과거 이력 비교나 기기 간 동기화는 제공하지 않습니다.");
  });

  it("제목과 noIndex 는 그대로다", () => {
    expect(src).toContain('title: "내 연봉 대시보드 - 저장한 결과 비교·시각화"');
    expect(src).toContain("noIndex: true");
  });
});
