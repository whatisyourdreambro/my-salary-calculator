// 가이드 재작성 사양·금지 사실 게이트 (2026-09-26 W1-E / GUIDES-02 — 테스트 전용, 런타임 파일 무변경)
//
// 다섯 부분으로 나뉜다.
//  (1) 금지 사실 스캔 — 한국어 가이드 전편(334)의 제목·설명·검색 설명·본문·보강 섹션을 FORBIDDEN 정규식으로 훑는다.
//      이미 있는 적중은 fixtures/guideSpecAllow.json 의 forbiddenHits 에 {slug, patternId, snippet, tag} 로 올려 두었다.
//      tag 는 둘 중 하나다 — 'GUIDES-08'(고칠 대상) / 'dated-historical'(날짜를 박은 과거 사실·폐지·부정 문맥이라 둔다).
//      목록 밖 적중은 실패, 고쳐서 사라진 적중이 목록에 남아 있어도 실패(목록을 같은 커밋에서 줄일 것).
//  (2) 키퍼 사양 — KEEPERS(처음엔 비어 있음. W3-A 가 재작성한 슬러그를 같은 커밋에서 추가)의 제목·검색 설명·리드·분량·
//      H2·표·FAQ·공식 출처·기준일·날짜 규칙. guide.description 은 GuideMidAd 위 TL;DR 상자에 그대로 찍히므로
//      전 가이드에 대해 기준선(3b564c80) 길이를 넘지 못하게 한다 — 검색용 긴 문구는 metaDescription(META-07)에 쓴다.
//  (3) H2 불변 — 5/23 대량 배치 4개 모듈(hot-news-2026-may·extended·deep-dive·hot-bonus-tax-complete, 181편)의
//      H2 목록과 광고 분할 지점(GuidePageClient splitContentByH2 의 1/3·2/3 H2)이 guidesMayH2.snapshot.json 과 같아야 한다.
//      동결 기간 문자열 정정(F-C)의 가드 — 키퍼는 제외(재작성으로 H2 가 바뀐다).
//  (4) /guides/nurse-salary 페이지 데이터 해시 고정 — verify:autoads 기준 페이지라 손대지 않는다.
//  (5) 엔진 수치 규칙 — 키퍼 본문 표(<table>, 클래스 무관)의 원본 소스에 verify:tax 가 감시하는 2026 요율·상한
//      리터럴을 쓰지 않는다. 정본 상수(src/config·taxConstants2026·엔진)를 import 해 ${…} 로 끼워 넣을 것
//      (hot-news-2026-deep-dive.ts 의 UNEMPLOYMENT_BENEFIT_2026 패턴). 패턴 목록은 verify-tax-constants.mjs 에서 읽어 온다.
//
// 픽스처 재생성 — GUIDE_SPEC_REGEN 에 쉼표로 고른다 (이때 검사 블록은 건너뛴다):
//   allow    : forbiddenHits 를 현재 적중으로 다시 쓴다. 기존 항목의 tag·note 는 유지, 새 적중은 tag "TODO"
//              (TODO 가 남으면 검사가 실패한다 — 사람이 GUIDES-08 / dated-historical 로 판정해 적을 것).
//   baseline : descriptionBaseline 에 없는 슬러그만 추가한다. 기존 값은 절대 덮어쓰지 않는다(재작성 전 길이가 기준).
//   h2       : H2 스냅숏을 현재 본문으로 다시 쓴다. ★동결 기간에는 쓰지 말 것 — 키퍼는 KEEPERS 로 빠지고,
//              308 통합으로 사라진 가이드는 스냅숏에서 그 항목만 손으로 지운다.
//   예) GUIDE_SPEC_REGEN=allow npx vitest run src/lib/__tests__/guideSpec.test.ts
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Guide } from "@/lib/guidesData";
import { koGuides } from "@/lib/guidesContent";
import { extractGuideFaqs } from "@/lib/guideFaq";
import { guideSupplements } from "@/lib/guides/supplements";
import { hotNewsMay2026 } from "@/lib/guides/hot-news-2026-may";
import { hotNewsExtended } from "@/lib/guides/hot-news-2026-extended";
import { hotNewsDeepDive } from "@/lib/guides/hot-news-2026-deep-dive";
import { hotBonusTaxComplete } from "@/lib/guides/hot-bonus-tax-complete";

/** 재작성 완료 키퍼 — W3-A 가 재작성 커밋마다 슬러그를 추가한다 (2026-10-13 1차부터). */
const KEEPERS: readonly string[] = [
  // 1차 연말정산 묶음 — G1B (2026-09-26 재작성, 배포 예정 2026-09-30)
  "housing-subscription-25man-deduction-2026",
  "earned-income-deduction-2026",
  "standard-vs-special-deduction-2026",
  "child-education-deduction-limit-2026",
  "couple-split-bonus-year-2026",
  "newlywed-deduction-first-year-2026",
];

