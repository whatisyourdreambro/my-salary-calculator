// 홈 '미래 연봉' 탭 회귀 가드 (2026-10-05 감사 code24-04·code54-02)
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { calculateFutureSalary } from "@/lib/futureCalculator";

describe("이벤트 유형 변경 시 값 초기화", () => {
  it("이직 이벤트 값이 10(원)으로 남으면 그해 연봉이 10원이 된다 — 그래서 유형 변경 때 값을 바꾼다", () => {
    const broken = calculateFutureSalary(50_000_000, 3, 5, [{ yearIndex: 1, type: "job_change", value: 10 }], null);
    expect(broken[1].salary).toBe(10);
    const src = readFileSync(resolve(process.cwd(), "src/components/FutureSalaryCalculator.tsx"), "utf8");
    expect(src).toContain('targetEvent.value = nextType === "promotion" ? 10 : Number(currentSalary.replace(/,/g, "")) || 0;');
  });
  it("자체 참고 분포 선을 '시장' 평균으로 부르지 않는다", () => {
    const src = readFileSync(resolve(process.cwd(), "src/components/FutureSalaryCalculator.tsx"), "utf8");
    expect(src).toContain('name="참고 분포 평균"');
    expect(src).toContain('name="참고 분포 상위 10%"');
    expect(src).not.toContain('name="시장 평균"');
  });
});

describe("미래 연봉 탭 접근성 이름·상태 (2026-11-15 감사 components-b03-F03·F04, N2-components-07)", () => {
  const src = () => readFileSync(resolve(process.cwd(), "src/components/FutureSalaryCalculator.tsx"), "utf8");
  it("직군·경력·상승률 제목이 입력칸과 이어진다", () => {
    const s = src();
    for (const id of ["future-job", "future-exp", "future-rate"]) {
      expect(s).toContain(`htmlFor="${id}"`);
      expect(s).toContain(`id="${id}"`);
    }
  });
  it("예측/목표 전환은 눌림 상태를, 이벤트 칸과 삭제 단추는 이름을 갖는다", () => {
    const s = src();
    expect(s).toContain('aria-pressed={mode === "predict"}');
    expect(s).toContain('aria-pressed={mode === "goal"}');
    expect(s).toContain("aria-label={`이벤트 ${index + 1} 연차`}");
    expect(s).toContain("aria-label={`이벤트 ${index + 1} 유형`}");
    expect(s).toContain('aria-label={`이벤트 ${index + 1} ${event.type === "promotion" ? "인상률(%)" : "이직 연봉(원)"}`}');
    expect(s).toContain('<button type="button" aria-label={`이벤트 ${index + 1} 삭제`} onClick={() => removeEvent(index)}');
  });
});
