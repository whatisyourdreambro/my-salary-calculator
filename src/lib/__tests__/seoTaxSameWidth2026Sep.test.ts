// seo-tax 그룹(2026-09-29) 10/2~3 배포 묶음 회귀 가드 — 광고 위 제자리 교체·접힌 FAQ 사실 정정
//
// ★슬롯 분리: 이 파일은 10/2~3 같은 폭 정정 커밋(TS-01·05·07·10·14·21·22·23·24·27)만 있어도 통과해야 한다.
//   10/13~15 광고 아래 추가 커밋이 만든 export·문구·섹션은 seoTaxBelowAd2026Sep.test.ts 에만 단언한다.
//
// 1) 광고 위 제자리 교체는 어절 구성(한글 음절 수·숫자·기호, 띄어쓰기 위치)이 원문과 같다 —
//    사이트 폰트는 한글 음절 폭이 모두 같고(1770/2048em) 한국어 문단은 keep-all(globals.css)이라
//    어절 구성이 같으면 줄바꿈도 같다. +·= 처럼 폭이 같은 기호끼리의 교체는 WIDTH_TWINS 로 허용.
// 2) 접힌 FAQ·광고 위 문구의 핵심 사실 값 고정 — 출처는 각 커밋 메시지와 페이지 주석.
//    · 2026 세제개편안 9/1 정부안 확정: 비거주 1주택 12억 유지·세부담상한 150% 유지(재정경제부 2026-09-01 주요 수정사항)
//    · 연말정산 미리보기 개통 2023-10-31·2024-11-15·2025-11-05(국세청 발표)
//    · 교육비 세액공제: 초등학생 학원비는 9세 미만 또는 2학년 이하 예능 학원·체육시설만(소득세법 제59조의4, 시행 2026.1.1)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { YEAR_END_STEPS } from "@/data/yearEndTaxHub";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8");

// ── 광고 위 제자리 교체: 어절 구성 동일성 ─────────────────────────────────────────────
const WIDTH_TWINS: Record<string, string> = { "=": "+", "·": ".", ":": "." };
/** 어절마다 [한글 음절 수, 한글 밖 문자열(폭 같은 기호는 대표 문자로)] */
const shape = (s: string) =>
  s.split(" ").map((w) => {
    const chars = [...w];
    const hangul = chars.filter((c) => /[가-힣]/.test(c)).length;
    const rest = chars
      .filter((c) => !/[가-힣]/.test(c))
      .map((c) => WIDTH_TWINS[c] ?? c)
      .join("");
    return `${hangul}|${rest}`;
  });

const SAME_WIDTH: [string, string, string][] = [
  ["src/app/tax-reform-2026/page.tsx", "실거주 14억·비거주 9억 차등화", "실거주 14억·비거주 9억 철회됨"],
  ["src/app/tax-reform-2026/page.tsx", "'실거주 여부'가 종부세의 핵심 기준이 됩니다.", "'비거주 축소'는 국무회의 확정 시점에 철회됨."],
  ["src/app/year-end-tax-preview/page.tsx", "10월 말~11월 초에 오픈", "10월 말~11월 중순 오픈"],
  ["src/data/yearEndTaxHub.ts", "예년 기준 10월 말 오픈) 전에도", "예년 기준 10월 말 이후) 전에도"],
  ["src/app/health-insurance-fee-2026/page.tsx", "재산세 과세표준 5.4억 이하 필요.", "재산세 과세표준 5.4억 이하 원칙."],
  ["src/app/health-insurance-fee-2026/page.tsx", "본인+회사분 모두 본인 부담.", "본인+회사분 절반 본인 부담."],
  ["src/app/tools/finance/stock-tax/page.tsx", "매년 5월 종합소득세 신고 필요.", "매년 5월 양도소득세 신고 필요."],
  ["src/app/tools/finance/irp/page.tsx", "기타소득세 16.5% + 그동안 받은 세액공제 환수.", "기타소득세 16.5% = 그동안 받은 세액공제 환수."],
  ["src/app/year-end-tax-settlement-2026/page.tsx", "지정기부금 15% 세액공제. 종교단체도 가능.", "일반기부금 15% 세액공제. 종교단체도 가능."],
  ["src/app/year-end-tax-settlement-2026/page.tsx", "본인·자녀 학원비, 교복비 등 일부 공제 가능.", "유아·초등 예체능, 교복비 등 일부 공제 가능."],
  ["src/app/year-end-tax-checklist/page.tsx", "지정기부금 영수증 (15% 세액공제, 1천만 초과 30%)", "일반기부금 영수증 (15% 세액공제, 1천만 초과 30%)"],
  ["src/app/rent-tax-credit-2026/page.tsx", "기획재정부 2026년 8월 3일 세제개편안", "재정경제부 2026년 8월 3일 세제개편안"],
  ["src/app/credit-card-deduction-2026/page.tsx", "· 기획재정부 2026년", "· 재정경제부 2026년"],
];