const BASE = "3b564c80";
const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");
const ALLOW_PATH = join(process.cwd(), "src/lib/__tests__/fixtures/guideSpecAllow.json");
const H2_PATH = join(process.cwd(), "src/lib/__tests__/fixtures/guidesMayH2.snapshot.json");
const REGEN = new Set(
  (process.env.GUIDE_SPEC_REGEN ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
const sha16 = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
/** 코드포인트 길이 — 이모지·한글 모두 1자 */
const chars = (s: string) => [...s].length;

// ─────────────────────────────────────────────────────────────
// (1) 금지 사실 — 2026년 귀속·현행 기준으로 틀린 옛 값. 근거는 공식 출처(2026-09-26 확인)와 저장소 정본 상수.
//     정규식은 '가시 텍스트'(인라인 태그 제거·블록 태그는 공백)에 건다. id 는 허용목록 키이므로 바꾸지 말 것.
// ─────────────────────────────────────────────────────────────
interface ForbiddenPattern {
  id: string;
  re: RegExp;
  why: string;
}
const FORBIDDEN: readonly ForbiddenPattern[] = [
  // ── GUIDES-02 기본 목록 (B9 가 손으로 고친 2026 오류의 재발 방지)
  {
    id: "health-settle-july",
    re: /7월.{0,8}(?:건보|건강보험).{0,6}정산/g,
    why: "직장가입자 건보료 연말정산은 3/10 보수총액 신고 뒤 4월 (nhis.or.kr 직장보험료 보수총액 신고)",
  },
  { id: "nps-rate-4.5", re: /국민연금\s?4\.5\s?%/g, why: "2026년 근로자 부담 4.75%(총 9.5%) — korea.kr 148957270" },
  // 앞 글자가 숫자·쉼표·점이 아닐 때만 (1,590만·2.590만 등 제외 — 뒤보기 대신 한 글자 포함, 타깃 ES2017)
  { id: "nps-cap-590", re: /(?:^|[^\d,.])590만/g, why: "연금 기준소득월액 상한 590만은 2023-07~2024-06 값 (현행 659만, taxConstants2026)" },
  {
    id: "other-income-expense-80",
    re: /필요경비\s?80\s?%/g,
    why: "강연료 등 기타소득 의제 필요경비는 2019년부터 60% (nts.go.kr 기타소득 원천징수)",
  },
  {
    id: "youth-leap-invite",
    re: /도약계좌.{0,40}(?:가입하세요|가입해\s?(?:두|보)세요|가입을 서두르|지금 가입|바로 가입|활용하세요|신청하세요|개설하세요|가입 추천|가입 필수|꼭 가입)/g,
    why: "청년도약계좌 신규 가입은 2025-12 종료, 후속 청년미래적금 2026-06 출시 (fsc.go.kr 보도자료 87106)",
  },
  {
    id: "base-rate-2.75",
    re: /연 2\.75%/g,
    why: "기준금리 현재값은 3.00%(2026-08-27). 2.75% 는 2026-07-16~08-26 값 (bok.or.kr 기준금리 추이)",
  },
  {
    id: "card-over-1.2eok-200",
    re: /1\.2억 초과.{0,6}200만/g,
    why: "카드 소득공제 1.2억 초과 200만 구간은 2023년 귀속부터 폐지 — 7천 이하 300만/초과 250만 (korea.kr 148923639)",
  },
  {
    id: "jongbu-joint-each-6eok",
    re: /각 6억/g,
    why: "종부세 주택분 인별 기본공제는 2023년부터 9억(1세대1주택 12억) — korea.kr 148910697",
  },
  { id: "infertility-20", re: /난임.{0,12}20\s?%/g, why: "난임시술비 의료비 세액공제율은 2022년 지출분부터 30% (taxConstants2026 MEDICAL_CREDIT_2026)" },
  {
    // '이월과세'(증여 후 양도 시 취득가 이월 — 현행 제도)는 제외한다
    id: "transfer-loss-carry",
    re: /양도.{0,12}이월(?!과세)/g,
    why: "주식·부동산 양도차손은 같은 과세기간 안에서만 통산 — 다음 해로 이월공제되지 않는다 (소득세법 §102)",
  },
  {
    id: "crypto-5y-carry",
    re: /가상자산.{0,10}5년 이월/g,
    why: "가상자산소득은 분리과세 기타소득(2027-01-01 양도분부터 20%·250만 공제) — 결손금 이월공제 규정 없음 (nts.go.kr 가상자산소득 과세 개요)",
  },
  { id: "stock-10y-carry", re: /주식의 10년/g, why: "주식 양도차손 10년 이월 규정은 없다 (소득세법 §102, 같은 해 통산만)" },
  {
    // transfer-loss-carry 가 놓치는 표기 — '양도'가 멀리 있거나 앞 문장에 있는 '손실 시 이월 가능'
    id: "stock-loss-carry",
    re: /(?:주식|RSU|양도)[^.]{0,40}손실[^.]{0,12}이월\s?가능|손실 시 이월 가능/g,
    why: "주식·RSU 양도차손은 같은 과세기간 안에서만 통산 — 다음 해로 이월공제되지 않는다 (소득세법 §102). 사업소득 결손금 이월은 '결손금 이월공제'로 쓸 것",
  },

  // ── SEASON-11 흡수 — 시즌 가이드에서 되풀이되는 옛 값
  {
    id: "card-tier-1.2eok",
    re: /(?:7,000만\s?원?|7천만?\s?원?)\s*(?:초과)?\s*[~∼]\s*1\.2억/g,
    why: "카드 공제 '7천~1.2억' 구간은 2023년 귀속부터 폐지 (cardDeduction2026)",
  },
  {
    id: "card-extra-each-100",
    re: /(?:각|별도 한도)\s?100만\s?원?씩?\s?추가|\(한도 100만\s?원?\s?추가\)/g,
    why: "전통시장·대중교통·문화 추가공제는 항목별 각 100만이 아니라 합산 300만(7천 이하)/200만(초과) — korea.kr 148923639, EDIT-08",
  },
  {
    // 현행 소득 요건의 짝 '종합소득금액 7,000만 이하'는 옳은 값이라 제외한다 (nts.go.kr 239025 — 2024년 과세연도부터
    // 총급여 7천→8천만·종합소득금액 6천→7천만). 뒤보기는 정규식 리터럴 대신 문자열로 만든다(타깃 ES2017 리터럴 검사 회피, 런타임 Node 는 지원).
    id: "rent-salary-7000",
    re: new RegExp("월세.{0,40}(?<!종합소득(?:금액)?[이은]?\\s?)(?:7,000만|7천만)", "g"),
    why: "월세 세액공제 총급여 요건은 2024년 귀속부터 8,000만 이하 — 종합소득금액 요건은 7,000만 이하 (nts.go.kr 월세액 세액공제)",
  },
  // 한도 1,200만은 금지하지 않는다 — 2026년 세제개편안(korea.kr 정책뉴스 148969870, 2026-08-13)이 1,000만 → 1,200만 확대와
  // 15~34세 청년 17% 를 제안했고 국회 심의 중이라 적용 귀속연도가 미확정이다. 12월 국회 의결 뒤 이 줄과 rent-cap-750 을 다시 볼 것.
  { id: "rent-cap-750", re: /월세.{0,40}750만/g, why: "월세 세액공제 한도는 2024년 귀속부터 연 1,000만 (nts.go.kr 월세액 세액공제)" },
  {
    id: "postpartum-70-7",
    re: /산후조리[^.]{0,30}?[^\d,.](?:70|7)만/g,
    why: "산후조리원은 출산 1회 200만 한도 × 15% = 최대 30만 (MEDICAL_CREDIT_2026, EDIT-05)",
  },
  {
    id: "child-credit-old",
    re: /자녀\s?세액\s?공제.{0,30}(?:1명|첫째|1인)[^0-9]{0,6}15만|자녀\s?세액\s?공제.{0,40}(?:2명|두 명)[^0-9]{0,6}(?:30|35)만|자녀\s?세액\s?공제.{0,40}둘째[^0-9]{0,6}20만/g,
    why: "자녀세액공제는 2025년 귀속부터 1명 25만·2명 55만·셋째부터 40만씩 (korea.kr 148956909, CHILD_TAX_CREDIT_2026)",
  },
  {
    // 출산·입양 세액공제(30·50·70만, 1회)를 연간 자녀세액공제로 적은 표기. 사이에 '출산·입양'이 끼면 옳은 문장이라 제외
    id: "child-credit-30-70",
    re: /자녀\s?세액\s?공제(?:(?!출산|입양)[^.+·]){0,12}30\s?~\s?70만|자녀\s?\(30\s?~\s?70만/g,
    why: "30·50·70만은 출산·입양 세액공제(첫째·둘째·셋째 이상, 출산·입양한 과세기간에 1회) — 연간 자녀세액공제는 1명 25만·2명 55만·셋째부터 40만씩 (nts.go.kr 근로소득 세액공제 cntntsId=7875, 소득세법 §59의2)",
  },
  {
    id: "transit-80",
    re: /대중교통.{0,20}80\s?%/g,
    why: "대중교통 공제율 80% 는 한시 상향(2022 하반기 등) — 2026년 귀속은 40% (CARD_RATES_2026.TRANSIT)",
  },
  {
    id: "hometown-15",
    re: /고향사랑.{0,60}10만\s?원?\s?초과(?:분)?\s?(?:은|는)?\s?[:：]?\s?(?:15|16\.5)\s?%|고향사랑.{0,60}10만\s?원?\s?(?:초과)?\s?[~∼]\s?20만\s?원?\s?(?:이하)?[^0-9%]{0,6}(?:15|16\.5)\s?%/g,
    why: "고향사랑기부 10만 초과 20만 이하는 2026-01-01 기부분부터 40%(지방세 포함 44%) — korea.kr 148957544, 조특법 §58",
  },

  // ── EDIT-05 잔여 (가상자산 5년 이월결손금 — crypto-5y-carry 와 같은 사실의 다른 표기)
  {
    id: "crypto-loss-carry-5y",
    re: /5년\s?이월\s?결손금|이월결손금\s?[:：]?\s?5년/g,
    why: "가상자산소득 결손금 이월공제 규정 없음 (nts.go.kr 가상자산소득 과세 개요)",
  },
];

const ALLOW_TAGS = new Set(["GUIDES-08", "dated-historical"]);

/** 인라인 태그는 지우고(단어가 쪼개지지 않게) 블록 태그는 공백으로 — 사람이 읽는 문장 그대로에 정규식을 건다 */
function visibleText(html: string): string {
  return html
    .replace(/<\/?(?:strong|em|b|i|u|a|span|code|mark|sup|sub|small)\b[^>]*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

interface ForbiddenHit {
  slug: string;
  patternId: string;
  snippet: string;
}
interface AllowEntry extends ForbiddenHit {
  tag: string;
  note?: string;
}

const SNIPPET_CONTEXT = 15;
function scanForbidden(guides: readonly Guide[]): ForbiddenHit[] {
  const hits: ForbiddenHit[] = [];
  for (const g of guides) {
    const fields = [g.title, g.description, g.metaDescription ?? "", visibleText(g.content), visibleText(guideSupplements[g.slug] ?? "")];
    for (const text of fields) {
      if (!text) continue;
      for (const p of FORBIDDEN) {
        for (const m of text.matchAll(p.re)) {
          const at = m.index ?? 0;
          const before = [...text.slice(0, at)].slice(-SNIPPET_CONTEXT).join("");
          const after = [...text.slice(at + m[0].length)].slice(0, SNIPPET_CONTEXT).join("");
          hits.push({ slug: g.slug, patternId: p.id, snippet: `${before}${m[0]}${after}`.trim() });
        }
      }
    }
  }
  return hits;
}
const hitKey = (h: ForbiddenHit) => `${h.slug}\u0000${h.patternId}\u0000${h.snippet}`;

/** 적중과 허용목록을 다중집합으로 맞춘다 — 같은 문구가 두 번 나오면 항목도 두 개여야 한다 */
function matchAllowlist(hits: readonly ForbiddenHit[], allow: readonly AllowEntry[]) {
  const pool = new Map<string, number>();
  for (const a of allow) pool.set(hitKey(a), (pool.get(hitKey(a)) ?? 0) + 1);
  const unlisted: ForbiddenHit[] = [];
  for (const h of hits) {
    const n = pool.get(hitKey(h)) ?? 0;
    if (n > 0) pool.set(hitKey(h), n - 1);
    else unlisted.push(h);
  }
  const stale = allow.filter((a) => {
    const n = pool.get(hitKey(a)) ?? 0;
    if (n > 0) {
      pool.set(hitKey(a), n - 1);
      return true;
    }
    return false;
  });
  return { unlisted, stale };
}

// ─────────────────────────────────────────────────────────────
// (3) H2 목록·광고 분할 지점 — GuidePageClient.splitContentByH2 복제 (런타임 함수는 export 되지 않는다).
//     원본이 바뀌면 SPLIT_FN_SHA 드리프트 가드가 실패한다 → 복제본을 맞추고 해시를 갱신할 것.
// ─────────────────────────────────────────────────────────────
const SPLIT_FN_SHA = "4d42b3f5b6e0f4e9";
const H2_OPEN_RE = /<h2[\s>]/gi;

/** 분할 지점(본문 문자 위치) — 1개면 2분할, 2개면 3분할(GuideMidAd 1/3·InArticleAd 2/3) */
function splitStarts(html: string): number[] {
  const indices = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  if (indices.length < 2) return [];
  const candidates = indices.filter((i) => i > 0);
  if (candidates.length === 0) return [];
  const nearest = (target: number, pool: number[]) =>
    pool.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best));
  if (html.length < 4000 || candidates.length === 1) return [nearest(html.length / 2, candidates)];
  const p1 = nearest(html.length / 3, candidates);
  const after = candidates.filter((i) => i > p1);
  if (after.length === 0) return [p1];
  return [p1, nearest((html.length * 2) / 3, after)];
}

interface H2Shape {
  h2: string[];
  /** 분할이 시작되는 H2 의 순번(0부터) */
  split: number[];
}
function h2Shape(html: string): H2Shape {
  const opens = [...html.matchAll(H2_OPEN_RE)].map((m) => m.index ?? 0);
  const h2 = [...html.matchAll(/<h2[\s>][\s\S]*?<\/h2>/gi)].map((m) => m[0]);
  return { h2, split: splitStarts(html).map((p) => opens.indexOf(p)) };
}

const MAY_FAMILY: readonly Guide[] = [...hotNewsMay2026, ...hotNewsExtended, ...hotNewsDeepDive, ...hotBonusTaxComplete];

// ─────────────────────────────────────────────────────────────
// (2) 키퍼 사양
// ─────────────────────────────────────────────────────────────
const OFFICIAL_LINK_RE =
  /href="(https?:\/\/(?:[\w-]+\.)*(?:law\.go\.kr|nts\.go\.kr|nhis\.or\.kr|nps\.or\.kr|moel\.go\.kr|molit\.go\.kr|fsc\.go\.kr)(?:[/?#][^"]*)?)"/g;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface DescriptionBaseline {
  chars: number;
  publishedDate: string;
}
interface KeeperContext {
  koTitles: readonly string[];
  baseline: Readonly<Record<string, DescriptionBaseline>>;
}

