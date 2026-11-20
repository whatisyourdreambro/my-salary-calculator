// 사이트맵 전용 가이드 날짜 — 광고 아래 보강(lens-meta-F01, 운영자 승인 2026-11-13), 또는 화면 날짜를 올리지 못한 광고 위 같은 폭 정정(ads-01)
//
// 화면·OG·Article 날짜(getGuideContentDate)는 그대로 두고 사이트맵 lastmod 만 보강을 고친 날로 올린다.
// 그래야 게시 8단계 IndexNow(사이트맵 (loc, lastmod) 차이)가 보강한 글을 네이버·빙에 알린다.
// 2026-11-15 (ads-01): 이미 '수정' 칩이 있는 R1 10편도 이 표에 있다 — 칩 숫자를 바꾸면 화면 폭 440~445px 에서 광고가 24px 내려가
// (가드 스윕 실측) 화면 날짜는 운영 값 그대로 둔다. 그 10편의 두 날짜 고정은 relandR1Ledger.test.ts.
// 2026-11-18 (운영자 결정 2026-11-17 10번): 칩 없는 글의 본문 정정도 보강 없이 행을 둘 수 있다 — 화면은 그대로(칩을 만들지 않음),
// 사이트맵 날짜만 본문을 고친 날. 이름과 이유를 적은 CHIPLESS_BODY_ROWS 에 있어야 한다(아래 두 번째 검사, rl08GuideFacts.test.ts 도 같은 규칙).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { koGuides } from "@/lib/guidesContent";
import { guideSupplements } from "@/lib/guides/supplements";
import { getGuideContentDate } from "@/lib/guideContentRevisions";
import { GUIDE_SITEMAP_ONLY_REVISED, getGuideSitemapDate } from "@/lib/guideSitemapDates";