describe("광고 위 제자리 교체는 어절 구성이 원문과 같다", () => {
  for (const [file, before, after] of SAME_WIDTH) {
    it(`${file}: ${after}`, () => {
      expect(shape(after)).toEqual(shape(before));
      const src = readSrc(file);
      expect(src).toContain(after);
      expect(src).not.toContain(before);
    });
  }
  // 유일한 예외 — 문단 마지막 어절(한글 5+마침표)을 한글 3·2 두 어절로 나눴다(합 폭 −0.05px).
  // keep-all 에서 마지막 어절만 나뉘면 줄 수가 같다: 원문 끝 어절이 앞줄에 들어가면 새 문구도 들어가고,
  // 넘어가면 앞 3음절이 앞줄에 남거나 함께 넘어가 줄 수 동일. 카드 288~768px 1px 간격 렌더로도 높이 차이 0.
  // 통합 담당 폭 스윕에서 광고 top 이 한 폭이라도 바뀌면 이 문구만 원문(상향합니다.)으로 되돌리고 이 단언을 뺀다.
  it("세부담상한 문장 끝 — 마지막 어절 상향합니다. → 상향안 철회 (한글 총량 5 동일, 마침표 대신 빈칸)", () => {
    const before = "세부담상한은 150%에서 200%로 상향합니다.";
    const after = "세부담상한은 150%에서 200%로 상향안 철회";
    expect(shape(after).slice(0, -2)).toEqual(shape(before).slice(0, -1));
    expect(shape(after).slice(-2).map((w) => Number(w.split("|")[0]))).toEqual([3, 2]);
    const src = readSrc("src/app/tax-reform-2026/page.tsx");
    expect(src).toContain(`${after}"`);
    expect(src).not.toContain(before);
  });
});

describe("사실 정정 고정 — 10/2~3 묶음", () => {
  it("세제개편안 접힌 FAQ — 9/1 정부안 확정·9/3 국회 제출·상한 150% 유지", () => {
    const src = readSrc("src/app/tax-reform-2026/page.tsx");
    expect(src).not.toContain("세부담상한은 150%에서 200%로 상향합니다");
    expect(src).toContain("9월 3일 정기국회에 제출됐으며");
    expect(src).toContain("철회돼 현행 12억원 유지");
    expect(src).toContain("현행 150%가 유지됩니다");
  });
  it("연말정산 미리보기 — 오픈 시기 10월 말~11월 중순, 접힌 FAQ 에 최근 3년 개통일", () => {
    const src = readSrc("src/app/year-end-tax-preview/page.tsx");
    expect(src).toContain("최근 3년은 2023년 10월 31일, 2024년 11월 15일, 2025년 11월 5일에 열렸습니다(국세청 발표)");
  });
  it("연말정산 허브 — 가이드 제목 100%·오픈 시기", () => {
    const preview = YEAR_END_STEPS.find((s) => s.id === "preview")!;
    expect(preview.desc).toContain("예년 기준 10월 말 이후");
    expect(preview.entries.map((e) => e.title)).toContain("미리보기 100% 활용 가이드");
  });
  it("최저임금 2027 — 건강보험 2027 동결 확정(접힌 FAQ)·요율 CTA 는 2027 요율표", () => {
    const src = readSrc("src/app/minimum-wage-2027/page.tsx");
    expect(src).toContain("2027년 요율이 동결(총 7.19%, 본인 3.595%)돼");
    expect(src).toContain('<h3 className="text-lg font-black mb-2">2027 4대보험 요율</h3>');
    expect(src).not.toContain("2026 4대보험 요율</h3>");
  });
  it("건보료 FAQ — 본인부담상한 2026 값·임의계속 50% 경감·2022년 9월 2단계 개편", () => {
    const src = readSrc("src/app/health-insurance-fee-2026/page.tsx");
    expect(src).toContain("2026년 진료분 90만원~843만원");
    expect(src).toContain("50%를 경감받아");
    expect(src).toContain("2022년 9월 건강보험료 부과체계 2단계 개편");
    expect(src).not.toContain("2024년 기준 87만원~808만원");
  });
  it("종소세 FAQ — 수정신고 90~10% 감면·기한후신고 결정 전까지·특례·일반 기부금", () => {
    const src = readSrc("src/app/year-end-tax-2026/page.tsx");
    expect(src).toContain("1개월 이내 90%, 3개월 이내 75%, 6개월 이내 50%, 1년 이내 30%, 1년 6개월 이내 20%, 2년 이내 10%");
    expect(src).not.toContain("5년 이내 기한 후 신고는 가능");
    expect(src).not.toContain("법정·지정 기부금");
  });
  it("12월 점검 카드 교육비 — 본인 학원비 삭제, 초등은 예체능만(초등 학원비 전반 아님)", () => {
    const src = readSrc("src/app/year-end-tax-settlement-2026/page.tsx");
    expect(src).not.toContain("본인·자녀 학원비");
    expect(src).not.toContain("유아·초등 학원비");
  });
  it("IRP 계산기 FAQ — 이연퇴직소득 70%·60%·50%, 적격 TDF 100%", () => {
    const src = readSrc("src/app/tools/finance/irp/page.tsx");
    expect(src).toContain("퇴직소득세의 70%(연금 수령 11~20년차는 60%, 21년차부터는 50%)");
    expect(src).toContain("적립금의 100%까지 투자할 수 있습니다");
    expect(src).not.toContain("평균 50~70% 세금 절감");
  });
});