/** 사양 위반 목록 — 빈 배열이면 통과 */
function keeperViolations(g: Guide, ctx: KeeperContext): string[] {
  const v: string[] = [];
  const html = g.content;
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  if (chars(g.title) > 32) v.push(`title: ${chars(g.title)}자 > 32`);
  if (/\p{Extended_Pictographic}/u.test(g.title)) v.push("title: 이모지");
  if (ctx.koTitles.filter((t) => t === g.title).length > 1) v.push("title: 다른 가이드와 중복");

  const meta = g.metaDescription ?? "";
  if (chars(meta) < 80 || chars(meta) > 120) v.push(`metaDescription: ${chars(meta)}자 (80~120)`);

  const base = ctx.baseline[g.slug];
  if (!base) v.push("descriptionBaseline 없음 — 재작성 전 길이를 기준선에 먼저 기록해야 한다");
  else {
    if (chars(g.description) > base.chars) v.push(`description: ${chars(g.description)}자 > 기준선 ${base.chars}자 (TL;DR 은 GuideMidAd 위)`);
    if (g.publishedDate !== base.publishedDate) v.push(`publishedDate: ${g.publishedDate} ≠ 기준선 ${base.publishedDate} (발행일은 그대로)`);
  }

  if (!/<p class="lead">/.test(html)) v.push('<p class="lead"> 없음');
  if (text.length < 2500) v.push(`가시 텍스트 ${text.length}자 < 2,500`);
  if (html.length < 4000) v.push(`HTML ${html.length}자 < 4,000`);

  const h2Attrs = [...html.matchAll(/<h2([^>]*)>/gi)].map((m) => m[1]);
  const plain = h2Attrs.filter((a) => a === "").length;
  if (plain !== h2Attrs.length) v.push(`H2 에 속성 ${h2Attrs.length - plain}개 — 전부 맨 <h2>`);
  if (plain < 5 || plain > 7) v.push(`맨 <h2> ${plain}개 (5~7)`);
  if (splitStarts(html).length !== 2) v.push("본문이 3분할되지 않음 (GuideMidAd 1/3·InArticleAd 2/3)");

  if (!html.includes('<table class="w-full text-sm">')) v.push('<table class="w-full text-sm"> 없음');
  const faqs = extractGuideFaqs(html);
  if (faqs.length < 3) v.push(`FAQPage 항목 ${faqs.length}개 < 3 (맨 <h2>자주 묻는 질문 + <li><strong>Q</strong> — A)`);

  const official = new Set([...html.matchAll(OFFICIAL_LINK_RE)].map((m) => m[1]));
  if (official.size < 2) v.push(`공식 출처 링크 ${official.size}개 < 2`);
  if (!html.includes("기준일")) v.push("'기준일' 줄 없음");
  if (html.includes("검수 완료")) v.push("'검수 완료' 배지 금지");

  if (!g.modifiedDate || !DATE_RE.test(g.modifiedDate)) v.push("modifiedDate 없음 (배포일 YYYY-MM-DD)");
  else if (g.modifiedDate < g.publishedDate) v.push(`modifiedDate ${g.modifiedDate} < publishedDate ${g.publishedDate}`);
  return v;
}