const TODAY_KST = new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);
const bySlug = new Map(koGuides.map((g) => [g.slug, g]));
// 링크 한 줄만 받은 보강 — 날짜를 올리지 않는다(lens-meta-F01 검증).
const LINK_ONLY = new Set([
  "etf-beginner", "basic-pension-65-2026", "health-insurance-2026-guide", "retirement-planning", "public-company-salary-ranking-2026",
]);
// 광고 아래 보강이 없는 행 — 이름과 이유를 적은 예외만 허용한다 (2026-11-15, ads-01).
// 이 표의 행은 원래 '마지막 광고 아래 보강을 고친 날'이다. 보강 없이 행을 둘 수 있는 경우는 하나뿐이다: 광고 위 같은 폭 사실 정정을
// 받았지만 이미 떠 있는 '수정' 칩의 숫자를 바꾸면 광고가 내려가서 화면 날짜를 올리지 못한 글. 그 밖의 행은 모두 보강이 있어야 한다.
const NO_SUPPLEMENT_ROWS: Readonly<Record<string, string>> = {
  // R1 RL-02: TL;DR·카드·Article 설명 '금리 인하 시기' → '금리 변동 시기'(같은 폭). 광고 아래 보강은 받지 않았다.
  "us-treasury-bond":
    "R1 RL-02 광고 위 같은 폭 정정만 받았다. 칩을 2026.11.03 으로 바꾸면 화면 폭 440~441px 에서 제목 아래 광고가 24px 내려가 화면 날짜는 2026.10.03 그대로 둔다",
  "bonus-property-sell-same-year-2026": "광고 위 같은 폭 이하 정정만 받았다(b03-F02 양도세 예정신고 기한, 보강 없음). 칩 2026.10.03 숫자는 바꾸지 않는다(R4 GUIDES 2026-11-18)",
  "chip-rsu-stock-tax-2026": "광고 위 같은 폭 이하 정정만 받았다(b13-F04 (c)(d) ISA 문장·표 칸, 보강 없음). 칩 2026.10.03 숫자는 바꾸지 않는다(R4 GUIDES 2026-11-18)",
  "dependent-check-before-bonus-2026": "광고 위 같은 폭 이하 정정만 받았고 광고 아래 보강은 2월(N2-guides-content-10). 칩 2026.10.03 숫자는 바꾸지 않는다(R4 GUIDES 2026-11-18), R4 수리 2026-11-20 리드·사업소득 줄·함정 문단·설명(F3~F5), 같은 날 2회차 설명 '가족 1인 연금·이자 합산'(/guides 태그 목록 N 과 같게)",
  "semiconductor-performance-bonus-tax": "광고 위 같은 폭 이하 정정만 받았다(b13-F04 (b) ISA 문장, 보강 없음). 칩 2026.10.03 숫자는 바꾸지 않는다(R4 GUIDES 2026-11-18)",
  "tax-amnesty-self-report-2026": "광고 위 감면 표 한 줄 추가(N2-lib-12, 운영자 승인 2026-11-17 질문 1 방식)와 더 좁은 설명만 받았다(보강 없음). 칩 2026.10.03 숫자는 바꾸지 않는다(R4 GUIDES 2026-11-18)",
};
// 칩 없는 글의 본문(광고 위) 정정 — 운영자 결정 2026-11-17 10번(DEFER 질문: 화면은 그대로 두고 검색엔진용 날짜만 고친 날로).
// 칩 없는 글은 본문을 고쳐도 화면 날짜가 발행일이라 IndexNow 가 알리지 않는다. 칩을 새로 만들면 GuideMidAd 위 UI 가 늘어나므로(금지)
// 칩 없이 사이트맵 전용 행만 둔다. 값은 그 본문을 실제로 고친 날(KST, git 기록) — 아직 알리지 않은 정정에만, 오늘·게시일·미래 날짜 금지.
const CHIPLESS_BODY_ROWS: Readonly<Record<string, string>> = {
  "commercial-office-capital-gains-2026": "RL-08 재착지 1c90ba05a(2026-11-15) 광고 위 양도세 예시 정정 — 칩 없는 글, 보강 없음",
  "lease-right-transfer-tax-2026": "RL-08 재착지 266f6e806(2026-11-15) 광고 위 보유기간별 세율 정정 — 칩 없는 글, 보강 없음",
  "child-gift-10year-rule-2026": "RL-08 재착지 c11f56d41(2026-11-15) 광고 위 증여세 신고기한 정정 — 칩 없는 글, 보강 없음",
  "rental-business-prop-tax-exclusion-2026": "RL-08 재착지 ffcfbd57b(2026-11-15) 광고 위 종부세 합산배제 예시 정정 — 칩 없는 글, 보강 없음",
  "minimum-wage-2026": "RL-08 재착지 3406a00b1(2026-11-15) 광고 위 월급제 유급 시간 정정 — 칩 없는 글, 보강 없음",
  "hometax-year-end-preview-2026": "lens-season-F05 46d56278d(2026-11-13) 운영 기간 10월 28일~12월 18일 같은 길이 정정 — 칩 없는 글, 보강 없음",
  "samsung-ds-special-bonus-details-oct-2026": "R4 GUIDES b12-F01(2026-11-18) 광고 위 3분기 문단 같은 글자 수 정정 — 칩 없는 글, 보강 없음",
  "sk-hynix-bonus-renegotiation-sept-2026": "R4 GUIDES b12-F03(2026-11-18) 광고 위 계산기 시나리오 값 같은 글자 수 정정 — 칩 없는 글, 보강 없음",
  "samsung-electronics-stock-2026": "R4 GUIDES b13-F04 (a)(2026-11-18) 광고 위 ISA 문장 더 좁게 정정 — 칩 없는 글, 보강 없음",
  "chip-stock-tax-guide": "R4 GUIDES b13-M01(2026-11-18) 광고 위 연금계좌 ETF 문장 더 좁게 정정 — 칩 없는 글, 보강 없음",
  "executive-bonus-corporate-limit-2026": "R4 GUIDES b03-F01(2026-11-18) 광고 위 법인세 문장 더 좁게 정정 — 칩 없는 글, 보강 없음",
  "total-income-adjustment-bonus-2026": "R4 GUIDES b03-F04(2026-11-18) 광고 위 시뮬·제목 더 좁게 정정 — 칩 없는 글, 보강 없음, R4 수리 2026-11-20 제목 '종합 정산 — 영끌 2억 시 총 5,300만', 같은 날 2회차 설명 '급여 1.2억 … 종소세 4,100만'(덧셈 정정, /guides 태그 목록 N 과 같게)",
  "moving-company-bonus-2026": "R4 GUIDES b03-F05(2026-11-18) 광고 위 합산·건보 문장 더 좁게 정정 — 칩 없는 글, 보강 없음, R4 수리 2회차 2026-11-20 설명 '5월 종소세 신고 시 누락 합산'(N 꼴, /guides 태그 목록 N 과 같게)",
  "gift-children-with-bonus-2026": "R4 GUIDES b03-F06(2026-11-18) 광고 위 손자녀 줄 더 좁게 정정 — 칩 없는 글, 보강 없음",
  "foreign-bonus-structure-2026": "R4 GUIDES b03-M01(2026-11-18) 광고 위 RSU·해외계좌 문단 더 좁게 정정 — 칩 없는 글, 보강 없음",
};

