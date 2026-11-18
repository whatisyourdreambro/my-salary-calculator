// 현대모비스 성과급 계산기 주가 기본값 = DART 공시 처분가 353,000원
// (R4 2차 MISC2, 운영자 질문 C-11 — 2026-11-18 승인, 광고가 하나도 내려가지 않을 때만 유지)
//
// 출처(2026-11-18 DART 원문 다시 읽음): 현대모비스 주요사항보고서(자기주식처분결정) 2026-10-30, rcpNo 20261030000571 —
//   2. 처분 대상 주식가격(원) 보통주식 353,000 / 4. 처분예정기간 2026-11-30 / 5. 처분목적 '2026년 단체교섭에 따른 회사주식 지급'
//   / 13. '이사회 결의일 전일 종가(※2026년 10월 29일 종가) 기준이며, 향후 주가 변동에 따라 변동될 수 있음'.
// 지급일 주가 예측이 아니라 날짜가 박힌 공시 기준가라서 화면 문구는 'DART 10/30 공시 처분가(10/29 종가)'다.
//
// 광고 위 폭 규칙: 3단계 상자(빠른 값 버튼·안내 문장)와 결과 상자(세후 줄)는 CalcResultAd 바로 위다.
//  - 빠른 값 버튼은 4개 그대로, 라벨(12px 굵게 700)은 자리마다 종전 이하 폭: 24만→27만, 28만→32만, 32만→37만, 36만→42만.
//    지금 값과 같은 버튼을 강조하는 상태는 없다(클래스 고정).
//  - 세후 줄 '세전 X − 공제 Y (실효세율 Z%)' 는 기본값 35.3만에서 '세전 3,652만원 − 공제 1,245만원 (실효세율 34.1%)' 가
//    되어 종전(28만) 줄보다 10.9px 넓어지고, 결과 상자 글 폭 244.5~255.25px(화면 약 370~381px)에서 한 줄 늘어 결과 광고가
//    내려갈 자리였다. 그래서 바로 위 '총 성과급 (세전)' 상자와 같은 값인 '세전 ' 앞말을 뺐다(모든 상태에서 줄이 좁아진다).
//  - 3단계 안내 문장·'주식 8주' FAQ 답은 같은 폭 이하이고, keep-all 줄 수가 어느 폭에서도 늘지 않는다.
// 글꼴 단위는 사이트 글꼴 MoneySalaryText 를 fontTools 로 wght 400·700 인스턴스해 잰 advance(unitsPerEm 2048)다 —
// 한글 음절은 모두 1770, 숫자는 비례. 표에 없는 새 글자는 테스트가 실패한다(먼저 재고 표에 넣을 것).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MobisClient from "@/app/calc/hyundai-mobis-bonus/Client";
import { CALC_NEWS_NOTES } from "@/components/CalcNewsNote";
import { calcBonusNet, DEFAULT_BONUS_CREDIT_RATE, fmtEok } from "@/lib/bonusTaxCalc";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");
const norm = (s: string) => s.replace(/\s+/g, " ");
const CLIENT = norm(read("src/app/calc/hyundai-mobis-bonus/Client.tsx"));
const PAGE = norm(read("src/app/calc/hyundai-mobis-bonus/page.tsx"));

/** 사이트 글꼴 서브셋 6종의 unicode-range 합집합 */
function siteFontCodepoints(): Set<number> {
  const source = read("src/app/fonts/siteFonts.generated.ts");
  const set = new Set<number>();
  for (const range of source.matchAll(/prop: "unicode-range", value: "([^"]+)"/g)) {
    for (const part of range[1].split(",")) {
      const [first, last = first] = part.trim().slice(2).split("-").map((v) => parseInt(v, 16));
      for (let code = first; code <= last; code++) set.add(code);
    }
  }
  return set;
}
const FONT = siteFontCodepoints();
const outsideFont = (text: string) =>
  [...new Set([...text].filter((ch) => ch.codePointAt(0)! > 127 && !FONT.has(ch.codePointAt(0)!)))];

