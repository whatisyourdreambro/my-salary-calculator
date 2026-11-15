// 검색 설명의 예시 금액이 화면 계산기와 같은 엔진·같은 기본값에서 나오는지 고정 (2026-11-15 SEASONA, 감사 calc ideas[5])
// 설명 문자열은 빌드 때 엔진으로 계산한다 — 엔진이 바뀌면 숫자도 같이 바뀌므로 여기서는 '같은 함수·같은 입력'을 본다.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { metadata as vacationMeta } from "@/app/calc/vacation-pay/page";
import { metadata as severanceMeta } from "@/app/calc/severance-vs-pension/page";
import { calcVacationPay } from "@/lib/vacationPay";
import { compareSeveranceVsPension } from "@/lib/severanceVsPension";

const manwon = (won: number) => Math.round(won / 10_000).toLocaleString("ko-KR");
const read = (p: string) => readFileSync(p, "utf8");

describe("/calc/vacation-pay 검색 설명", () => {
  it("예시 = 계산기 기본값(연봉 48,000,000원·미사용 10일)의 calcVacationPay 결과", () => {
    const client = read("src/app/calc/vacation-pay/Client.tsx");
    expect(client).toContain('useState("48,000,000")');
    expect(client).toContain('useState("10")');
    const r = calcVacationPay(48_000_000, 10);
    const d = String(vacationMeta.description);
    expect(d).toContain(`연봉 4,800만원·미사용 연차 10일이면 연차수당은 세전 약 ${manwon(r.grossPay)}만원, 세후 약 ${manwon(r.net)}만원입니다.`);
    expect([manwon(r.grossPay), manwon(r.net)]).toEqual(["153", "117"]);
    expect(d).toContain("2026년 세법 적용."); // tax-constants-allow.json 연도 고정 메모와 같은 문구
    expect(String(vacationMeta.openGraph?.description)).toBe(d);
  });
});

describe("/calc/severance-vs-pension 검색 설명", () => {
  it("예시 = 계산기 기본값(6,000만원·10년·3%·4%)의 compareSeveranceVsPension 결과", () => {
    const client = read("src/app/calc/severance-vs-pension/Client.tsx");
    for (const v of ['useState("60,000,000")', 'useState("10")', 'useState("3")', 'useState("4")']) expect(client).toContain(v);
    const r = compareSeveranceVsPension({ salary: 60_000_000, years: 10, growth: 0.03, dcReturn: 0.04 });
    const d = String(severanceMeta.description);
    expect(d).toContain(`연봉 6,000만원·근속 10년·연봉 상승률 3%·DC 수익률 4%라면 DB형 퇴직금은 세전 약 ${manwon(r.dbAmount)}만원, DC형 적립금은 약 ${manwon(r.dcAmount)}만원입니다.`);
    expect([manwon(r.dbAmount), manwon(r.dcAmount)]).toEqual(["6,524", "6,816"]);
    expect(String(severanceMeta.openGraph?.description)).toBe(d);
  });
});

describe("제목은 그대로, 바뀐 설명은 gsc-sniping-log 에 기록", () => {
  it("title 은 buildToolMetadata 의 이름·태그라인 그대로", () => {
    expect(String((vacationMeta.title as { absolute?: string })?.absolute ?? vacationMeta.title)).toContain("연차수당 계산기 2026 — 미사용 연차 수당 — 통상임금·세금 자동 계산");
    expect(String((severanceMeta.title as { absolute?: string })?.absolute ?? severanceMeta.title)).toContain("퇴직금 vs 퇴직연금 비교 2026 — DB·DC·IRP — 어느 방식이 가장 많이 받나?");
  });

  it("두 경로가 2026-11-15 SEASONA 절에 이전 → 이후로 적혀 있다", () => {
    const log = read("docs/gsc-sniping-log.md");
    const at = log.indexOf("## 2026-11-15 SEASONA 검색 설명 변경 기록");
    expect(at).toBeGreaterThan(0);
    const section = log.slice(at);
    expect(section).toContain(`| 2026-11-15 | /calc/vacation-pay | calc ideas[5] | 검색 설명: 사용하지 않은 연차 일수와 연봉만 입력하면`);
    expect(section).toContain(String(vacationMeta.description));
    expect(section).toContain(String(severanceMeta.description));
  });
});