describe("guideSitemapDates — 사이트맵 전용 날짜(광고 아래 보강, 또는 화면 날짜를 올리지 못한 광고 위 정정)", () => {
  it("모든 행은 실제 가이드 슬러그·광고 아래 보강이 있는 글(이름 붙인 예외 제외)·YYYY-MM-DD·오늘(KST) 이전", () => {
    for (const [slug, day] of Object.entries(GUIDE_SITEMAP_ONLY_REVISED)) {
      expect(bySlug.has(slug), slug).toBe(true);
      if (slug in NO_SUPPLEMENT_ROWS || slug in CHIPLESS_BODY_ROWS) {
        expect(guideSupplements[slug], `${slug}: 보강이 생겼으면 예외 목록에서 뺀다`).toBeFalsy();
      } else {
        expect(guideSupplements[slug], slug).toBeTruthy();
      }
      expect(day, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10), slug).toBe(day);
      expect(day <= TODAY_KST, slug).toBe(true);
      expect(LINK_ONLY.has(slug), slug).toBe(false);
    }
  });

  it("보강 없는 행의 예외: 칩 있는 글(①)은 6편, 칩 없는 글의 본문 정정(③, 운영자 결정 2026-11-17)은 15편 — 모두 이유가 있고 표에 실제로 있다", () => {
    expect(Object.keys(NO_SUPPLEMENT_ROWS)).toEqual(["us-treasury-bond", "bonus-property-sell-same-year-2026", "chip-rsu-stock-tax-2026", "dependent-check-before-bonus-2026", "semiconductor-performance-bonus-tax", "tax-amnesty-self-report-2026"]);
    for (const [slug, reason] of Object.entries(NO_SUPPLEMENT_ROWS)) {
      expect(slug in GUIDE_SITEMAP_ONLY_REVISED, `${slug}: 표에 없는 예외`).toBe(true);
      expect(reason.length, slug).toBeGreaterThanOrEqual(20);
      // ① 은 칩 있는 글만 — 칩 없는 글은 아래 ③ 목록에 따로 이유를 적는다
      const guide = bySlug.get(slug)!;
      expect(guide.modifiedDate, slug).toBeDefined();
      expect(getGuideContentDate(guide), slug).not.toBe(guide.publishedDate);
    }
    // ③ 칩 없는 글의 본문 정정 — 목록을 고정한다(새 행은 이유와 함께 여기에 더한다)
    expect(Object.keys(CHIPLESS_BODY_ROWS).sort()).toEqual([
      "child-gift-10year-rule-2026", "chip-stock-tax-guide", "commercial-office-capital-gains-2026",
      "executive-bonus-corporate-limit-2026", "foreign-bonus-structure-2026", "gift-children-with-bonus-2026",
      "hometax-year-end-preview-2026", "lease-right-transfer-tax-2026", "minimum-wage-2026",
      "moving-company-bonus-2026", "rental-business-prop-tax-exclusion-2026", "samsung-ds-special-bonus-details-oct-2026",
      "samsung-electronics-stock-2026", "sk-hynix-bonus-renegotiation-sept-2026", "total-income-adjustment-bonus-2026",
    ]);
    for (const [slug, reason] of Object.entries(CHIPLESS_BODY_ROWS)) {
      expect(slug in GUIDE_SITEMAP_ONLY_REVISED, `${slug}: 표에 없는 예외`).toBe(true);
      expect(slug in NO_SUPPLEMENT_ROWS, `${slug}: 두 목록에 함께 있으면 안 된다`).toBe(false);
      expect(reason.length, slug).toBeGreaterThanOrEqual(20);
      const guide = bySlug.get(slug)!;
      // 칩이 없는 글이고(화면 날짜 = 발행일), 행은 그 화면을 바꾸지 않는다 — 사이트맵 날짜만 발행일보다 늦다
      expect(guide.modifiedDate, slug).toBeUndefined();
      expect(getGuideContentDate(guide), slug).toBe(guide.publishedDate);
      expect(GUIDE_SITEMAP_ONLY_REVISED[slug] > guide.publishedDate, slug).toBe(true);
    }
  });

  it("행은 사이트맵 날짜만 올린다 — 화면·OG·Article 날짜(getGuideContentDate)보다 늦고, 칩 없는 글은 칩이 생기지 않는다", () => {
    for (const slug of Object.keys(GUIDE_SITEMAP_ONLY_REVISED)) {
      const guide = bySlug.get(slug)!;
      const content = getGuideContentDate(guide);
      expect(getGuideSitemapDate(guide), slug).toBe(GUIDE_SITEMAP_ONLY_REVISED[slug]);
      expect(GUIDE_SITEMAP_ONLY_REVISED[slug] > content, `${slug}: 효과 없는 행`).toBe(true);
      // 칩은 내용 수정일 ≠ 발행일일 때만 붙는다(GuidePageClient). modifiedDate 가 없는 글은 계속 칩이 없다.
      if (!guide.modifiedDate) expect(content, slug).toBe(guide.publishedDate);
    }
    // 표에 없는 글은 종전과 같다
    for (const guide of koGuides.filter((g) => !(g.slug in GUIDE_SITEMAP_ONLY_REVISED))) {
      expect(getGuideSitemapDate(guide), guide.slug).toBe(getGuideContentDate(guide));
    }
  });

  it("보강이 있는 칩 없는 글은 모두 행이 있거나 링크 한 줄 보강이다 — 보강을 더하고 날짜를 잊지 않게", () => {
    const missing = Object.keys(guideSupplements).filter((slug) => {
      const guide = bySlug.get(slug);
      if (!guide) return false;
      return getGuideContentDate(guide) === guide.publishedDate && !(slug in GUIDE_SITEMAP_ONLY_REVISED) && !LINK_ONLY.has(slug);
    });
    expect(missing).toEqual([]);
  });

  it("실제 sitemap() 이 행의 날짜를 lastmod 로 낸다", () => {
    const source = `globalThis.fetch = () => { throw new Error('Network forbidden in sitemap fixture'); };
      const sitemap = require('./src/app/sitemap.ts').default;
      const { GUIDE_SITEMAP_ONLY_REVISED: rows } = require('./src/lib/guideSitemapDates.ts');
      const paths = new Set(Object.keys(rows).map(slug => 'https://www.moneysalary.com/guides/' + slug));
      console.log(JSON.stringify(sitemap().filter(item => paths.has(item.url)).map(item => ({ url: item.url, date: item.lastModified }))));`;
    const rows = JSON.parse(execFileSync(process.execPath, ["--import", "tsx", "-e", source], {
      cwd: process.cwd(), encoding: "utf8", timeout: 30_000, maxBuffer: 1024 * 1024,
    })) as Array<{ url: string; date: string }>;
    expect(rows).toHaveLength(Object.keys(GUIDE_SITEMAP_ONLY_REVISED).length);
    for (const { url, date } of rows) {
      const slug = url.slice("https://www.moneysalary.com/guides/".length);
      expect(date, slug).toBe(GUIDE_SITEMAP_ONLY_REVISED[slug]);
    }
  }, 35_000);
});

