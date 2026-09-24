// src/lib/__tests__/widgetCompanyNote.test.ts
//
// /widget/company 카드 하단 안내문 가드 (A19 리뷰 정정, 2026-09-25):
//  - 헤드라인 산정 기준을 밝힌다 — 무플래그 = 공시 1인평균급여액 기준, b="c" = 급여총액÷인원.
//  - 임베드 iframe 높이 고정(420px) — 종전 안내문보다 길어지지 않는다.
//  - 날짜는 카드 내용 변경일(DART_INJECTION_DATE)이라 '갱신일' 로 표기한다(수집일과 구분).
import { describe, expect, it } from "vitest";
import { GET } from "@/app/widget/company/route";
import { dartInjection, DART_INJECTION_DATE } from "@/data/dart/dartInjection";
import { dartNameMap } from "@/data/dart/dartNameMap";

async function note(id: string): Promise<string> {
  const res = await GET(new Request(`https://www.moneysalary.com/widget/company?id=${id}`));
  const html = await res.text();
  const m = html.match(/<p class="note">([\s\S]*?)<\/p>/);
  if (!m) throw new Error(`note 없음: ${id}`);
  return m[1];
}

describe("/widget/company 안내문 — 산정 기준·길이·날짜 라벨", () => {
  const reportedId = Object.keys(dartInjection).find(
    (id) => dartInjection[id].b === undefined && Object.hasOwn(dartNameMap, id)
  )!;
  const computedId = Object.keys(dartInjection).find(
    (id) => dartInjection[id].b === "c" && Object.hasOwn(dartNameMap, id)
  );

  it.each([
    ["reported", reportedId, "1인평균급여액 기준"],
    ["computed", computedId, "급여총액÷인원 기준"],
  ] as const)("%s 카드는 기준을 밝히고 종전 문구보다 짧다", async (_label, id, basis) => {
    if (!id) return; // 해당 기준 카드가 없으면 건너뜀
    const text = await note(id);
    expect(text).toContain(basis);
    expect(text).toContain(`갱신일 ${DART_INJECTION_DATE}`);
    expect(text).not.toContain("데이터 기준일");
    const y = dartInjection[id].y;
    const legacy = `금융감독원 DART ${y}년 사업보고서 &ldquo;직원 등의 현황&rdquo; 기준(임원 제외 전 직원 평균, 100만원 단위 반올림). 데이터 기준일 ${DART_INJECTION_DATE}.`;
    expect(text.length).toBeLessThanOrEqual(legacy.length);
  });
});