// ─────────────────────────────────────────────────────────────
// (5) 키퍼 표의 원본 소스 — 렌더된 본문에서는 import 값과 리터럴을 구별할 수 없으므로 소스 템플릿을 찾아 검사한다.
// ─────────────────────────────────────────────────────────────
interface TaxLiteral {
  name: string;
  re: RegExp;
}
/**
 * verify-tax-constants.mjs 의 PATTERNS(코드 리터럴 형태)를 그대로 읽어 온다 — 목록을 복제하지 않는다.
 * 그 파일을 고칠 때는 항목마다 한 줄 `{ name: "…", re: /…/ }` 모양을 지킬 것(문자 클래스 안 '/'·키 순서 변경 시 이 파서도 함께).
 */
function verifyTaxPatterns(): TaxLiteral[] {
  const script = read("scripts/verify-tax-constants.mjs");
  const block = /const PATTERNS = \[([\s\S]*?)\n\];/.exec(script)?.[1] ?? "";
  const declared = (block.match(/\bname:\s*"/g) ?? []).length;
  const parsed = [...block.matchAll(/\{\s*name:\s*"([^"]+)",\s*re:\s*\/((?:\\.|[^/\\\n])+)\/([a-z]*)\s*\}/g)].map((m) => ({
    name: m[1],
    re: new RegExp(m[2], m[3]),
  }));
  if (declared === 0 || parsed.length !== declared) {
    throw new Error(`verify-tax-constants.mjs PATTERNS 파싱 실패 (선언 ${declared}개, 읽음 ${parsed.length}개) — 형식이 바뀌었으면 이 파서를 맞출 것`);
  }
  return parsed;
}
/** 화면 표기 형태의 2026 요율·상한 — verify:tax 는 0.0475 같은 코드 형태만 본다 */
const DISPLAY_RATE_LITERALS: readonly TaxLiteral[] = [
  { name: "국민연금 4.75% (표기)", re: /4\.75\s?%/ },
  { name: "건강보험 3.595% (표기)", re: /3\.595\s?%/ },
  { name: "장기요양 13.14% (표기)", re: /13\.14\s?%/ },
  { name: "연금 상한 월 659만 (표기)", re: /659만/ },
  { name: "연금 상한 연 7,908만 (표기)", re: /7,908만/ },
];