// ── 보강 고정 핀 (rf-04, 2026-11-15) ─────────────────────────────────────────────────────────────
// 위 '보강이 있는 칩 없는 글' 검사는 행이 있는지만 본다. 그래서 (가) '수정' 칩이 있는 글에 보강을 더하거나 고칠 때,
// (나) 이미 행이 있는 글의 보강을 다시 고칠 때 사이트맵 날짜를 잊어도 실패하지 않았다(머리 주석 ★ ①: 칩이 있든 없든 행).
// 그래서 모든 광고 아래 보강(guideSupplements, 링크 한 줄 보강 포함)의 내용을 해시로 고정한다. 보강이 바뀌어 아래 검사가 실패하면:
//   ① 그 글의 사이트맵 전용 행(src/lib/guideSitemapDates.ts)을 보강을 실제로 고친 날(KST, 게시일·미래 날짜 금지)로 올리고
//      (링크 한 줄만 바뀐 보강은 날짜를 올리지 않는다 — LINK_ONLY),
//   ② 다시 돌려 실패 메시지가 찍은 줄(새 해시와 지금 사이트맵 날짜)을 아래 핀에 그대로 넣는다.
// 핀의 날짜 = 그 내용의 보강이 사이트맵에 알려진 날. getGuideSitemapDate 가 그보다 이르면 실패한다(행을 지우거나 되돌린 경우).
// 보강 HTML 이 읽는 데이터 상수(최저임금·실업급여·PS 이력·DART 평균 등)가 바뀌어도 화면 보강이 바뀐 것이라 같은 절차다.
// 해시 = sha256(보강 HTML, utf8) 앞 16자. 템플릿 리터럴은 줄바꿈을 LF 로 읽으므로 체크아웃 줄바꿈과 무관하다.
const SUPPLEMENT_PINS: Readonly<Record<string, readonly [hash: string, day: string]>> = {
  "basic-pension-65-2026": ["71f1893287314465", "2026-05-23"],
  "career-break-financial-plan": ["10b01da9f9811251", "2026-11-03"],
  "child-support-100-2026": ["7c3722b1114122f8", "2026-11-15"],
  "comprehensive-income-tax-2026": ["005ded4d9973b74f", "2026-11-03"],
  "coupang-fulfillment-night-pay-2026": ["cc5ad0d8cbac097f", "2026-11-03"],
  "crypto-tax-2026": ["035f16d6f5e4d039", "2026-11-03"],
  "earned-income-credit-2026": ["f3c650488cbbb6ed", "2026-11-03"],
  "energy-voucher-2026": ["aa1bdae2ca987167", "2026-11-15"],
  "etf-beginner": ["02d83e22676c9dea", "2026-05-16"],
  "financial-income-tax": ["944a9b785ee6d62d", "2026-11-03"],
  "first-home-2026-strategy": ["637e764bf9660f8b", "2026-11-03"],
  "four-major-insurance-complete": ["a2c15b2ee7520887", "2026-11-03"],
  "gap-investment-risk": ["fc950cf62add806d", "2026-11-03"],
  "health-insurance-2026-guide": ["4e29f8373682e474", "2026-10-03"],
  "hl-mando-salary-2026": ["2009f28dd7f15a68", "2026-11-03"],
  "isa-account-guide": ["0c16d93ec3276936", "2026-11-03"],
  "kai-salary-2026": ["691e4ded995b694d", "2026-11-03"],
  "minimum-wage-impact-2026": ["82dc8a3f4a79f7e2", "2026-11-03"],
  "n-job-tax-2026": ["2546c08b4dc0201d", "2026-11-03"],
  "national-pension-strategy-2026": ["f8f7414965de085a", "2026-11-03"],
  "newlywed-tax-benefits-2026": ["16bb6961a12c90ec", "2026-11-03"],
  "nurse-salary": ["1851d4e7104374c5", "2026-09-25"],
  "one-home-capital-gains-12eok-2026": ["5a35e5d313cce9db", "2026-10-06"],
  "p2p-investment-risk": ["ff033d846b67b199", "2026-11-03"],
  "parental-leave-6plus6-2026": ["ba3658169835217f", "2026-11-03"],
  "parental-leave-complete-guide": ["01b428520bdfd21c", "2026-11-03"],
  "performance-pay-complete-2026": ["23180f7860fc6d5a", "2026-11-03"],
  "property-downsizing-1home-2026": ["7d3ed133915d5197", "2026-11-01"],
  "public-company-salary-ranking-2026": ["b1f052703c1893b4", "2026-10-03"],
  "real-estate-capital-gains-2026": ["e54b5299aacb0488", "2026-11-01"],
  "rent-deposit-protection": ["1d74d14153527769", "2026-11-03"],
  "retirement-planning": ["191dc78d852ef6fb", "2026-10-03"],
  "retirement-planning-30s": ["c8f0117f1e097b74", "2026-11-03"],
  "samsung-bonus-treasury-stock-15-trillion-2026": ["910916515cc3a502", "2026-11-20"],
  "samsung-medison-salary-2026": ["ecd2a15f74d1abae", "2026-11-03"],
  "samsung-opi-forecast-2027": ["5128bbd4399d5582", "2026-11-15"],
  "samsung-opi-tai-complete-2026": ["995857fcfc051ca8", "2026-10-08"],
  "samsung-special-bonus-q3-preview-2027": ["6fe0fc6f0cc6ea6a", "2026-11-20"],
  "samsung-vs-sk-hynix-stock-bonus-2026": ["4410ab351e93a405", "2026-11-18"],
  "samsung-wage-negotiation-2026": ["99837c3b3d2c45b5", "2026-11-01"],
  "side-hustle-tax-2026": ["1ef59ab5d22ff447", "2026-11-03"],
  "sk-hynix-ps-cash-vs-stock-scenarios-2026": ["63648f3ce0316dd0", "2026-11-03"],
  "sk-hynix-ps-forecast-2027": ["ddfc1050118f2634", "2026-11-18"],
  "sk-hynix-stock-2026": ["7d3a7bfc3e0269da", "2026-11-03"],
  "sk-hynix-wage-2026": ["a286d5922ca6a845", "2026-11-18"],
  "social-insurance-reduction": ["f664265068b59501", "2026-11-03"],
  "tax-refund-mistakes-2026": ["47a9348456de53bb", "2026-11-03"],
  "temp-two-home-3year-rule-2026": ["a9bf9822802e740a", "2026-11-01"],
  "unemployment-benefits-complete": ["da0c60ab5e528caa", "2026-11-18"],
  "unemployment-insurance-2026": ["9b26b239aa9b7b5d", "2026-11-03"],
  "vat-filing-2026": ["b88455d06fb69eff", "2026-11-03"],
  "year-end-tax-2026": ["03cfb416099d1ce7", "2026-11-03"],
};

