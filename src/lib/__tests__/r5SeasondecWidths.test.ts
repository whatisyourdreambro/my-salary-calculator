// 실수령액 표 시즌 상자 — 12/1 자동 전환(DEC) 때 줄이 늘지 않게 (R4 2차 SEASONDEC, lens-season 검증 누락 1, 2026-11-18)
//
// 상자: src/app/table/2026/SeasonalLinks.tsx. 실수령액 표 8쪽(/table/2026·2027 × 연봉·월급·주급·시급)에서 layout 의
// PageFooterAds(광고 2개·쿠팡 배너) 바로 위에 있다(/salary/[amount]·/monthly/[amount] 에서는 모든 광고 아래).
// 활성 세트는 빌드 시점 키가 고른다: 12/1 첫 빌드부터 OCT → DEC 가 저절로 바뀐다. 이 상자가 높아지면 그날 표 페이지의
// 아래 광고가 내려간다(운영자 규칙: 광고는 내려가면 안 된다).
//
// 폭 모델 — 사이트 글꼴 src/app/fonts/PretendardVariable-subset.woff2 (배포 분할 6개와 advance 동일, fonts/README.md)를
//   fontTools instancer 로 wght 400·700·750 에 고정해 읽은 glyph advance(아래 표, 2048 단위). 한글 음절 2,351자는 세 굵기 모두
//   1770, 한글이 낀 GPOS kern 쌍은 0, 표에 있는 kern 은 아래 KERN. 표는 글꼴 파일 SHA-256 에 묶여 있다(글꼴을 바꾸면 먼저 깨진다).
// 스타일(N QA 빌드 CSS 로 확인):
//   제목 h2  text-lg 18px · font-black = 750(tailwind.config fontWeight.black) · letter-spacing -0.02em(globals.css h2) ·
//            keep-all(:where(h1..h6,p,li,label):lang(ko)) · text-wrap balance(줄 수는 그대로) · 줄 높이 28px
//   카드 제목 span 14px 700, 설명 span 12px 400 — body 의 -0.01em 이 -0.16px 로 상속, span 이라 keep-all 이 아니다(word-break
//            normal → 한글 음절 사이에서도 줄바꿈), leading-snug 줄 높이 19.25px / 16.5px, 제목·설명 사이 4px.
// 카드 폭 — 격자는 grid-cols-1 / sm:grid-cols-2 = repeat(n, minmax(0, 1fr)) 라 열 폭이 글자와 무관하다(표의 auto 열처럼
//   한 칸 글이 줄어 다른 칸 폭이 바뀌는 일이 없다). 글이 들어가는 폭 = 카드 폭 - 테두리 2 - 패딩 32 - 간격 12 - 화살표 16.
//   2열에서 행 높이는 두 카드 중 큰 쪽(align stretch): 한 카드 글이 짧아지면 그 행은 같거나 낮아질 뿐, 다른 카드가 높아지지 않는다.
// 사용 가능 폭 — 뷰포트 320~1440px(600px 이상은 15·17px 스크롤바도), .page-width(거터 clamp(16px,3vw,32px)) 안 연봉·월급 표와
//   px-4/sm:px-6 을 받는 주급·시급 표: 제목 252~860px, 카드 글 219.5~545px(1열 226~545, 2열 219.5~380). 아래는 양쪽 4px 여유.
// 줄바꿈 모델 셋 — K: 띄어쓰기에서만, H: + 한글 음절 사이, L: + 한글이 낀 모든 경계(닫는 문장부호 앞·여는 괄호 뒤 제외).
//   카드 글은 셋 모두, 제목도 셋 모두(keep-all 이면 K) 통과해야 한다.
// 판정 — (1) 제목은 지금 제목보다 넓지 않고 모든 폭에서 줄이 같거나 적다. (2) 카드마다 짝(같은 링크, 없으면 그 자리를 넘겨받은
//   카드)보다 제목·설명 모두 모든 폭에서 줄이 같거나 적고, 짝보다 넓으면 가장 좁은 폭에서도 한 줄이다. (3) 상자 전체 높이
//   (1열 = 카드 합, 2열 = 행마다 큰 카드의 합)가 모든 폭에서 같거나 낮다.
// 이 계산은 렌더 실측이 아니다. 통합 단계가 같은 head 를 SEASON_KEY_NOW=2026-12-01T00:00:00+09:00 과 오늘 키로 두 번 빌드해
// 가드 스윕(광고 없는 QA 빌드)으로 표 8쪽·홈·샘플 페이지의 광고 top 을 모든 폭에서 비교한다.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SEASONAL_LINKS_DEC,
  SEASONAL_LINKS_JAN,
  SEASONAL_LINKS_OCT,
  type SeasonalLinkSet,
} from "@/app/table/2026/SeasonalLinks";