/** MoneySalaryText advance (2026-11-18 fontTools 측정, unitsPerEm 2048) */
const ADV: Record<400 | 700, Record<string, number>> = {
  400: {
    "0": 1220, "1": 898, "2": 1202, "3": 1264, "4": 1278, "5": 1222, "6": 1256, "7": 1130, "8": 1242, "9": 1256,
    " ": 514, ".": 520, ",": 528, "(": 698, ")": 698, "%": 1766, "/": 684, "−": 1284, "×": 1284, "-": 886, "'": 412,
    D: 1404, A: 1322, R: 1246, T: 1252,
  },
  700: {
    "0": 1352, "1": 960, "2": 1251, "3": 1309, "4": 1346, "5": 1284, "6": 1317, "7": 1179, "8": 1317, "9": 1317,
    " ": 473, ".": 578, ",": 588, "%": 1965,
  },
};
const HANGUL = 1770;
type Run = [string, 400 | 700];
function adv(ch: string, weight: 400 | 700): number {
  if (/[가-힣]/.test(ch)) return HANGUL;
  const v = ADV[weight][ch];
  if (v === undefined) throw new Error(`advance 표에 없는 글자: ${JSON.stringify(ch)} (wght ${weight})`);
  return v;
}
const px = (units: number, size: number) => (units / 2048) * size;
const widthOf = (runs: Run[], size: number) => runs.reduce((s, [t, w]) => s + [...t].reduce((a, ch) => a + px(adv(ch, w), size), 0), 0);

/** keep-all(띄어쓰기에서만 줄바꿈) 탐욕 줄 수 */
function lineCount(runs: Run[], size: number, width: number): number {
  const words: { w: number; space: number }[] = [];
  let cur = 0;
  for (const [text, weight] of runs) {
    for (const ch of text) {
      if (ch === " ") {
        words.push({ w: cur, space: px(adv(" ", weight), size) });
        cur = 0;
      } else cur += px(adv(ch, weight), size);
    }
  }
  words.push({ w: cur, space: 0 });
  let n = 1;
  let line = 0;
  for (const { w, space } of words) {
    if (w > width) throw new Error("한 낱말이 줄보다 넓다 — 이 모형 범위 밖");
    if (line > 0 && line + w > width + 1e-6) {
      n += 1;
      line = 0;
    }
    line += w + space;
  }
  return n;
}
/** 새 글이 종전보다 줄이 많아지는 폭 목록(0.25px 간격) */
function widthsWithMoreLines(oldRuns: Run[], newRuns: Run[], size: number, min: number, max: number): number[] {
  const worse: number[] = [];
  for (let w = min; w <= max; w += 0.25) if (lineCount(newRuns, size, w) > lineCount(oldRuns, size, w)) worse.push(w);
  return worse;
}

describe("주가 기본값과 빠른 값 버튼 (C-11)", () => {
  it("기본값은 353_000(DART 2026-10-30 공시 처분가, 10/29 종가)이고 출처가 주석에 있다", () => {
    expect(CLIENT).toContain("const DEFAULT_MOBIS_STOCK = 353_000;");
    expect(CLIENT).toContain("rcpNo 20261030000571");
    expect(CLIENT).toContain("이사회 결의 전일(2026-10-29) 종가");
    expect(CLIENT).not.toContain("280_000");
  });

  it("빠른 값 버튼은 4개 그대로 27·32·37·42만, 라벨은 자리마다 종전 이하 폭(12px 굵게)", () => {
    expect(CLIENT).toContain("{[270_000, 320_000, 370_000, 420_000].map((p) => (");
    expect(CLIENT).toContain("{(p / 10000).toFixed(0)}만");
    const html = renderToStaticMarkup(createElement(MobisClient));
    const labels = [...html.matchAll(/>(\d+)만<\/button>/g)].map((m) => m[1]);
    // 월 기본급 버튼 5개(300~700만) 뒤에 주가 버튼 4개
    expect(labels).toEqual(["300", "400", "500", "600", "700", "27", "32", "37", "42"]);
    const OLD = ["24만", "28만", "32만", "36만"];
    const NEW = ["27만", "32만", "37만", "42만"];
    NEW.forEach((label, i) => {
      expect(widthOf([[label, 700]], 12), `${OLD[i]} -> ${label}`).toBeLessThanOrEqual(widthOf([[OLD[i], 700]], 12));
    });
  });

  it("주가 버튼에 지금 값 강조 상태가 없다(클래스 고정) — 눌러도 상자 크기가 그대로", () => {
    expect(CLIENT).toContain(
      `onClick={() => setStockPrice(p)} className="py-1.5 rounded-md border border-canvas-deep text-xs font-bold hover:border-primary/40 transition" >`
    );
  });
});

