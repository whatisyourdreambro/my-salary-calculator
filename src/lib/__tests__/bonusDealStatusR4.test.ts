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

  it("검사 대상이 비어 있지 않다 (두산·한화의 날짜 붙은 상태 문구)", () => {
    const n = [PAGES.doosan, PAGES.hanwha].reduce((acc, p) => acc + statusContexts(read(p)).length, 0);
    expect(n).toBeGreaterThanOrEqual(4);
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
    expect(mobis).toContain(`8/31 가결</strong>(성과금 ${pct}%+${man}만·주식 ${shares}주)`);
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
});
