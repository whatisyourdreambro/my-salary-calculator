// 2026 임단협 진행 상태 문구 회귀 가드 (2026-09-26, R4 bonus-deal-status)
//
// 현대모비스·두산에너빌리티·한화에어로스페이스·현대로템 성과급 계산기 page.tsx 의
// '2026 임단협 상태' 문구가 날짜 없이 굳지 않도록 소스 스캔으로 지킨다 (jsdom 없음 —
// bonusNextLinks.test.ts 와 같은 방식).
//   1) 이미 틀린 옛 문구('(2026-08 기준)'·'장기화 중'·'2026년 4월 기준 미타결')가 없다.
//   2) '교섭 중'·'미타결'은 모두 2026-09 이후 기준일을 달고 있다
//      (ISO 2026-09-DD 이후, 또는 같은 문맥에 2026 이 있는 9~12월 M/D).
//   3) 모비스 본문의 현대차 2026 타결 수치는 /calc/hyundai-bonus 정본 시나리오(Client.tsx
//      '2026-agreed')와 같다.
//   4) 잠정합의·사측 제시안 수치(운영자 승인 전)는 본문에 넣지 않는다 — hyundai-bonus 선례.
//   5) 광고 위 문구(상자·안내·출처·한화 본문)는 main 과 같은 글자 폭으로 맞춘 값 그대로다.
//      이 페이지들은 모든 본문이 calc/layout.tsx 의 InArticleAd·HomeTopAd 위에 있어서, 한 줄만
//      늘거나 줄어도 광고가 움직인다(R4 리뷰: 360~412px·768px 에서 +16~23px). 그래서 바뀐 문구는
//      단어마다 main 과 같은 폭(한글 음절 수·숫자·문장부호)으로 맞췄고, 320~1440px 1px 간격과
//      1536·1920px 에서 광고 위치가 같음을 확인했다(scratch sweepfit). 목록의 문구를 바꾸려면 같은
//      확인을 다시 하고 이 목록을 갱신한다. 접힌 FAQ 답(details)과 메타 설명은 높이에 영향이 없어
//      이 목록에 없다.
// 상태가 바뀌면(타결·가결 보도) 문구와 함께 이 테스트의 기준일도 갱신한다.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

const PAGES = {
  mobis: "src/app/calc/hyundai-mobis-bonus/page.tsx",
  doosan: "src/app/calc/doosan-enerbility-bonus/page.tsx",
  hanwha: "src/app/calc/hanwha-aerospace-bonus/page.tsx",
  rotem: "src/app/calc/hyundai-rotem-bonus/page.tsx",
} as const;
const HYUNDAI_CLIENT = "src/app/calc/hyundai-bonus/Client.tsx";

// JSX 여러 줄 텍스트는 렌더 시 공백 1칸으로 합쳐지므로 같은 방식으로 정규화해 문맥을 본다.
const norm = (s: string) => s.replace(/\s+/g, " ");