describe("첫 화면(서버 렌더 = 수화 뒤 기본 상태) 결과 — 기본급 500만·2026 타결·주가 35.3만", () => {
  const html = renderToStaticMarkup(createElement(MobisClient));
  const plain = norm(html.replace(/<[^>]+>/g, ""));

  it("주가 칸은 353,000(입력 칸 너비 고정), 주식 가치는 8주 × 35.3만원 = 282만원", () => {
    expect(html).toContain('aria-valuenow="353000" value="353,000"');
    expect(plain).toContain("8주 × 35.3만원");
    expect(plain).toContain("282만원");
    expect(8 * 353_000).toBe(2_824_000);
  });

  it("세전 3,652만원(추정 연봉 대비 41%), 세후 2,407만원, 세후 줄은 '세전 ' 앞말 없이", () => {
    const tax = calcBonusNet(500 * 10_000 * 18, 36_524_000, DEFAULT_BONUS_CREDIT_RATE, true);
    expect([fmtEok(tax.net), fmtEok(tax.totalDeductions), tax.effectiveRate]).toEqual(["2,407만원", "1,245만원", 34.1]);
    expect(plain).toContain("3,652만원");
    expect(plain).toContain("추정 연봉 대비 41%");
    expect(plain).toContain("2,407만원");
    expect(plain).toContain("3,652만원 − 공제 1,245만원 (실효세율 34.1%)");
    expect(plain).not.toContain("세전 3,652만원 − 공제");
    expect(CLIENT).toContain(`{fmtEok(calc.totalGross)} − 공제 {fmtEok(calc.tax.totalDeductions)}{" "} (실효세율 <strong>{calc.tax.effectiveRate}%</strong>)`);
  });
});

// 세후 줄: 종전(next-1120 = 28만, '세전 ' 앞말 있음) 대 지금. 결과 상자 글 폭은 화면 320px 에서 약 194px, 가장 넓을 때 866px.
type Sc = { bp: number; fx: number; sh: number; v: number };
const S2026: Sc = { bp: 400, fx: 13_200_000, sh: 8, v: 500_000 };
const S2025: Sc = { bp: 450, fx: 14_200_000, sh: 17, v: 200_000 };
const SCUSTOM: Sc = { bp: 400, fx: 13_200_000, sh: 8, v: 0 };
function netLine(sc: Sc, salaryManwon: number, price: number, withPrefix: boolean): Run[] {
  const monthly = salaryManwon * 10_000;
  const gross = monthly * (sc.bp / 100) + sc.fx + sc.sh * price + sc.v;
  const tax = calcBonusNet(monthly * 18, gross, DEFAULT_BONUS_CREDIT_RATE, true);
  return [
    [`${withPrefix ? "세전 " : ""}${fmtEok(gross)} − 공제 ${fmtEok(tax.totalDeductions)} (실효세율 `, 400],
    [`${tax.effectiveRate}%`, 700],
    [")", 400],
  ];
}

describe("세후 줄은 측정 상태마다 종전보다 좁고 줄 수가 늘지 않는다(결과 광고 바로 위)", () => {
  const cases: [string, Sc, number, number, number][] = [
    ["기본(2026)", S2026, 500, 280_000, 353_000],
    ["2025 칩", S2025, 500, 280_000, 353_000],
    ["직접 입력", SCUSTOM, 500, 280_000, 353_000],
  ];
  const OLD_BTN = [240_000, 280_000, 320_000, 360_000];
  const NEW_BTN = [270_000, 320_000, 370_000, 420_000];
  OLD_BTN.forEach((p, i) => {
    cases.push([`버튼 ${i + 1} (2026)`, S2026, 500, p, NEW_BTN[i]]);
    cases.push([`버튼 ${i + 1} (2025)`, S2025, 500, p, NEW_BTN[i]]);
    cases.push([`버튼 ${i + 1} (직접 입력)`, SCUSTOM, 500, p, NEW_BTN[i]]);
  });
  for (const m of [300, 400, 600, 700]) cases.push([`기본급 ${m}만 (2026)`, S2026, m, 280_000, 353_000]);

  it.each(cases)("%s", (_name, sc, salary, oldPrice, newPrice) => {
    const before = netLine(sc, salary, oldPrice, true);
    const after = netLine(sc, salary, newPrice, false);
    expect(widthOf(after, 12)).toBeLessThan(widthOf(before, 12));
    expect(widthsWithMoreLines(before, after, 12, 190, 870)).toEqual([]);
  });

  it("앞말을 그대로 두면 기본 상태에서 줄이 넓어져 한 줄 느는 폭이 생긴다(이 수정의 이유)", () => {
    const before = netLine(S2026, 500, 280_000, true);
    const kept = netLine(S2026, 500, 353_000, true);
    expect(widthOf(kept, 12) - widthOf(before, 12)).toBeGreaterThan(10);
    expect(widthsWithMoreLines(before, kept, 12, 190, 870).length).toBeGreaterThan(0);
  });
});

