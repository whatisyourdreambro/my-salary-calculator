// 현대모비스 성과급 계산기 — 2026 임단협 타결 반영 (R4 MOBIS, 패키지 N2-calc-19, 운영자 승인 2026-11-17 '권장대로')
//
// 공개 출처(2026-11-18 다시 확인):
//  - 더팩트 2026-08-26 (네이트 게재본 https://m.news.nate.com/view/20260826n34942): 잠정합의안 임금성 내용 —
//    기본급 10만원 인상·성과급 400%+1320만원·주식 8주·복지포인트 50만원.
//  - 더팩트 2026-09-04 https://news.tf.co.kr/read/ogmeta/2361989.htm: '현대모비스는 … 곧바로 올해 임단협을 마무리했다'.
//  - DART 2026-10-30 주요사항보고서(자기주식처분결정) rcpNo 20261030000571: 처분목적 '2026년 단체교섭에 따른 회사주식 지급',
//    96,136주, 처분 대상 주식가격 353,000원(이사회 결의 전일 2026-10-29 종가), 처분 예정 2026-11-30, 처분 상대방 회사 직원,
//    직원 개인 계좌 입고 또는 우리사주조합 출연(4년 의무예탁) 중 선택. 96,136 ÷ 8 = 12,017명.
//
// 운영자가 승인한 범위: 버튼 수 그대로(2024 합의 칩 → 2026 타결 칩), 기본값 2026, 머리 배지·안내 상자·하단 문구는 같은 폭으로
// 교체, 게시 전 광고 위치 실측. 그래서 광고 위 문구는 사이트 글꼴(src/app/fonts 서브셋 woff2)의 글자 폭으로 옛 문구와 줄 수를
// 견줘(keep-all 은 띄어쓰기에서만, 버튼 안 div 는 한글 음절 사이에서도 줄바꿈) 모든 폭에서 줄 수가 같거나 적은 것만 골랐다.
// 이 목록의 문구를 바꾸려면 같은 확인을 다시 하고 통합 스윕(320~1920px)에서 광고가 내려가지 않음을 본 뒤 목록을 갱신한다.
// 성과급 허브 카드·현대모비스 연봉 페이지의 계산기 안내(N2-data-09)는 승인 전이라 이 묶음에서 바꾸지 않는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const observed = vi.hoisted(() => ({ gross: [] as number[] }));
vi.mock("@/lib/bonusTaxCalc", async () => {
  const actual = await vi.importActual<typeof import("@/lib/bonusTaxCalc")>("@/lib/bonusTaxCalc");
  return {
    ...actual,
    calcBonusNet: (...args: Parameters<typeof actual.calcBonusNet>) => {
      observed.gross.push(args[1]);
      return actual.calcBonusNet(...args);
    },
  };
});