const supplementHash = (html: string) => createHash("sha256").update(html, "utf8").digest("hex").slice(0, 16);
const pinLine = (slug: string) => {
  const guide = bySlug.get(slug);
  const day = guide ? getGuideSitemapDate(guide) : "가이드 없음";
  return `"${slug}": ["${supplementHash(guideSupplements[slug] ?? "")}", "${day}"],`;
};

describe("guideSitemapDates — 보강 고정 핀: 보강이 바뀌면 사이트맵 날짜를 잊지 않게 (rf-04, 칩 있는 글 포함)", () => {
  it("모든 광고 아래 보강에 핀이 있고, 없는 보강의 핀은 남기지 않는다 — 새 보강은 행과 핀을 함께 넣는다", () => {
    const missing = Object.keys(guideSupplements).filter((slug) => !(slug in SUPPLEMENT_PINS));
    expect(missing.map(pinLine), "새 보강: 사이트맵 전용 행을 고친 날로 넣고 이 줄을 SUPPLEMENT_PINS 에").toEqual([]);
    expect(Object.keys(SUPPLEMENT_PINS).filter((slug) => !(slug in guideSupplements))).toEqual([]);
  });

  it("보강 내용이 핀과 같다 — 바뀌었으면 행을 고친 날(KST)로 올린 뒤 찍힌 줄로 핀을 바꾼다", () => {
    const changed = Object.entries(SUPPLEMENT_PINS)
      .filter(([slug, [hash]]) => slug in guideSupplements && supplementHash(guideSupplements[slug]) !== hash)
      .map(([slug]) => pinLine(slug));
    expect(changed, "보강이 바뀐 글: 행 날짜를 먼저 올리고 다시 돌린 뒤 이 줄로 핀 교체").toEqual([]);
  });

  it("사이트맵 날짜는 핀의 날짜보다 이르지 않고, 핀 날짜는 오늘(KST) 이전이다", () => {
    for (const [slug, [, day]] of Object.entries(SUPPLEMENT_PINS)) {
      const guide = bySlug.get(slug);
      expect(guide, slug).toBeDefined();
      expect(day, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day <= TODAY_KST, slug).toBe(true);
      expect(getGuideSitemapDate(guide!) >= day, `${slug}: 사이트맵 ${getGuideSitemapDate(guide!)} < 핀 ${day}`).toBe(true);
    }
  });

  it("해시는 보강 한 글자 변화에도 바뀐다(검사 자체의 민감도)", () => {
    const [slug] = Object.keys(SUPPLEMENT_PINS);
    const html = guideSupplements[slug];
    expect(supplementHash(html)).toBe(SUPPLEMENT_PINS[slug][0]);
    expect(supplementHash(`${html} `)).not.toBe(SUPPLEMENT_PINS[slug][0]);
    expect(supplementHash(html.replace(/\d/, (d) => String((Number(d) + 1) % 10)))).not.toBe(SUPPLEMENT_PINS[slug][0]);
  });
});
