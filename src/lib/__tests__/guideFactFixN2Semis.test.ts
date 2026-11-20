// R4 GUIDES 단위 — N2-guides-content-01 (삼성·SK 성과급 가이드 묶음, 2026-11-18) 사실 정정 핀.
//
// 모두 광고 위 본문의 같은 폭 이하 교체다(커밋마다 하나씩, 스윕에서 광고가 내려가면 그 커밋을 되돌린다).
// 커밋을 되돌리면 아래 같은 이름의 describe 블록도 함께 지운다(커밋 해시는 블록 제목에 적었다).
// (1) 분할 고정: GuidePageClient.splitContentByH2 는 본문 길이로 H2 분할 지점을 고르고, 히어로 'N분 분량' = ceil(길이/1000) 은
//     광고 위 날짜 줄에 있다. 고친 글마다 수정 전(ce2463cda) H2 개수·분할 H2 순번·읽기 시간을 고정한다 — 값이 바뀌면 광고 위치나
//     광고 위 날짜 줄이 바뀐 것이므로 문구 폭부터 다시 맞출 것(값을 그냥 갱신하지 말 것). 분할 함수 복제본의 원본 일치는
//     guideSpec.test.ts 의 드리프트 가드가 맡는다.
// (2) 사실 고정: 공식·공개 출처는 각 커밋 메시지(2026-11-18 확인).
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { PROFIT_SCENARIOS } from "@/app/calc/sk-hynix-bonus/psData";

const guide = (slug: string) => {
  const g = koGuides.find((x) => x.slug === slug);
  if (!g) throw new Error(`가이드 없음: ${slug}`);
  return g;
};

const H2_OPEN_RE = /<h2[\s>]/gi;
function splitH2Ordinals(html: string): number[] {
  const indices = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  if (indices.length < 2) return [];
  const candidates = indices.filter((i) => i > 0);
  if (candidates.length === 0) return [];
  const nearest = (target: number, pool: number[]) =>
    pool.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best));
  let pts: number[];
  if (html.length < 4000 || candidates.length === 1) pts = [nearest(html.length / 2, candidates)];
  else {
    const p1 = nearest(html.length / 3, candidates);
    const after = candidates.filter((i) => i > p1);
    pts = after.length === 0 ? [p1] : [p1, nearest((html.length * 2) / 3, after)];
  }
  return pts.map((p) => indices.indexOf(p));
}

// [H2 개수, 분할 H2 순번, 히어로 읽기 시간(분)] — ce2463cda 실측
const SPLIT_PINS: Record<string, [number, number[], number]> = {
  "samsung-ds-special-bonus-details-oct-2026": [9, [3, 8], 8],
  "sk-hynix-bonus-renegotiation-sept-2026": [9, [2, 6], 14],
  "sk-hynix-ps-cash-vs-stock-scenarios-2026": [9, [3, 5], 13],
  "samsung-opi-forecast-2027": [9, [3, 6], 7],
  "samsung-electronics-stock-2026": [3, [2], 4],
  "semiconductor-performance-bonus-tax": [4, [1, 3], 7],
  "chip-rsu-stock-tax-2026": [4, [1, 3], 6],
  "chip-stock-tax-guide": [3, [2], 3],
};

describe("N2-guides-content-01 — 광고 분할·읽기 시간 불변", () => {
  for (const [slug, [h2, split, minutes]] of Object.entries(SPLIT_PINS)) {
    it(slug, () => {
      const html = guide(slug).content;
      expect([...html.matchAll(H2_OPEN_RE)].length).toBe(h2);
      expect(splitH2Ordinals(html)).toEqual(split);
      expect(Math.ceil(html.length / 1000)).toBe(minutes);
    });
  }
});

describe("b12-F01 (628da0d00, R4 수리 2026-11-20) 삼성 DS 특별성과급 세부안 — 10/29 발표는 지난 일", () => {
  const c = guide("samsung-ds-special-bonus-details-oct-2026").content;
  it("발표 결과를 적고, 발표 대기 문장은 없다", () => {
    expect(c).toContain("1~3분기 누적 영업이익은 254조 1,300억원입니다(EBN).</p>");
    expect(c).toContain("10월 29일 발표된 3분기 DS부문 영업이익은 106조 5,000억원입니다(한국경제).");
    expect(c).toContain("앞서 메리츠증권은 약 110조원으로 추정했습니다(파이낸셜뉴스 10월 8일, 증권가 추정).");
    expect(c).not.toContain("컨퍼런스콜에서 발표됩니다");
    expect(c).not.toContain("10월 29일 확정 발표를 봐야");
  });
  // 같은 글자 수 교체(7,804자)는 실측에서 두 문단이 한 줄씩 더 감겼다(InArticleAd +32~64px). 수리본은 두 문단 모두 N 보다 짧다.
  // R4 수리 2회차(2026-11-20): 출처 목록의 EBN 10/8 링크 글에서 '·실적 발표 일정' 9자를 지웠다(본문이 일정을 더는 말하지 않음, 순수 삭제).
  it("N(7,804자)보다 짧은 본문 7,694자 — 읽기 시간 8분과 광고 분할 H2(3·8번째)는 위 핀이 지킨다", () => {
    expect(c.length).toBe(7694);
    expect(c).toContain('target="_blank">1~3분기 누적 실적</a></li>');
    expect(c).not.toContain("실적 발표 일정");
  });
});

