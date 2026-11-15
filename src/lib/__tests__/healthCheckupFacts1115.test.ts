// N2-app-pages-06 (2026-11-15 감사 app-pages-b03-F01·F05·M01) — /health-checkup-2026 사실·글꼴 회귀 가드.
// standaloneFactsR8B.test.ts 는 다른 묶음(N2-app-pages-13·RL-48)이 고치는 파일이라 이 파일로 따로 둔다.
// 광고 위 두 정정(링크 카드 7월->4월, 폐암 비용 칸)은 되돌리기 단위가 되도록 커밋마다 이 파일의 다른 자리에 단언을 둔다
// (카드 단언은 맨 위, 비용 칸 단언은 맨 아래).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/health-checkup-2026/page.tsx"), "utf8").replace(/\s+/g, " ");

// 광고 위(CalcResultAd 와 GuideMidAd 사이) 링크 카드 — 직장가입자 건강보험료 정산은 4월분 보험료에 반영된다
// (연결 페이지 /health-insurance-2026 도 4월). '7월 건보 정산'은 운영자 상시 금지 문구(d4eda1cfa 가 메뉴의 같은 문구만 고쳤다).
// 숫자 한 글자 교체: 14px 사이트 글꼴 102.96px -> 103.97px(+1.01px), 카드 글 칸은 최소 약 180px 라 줄바꿈 없음.
describe("/health-checkup-2026 건강보험 정산 링크 카드", () => {
  it("정산 추가 부과 달은 4월이고 7월 문구가 없다", () => {
    expect(src).toContain('<p className="text-sm opacity-90">4월 추가 부과 대응</p>');
    expect(src).not.toContain("7월 추가 부과");
  });
});

// 접힌 FAQ(GuideMidAd 아래 닫힌 details) — '多'(U+591A)는 사이트 서브셋 글꼴에 없는 글자라 열면 시스템 글꼴로 그려졌다.
// 1895f456e(2026-09-28)가 같은 쪽의 다른 '多'만 '많음'으로 바꿨다.
describe("/health-checkup-2026 접힌 FAQ 글꼴", () => {
  it("서브셋 밖 글자 '多'가 쪽 어디에도 없다", () => {
    expect(src).toContain("회사 인사팀이 일괄 예약하는 경우가 많습니다.");
    expect(src).not.toContain("多");
  });
});

// 광고 위(CalcResultAd 와 GuideMidAd 사이) 비용 표 — 폐암 행이 설명·5대 암 행·FAQ(암검진 실시기준 제10·11조)와 달리
// 보험료 하위 50%·의료급여 0원을 빠뜨렸다. 새 칸은 더 짧다(12px 사이트 글꼴 156.23px -> 123.63px, 모든 글자 서브셋 안).
describe("/health-checkup-2026 폐암 검진 비용 칸", () => {
  it("본인 10%와 하위 50% 0원을 함께 적고 옛 칸 문구가 없다", () => {
    expect(src).toContain('{ item: "폐암 검진", cost: "본인 10%(하위 50% 0원)" }');
    expect(src).not.toContain("공단 90% + 본인 10% (1만원대)");
  });
});