// ── 글꼴 폭 표 ─────────────────────────────────────────────────────────────────────────
const FONT = "src/app/fonts/PretendardVariable-subset.woff2";
const FONT_SHA256 = "a113397cf70cb067a3246056195fee8cde99e998a392503e413e543da9cec761";
const UPM = 2048;
const HANGUL_ADVANCE = 1770;
const CHARS = " 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ()%,.?/:·—→~+-";
type Weight = 400 | 700 | 750;
// CHARS 순서의 advance (fontTools instancer, wght 고정)
const ADV: Record<Weight, number[]> = {
  400: [514, 1220, 898, 1202, 1264, 1278, 1222, 1256, 1130, 1242, 1256, 1322, 1268, 1420, 1404, 1162, 1140, 1452, 1446, 500, 1056, 1272, 1092, 1746, 1470, 1488, 1238, 1488, 1246, 1244, 1252, 1448, 1322, 1874, 1254, 1298, 1218, 698, 698, 1766, 528, 520, 982, 684, 520, 520, 1960, 1870, 1284, 1284, 886],
  700: [473, 1352, 960, 1251, 1309, 1346, 1284, 1317, 1179, 1317, 1317, 1470, 1303, 1482, 1436, 1205, 1152, 1501, 1473, 545, 1122, 1357, 1118, 1808, 1453, 1542, 1276, 1543, 1294, 1290, 1317, 1441, 1470, 2046, 1405, 1425, 1312, 799, 799, 1965, 588, 578, 1102, 761, 578, 578, 1978, 1887, 1338, 1338, 919],
  750: [466, 1375, 971, 1259, 1317, 1357, 1295, 1327, 1187, 1329, 1327, 1495, 1309, 1493, 1441, 1212, 1155, 1509, 1478, 553, 1133, 1371, 1122, 1819, 1450, 1551, 1283, 1553, 1301, 1298, 1327, 1440, 1495, 2075, 1430, 1446, 1328, 816, 816, 1998, 598, 587, 1122, 774, 587, 587, 1981, 1890, 1347, 1347, 924],
};
// GPOS kern(첫 글자 XAdvance) — [400, 700, 750]. 아래 KERN_CHECKED 의 나머지 쌍은 세 굵기 모두 0 으로 확인했다.
const KERN: Record<string, [number, number, number]> = {
  "70": [-31, -31, -31],
  ", ": [-3, -65, -76],
  ",0": [-51, -59, -60],
  "1,": [-85, -77, -76],
  "P·": [-88, -38, -30],
  TA: [-170, -178, -179],
};
const KERN_CHECKED = new Set([
  " (", " 1", " 2", " 3", " 5", " 9", " O", " T", " —", " →", "% ", "%(", "%)", "%·", "(2", ") ", ", ", ",0", "/3", "0%",
  "00", "02", "1 ", "1,", "10", "11", "12", "17", "2/", "20", "25", "26", "27", "30", "31", "5%", "7 ", "70", "90", "? ",
  "AI", "I ", "IR", "OP", "PI", "P·", "RP", "TA", "— ", "→ ",
]);

// ── 상자 스타일·폭 범위 ─────────────────────────────────────────────────────────────────────
type Kind = "heading" | "title" | "desc";
const STYLE: Record<Kind, { px: number; w: Weight; ls: number; lh: number }> = {
  heading: { px: 18, w: 750, ls: -0.36, lh: 28 },
  title: { px: 14, w: 700, ls: -0.16, lh: 19.25 },
  desc: { px: 12, w: 400, ls: -0.16, lh: 16.5 },
};
const TITLE_DESC_GAP = 4;
const HEADING_AVAIL: [number, number] = [248, 864];
const CARD_AVAIL: [number, number] = [215.5, 549];
const STEP = 0.25;
type Model = "K" | "H" | "L";
const MODELS: Model[] = ["K", "H", "L"];