describe("b12-F03 (f85f4cdd9·3261dcd03) SK하이닉스 가이드 2편 — 계산기 시나리오 버튼 값", () => {
  const values = PROFIT_SCENARIOS.filter((s) => s.id !== "actual2025").map((s) => s.trillion);
  it("가이드가 가리키는 값은 지금 계산기 버튼 값(보수·누적 연환산·컨센서스)이다", () => {
    expect(values).toEqual([181.5, 242, 250]);
  });
  it("재협상 글", () => {
    const c = guide("sk-hynix-bonus-renegotiation-sept-2026").content;
    expect(c).toContain("(보수 181.5조·연환산 242조·컨센서스 250조)");
    expect(c).not.toContain("196.4조");
    expect(c).not.toContain("150조·");
  });
  it("현금·주식 시나리오 글", () => {
    const c = guide("sk-hynix-ps-cash-vs-stock-scenarios-2026").content;
    expect(c).toContain("(181.5조·242조·250조)");
    expect(c).not.toContain("196.4조");
    expect(c).not.toContain("150조·");
  });
});

describe("b01-M01 (18c874d61) 삼성 OPI 2027 전망 — DS부문 항목은 DS부문 이익", () => {
  it("2025년 DS 영업이익 24.9조원, 회사 전체 43.6조원을 DS로 적지 않는다", () => {
    const c = guide("samsung-opi-forecast-2027").content;
    expect(c).toContain("2025년 DS 이익 24.9조원으로 47%였는데");
    expect(c).not.toContain("2025년 영업이익 43.6조원으로");
    // 표의 '2025년 연간(비교용)' 회사 전체 43.6조원은 그대로
    expect(c).toContain("<td>43.6조원</td>");
  });
});

describe("b13-F04 ISA — 국내 상장주식 매매차익은 원래 비과세, ISA 혜택은 배당·과세 수익", () => {
  it("(a) f0a4b6c7c 삼성전자 주식 글", () => {
    const c = guide("samsung-electronics-stock-2026").content;
    expect(c).toContain("안에서 배당 등 과세 수익을 비과세로 받을 수 있습니다.");
    expect(c).not.toContain("매매 차익을 비과세로 가져갈 수 있어");
  });
  it("(b) 9e873add3 반도체 성과급 세금 글", () => {
    const c = guide("semiconductor-performance-bonus-tax").content;
    expect(c).toContain("해외지수 ETF 매매차익·배당 200만원까지 비과세");
    expect(c).not.toContain("ETF·국내주식 매매하면");
  });
  it("(c) 57eebbaf5 반도체 RSU 글 원칙 2", () => {
    const c = guide("chip-rsu-stock-tax-2026").content;
    expect(c).toContain("ISA 계좌로 매수해 배당을 비과세로 받습니다.");
    expect(c).not.toContain("매매차익을 비과세로 가져갑니다");
  });
  it("(d) cba4c276c 반도체 RSU 글 매수 경로 표 ISA 행", () => {
    const c = guide("chip-rsu-stock-tax-2026").content;
    expect(c).toContain('<td class="p-3 font-bold text-primary">국내주식 차익은 원래 비과세</td>');
    expect(c).not.toContain("6,822만원");
    expect(c).not.toContain("초과분 9.9% 분리과세</td>");
  });
});

describe("b13-M01 (e4babfd6c) 반도체 주식 세금 글 — 연금계좌 과세이연은 해외지수 ETF", () => {
  it("KOSPI 200 ETF 예시와 '일반 양도세보다'가 없다", () => {
    const c = guide("chip-stock-tax-guide").content;
    expect(c).toContain("IRP 계좌 안에서 S&P500 등 해외지수 ETF를 매매하면");
    expect(c).toContain("일반 과세보다 유리합니다");
    expect(c).not.toContain("KOSPI 200 ETF 또는 반도체 ETF");
    expect(c).not.toContain("일반 양도세보다");
  });
});
