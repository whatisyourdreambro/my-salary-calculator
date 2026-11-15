// /fun 토스트 가운데 정렬·당직 추첨기 날짜 중복 회귀 가드 (2026-11-15 감사 components-b06-F02·F04, N2-components-09)
//
// - framer-motion 이 y 애니메이션으로 인라인 transform 을 써서 Tailwind -translate-x-1/2 를 덮었다. 토스트 왼쪽 끝이 화면 50% 에
//   붙어 360px 휴대폰에서 '⚠️ 날짜와 인원을 입력해주세요!' 뒤쪽이 잘렸다. 가로 이동도 framer 가 갖게 x: "-50%" 를 준다.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (rel: string) => readFileSync(resolve(process.cwd(), rel), "utf8").replace(/\r\n/g, "\n");

describe("motion 토스트는 framer 가 가로 -50% 를 갖는다 (components-b06-F02)", () => {
  it.each([
    "src/components/WeekendDutyGame.tsx",
    "src/app/fun/reincarnation/page.tsx",
    "src/app/fun/spending-test/page.tsx",
  ])("%s", (file) => {
    const src = readSrc(file);
    const toast = src.match(/<motion\.div\s+initial=\{\{ opacity: 0, y: 30, x: "-50%" \}\}\s+animate=\{\{ opacity: 1, y: 0, x: "-50%" \}\}\s+exit=\{\{ opacity: 0, y: 30, x: "-50%" \}\}\s+className="fixed bottom-8 left-1\/2 ([^"]*)"/);
    expect(toast, "toast motion.div").not.toBeNull();
    expect(toast![1]).not.toContain("-translate-x-1/2");
  });
});
