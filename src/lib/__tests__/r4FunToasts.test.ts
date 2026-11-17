// FIRE 계산기·퇴사 플랜·밈코인 토스트 가운데 정렬 회귀 가드 (2026-11-15 감사 components-b06-F02 의 같은 버그, n2 leftovers, R4 FUN)
//
// framer-motion 이 y 애니메이션으로 인라인 transform 을 써서 Tailwind -translate-x-1/2 를 덮는다. 토스트 왼쪽 끝이 화면 50% 에
// 붙어 휴대폰에서 오른쪽이 잘렸다. 주말 당직·환생·소비 성향(N2-components-09, funToastAndDutyDates.test.ts)과 같은 세 속성 수정.
// 토스트는 position:fixed 이고 누른 뒤에만 그려져 흐름·광고 위치와 무관하다. 소스 문자열만 읽는다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8").replace(/\r\n/g, "\n");

describe("motion 토스트는 framer 가 가로 -50% 를 갖는다 (각 파일의 y 20 유지)", () => {
  it.each([
    "src/app/fire-calculator/page.tsx",
    "src/app/fun/escape-plan/page.tsx",
    "src/app/fun/meme-coin/page.tsx",
  ])("%s", (file) => {
    const src = readSrc(file);
    const toast = src.match(/<motion\.div\s+initial=\{\{ opacity: 0, y: 20, x: "-50%" \}\}\s+animate=\{\{ opacity: 1, y: 0, x: "-50%" \}\}\s+exit=\{\{ opacity: 0, y: 20, x: "-50%" \}\}\s+className="fixed bottom-8 left-1\/2 ([^"]*)"/);
    expect(toast, "toast motion.div").not.toBeNull();
    expect(toast![1]).not.toContain("-translate-x-1/2");
    // 고정 위치 토스트만 고쳤다 — 같은 파일의 다른 motion.div 는 x 를 갖지 않는다
    expect(src.match(/x: "-50%"/g)).toHaveLength(3);
  });
});