import MobisClient from "@/app/calc/hyundai-mobis-bonus/Client";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const norm = (s: string) => s.replace(/\s+/g, " ");
const PAGE = "src/app/calc/hyundai-mobis-bonus/page.tsx";
const CLIENT = "src/app/calc/hyundai-mobis-bonus/Client.tsx";
const text = (html: string) => norm(html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&"));

describe("계산기 기본값 = 2026 임단협 타결 (버튼 수 그대로)", () => {
  beforeEach(() => { observed.gross = []; });

  it("첫 화면: 2026 타결 칩이 기본 선택이고 세전 합계는 3,652만원(기본급 500만·주가 35.3만 = DART 공시 처분가, C-11)", () => {
    const html = renderToStaticMarkup(createElement(MobisClient));
    // 500만 × 400% + 1,320만 + 8주 × 35.3만 + 복지포인트 50만 — 주가 기본값은 2026-11-18 C-11 로 28만 → 35.3만
    // (r4bMisc2MobisPrice.test.ts 가 기본값·버튼·폭을 고정한다)
    expect(observed.gross).toEqual([20_000_000 + 13_200_000 + 8 * 353_000 + 500_000]);
    expect(observed.gross[0]).toBe(36_524_000);
    const t = text(html);
    expect(t).toContain("3,652만원");
    expect(t).toContain("= 월 기본급 500만 × 400%");
    expect(t).toContain("8주 × 35.3만원");
    expect(t).toContain("포인트·상품권");
    expect(t).toContain("포인트·상품권 50만원 복지포인트");
    // 시나리오 칩 2개(2026 → 2025) + 직접 입력 버튼 1개 — 칩이 늘면 광고 위 높이가 늘어난다
    const chips = [...t.matchAll(/(2026 임단협 타결 \(최신\)|2025 임단협 타결 \(실제 지급\)|2024 임협 합의)/g)].map((m) => m[0]);
    expect(chips).toEqual(["2026 임단협 타결 (최신)", "2025 임단협 타결 (실제 지급)"]);
    expect(t).toContain("🎛️ 직접 입력 (커스텀 시나리오)");
    expect(t).not.toContain("2026 타결안 나오면");
    // 세후 아래 줄 — 같은 세 숫자, '세전 '·'세율' 없이 (2026-11-18 통합 검토 RV-01: 직접 입력한 기본급에서 이 줄이 한 줄 더
    // 접혀 CalcResultAd 가 내려가던 폭을 없앰. 세전 합계는 바로 위 '총 성과급 (세전)' 상자)
    // 숫자는 R4 통합(2026-11-18)에서 C-11 주가 기본값 35.3만(efe317f1a)의 첫 화면 값으로 — 문구는 RV-01 그대로.
    // efe317f1a 를 되돌리면 28만 값('2,373만원3,594만원 − 공제 1,221만원 (실효 34%)')으로 돌아간다.
    const tight = norm(html.replace(/<[^>]+>/g, ""));
    expect(tight).toContain("2,407만원3,652만원 − 공제 1,245만원 (실효 34.1%)");
    expect(tight).not.toContain("세전 3,652만원 − 공제");
    expect(tight).not.toContain("실효세율");
  });

  it("2026 칩 설명·직접 입력 초기값은 보도·공시 값(400% · 1,320만 · 8주 · 복지포인트 50만)", () => {
    const src = norm(read(CLIENT));
    const block = src.slice(src.indexOf('id: "2026-settled"'), src.indexOf('id: "2025-settled"'));
    expect(block).toContain("bonusPercent: 400,");
    expect(block).toContain("fixedAmount: 13_200_000,");
    expect(block).toContain("freeShares: 8,");
    expect(block).toContain("voucher: 500_000,");
    expect(block).toContain(`desc: "성과금 400% + 격려금 1,320만 + 주식 8주 + 복지포인트 50만 (주식 11/30 지급, 기본급 월 +10만 별도)"`);
    expect(src).toContain(`useState<(typeof SCENARIOS)[number]["id"]>("2026-settled")`);
    expect(src).toContain("useState(400)");
    expect(src).toContain("useState(13_200_000)");
    expect(src).toContain("useState(8)");
    expect(src).not.toContain('id: "2024-settled"');
  });
});

describe("페이지 문구 — 협상 중·미확정 표현 제거, 출처는 보도·DART", () => {
  const page = norm(read(PAGE));

  it("옛 상태 문구가 남아 있지 않다", () => {
    for (const s of ["협상 진행 중", "잠정안(미확정)", "<strong>미확정</strong>", "2026-09-26 기준", "아직 반영하지 않았습니다", "반영 전입니다", "타결 시 본 계산기"]) {
      expect(page.includes(s), s).toBe(false);
    }
  });

  it("숨긴 HowTo JSON-LD 는 없고(R4 BONUS1 276c6db0a 제거), 옛 2024 시나리오 단계 문구도 남지 않는다", () => {
    // 화면에 나오지 않는 JSON-LD 문자열만(광고 위치와 무관). 11/20 판에서 칩에 맞춘 단계(703b79649)는 11/27 통합에서
    // BONUS1 의 RL-17 HowTo 제거로 블록째 빠졌다. 제거 가드는 bonusNoHowTo.test.ts, 여기서는 옛 문구가 돌아오지 않는지만.
    expect(page).not.toContain("HOW_TO_STEPS");
    expect(page).not.toContain("howToLd");
    expect(page).not.toContain("2024 합의 /");
    expect(page).not.toContain("직접 입력(2026 타결 시)");
  });

  it("메타 설명과 '신뢰' FAQ 답은 계산기 기준(2026 타결 보도·DART 공시 + 2025 타결 보도)을 적는다", () => {
    // 접힌 FAQ 답의 타결 사실(더팩트 8/26·9/4, DART 10/30)은 r4MobisFaq2026.test.ts 가 고정한다.
    expect(page).toContain(
      `"현대모비스 임단협 성과급·격려금 계산기. 본인 기본급(월)만 입력하면 2026 타결안 성과금 400% + 격려금 1,320만원 + 주식 8주 + 포인트 50만원 합산 세전·세후 실수령액이 즉시. 2026 타결 + 2025 타결 시나리오 비교, 주식 11/30 지급(DART 공시) 반영."`
    );
    expect(page).toContain(
      "본 계산기는 2026년 임단협 타결 보도(더팩트 2026-08-26·2026-09-04)와 DART 자기주식 처분 공시(2026-10-30), 2025년 10월 임단협 타결 보도(전자신문·서울경제·아주경제·뉴스웍스) 기반 추정 모델입니다."
    );
    expect(page).not.toContain("2024 합의 시나리오 비교");
  });
});

// 광고 위 문구 — 폭 모델로 옛 문구보다 모든 폭에서 줄 수가 같거나 적음을 확인한 값(통합 스윕에서 실측).
// 옛 문구 → 새 문구 (글꼴 폭 합계): 배지 214.9 → 202.9px(12px), 소개 굵은 글 416.0 → 382.4px(16px),
// 칩 제목 156.2 → 140.7px, 칩 설명 531.5 → 497.8px, 직접 입력 239.8 → 173.8px, 상자 제목 202.5 → 171.3px,
// 상자 항목 161.3/246.0/274.8 → 133.8/208.7/239.1px, 상자 출처 338.8 → 318.4px, 안내 상자 1013.5 → 984.9px,
// 하단 출처 1596.2 → 1585.9px, FAQ 질문 184.8 → 150.7px.
const ABOVE_AD_PAGE = [
  `<Cog className="w-3.5 h-3.5" /> 2026 임단협 타결 반영 + 주식 11/30 지급 </div>`,
  `<strong>성과금 400% + 격려금 1,320만 + 주식 8주 + 포인트 50만</strong>{" "} 합산 세전·세후 실수령액이 즉시 계산됩니다.`,
  `<h3 className="font-bold mb-2 text-lg">📢 2026 임단협 (타결)</h3>`,
  `<li>• 기본급 월 <strong>10만원</strong> 인상</li>`,
  `<li>• 성과금 <strong>400%</strong> + 격려금 <strong>1,320만원</strong></li>`,
  `<li>• 주식 <strong>8주</strong>(11/30 지급)·복지포인트 50만원</li>`,
  `<li>• 현대차 8/31 <strong>가결</strong>(성과금 400%·1,270만, 주식 15주)</li>`,
  `더팩트 2026-08-26·09-04 보도, 주식 지급은 DART 10/30 공시.`,
  `2026년 임단협 타결 보도·DART 공시 + 2025년 10월 타결 공개 보도 기반 추정. 실제 지급은 직군·근속·평가에 따라 차이 가능하며, 주식 평가액은 지급 시점 주가에 따라 달라집니다.`,
  `{CURRENT_RATES_YEAR} 세법 반영. 2026년분 임단협은 타결(2026-09 보도).`,
  `question: "주식 8주는 얼마인가요?"`,
];
const ABOVE_AD_CLIENT = [
  `label: "2026 임단협 타결 (최신)",`,
  `🎛️ 직접 입력 (커스텀 시나리오)`,
  `<ResultCard label="포인트·상품권" value={fmtManwon(calc.voucherWon)} sub={calc.voucherWon > 0 ? scenario.voucherLabel : "해당 시나리오 상품권 없음"} />`,
  `voucherLabel: "복지포인트",`,
  `voucherLabel: "재래시장상품권",`,
  // 결과 카드 세후 아래 줄(CalcResultAd 바로 위): 2025 기본값의 옛 줄 '세전 … − 공제 … (실효세율 …%)'보다 어떤 입력에서도
  // 16px 이상 짧다(사이트 글꼴 폭, 기본급 0~3,000만·주가 0~100만·세액공제·4대보험·직접 입력). 통합 검토 RV-01(2026-11-18).
  `{fmtEok(calc.totalGross)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "} (실효 <strong>{calc.tax.effectiveRate}%</strong>)`,
];

describe("광고 위 문구는 폭을 맞춘 값 그대로다", () => {
  it.each(ABOVE_AD_PAGE)("page.tsx: %s", (s) => {
    expect(norm(read(PAGE))).toContain(s);
  });
  it.each(ABOVE_AD_CLIENT)("Client.tsx: %s", (s) => {
    expect(norm(read(CLIENT))).toContain(s);
  });
  it("2026 상자 항목은 4개 그대로(2025 상자 5개와 나란히) — 줄이 늘면 GuideMidAd 가 내려간다", () => {
    const page = norm(read(PAGE));
    const card = page.slice(page.indexOf("📢 2026 임단협 (타결)"), page.indexOf("</article>", page.indexOf("📢 2026 임단협 (타결)")));
    expect(card.match(/<li>/g)?.length).toBe(4);
  });
});