const STALE = ["(2026-08 기준)", "장기화 중", "2026년 4월 기준 미타결"];
const STATUS_RE = /교섭 중|미타결/g;
const WINDOW = 60;
const ISO_RE = /2026-(0[9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;
const MD_RE = /(?<![\d/.-])(9|1[0-2])\/([1-9]|[12]\d|3[01])(?![\d/])/;

// 5) 광고 위 폭 고정 문구 — 정규화한 소스에 그대로 있어야 한다.
const WIDTH_PINNED: Record<keyof typeof PAGES, string[]> = {
  mobis: [
    `<h3 className="font-bold mb-2 text-lg">📢 2026 임단협 (잠정합의)</h3>`,
    `<li>• 현대차 8/31 <strong>가결</strong>(성과금 400%·1,270만, 주식 15주)</li>`,
    `<li>• 모비스 <strong>8/25 잠정합의</strong> 보도</li>`,
    `<li>• 타결 시 본 계산기 &lsquo;직접 입력&rsquo;으로 즉시 계산 가능</li>`,
    `2026년분 지급률은 <strong>미확정</strong>. 확정 보도가 나오면 본 페이지를 갱신합니다.`,
    `차이 가능하며, 2026년분은 현대차 가결 이후에도 잠정안(미확정) 상태입니다.`,
    `{CURRENT_RATES_YEAR} 세법 반영. 2026년분 임단협은 잠정안(2026-08 보도).`,
  ],
  doosan: [
    `<h3 className="font-bold mb-2 text-lg">📢 2026 임단협, 9/26 교섭 중</h3>`,
    `차이가 크고, 2026년분은 임단협 타결까지 미확정입니다.`,
    `(2026 임단협 노조 요구안), DART 두산에너빌리티 사업보고서`,
  ],
  hanwha: [
    `</strong> 을 요구하는 것으로, 2026년 4월 초에 보도가 나왔습니다(뉴스웨이, 2026-04-08). 임단협 결과는 차기 성과급·기본급 산정에 영향을 줄 수 있으므로 타결 시 본 페이지에 반영할 예정입니다.`,
  ],
  rotem: [
    `<li>• 실적 대비 축소로 내부 불만 → 2026년 잠정합의 보도 확정 전 (이데일리)</li>`,
    `이번 잠정합의는 미반영. 확정 시 본 페이지에 반영 예정.`,
    `뉴스웨이(2026-07 성과배분 갈등 보도). {CURRENT_RATES_YEAR} 세법 반영.`,
  ],
};

function statusContexts(src: string) {
  const text = norm(src);
  const out: { match: string; context: string; dated: boolean }[] = [];
  for (const m of text.matchAll(STATUS_RE)) {
    const i = m.index ?? 0;
    const context = text.slice(Math.max(0, i - WINDOW), i + m[0].length + WINDOW);
    const dated = ISO_RE.test(context) || (MD_RE.test(context) && context.includes("2026"));
    out.push({ match: m[0], context, dated });
  }
  return out;
}

describe("2026 임단협 상태 문구 (R4 bonus-deal-status)", () => {
  it.each(Object.entries(PAGES))("%s: 옛 상태 문구가 남아 있지 않다", (_k, p) => {
    const text = norm(read(p));
    for (const s of STALE) expect(text.includes(s), `${p} 에 '${s}'`).toBe(false);
  });

  it.each(Object.entries(PAGES))("%s: '교섭 중'·'미타결'은 모두 2026-09 이후 기준일을 단다", (_k, p) => {
    const undated = statusContexts(read(p)).filter((c) => !c.dated);
    expect(undated.map((c) => `${c.match} … ${c.context}`)).toEqual([]);
  });

  it("검사 대상이 비어 있지 않다 (두산 제목·FAQ 의 날짜 붙은 상태 문구)", () => {
    // 광고 위 상자·안내 문구는 폭을 맞추느라 '타결까지 미확정'처럼 상태어 없이 썼다(5).
    // 날짜 붙은 상태어는 두산 제목(9/26 교섭 중)과 접힌 FAQ 답(2026-09-26 기준)에 남는다.
    const n = [PAGES.doosan, PAGES.hanwha].reduce((acc, p) => acc + statusContexts(read(p)).length, 0);
    expect(n).toBeGreaterThanOrEqual(2);
  });

  it("모비스 본문의 현대차 2026 타결 수치가 hyundai-bonus 정본 시나리오와 같다", () => {
    const client = read(HYUNDAI_CLIENT);
    const block = client.slice(client.indexOf('id: "2026-agreed"'), client.indexOf('id: "2025-agreed"'));
    expect(block.length).toBeGreaterThan(0);
    const pct = Number(/bonusPercent:\s*(\d+)/.exec(block)?.[1]);
    const fixed = Number(/fixedAmount:\s*([\d_]+)/.exec(block)?.[1].replace(/_/g, ""));
    const shares = Number(/freeShares:\s*(\d+)/.exec(block)?.[1]);
    expect([pct, fixed, shares]).toEqual([400, 12_700_000, 15]);
    const man = (fixed / 10_000).toLocaleString("en-US");
    const mobis = norm(read(PAGES.mobis));
    expect(mobis).toContain(`8/31 <strong>가결</strong>(성과금 ${pct}%·${man}만, 주식 ${shares}주)`);
    expect(mobis).toContain(`성과금 ${pct}%+${man}만원·주식 ${shares}주`);
  });

  it("잠정합의·사측 제시안 수치(승인 전)는 본문에 없다", () => {
    const mobis = norm(read(PAGES.mobis));
    const rotem = norm(read(PAGES.rotem));
    const hanwha = norm(read(PAGES.hanwha));
    for (const s of ["1,320만", "1320만", "주식 8주", "자사주 8주"]) expect(mobis.includes(s), `mobis '${s}'`).toBe(false);
    for (const s of ["1,550만", "1550만", "850만", "주식 30주"]) expect(rotem.includes(s), `rotem '${s}'`).toBe(false);
    // 사측 제시안(뉴스1 2026-09-11): 기본급 월 12만2,000원↑·인센 최대 500만·생산목표달성격려금 최대 300만.
    // ('800만원'은 기존 평균연봉 '1억 1,800만원'과 겹쳐 쓰지 않는다)
    for (const s of ["12만2,000", "12만 2,000", "12.2만", "생산목표달성격려금", "생산목표 달성 격려금"]) {
      expect(hanwha.includes(s), `hanwha '${s}'`).toBe(false);
    }
  });

  it.each(Object.entries(WIDTH_PINNED))("%s: 광고 위 문구가 main 과 같은 폭으로 맞춘 값 그대로다", (k, list) => {
    const text = norm(read(PAGES[k as keyof typeof PAGES]));
    for (const s of list) expect(text.includes(s), `'${s}' 가 없다 — 폭을 다시 맞추고 확인한 뒤 목록 갱신`).toBe(true);
  });
});
