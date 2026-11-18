// 회사명 정정 — 현대에너지솔루션스 -> HD현대에너지솔루션 (N2-data-08 2단계, data-b03-F03, 운영자 승인 2026-11-18 C-3,
// 이 커밋 하나로 되돌릴 수 있다 — 세 이름 가운데 유일하게 넓어지는 정정)
//
// DART 회사명(corp 01199550, 종목 322000, 2025 사업보고서 rcpNo 20260313001045)과 회사 통합보고서 표기는 'HD현대에너지솔루션'이다.
// 옛 표기 '현대에너지솔루션스'는 HD 사명 변경 전 이름(현대에너지솔루션)에도 없는 '스'가 붙은 오기다.
// 넓어진다: 'HD' 두 글자(H 1446 + D 1404 = 2850 단위)가 음절 '스'(1770 단위)를 대신해 기본 굵기에서 +1080 단위
// (16px 약 +8.4px, H1 700 굵기 32px 약 +17.8px). 이름은 <title>·H1·이동 경로(CalcResultAd 위)와 비교 2쪽 제목·H1(HomeTopAd 위)·
// 관련 회사 카드 등에 나온다 — 통합 스윕이 광고 위치를 판정하고, 내려가면 이 커밋만 되돌린다.
// 덧붙은 효과(렌더 비교로 확인): 회사명이 DART 회사명과 같아져 DART 행의 회사 링크 해석(resolveCompanyRouteId, 회사명 정규화 일치)이
// 이 회사 페이지를 찾는다 — /salary-db/listed/industry/semiconductor 순위 행·/salary/86000000·/salary/86500000·/monthly/7200000
// 비슷한 연봉 상장사 표의 'HD현대에너지솔루션' 글자에 /salary-db/hyundai-lifeway 링크가 생긴다(글자·폭 그대로). URL 은 늘거나 줄지 않는다
// (직원 238명이라 상장 lite 코호트 밖), 회사 페이지에 공시 카드는 생기지 않는다(카드는 corpCodeMap·dartInjection id 기준 — 2월 몫).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import titleSnapshot from "./fixtures/companyTitles-2026-09-25.json";
import preGateSnapshot from "./fixtures/companyPreGate-bd68d860.json";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { allCompanies } from "@/data/companies";
import { buildCompanySalaryFaq } from "@/lib/companySalaryBasis";
import { dartDisclosed } from "@/data/dart/dartDisclosed";
import { getListedByStockCode, resolveCompanyRouteId } from "@/lib/salary-data/dartLite";

const ID = "hyundai-lifeway";
const OLD = "현대에너지솔루션스";
const NEW = "HD현대에너지솔루션";
/** 정정 전 고정본의 연봉 FAQ sha(bd68d860 출력) — 이름만 되돌리면 이 값과 같아야 한다 */
const PRE_FAQ_SHA_OLD_NAME = "/V+B1aTWpnzaNl42j0Q/FupSkBDiesPKg72/IpVBN/o=";
const sha = (t: string) => createHash("sha256").update(t, "utf8").digest("base64");

afterEach(() => vi.useRealTimers());

describe("N2-data-08 2단계 — hyundai-lifeway 회사명 HD현대에너지솔루션", () => {
  it("name.ko 는 DART 회사명과 같은 HD현대에너지솔루션, 영문명·업종·tier·lastUpdated 는 그대로", () => {
    const c = companyRepository.getById(ID)!;
    expect(c.name).toEqual({ ko: NEW, en: "Hyundai Energy Solutions" });
    expect(c.industry).toBe("Solar / EV Charging");
    expect(c.tier).toBe("conglomerate");
    expect(allCompanies.filter((x) => x.id === ID).map((x) => x.lastUpdated)).toEqual(["2026-05-15"]);
    expect(companyRepository.getAll().filter((x) => x.name.ko === NEW).map((x) => x.id)).toEqual([ID]);
    const d = dartDisclosed.find((x) => x.corpCode === "01199550")!;
    expect(d.stockCode).toBe("322000");
    expect(d.corpNameKo).toBe(NEW);
  });

  it("옛 표기가 데이터·고정본에 남지 않는다", () => {
    expect(readFileSync("src/data/krCompanies_Batch21.ts", "utf8")).not.toContain(`ko: "${OLD}"`);
    const t = titleSnapshot as Record<string, string>;
    const pre = preGateSnapshot as { descriptions: Record<string, string> };
    expect(t[ID]).toBe("HD현대에너지솔루션 연봉 2026 — 신입 5,450만원~시니어 9,500만원 직급별 연봉표 | 머니샐러리");
    expect(pre.descriptions[ID].startsWith(`${NEW} 연봉 자체 추정치:`)).toBe(true);
    for (const text of [JSON.stringify(titleSnapshot), JSON.stringify(preGateSnapshot)]) expect(text).not.toContain(OLD);
  });

  it("적용 전 연봉 FAQ 는 이름만 바뀌었다 — 이름을 되돌리면 bd68d860 고정본 sha 와 같다", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T14:59:59.999Z"));
    const json = JSON.stringify(buildCompanySalaryFaq(companyRepository.getById(ID)!));
    expect(json).toContain(NEW);
    expect(sha(json.split(NEW).join(OLD))).toBe(PRE_FAQ_SHA_OLD_NAME);
    expect(sha(json)).toBe((preGateSnapshot as { salaryFaqSha256: Record<string, string> }).salaryFaqSha256[ID]);
  });

  it("사이트 검색이 새 이름·HD 이전 사명(현대에너지솔루션)으로 찾는다", () => {
    expect(companyRepository.search(NEW).map((c) => c.id)).toContain(ID);
    expect(companyRepository.search("hd현대에너지솔루션").map((c) => c.id)).toContain(ID);
    expect(companyRepository.search("현대에너지솔루션").map((c) => c.id)).toContain(ID);
  });

  it("DART 행 링크가 이 회사 페이지로 풀리지만 URL·공시 카드는 그대로(lite 코호트 밖, disclosed 없음)", () => {
    expect(resolveCompanyRouteId(undefined, NEW)).toBe(ID);
    expect(getListedByStockCode("322000")).toBeNull();
    expect(companyRepository.getById(ID)!.disclosed).toBeUndefined();
  });

  it("넓어지는 정정임을 고정 — 기본 굵기 글꼴 단위 15,930 -> 17,010 (+1,080)", () => {
    const adv = (s: string) => [...s].reduce((sum, ch) => sum + (/[가-힣]/.test(ch) ? 1770 : ch === "H" ? 1446 : ch === "D" ? 1404 : NaN), 0);
    expect(adv(OLD)).toBe(15930);
    expect(adv(NEW)).toBe(17010);
  });
});
