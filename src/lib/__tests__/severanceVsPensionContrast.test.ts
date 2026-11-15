// /calc/severance-vs-pension 결과 카드 글자 대비 (2026-11-15 감사 calc-04-F10)
// 종전: #10B981 위 흰 금액 2.54:1, 70% 흰 라벨 1.91:1, 60% 흰 설명 1.73:1, 흰 카드 #7A9AB5 2.95:1, #94A3B8 2.56:1.
// 색만 바꾼다(글자 크기·간격 그대로 — 광고 위치 무관). 10~12px 글자라 WCAG AA 4.5:1 이상.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const client = readFileSync(resolve(process.cwd(), "src/app/calc/severance-vs-pension/Client.tsx"), "utf8");

type Rgb = [number, number, number];
const hex = (h: string): Rgb => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const over = (fg: Rgb, alpha: number, bg: Rgb): Rgb =>
  fg.map((c, i) => c * alpha + bg[i] * (1 - alpha)) as Rgb;
const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const WHITE = hex("#FFFFFF");

describe("결과 카드 글자 대비 4.5:1 이상 (calc-04-F10)", () => {
  it("강조(IRP 연금 수령) 카드 2장은 #047857 바탕", () => {
    expect(client.match(/accent="#047857"/g)?.length).toBe(2);
    expect(client).not.toContain('accent="#10B981"');
  });

  it("강조 카드: 흰 금액과 90% 흰 라벨·설명·세전/세금 줄", () => {
    const bg = hex("#047857");
    expect(contrast(WHITE, bg)).toBeGreaterThanOrEqual(4.5);
    expect(client.match(/highlight \? "rgba\(255,255,255,0\.9\)"/g)?.length).toBe(3);
    expect(client).not.toMatch(/highlight \? "rgba\(255,255,255,0\.[67]\)"/);
    expect(contrast(over(WHITE, 0.9, bg), bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("흰 카드: 라벨·세전/세금 줄 #475569, 설명 #64748B, 금액 #0A1829", () => {
    expect(client.match(/: "#475569"/g)?.length).toBe(2);
    expect(client.match(/: "#64748B"/g)?.length).toBe(1);
    expect(client).not.toContain(': "#7A9AB5"');
    expect(client).not.toContain(': "#94A3B8"');
    for (const c of ["#475569", "#64748B", "#0A1829"]) {
      expect(contrast(hex(c), WHITE)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("종전 값은 실제로 4.5:1 미만이었다 (계산식 확인)", () => {
    expect(contrast(WHITE, hex("#10B981"))).toBeCloseTo(2.54, 2);
    expect(contrast(over(WHITE, 0.6, hex("#10B981")), hex("#10B981"))).toBeLessThan(2);
    expect(contrast(hex("#94A3B8"), WHITE)).toBeCloseTo(2.56, 2);
  });
});
