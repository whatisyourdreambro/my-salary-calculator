// 삼성 성과급 데이터 모듈 불변식 + 잔존 문자열 게이트 (2026-09-21 S2-0, 10배 계획 L13b ②).
//
// 1) opiData/taiData/annualOp 의 발표 전 null 강제·라벨 파생을 검사한다.
// 2) page.tsx·Client.tsx·TaiCalculator.tsx 본문에 반기·실지급률 리터럴이 다시 박히지 않도록
//    허용 목록 방식으로 스캔한다 — 12월 TAI H2·1월 OPI 발표 때 데이터 파일만 고치면 되게.
// jsdom 없음 — 순수 데이터와 소스 텍스트만 본다.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ANNUAL_OP_2026_PRELIM, DEFAULT_PROFIT_TRILLION, initialProfitTrillion } from "./annualOp";
import { OPI1_DEFAULT_RATE, OPI1_MAX_RATE, OPI_ACTUAL, OPI_ACTUAL_2025, OPI_LATEST, OPI_LATEST_TOP, opiRateSummary } from "./opiData";
import {
  TAI_H2_ANNOUNCED_DATE,
  TAI_H2_PAY_DATE,
  TAI_LATEST,
  TAI_LATEST_TOP,
  TAI_RATES_2026_H1,
  TAI_RATES_2026_H2,
  taiRateSummary,
} from "./taiData";

describe("opiData — 2025년 실적분 동결값·파생", () => {
  it("2025년분 8행 (노조 공지 기반 보도, 2026-01-30 지급)", () => {
    expect(OPI_ACTUAL_2025.payDate).toBe("2026-01-30");
    expect(OPI_ACTUAL_2025.rates.map((r) => [r.division, r.rate])).toEqual([
      ["MX (스마트폰)", 50],
      ["DS부문 공통", 47],
      ["한국총괄·SR·CDO", 37],
      ["생산기술연구소", 36],
      ["EHS", 34],
      ["경영지원·하만·상생협력·글로벌CS", 39],
      ["VD·생활가전·네트워크·의료기기", 12],
      ["CSS사업팀", 11],
    ]);
    expect(OPI_ACTUAL_2025.rates.every((r) => r.rate >= 0 && r.rate <= OPI1_MAX_RATE)).toBe(true);
  });
  it("최신 블록 = 마지막 원소, 기본값은 최고 실지급률(상한 안)", () => {
    expect(OPI_LATEST).toBe(OPI_ACTUAL[OPI_ACTUAL.length - 1]);
    expect(OPI_LATEST_TOP.rate).toBe(Math.max(...OPI_LATEST.rates.map((r) => r.rate)));
    expect(OPI1_DEFAULT_RATE).toBe(Math.min(OPI1_MAX_RATE, OPI_LATEST_TOP.rate));
    expect(opiRateSummary(2)).toBe("MX 50%·DS부문 공통 47%");
  });
});

describe("taiData — H1 동결값 · H2 null 슬롯 · 라벨 파생", () => {
  it("2026 상반기 11행 (2026-07-06 발표)", () => {
    expect(TAI_RATES_2026_H1).toHaveLength(11);
    expect(TAI_RATES_2026_H1.find((r) => r.id === "memory")?.rate).toBe(100);
    expect(TAI_RATES_2026_H1.find((r) => r.id === "mx")?.rate).toBe(50);
    expect(TAI_RATES_2026_H1.find((r) => r.id === "da")?.rate).toBe(25);
  });
  it("하반기 슬롯: 발표 전 3필드 전부 null, 채우면 전부 non-null (추정 카피 금지)", () => {
    if (TAI_RATES_2026_H2) {
      expect(TAI_RATES_2026_H2.length).toBeGreaterThan(0);
      expect(TAI_H2_ANNOUNCED_DATE).not.toBeNull();
      expect(TAI_H2_PAY_DATE).not.toBeNull();
      expect(TAI_LATEST.half).toBe("H2");
    } else {
      expect(TAI_H2_ANNOUNCED_DATE).toBeNull();
      expect(TAI_H2_PAY_DATE).toBeNull();
      expect(TAI_LATEST.half).toBe("H1");
      expect(TAI_LATEST.periodLabel).toBe("2026년 상반기");
      expect(TAI_LATEST.shortLabel).toBe("2026 상반기");
      expect(TAI_LATEST.rates).toBe(TAI_RATES_2026_H1);
      expect(TAI_LATEST.announcedDate).toBe("2026년 7월 6일");
      expect(TAI_LATEST.payDate).toBe("2026년 7월 8일");
    }
  });
  it("최고 지급률 행·요약 문자열", () => {
    expect(TAI_LATEST_TOP.division).toBe("메모리");
    expect(TAI_LATEST_TOP.rate).toBe(100);
    expect(taiRateSummary()).toMatch(/^메모리·[^,]+ 100%, /);
    expect(taiRateSummary()).toMatch(/생활가전 \(DA\) 25%$/);
  });
});