const isHangul = (c: string) => c >= "가" && c <= "힣";
const KERN_INDEX: Record<Weight, number> = { 400: 0, 700: 1, 750: 2 };
function advance(c: string, w: Weight): number {
  if (isHangul(c)) return HANGUL_ADVANCE;
  const i = CHARS.indexOf(c);
  if (i < 0) throw new Error(`폭 표에 없는 글자 ${JSON.stringify(c)} — 글꼴에서 advance 를 재서 CHARS·ADV 에 추가`);
  return ADV[w][i];
}
function charWidths(s: string, kind: Kind): number[] {
  const st = STYLE[kind];
  const cs = [...s];
  return cs.map((c, i) => {
    let u = advance(c, st.w);
    const next = cs[i + 1];
    if (next !== undefined) u += KERN[c + next]?.[KERN_INDEX[st.w]] ?? 0;
    return (u / UPM) * st.px + st.ls;
  });
}
const total = (s: string, kind: Kind) => charWidths(s, kind).reduce((a, b) => a + b, 0);

const CLOSE = new Set([")", "]", "}", "%", ",", ".", "?", "!", ":", ";", "·", "/"]);
const OPEN = new Set(["(", "[", "{"]);
function breakBetween(prev: string, next: string, model: Model): boolean {
  if (model === "K") return false;
  if (model === "H") return isHangul(prev) && isHangul(next);
  if (!(isHangul(prev) || isHangul(next))) return false;
  return !CLOSE.has(next) && !OPEN.has(prev);
}
type Segment = { w: number; sp: number };
/** 줄바꿈 기회 사이 조각들 — sp 는 그 조각 앞 공백 폭(줄 끝에서는 버린다) */
function segments(s: string, kind: Kind, model: Model): Segment[] {
  const cs = [...s];
  const ws = charWidths(s, kind);
  const out: Segment[] = [];
  let curW = 0;
  let curSp = 0;
  let started = false;
  let spaceAcc = 0;
  cs.forEach((c, i) => {
    if (c === " ") {
      if (started) out.push({ w: curW, sp: curSp });
      started = false;
      spaceAcc += ws[i];
      return;
    }
    if (!started) {
      curSp = spaceAcc;
      spaceAcc = 0;
      curW = 0;
      started = true;
    } else if (breakBetween(cs[i - 1], c, model)) {
      out.push({ w: curW, sp: curSp });
      curSp = 0;
      curW = 0;
    }
    curW += ws[i];
  });
  if (started) out.push({ w: curW, sp: curSp });
  return out;
}
/** 앞에서부터 채우는 줄 수 (Chromium 의 첫 맞춤과 같은 결과; balance 는 줄 수를 바꾸지 않는다) */
function lineCount(segs: Segment[], avail: number): number {
  let n = 1;
  let cur = 0;
  segs.forEach((t, i) => {
    if (i === 0) cur = t.w;
    else if (cur + t.sp + t.w <= avail + 0.01) cur += t.sp + t.w;
    else {
      n += 1;
      cur = t.w;
    }
  });
  return n;
}
function widthsIn([lo, hi]: [number, number]): number[] {
  const out: number[] = [];
  for (let av = lo; av <= hi + 1e-9; av += STEP) out.push(av);
  return out;
}
/** after 가 before 보다 줄이 많은 폭 목록 (모든 모델) */
function moreLinesAt(before: string, after: string, kind: Kind, range: [number, number]): string[] {
  const bad: string[] = [];
  for (const m of MODELS) {
    const a = segments(before, kind, m);
    const b = segments(after, kind, m);
    for (const av of widthsIn(range)) if (lineCount(b, av) > lineCount(a, av)) bad.push(`${m}@${av}`);
  }
  return bad;
}
function cardHeight(link: { title: string; description: string }, av: number, m: Model): number {
  const t = lineCount(segments(link.title, "title", m), av);
  const d = lineCount(segments(link.description, "desc", m), av);
  return t * STYLE.title.lh + TITLE_DESC_GAP + d * STYLE.desc.lh;
}
function gridHeight(set: SeasonalLinkSet, av: number, m: Model, cols: 1 | 2): number {
  const hs = set.links.map((l) => cardHeight(l, av, m));
  if (cols === 1) return hs.reduce((a, b) => a + b, 0);
  let sum = 0;
  for (let i = 0; i < hs.length; i += 2) sum += Math.max(hs[i], hs[i + 1] ?? 0);
  return sum;
}
const setTexts = (set: SeasonalLinkSet) => [set.heading, ...set.links.flatMap((l) => [l.title, l.description])];

