// N2-app-pages-06 (2026-11-15 감사 app-pages-b03-F01·F05·M01) — /health-checkup-2026 사실·글꼴 회귀 가드.
// standaloneFactsR8B.test.ts 는 다른 묶음(N2-app-pages-13·RL-48)이 고치는 파일이라 이 파일로 따로 둔다.
// 광고 위 두 정정(링크 카드 7월->4월, 폐암 비용 칸)은 되돌리기 단위가 되도록 커밋마다 이 파일의 다른 자리에 단언을 둔다
// (카드 단언은 맨 위, 비용 칸 단언은 맨 아래).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const src = readFileSync(resolve(process.cwd(), "src/app/health-checkup-2026/page.tsx"), "utf8").replace(/\s+/g, " ");

// 접힌 FAQ(GuideMidAd 아래 닫힌 details) — '多'(U+591A)는 사이트 서브셋 글꼴에 없는 글자라 열면 시스템 글꼴로 그려졌다.
// 1895f456e(2026-09-28)가 같은 쪽의 다른 '多'만 '많음'으로 바꿨다.
describe("/health-checkup-2026 접힌 FAQ 글꼴", () => {
  it("서브셋 밖 글자 '多'가 쪽 어디에도 없다", () => {
    expect(src).toContain("회사 인사팀이 일괄 예약하는 경우가 많습니다.");
    expect(src).not.toContain("多");
  });
});
