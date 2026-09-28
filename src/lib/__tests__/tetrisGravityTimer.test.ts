// /fun/tetris 중력 타이머 의존성 가드 (2026-09-28, 감사 STAB-A4 테트리스분)
//
// 게임 루프 effect 가 move(=activePiece·grid 의존)와 activePiece 에 의존하면 블록이 한 칸 움직이거나
// 재렌더될 때마다 setInterval 이 지워지고 다시 걸린다(중력 타이머 리셋). 좌우 이동·회전을 틱 간격보다
// 빨리 누르면 블록이 떨어지지 않았다. 틱은 ref 로 최신 move 를 부르고, 타이머는 시작/종료·레벨·
// 새 블록 등장 때만 다시 건다. (이 환경엔 DOM 렌더러가 없어 소스 계약으로 고정 — flappy 가드와 같은 방식)

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("/fun/tetris — 중력 타이머 의존성", () => {
  const source = readFileSync("src/app/fun/tetris/page.tsx", "utf8");
  const loop = /\/\/ --- Game Loop ---([\s\S]*?)\/\/ --- Controls ---/.exec(source)?.[1] ?? "";
  const deps = /\}, \[([^\]]*)\]\);\s*$/.exec(loop.trim())?.[1].split(",").map((d) => d.trim()) ?? [];

  it("게임 루프는 이동·재렌더마다 다시 걸리지 않는다 (move·activePiece 비의존)", () => {
    expect(loop).toContain("setInterval(");
    expect(deps).toEqual(["isPlaying", "gameOver", "hasActivePiece", "level", "spawnPiece"]);
    expect(loop).toMatch(/setInterval\(\(\) => \{\s*moveRef\.current\(0, 1\);/);
  });

  it("ref 는 커밋마다 최신 move 로 갱신되고 checkCollision 은 grid 에만 의존한다", () => {
    expect(source).toMatch(/useEffect\(\(\) => \{\s*moveRef\.current = move;\s*\}, \[move\]\);/);
    expect(source).toMatch(/const checkCollision = useCallback\(/);
    expect(source).toMatch(/return false;\s*\}, \[grid\]\);/);
  });
});