/** 다음 세트의 각 카드 → 지금 세트의 짝 (같은 링크, 없으면 그 자리를 넘겨받은 카드) */
function twinsOf(prev: SeasonalLinkSet, next: SeasonalLinkSet, replaced: Record<string, string>) {
  return next.links.map((l) => {
    const href = prev.links.some((p) => p.href === l.href) ? l.href : replaced[l.href];
    const twin = prev.links.find((p) => p.href === href);
    if (!twin) throw new Error(`짝 없음: ${l.href}`);
    return { next: l, prev: twin };
  });
}

function expectNoTallerThan(prev: SeasonalLinkSet, next: SeasonalLinkSet, replaced: Record<string, string>) {
  // (1) 제목
  expect(total(next.heading, "heading")).toBeLessThanOrEqual(total(prev.heading, "heading"));
  expect(moreLinesAt(prev.heading, next.heading, "heading", HEADING_AVAIL)).toEqual([]);
  // (2) 카드 짝 — 짝은 일대일
  const twins = twinsOf(prev, next, replaced);
  expect(new Set(twins.map((t) => t.prev.href)).size).toBe(prev.links.length);
  for (const { next: n, prev: p } of twins) {
    for (const [kind, a, b] of [
      ["title", p.title, n.title],
      ["desc", p.description, n.description],
    ] as [Kind, string, string][]) {
      expect(moreLinesAt(a, b, kind, CARD_AVAIL), `${n.href} ${kind}: ${b}`).toEqual([]);
      const wider = total(b, kind) > total(a, kind) + 1e-9;
      if (wider) expect(total(b, kind), `${n.href} ${kind} 짝보다 넓으면 가장 좁은 폭에서도 한 줄`).toBeLessThanOrEqual(CARD_AVAIL[0]);
    }
  }
  // (3) 상자 전체 높이 — 1열 합, 2열 행별 큰 카드 합
  const taller: string[] = [];
  for (const m of MODELS) {
    for (const cols of [1, 2] as const) {
      for (const av of widthsIn(CARD_AVAIL)) {
        if (gridHeight(next, av, m, cols) > gridHeight(prev, av, m, cols) + 1e-9) taller.push(`${m}${cols}열@${av}`);
      }
    }
  }
  expect(taller).toEqual([]);
}

describe("폭 모델의 전제", () => {
  it("폭 표는 지금 글꼴 파일에서 잰 값이다 (SHA-256)", () => {
    const sha = createHash("sha256").update(readFileSync(resolve(process.cwd(), FONT))).digest("hex");
    expect(sha).toBe(FONT_SHA256);
  });
  it("검사하는 문구의 글자와 한글 밖 인접 쌍은 모두 표에서 잰 것이다", () => {
    for (const s of [...setTexts(SEASONAL_LINKS_OCT), ...setTexts(SEASONAL_LINKS_DEC), ...setTexts(SEASONAL_LINKS_JAN)]) {
      const cs = [...s];
      cs.forEach((c, i) => {
        expect(isHangul(c) || CHARS.includes(c), `${s}: ${c}`).toBe(true);
        const next = cs[i + 1];
        if (next !== undefined && !isHangul(c) && !isHangul(next)) expect(KERN_CHECKED.has(c + next), `${s}: ${c + next}`).toBe(true);
      });
    }
  });
  it("모델은 고치기 전 12월 제목·신용카드 설명의 줄 늘어남을 재현한다 (390px 폰 제목 322px, 360px 폰 카드 글 266px)", () => {
    const oldHeading = "연말정산 12/31 마감 전 체크 — 12월 시즌 체크리스트";
    const oldCard3 = "총급여 25% 문턱 넘겼나? 연말 결제수단별 공제율·한도 확인";
    expect(lineCount(segments(SEASONAL_LINKS_OCT.heading, "heading", "K"), 322)).toBe(1);
    expect(lineCount(segments(oldHeading, "heading", "K"), 322)).toBe(2);
    expect(lineCount(segments(SEASONAL_LINKS_OCT.links[2].description, "desc", "H"), 266)).toBe(1);
    expect(lineCount(segments(oldCard3, "desc", "H"), 266)).toBe(2);
  });
});