describe("annualOp — 잠정실적 트리거 (1/8)", () => {
  it("발표 전 announced=false·전 필드 null, 발표 후 전 필드 non-null", () => {
    const a = ANNUAL_OP_2026_PRELIM;
    if (a.announced) {
      expect(a.profitTrillion).toBeGreaterThan(0);
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.source).toMatch(/^https?:\/\//);
      expect(initialProfitTrillion()).toBe(a.profitTrillion);
    } else {
      expect(a.profitTrillion).toBeNull();
      expect(a.date).toBeNull();
      expect(a.source).toBeNull();
      expect(initialProfitTrillion()).toBe(DEFAULT_PROFIT_TRILLION);
    }
    expect(DEFAULT_PROFIT_TRILLION).toBe(350);
  });
});

// ── 잔존 문자열 게이트 (허용 목록 방식) ─────────────────────────────────────
// 본문 파일에 반기 라벨·실지급률·지급일 리터럴이 남아 있으면 실패한다. 주석 줄과
// 아래 ALLOW 에 등록된 줄(검색 키워드 등 의도적 고정 문자열)만 통과.
const DIR = join(__dirname);
const SCAN_FILES = ["page.tsx", "Client.tsx", "TaiCalculator.tsx"];
const FORBIDDEN: RegExp[] = [
  /2026년? 상반기/,
  /2026년? 하반기/,
  /상반기 (?:실제 )?발표(?:값| 지급률)/,
  /MX 50%/,
  /DS부문 공통 47%/,
  /DS부문 47%/,
  /2025년 실적분/,
  /2025년분:/,
  /2026-01-30/,
  /2026년 1월 30일/,
  /메모리 100%/,
  /7월 6일 사내 공지/,
];
const ALLOW: string[] = [
  '"삼성 TAI 상반기"', // 검색 키워드(메타) — 반기 고정 표기 의도
  "잠정합의안(현금 40% + 자사주 60%)", // (SK 문장은 이번 배치에서 제거 — 남아 있으면 실패해야 하므로 등록하지 않음)
].filter((s) => !s.startsWith("잠정합의안"));
const isComment = (line: string) => /^\s*(?:\/\/|\/\*|\*|\{\/\*)/.test(line);

describe("잔존 문자열 게이트 — 반기·실지급률 리터럴은 데이터 파일에만", () => {
  for (const file of SCAN_FILES) {
    it(`${file}: 본문에 고정 리터럴 없음`, () => {
      const lines = readFileSync(join(DIR, file), "utf8").split(/\r?\n/);
      const hits: string[] = [];
      lines.forEach((line, i) => {
        if (isComment(line)) return;
        if (ALLOW.some((a) => line.includes(a))) return;
        for (const re of FORBIDDEN) {
          if (re.test(line)) hits.push(`${file}:${i + 1} ${re} :: ${line.trim().slice(0, 90)}`);
        }
      });
      expect(hits).toEqual([]);
    });
  }
  it("Client.tsx: SK하이닉스 상태 문장은 9/16 가결 기준", () => {
    const src = readFileSync(join(DIR, "Client.tsx"), "utf8");
    expect(src).not.toMatch(/부결되어 재협상 중/);
    expect(src).toMatch(/2026-09-16/);
  });
});