const GUIDE_SOURCE_FILES = [
  ...readdirSync(join(process.cwd(), "src/lib/guides"))
    .filter((f) => f.endsWith(".ts") && !f.endsWith("-en.ts"))
    .map((f) => `src/lib/guides/${f}`),
  "src/lib/guidesContent.ts",
];

/** 여는 백틱 바로 뒤 → 짝이 되는 닫는 백틱 위치 */
function templateEnd(src: string, start: number): number {
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") i += 2;
    else if (c === "`") return i;
    else if (c === "$" && src[i + 1] === "{") i = exprEnd(src, i + 2);
    else i++;
  }
  throw new Error("닫히지 않은 템플릿 리터럴");
}
/** '${' 바로 뒤 → 짝이 되는 '}' 다음 위치 */
function exprEnd(src: string, start: number): number {
  let depth = 1;
  let i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === "`") {
      i = templateEnd(src, i + 1) + 1;
      continue;
    }
    if (c === '"' || c === "'") {
      i++;
      while (i < src.length && src[i] !== c) i += src[i] === "\\" ? 2 : 1;
      i++;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
    i++;
  }
  throw new Error("닫히지 않은 ${ } 식");
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let sourceCache: { rel: string; text: string }[] | null = null;
/** 가이드 본문 템플릿의 원본 소스(보간식 ${…} 은 그대로). 레거시 레코드("slug": `…`) → 객체(slug·content) 순으로 찾는다. */
function guideContentSource(slug: string): { rel: string; body: string } | null {
  sourceCache ??= GUIDE_SOURCE_FILES.map((rel) => ({ rel, text: read(rel).replace(/\r\n/g, "\n") }));
  const record = new RegExp(`^\\s*["']${escapeRe(slug)}["']\\s*:\\s*\``, "m");
  for (const { rel, text } of sourceCache) {
    const m = record.exec(text);
    if (m) {
      const s = m.index + m[0].length;
      return { rel, body: text.slice(s, templateEnd(text, s)) };
    }
  }
  const object = new RegExp(`slug:\\s*["']${escapeRe(slug)}["']`);
  for (const { rel, text } of sourceCache) {
    const m = object.exec(text);
    if (!m) continue;
    const rest = text.slice(m.index);
    const next = rest.slice(1).search(/slug:\s*["']/);
    const scope = next < 0 ? rest : rest.slice(0, next + 1);
    const c = /\bcontent:\s*(?:(`)|([A-Za-z_$][\w$]*))/.exec(scope);
    if (!c) continue; // guidesContent.ts 의 레거시 메타(본문은 legacy-rewrite 레코드)
    if (c[1]) {
      const s = m.index + c.index + c[0].length;
      return { rel, body: text.slice(s, templateEnd(text, s)) };
    }
    const decl = new RegExp(`\\bconst\\s+${escapeRe(c[2])}\\s*(?::\\s*string\\s*)?=\\s*\``).exec(text);
    if (!decl) return null;
    const s = decl.index + decl[0].length;
    return { rel, body: text.slice(s, templateEnd(text, s)) };
  }
  return null;
}

/** 원본 소스의 표(클래스 무관 — 옛 May 표 class="w-full text-sm border …" 포함) 안에 든 2026 요율·상한 리터럴 */
function tableLiterals(sourceBody: string, patterns: readonly TaxLiteral[]): string[] {
  const out: string[] = [];
  for (const [i, t] of [...sourceBody.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/g)].entries()) {
    for (const p of patterns) if (p.re.test(t[0])) out.push(`표 ${i + 1}: ${p.name}`);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// 픽스처
// ─────────────────────────────────────────────────────────────
interface AllowFixture {
  _README?: string[];
  base?: string;
  forbiddenHits: AllowEntry[];
  descriptionBaseline: Record<string, DescriptionBaseline>;
}
interface H2Fixture {
  _README?: string[];
  base?: string;
  guides: Record<string, H2Shape>;
}
const loadJson = <T>(path: string, fallback: T): T => (existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as T) : fallback);
const allowFixture = loadJson<AllowFixture>(ALLOW_PATH, { forbiddenHits: [], descriptionBaseline: {} });
const h2Fixture = loadJson<H2Fixture>(H2_PATH, { guides: {} });
const writeJson = (path: string, data: unknown) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");

const keeperSet = new Set(KEEPERS);
const bySlug = new Map(koGuides.map((g) => [g.slug, g]));

// ═════════════════════════════════════════════════════════════
describe.runIf(REGEN.size > 0)("guideSpec 픽스처 재생성 (GUIDE_SPEC_REGEN)", () => {
  it("요청한 픽스처만 다시 쓴다", () => {
    const allow: AllowFixture = { ...allowFixture };
    if (REGEN.has("allow")) {
      const hits = scanForbidden(koGuides);
      const pool = new Map<string, AllowEntry[]>();
      for (const a of allowFixture.forbiddenHits) pool.set(hitKey(a), [...(pool.get(hitKey(a)) ?? []), a]);
      allow.forbiddenHits = hits
        .map((h) => {
          const prev = pool.get(hitKey(h))?.shift();
          return { ...h, tag: prev?.tag ?? "TODO", ...(prev?.note ? { note: prev.note } : {}) };
        })
        .sort((x, y) => (hitKey(x) < hitKey(y) ? -1 : hitKey(x) > hitKey(y) ? 1 : 0));
    }
    if (REGEN.has("baseline")) {
      const next = { ...allowFixture.descriptionBaseline };
      for (const g of koGuides) next[g.slug] ??= { chars: chars(g.description), publishedDate: g.publishedDate };
      allow.descriptionBaseline = next;
    }
    if (REGEN.has("allow") || REGEN.has("baseline")) writeJson(ALLOW_PATH, allow);
    if (REGEN.has("h2")) {
      const guides: Record<string, H2Shape> = {};
      for (const g of MAY_FAMILY) if (!keeperSet.has(g.slug)) guides[g.slug] = h2Shape(bySlug.get(g.slug)!.content);
      writeJson(H2_PATH, { ...h2Fixture, guides });
    }
    expect(REGEN.size).toBeGreaterThan(0);
  });
});

describe.skipIf(REGEN.size > 0)("(1) 금지 사실 스캔 — 한국어 가이드 전편", () => {
  it("대상은 한국어 가이드 전편이고 패턴 id 는 겹치지 않는다", () => {
    // 3b564c80 기준 334편 — GUIDES-07(308 통합) 뒤에는 줄어든다
    expect(koGuides.length).toBeGreaterThan(200);
    expect(new Set(FORBIDDEN.map((p) => p.id)).size).toBe(FORBIDDEN.length);
    for (const p of FORBIDDEN) expect(p.re.flags, p.id).toContain("g");
  });

  it("허용목록 항목 형식 — 아는 패턴·슬러그, tag 는 GUIDES-08 / dated-historical", () => {
    const ids = new Set(FORBIDDEN.map((p) => p.id));
    const bad = allowFixture.forbiddenHits.filter(
      (a) => !ids.has(a.patternId) || !ALLOW_TAGS.has(a.tag) || !a.snippet || !bySlug.has(a.slug)
    );
    expect(bad, "patternId·tag·slug 를 확인 (tag TODO 는 사람이 판정해 적을 것)").toEqual([]);
  });

  it("허용목록 밖 적중 0 · 사라진 적중이 목록에 남지 않음", () => {
    const { unlisted, stale } = matchAllowlist(scanForbidden(koGuides), allowFixture.forbiddenHits);
    const why = new Map(FORBIDDEN.map((p) => [p.id, p.why]));
    expect(
      unlisted.map((h) => `${h.slug} [${h.patternId}] ${h.snippet} — ${why.get(h.patternId)}`),
      "금지 사실이 새로 들어왔다 — 공식 출처로 고치거나, 과거 사실이면 허용목록에 dated-historical 로 등록"
    ).toEqual([]);
    expect(
      stale.map((a) => `${a.slug} [${a.patternId}] ${a.snippet}`),
      "고쳐져서 더는 나오지 않는 항목 — guideSpecAllow.json 에서 지울 것"
    ).toEqual([]);
  });

  it("정규식이 공허하지 않다 — 대표 옛 문구를 잡고, 현행 문구는 잡지 않는다", () => {
    const probe = (text: string) =>
      FORBIDDEN.filter((p) => [...text.matchAll(p.re)].length > 0).map((p) => p.id);
    expect(probe("성과급 건보료는 7월에 건보 정산됩니다")).toContain("health-settle-july");
    expect(probe("7,000만원 초과 ~ 1.2억: 한도 250만원 · 1.2억 초과: 한도 200만원")).toEqual(
      expect.arrayContaining(["card-tier-1.2eok", "card-over-1.2eok-200"])
    );
    expect(probe("월세 세액공제 — 총급여 7천만 이하, 한도 750만")).toEqual(
      expect.arrayContaining(["rent-salary-7000", "rent-cap-750"])
    );
    expect(probe("산후조리원 공제로 70만원 환급")).toContain("postpartum-70-7");
    expect(probe("자녀세액공제 1명 15만원, 2명 35만원")).toContain("child-credit-old");
    expect(probe("고향사랑기부 10만원 초과분 16.5%")).toContain("hometown-15");
    expect(probe("청년도약계좌 지금 가입하세요")).toContain("youth-leap-invite");
    // 뒤보기가 뒤쪽 옳은 값에서 막혀도 앞쪽 옛 값은 되짚어 잡는다
    expect(probe("월세 세액공제 — 총급여 7천만 이하(종합소득금액 7,000만원 이하)")).toContain("rent-salary-7000");
    expect(probe("RSU 단기 보유: 차익 발생 시 250만원 공제 후 22%. 손실 시 이월 가능.")).toContain("stock-loss-carry");
    expect(probe("해외주식 양도에서 난 손실은 다음 해로 이월 가능합니다")).toContain("stock-loss-carry");
    expect(probe("부모 자녀세액공제 추가 환급 30~70만원/년.")).toContain("child-credit-30-70");
    expect(probe("세액공제: 자녀(30~70만) + 연금저축")).toContain("child-credit-30-70");
    // 현행 문구
    expect(probe("양도소득세 이월과세가 적용돼 증여자의 취득가액으로 계산")).toEqual([]);
    expect(probe("자녀세액공제 1명 25만원, 2명 55만원, 첫째 25만원·둘째 30만원")).toEqual([]);
    expect(probe("고향사랑 10만원까지 100/110 · 10만~20만원 40% · 20만원 초과 15%")).toEqual([]);
    expect(probe("산후조리원 200만원 한도 × 15% = 최대 30만원")).toEqual([]);
    expect(probe("월세 세액공제 총급여 8,000만원 이하, 연 1,000만원 한도")).toEqual([]);
    expect(probe("월세 세액공제 총급여 8,000만원 이하(종합소득금액 7,000만원 이하)")).toEqual([]);
    expect(probe("월세 세액공제 한도를 연 1,200만원으로 늘리는 2026년 세제개편안")).toEqual([]);
    expect(probe("사업소득 결손금은 15년간 이월공제 가능(양도차손은 같은 해 통산만, 이월 불가)")).toEqual([]);
    expect(probe("자녀세액공제 연 25~40만원 + 출산·입양 세액공제(일회성) 30~70만원")).toEqual([]);
  });
});

describe.skipIf(REGEN.size > 0)("(2) 키퍼 사양 + TL;DR 길이", () => {
  it("TL;DR(description) 은 전 가이드가 기준선(3b564c80) 길이 이하 — GuideMidAd 위 높이 보호", () => {
    const grown = koGuides
      .filter((g) => allowFixture.descriptionBaseline[g.slug])
      .filter((g) => chars(g.description) > allowFixture.descriptionBaseline[g.slug].chars)
      .map((g) => `${g.slug}: ${chars(g.description)}자 > ${allowFixture.descriptionBaseline[g.slug].chars}자`);
    expect(grown, "description 을 줄이고 검색용 문구는 metaDescription 으로").toEqual([]);
    expect(Object.keys(allowFixture.descriptionBaseline).length).toBeGreaterThanOrEqual(334);
  });

  it("KEEPERS 는 한국어 가이드 슬러그이고 중복이 없다", () => {
    expect(KEEPERS.filter((s) => !bySlug.has(s))).toEqual([]);
    expect(new Set(KEEPERS).size).toBe(KEEPERS.length);
  });

  it("키퍼 전원이 사양을 지킨다", () => {
    const ctx: KeeperContext = { koTitles: koGuides.map((g) => g.title), baseline: allowFixture.descriptionBaseline };
    const report = KEEPERS.map((slug) => ({ slug, v: keeperViolations(bySlug.get(slug)!, ctx) })).filter((r) => r.v.length);
    expect(report).toEqual([]);
  });

  it("사양 검사가 공허하지 않다 — 합성 가이드로 통과·위반을 확인", () => {
    const para = "<p>2026년 귀속 연말정산에서 공제 한도는 총급여와 부양가족 조건에 따라 달라지므로 먼저 요건을 확인합니다.</p>\n".repeat(14);
    const section = (h: string) => `<h2>${h}</h2>\n${para}`;
    const content = [
      '<p class="lead">2026년 귀속 신용카드 공제 한도는 총급여 7,000만원 이하 300만원입니다. 기준일 2026-10-13, 근거는 조세특례제한법입니다.</p>',
      section("신용카드 공제 한도는 얼마인가요"),
      section("공제율은 결제수단마다 다른가요"),
      '<table class="w-full text-sm"><tr><th>구분</th><th>한도</th></tr><tr><td>7천 이하</td><td>300만원</td></tr></table>',
      section("추가공제는 어떻게 합산하나요"),
      section("맞벌이는 누구에게 몰아야 하나요"),
      "<h2>자주 묻는 질문</h2>\n<ul>\n" +
        "<li><strong>Q. 체크카드도 공제되나요?</strong> — 체크카드와 현금영수증은 30% 공제율이 적용됩니다.</li>\n" +
        "<li><strong>Q. 부모님 카드도 합산되나요?</strong> — 소득 요건을 충족한 기본공제 대상자의 사용액만 합산됩니다.</li>\n" +
        "<li><strong>Q. 해외 결제도 포함되나요?</strong> — 해외 사용분은 공제 대상 사용금액에서 빠집니다.</li>\n</ul>",
      '<p>출처: <a href="https://www.law.go.kr/법령/조세특례제한법/제126조의2">조특법 §126의2</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7794">국세청</a> · 기준일 2026-10-13</p>',
    ].join("\n");
    const good: Guide = {
      slug: "synthetic-keeper",
      title: "2026년 귀속 신용카드 공제 한도 정리",
      description: "카드 공제 한도 요약",
      metaDescription:
        "2026년 귀속 신용카드 소득공제 한도는 총급여 7,000만원 이하 300만원, 초과 250만원입니다. 결제수단별 공제율과 추가공제 합산 방법, 맞벌이 몰아주기 기준까지 정리했습니다.",
      category: "세금",
      tags: [],
      level: "중급",
      publishedDate: "2026-05-23",
      modifiedDate: "2026-10-13",
      views: 0,
      content,
      lang: "ko",
    };
    const ctx: KeeperContext = {
      koTitles: [good.title],
      baseline: { "synthetic-keeper": { chars: 20, publishedDate: "2026-05-23" } },
    };
    expect(keeperViolations(good, ctx)).toEqual([]);

    const bad = (patch: Partial<Guide>, extra: Partial<KeeperContext> = {}) =>
      keeperViolations({ ...good, ...patch }, { ...ctx, ...extra }).join(" | ");
    expect(bad({ title: "2026년 귀속 신용카드 소득공제 한도 총정리 — 결제수단별 공제율" })).toContain("title:");
    expect(bad({ title: "카드 공제 한도 💳" })).toContain("이모지");
    expect(bad({}, { koTitles: [good.title, good.title] })).toContain("중복");
    expect(bad({ metaDescription: "짧은 설명" })).toContain("metaDescription");
    expect(bad({ description: "카드 공제 한도 요약을 더 길게 늘린 설명" })).toContain("기준선");
    expect(bad({ publishedDate: "2026-10-13" })).toContain("publishedDate");
    expect(bad({ content: content.replace('<p class="lead">', "<p>") })).toContain("lead");
    expect(bad({ content: content.replace(/<h2>/g, '<h2 class="mt-12">') })).toContain("속성");
    expect(bad({ content: content.replace("<h2>자주 묻는 질문</h2>", '<h2 class="mt-12">자주 묻는 질문</h2>') })).toContain("FAQPage");
    expect(bad({ content: content.replace(/<table[\s\S]*?<\/table>/, "") })).toContain("table");
    expect(bad({ content: content.replace(/https:\/\/www\.nts\.go\.kr[^"]*/, "https://example.com/") })).toContain("공식 출처");
    expect(bad({ content: content.replace(/기준일/g, "날짜") })).toContain("기준일");
    expect(bad({ content: `${content}<p>검수 완료</p>` })).toContain("검수 완료");
    expect(bad({ content: content.slice(0, 1500) })).toContain("가시 텍스트");
    expect(bad({ modifiedDate: undefined })).toContain("modifiedDate");
  });
});

describe.skipIf(REGEN.size > 0)("(3) 5/23 대량 배치 181편 H2·광고 분할 지점 불변 (키퍼 제외)", () => {
  it("GuidePageClient.splitContentByH2 가 이 테스트의 복제본과 같은 코드다", () => {
    const src = read("src/app/guides/[slug]/GuidePageClient.tsx").replace(/\r\n/g, "\n");
    const start = src.indexOf("function splitContentByH2(");
    expect(start, "splitContentByH2 를 찾지 못함").toBeGreaterThanOrEqual(0);
    const fn = src.slice(start, src.indexOf("\n}\n", start) + 2);
    expect(sha16(fn), "원본이 바뀌었다 — splitStarts 복제본을 맞춘 뒤 SPLIT_FN_SHA 를 갱신").toBe(SPLIT_FN_SHA);
  });

  it("스냅숏과 모듈의 슬러그가 같다 (308 통합으로 빠진 가이드는 스냅숏에서 지울 것)", () => {
    const current = MAY_FAMILY.map((g) => g.slug).filter((s) => !keeperSet.has(s)).sort();
    const snap = Object.keys(h2Fixture.guides).filter((s) => !keeperSet.has(s)).sort();
    expect(snap).toEqual(current);
    expect(MAY_FAMILY.every((g) => bySlug.has(g.slug))).toBe(true);
  });

  it("H2 태그·문구와 분할 H2 순번이 스냅숏과 같다", () => {
    const diffs: string[] = [];
    for (const g of MAY_FAMILY) {
      if (keeperSet.has(g.slug)) continue;
      const snap = h2Fixture.guides[g.slug];
      if (!snap) continue; // 위 슬러그 대조에서 실패
      const now = h2Shape(bySlug.get(g.slug)!.content);
      if (now.h2.length !== snap.h2.length) diffs.push(`${g.slug}: H2 ${snap.h2.length}개 → ${now.h2.length}개`);
      else {
        const i = now.h2.findIndex((h, k) => h !== snap.h2[k]);
        if (i >= 0) diffs.push(`${g.slug}: H2 #${i + 1} 변경 — ${snap.h2[i]} → ${now.h2[i]}`);
      }
      if (JSON.stringify(now.split) !== JSON.stringify(snap.split)) diffs.push(`${g.slug}: 광고 분할 H2 ${JSON.stringify(snap.split)} → ${JSON.stringify(now.split)}`);
    }
    expect(diffs, "동결 기간에는 문장·셀 안 문자열만 고친다 — H2 와 광고 분할 지점은 그대로").toEqual([]);
  });

  it("스냅숏이 공허하지 않다", () => {
    const shapes = Object.values(h2Fixture.guides);
    // 3b564c80: 181편·H2 441개, 대부분 4,000자 미만이라 2분할(분할 H2 1개) 169편·3분할 1편·분할 없음 11편.
    // 하한은 GUIDES-07 308 통합으로 항목이 빠진 뒤에도 공허함만 잡도록 느슨하게 둔다.
    expect(shapes.length).toBeGreaterThanOrEqual(100);
    expect(shapes.reduce((n, s) => n + s.h2.length, 0)).toBeGreaterThan(200);
    expect(shapes.filter((s) => s.split.length > 0).length).toBeGreaterThan(80);
    for (const g of MAY_FAMILY.slice(0, 5)) {
      const html = bySlug.get(g.slug)!.content;
      expect(h2Shape(html).h2.length, g.slug).toBe([...html.matchAll(H2_OPEN_RE)].length);
    }
  });
});

describe.skipIf(REGEN.size > 0)("(4) /guides/nurse-salary — verify:autoads 기준 페이지 무접촉", () => {
  it("가이드 데이터·보강 섹션 해시가 3b564c80 과 같다", () => {
    const sortKeys = (v: unknown): unknown =>
      Array.isArray(v)
        ? v.map(sortKeys)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.entries(v as Record<string, unknown>)
                .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
                .map(([k, x]) => [k, sortKeys(x)])
            )
          : v;
    const guide = bySlug.get("nurse-salary");
    expect(guide).toBeDefined();
    const hash = sha16(JSON.stringify(sortKeys({ guide, supplement: guideSupplements["nurse-salary"] ?? null })));
    expect(hash, `nurse-salary 가 바뀌었다 (${BASE} 대비) — 이 페이지는 고치지 않는다`).toBe("fc0119baca31c11f");
  });
});

describe.skipIf(REGEN.size > 0)("(5) 키퍼 표 — 2026 요율·상한은 정본 상수에서 (리터럴 금지)", () => {
  // 파싱은 it 안에서 처음 쓸 때 한다 — verify-tax-constants.mjs 형식이 바뀌면 (5) 의 패턴 테스트만 실패하고
  // 파일 수집(건너뛰기·REGEN 포함)과 (1)~(4) 는 영향을 받지 않는다.
  let taxCache: TaxLiteral[] | null = null;
  const taxPatterns = () => (taxCache ??= verifyTaxPatterns());
  const patterns = () => [...taxPatterns(), ...DISPLAY_RATE_LITERALS];

  it("verify-tax-constants.mjs 의 감시 패턴을 읽어 온다", () => {
    expect(taxPatterns().length).toBeGreaterThanOrEqual(11);
    expect(taxPatterns().map((p) => p.name)).toEqual(expect.arrayContaining(["국민연금 4.75%", "최저시급 10,320", "실업급여 일 상한 68,100"]));
  });

  it("원본 소스 탐색기가 한국어 가이드 전편의 본문 템플릿을 찾는다 (H2·표 개수가 렌더 결과와 같음)", () => {
    const misses: string[] = [];
    for (const g of koGuides) {
      const src = guideContentSource(g.slug);
      if (!src) {
        misses.push(`${g.slug}: 소스 없음`);
        continue;
      }
      const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
      if (count(src.body, /<h2[\s>]/g) !== count(g.content, /<h2[\s>]/g)) misses.push(`${g.slug}: H2 개수 불일치 (${src.rel})`);
      if (count(src.body, /<table class="w-full text-sm">/g) !== count(g.content, /<table class="w-full text-sm">/g)) {
        misses.push(`${g.slug}: 표 개수 불일치 (${src.rel})`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("리터럴 검사가 공허하지 않다 — 하드코딩은 잡고 ${정본 상수} 보간은 통과", () => {
    const literal = '<table class="w-full text-sm"><tr><td>최저시급</td><td>10,320원</td></tr><tr><td>국민연금</td><td>4.75%</td></tr></table>';
    const imported = '<table class="w-full text-sm"><tr><td>최저시급</td><td>${won(MINIMUM_WAGE_2026.hourly)}원</td></tr></table>';
    expect(tableLiterals(literal, patterns())).toEqual(expect.arrayContaining(["표 1: 최저시급 10,320", "표 1: 국민연금 4.75% (표기)"]));
    expect(tableLiterals(imported, patterns())).toEqual([]);
    expect(tableLiterals("<p>최저시급 10,320원</p>", patterns())).toEqual([]);
  });

  it("키퍼 표에 2026 요율·상한 리터럴이 없다", () => {
    const report = KEEPERS.flatMap((slug) => {
      const src = guideContentSource(slug);
      if (!src) return [`${slug}: 본문 소스를 찾지 못함`];
      return tableLiterals(src.body, patterns()).map((x) => `${slug} (${src.rel}) ${x}`);
    });
    expect(report, "표의 요율·상한은 taxConstants2026·config 정본을 import 해 ${…} 로 넣는다").toEqual([]);
  });
});