describe("12월 세트(DEC) — 12/1 자동 전환 때 지금 세트(OCT)보다 상자가 높아지지 않는다", () => {
  it("링크 6개·순서·주소는 그대로", () => {
    expect(SEASONAL_LINKS_DEC.links.map((l) => l.href)).toEqual([
      "/year-end-tax-2027",
      "/calc/samsung-bonus",
      "/credit-card-deduction-2026",
      "/medical-tax-credit-2026",
      "/tools/finance/irp",
      "/table/2027/annual",
    ]);
  });
  it("제목·카드·상자 높이 모두 지금 세트 이하 (짝: TAI 계산기 ← 미리보기 이용법, IRP ← 월세)", () => {
    expectNoTallerThan(SEASONAL_LINKS_OCT, SEASONAL_LINKS_DEC, {
      "/calc/samsung-bonus": "/year-end-tax-preview",
      "/tools/finance/irp": "/rent-tax-credit-2026",
    });
  });
  it("줄인 문구는 고치기 전 문구보다 좁고, 사실(12/31 귀속연도 끝·총급여 25% 문턱)은 그대로다", () => {
    const changed: [Kind, string, string][] = [
      ["heading", "연말정산 12/31 마감 전 체크 — 12월 시즌 체크리스트", SEASONAL_LINKS_DEC.heading],
      ["desc", "일정·계산기·단계별 로드맵 — 12/31 전 마지막 점검", SEASONAL_LINKS_DEC.links[0].description],
      ["desc", "총급여 25% 문턱 넘겼나? 연말 결제수단별 공제율·한도 확인", SEASONAL_LINKS_DEC.links[2].description],
    ];
    for (const [kind, before, after] of changed) expect(total(after, kind)).toBeLessThan(total(before, kind));
    expect(SEASONAL_LINKS_DEC.heading).toBe("연말정산 마감 전 — 12월 시즌 체크리스트");
    expect(SEASONAL_LINKS_DEC.links[0].description).toBe("단계별 로드맵 — 12/31 전 점검");
    expect(SEASONAL_LINKS_DEC.links[2].description).toBe(SEASONAL_LINKS_OCT.links[2].description);
  });
});

// 1월 세트는 1/2 무렵 SEASON_KEY_OVERRIDE = "JAN" 으로 수동 전환(1/1 묶음). 같은 규칙을 줄인 12월 세트에 대어 본다.
describe("1월 세트(JAN) — 수동 전환 때 줄인 12월 세트(DEC)보다 상자가 높아지지 않는다", () => {
  it("링크 6개·순서·주소는 그대로", () => {
    expect(SEASONAL_LINKS_JAN.links.map((l) => l.href)).toEqual([
      "/year-end-tax-2027",
      "/calc/samsung-bonus",
      "/year-end-tax",
      "/credit-card-deduction-2026",
      "/table/2027/annual",
      "/medical-tax-credit-2026",
    ]);
  });
  it("제목·카드·상자 높이 모두 12월 세트 이하 (짝: 환급금 계산기 ← IRP 계산기)", () => {
    expectNoTallerThan(SEASONAL_LINKS_DEC, SEASONAL_LINKS_JAN, { "/year-end-tax": "/tools/finance/irp" });
  });
  it("줄인 문구는 고치기 전보다 좁고, 날짜는 넣지 않았다(간소화 개통일 미발표)", () => {
    const changed: [Kind, string, string][] = [
      ["heading", "연말정산 간소화 오픈 — 1월 시즌 체크리스트", SEASONAL_LINKS_JAN.heading],
      ["title", "연말정산 간소화 서비스 이용 순서 — 2027 허브", SEASONAL_LINKS_JAN.links[0].title],
      ["desc", "간소화 자료 조회부터 회사 제출까지 단계별 로드맵", SEASONAL_LINKS_JAN.links[0].description],
      ["desc", "발표된 사업부별 지급률 입력 → 세후 실수령액 바로 확인", SEASONAL_LINKS_JAN.links[1].description],
      ["desc", "간소화 자료 기준 예상 환급·추가납부액 즉시 계산", SEASONAL_LINKS_JAN.links[2].description],
    ];
    for (const [kind, before, after] of changed) expect(total(after, kind)).toBeLessThan(total(before, kind));
    for (const s of setTexts(SEASONAL_LINKS_JAN)) {
      expect(s).not.toMatch(/\d+\/\d+/);
      expect(s).not.toMatch(/\d+일/);
    }
  });
});