describe("3단계 안내 문장 — DART 공시 처분가와 날짜, 같은 폭 이하", () => {
  const OLD = "우리사주 평가액은 지급 시점 주가에 따라 달라집니다. 현재가를 확인해 직접 입력하세요.";
  const NEW = "기본값은 DART 10/30 공시 처분가(10/29 종가). 지급일 주가로 고쳐 입력하세요.";
  it("새 문장이 있고 옛 문장은 없다", () => {
    expect(CLIENT).toContain(NEW);
    expect(CLIENT).not.toContain(OLD);
  });
  it("12px 보통 굵기로 종전보다 좁고, 3단계 상자 글 폭 238~910px 어디서도 줄이 늘지 않는다", () => {
    expect(widthOf([[NEW, 400]], 12)).toBeLessThan(widthOf([[OLD, 400]], 12));
    expect(widthsWithMoreLines([[OLD, 400]], [[NEW, 400]], 12, 230, 912)).toEqual([]);
    expect(outsideFont(NEW)).toEqual([]);
  });
});

describe("'주식 8주는 얼마인가요?' 답 — 기본값·8주 평가액, 같은 폭 이하(열린 FAQ 상태)", () => {
  const TAIL =
    " 같은 공시 기준 주식은 직원 개인 증권계좌로 받거나 우리사주조합에 출연하는 방식 중 하나로 지급되고, 우리사주조합에 출연한 주식은 4년 동안 의무예탁됩니다. 인출 가능 시점을 사내 공지로 확인하세요. 지급 시점 시가 기준으로 근로소득 과세되는 것이 원칙입니다.";
  const OLD =
    "지급 시점의 현대모비스 주가에 따라 달라집니다. 본 계산기는 주가를 직접 입력받아 '주식 수 × 주가'로 평가액을 계산합니다. 2026-10-30 DART 공시에 적힌 처분가 353,000원은 이사회 전날(10월 29일) 종가 기준이라 실제 지급일 주가와 다를 수 있습니다." + TAIL;
  const NEW =
    "지급 시점의 현대모비스 주가에 따라 달라집니다. 본 계산기의 주가 기본값은 2026-10-30 DART 공시에 적힌 처분가로, 8주면 282만 4,000원입니다. 처분가 353,000원은 이사회 전날(10월 29일) 종가 기준이라 실제 지급일 주가와 다를 수 있습니다." + TAIL;
  it("답이 새 문장이다", () => {
    expect(PAGE).toContain(`question: "주식 8주는 얼마인가요?", answer: "${NEW}"`);
    expect(PAGE).not.toContain("본 계산기는 주가를 직접 입력받아");
  });
  it("14px 보통 굵기로 종전보다 좁고, FAQ 답 글 폭 214~910px 어디서도 줄이 늘지 않는다", () => {
    expect(widthOf([[NEW, 400]], 14)).toBeLessThan(widthOf([[OLD, 400]], 14));
    expect(widthsWithMoreLines([[OLD, 400]], [[NEW, 400]], 14, 214, 910)).toEqual([]);
    expect(outsideFont(NEW)).toEqual([]);
  });
});

describe("마지막 광고 아래 보도·공시 요약 — 기본값이 공시 가격임을 적는다", () => {
  it("셋째 점: 종가 기준 문장 그대로 + 이 가격을 주가 기본값으로 쓴다", () => {
    const p = CALC_NEWS_NOTES["/calc/hyundai-mobis-bonus"].points[2];
    expect(p).toBe(
      "공시의 1주 가격 353,000원은 2026년 10월 29일 종가 기준이라 실제 지급일 주가와 다를 수 있습니다. 이 계산기는 이 가격을 주가 기본값으로 쓰며, 주가 칸에 지급일 주가를 넣으면 주식 8주의 평가액과 세금이 그 값으로 계산됩니다."
    );
    expect(outsideFont(p)).toEqual([]);
  });
  it("새 문구에 예측·약속 표현이 없다", () => {
    const fresh = [
      "기본값은 DART 10/30 공시 처분가(10/29 종가). 지급일 주가로 고쳐 입력하세요.",
      "본 계산기의 주가 기본값은 2026-10-30 DART 공시에 적힌 처분가로, 8주면 282만 4,000원입니다.",
      CALC_NEWS_NOTES["/calc/hyundai-mobis-bonus"].points[2],
    ].join(" ");
    expect(fresh).not.toMatch(/예상|전망|될 것|예정 주가|11\/30 주가/);
  });
});
