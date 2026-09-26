// src/lib/trendBriefs/types.ts
//
// 공식 발표 해설(트렌드 브리프) — 초안 스키마·상수 (2026-09-26 R5 publisher).
// ★상수 전용 모듈: 계산 엔진·React·node: 모듈을 import 하지 않는다.
//   FeaturedGuides(홈 청크)가 TREND_BRIEF_TAG 를 import 하므로 여기에 무거운 의존성을 두면 홈 청크가 커진다.
//   draftSha256 도 그래서 node:crypto 대신 순수 JS SHA-256 으로 계산한다(값은 node:crypto 와 같다 — 테스트로 고정).
// 파이프라인: scripts/trend-publish/*(daily·gate·render·publish-approved) · 런북 docs/trend-publishing-runbook.md.
// 정책 근거: Google 스팸 정책(대량 생성 콘텐츠 남용)·네이버 저품질/어뷰징 문서·AdSense 저가치 콘텐츠 —
//   무제한 자동 발행 금지. 하루 1편·주 5편 이하, 공식 출처 2건 이상, 엔진 계산 영향 표 필수, 게이트 실패 = SKIP.

/** 브리프 태그 — 홈 추천(FeaturedGuides) 최근 슬롯에서 제외하는 표식. 모든 브리프에 자동으로 붙는다. */
export const TREND_BRIEF_TAG = "공식발표해설";

export const TREND_BRIEF_SCHEMA_VERSION = 1;

/** 주제 군집 12개 — 레이더 후보의 cluster 값. 별칭은 CLUSTER_ALIASES. */
export const CLUSTER_IDS = [
  "minimum-wage",
  "social-insurance-rates",
  "civil-servant-pay",
  "tax-law-amendment",
  "year-end-tax",
  "earned-income-credit",
  "bok-base-rate",
  "national-pension",
  "parental-leave",
  "unemployment-benefit",
  "retirement-pension",
  "household-loan-policy",
] as const;
export type ClusterId = (typeof CLUSTER_IDS)[number];

/** 정책 조사(guardrails.json) 표기 → 군집 id */
export const CLUSTER_ALIASES: Readonly<Record<string, ClusterId>> = {
  "civil-servant-pay-table": "civil-servant-pay",
  "base-rate-decision": "bok-base-rate",
  "base-rate-decision(bok)": "bok-base-rate",
  "national-pension-benefit": "national-pension",
  "parental-leave-benefit": "parental-leave",
};

/** 영향 표 엔진이 있는 군집만 브리프 대상 — 엔진이 없는 주제는 SKIP (표를 손으로 쓰지 않는다) */
export const BRIEF_ELIGIBLE_CLUSTERS: readonly ClusterId[] = [
  "minimum-wage",
  "social-insurance-rates",
  "civil-servant-pay",
  "tax-law-amendment",
  "year-end-tax",
  "bok-base-rate",
  "national-pension",
  "unemployment-benefit",
  "retirement-pension",
  "household-loan-policy",
];

export const BRIEF_CATEGORIES = ["연봉", "세금", "기초", "부동산"] as const;
export type BriefCategory = (typeof BRIEF_CATEGORIES)[number];

/** 군집별 허용 카테고리 — 부동산은 household-loan-policy 만. 투자·주식은 어디에도 없다. */
export const CLUSTER_CATEGORIES: Readonly<Record<ClusterId, readonly BriefCategory[]>> = {
  "minimum-wage": ["연봉"],
  "social-insurance-rates": ["세금", "연봉"],
  "civil-servant-pay": ["연봉"],
  "tax-law-amendment": ["세금"],
  "year-end-tax": ["세금"],
  "earned-income-credit": ["세금"],
  "bok-base-rate": ["기초"],
  "national-pension": ["세금", "기초"],
  "parental-leave": ["기초"],
  "unemployment-benefit": ["기초"],
  "retirement-pension": ["기초", "세금"],
  "household-loan-policy": ["부동산", "기초"],
};

/** 군집 허브 — 계산기 링크의 첫 번째는 반드시 이 허브(없는 군집은 브리프 대상이 아니다) */
export const CLUSTER_HUBS: Readonly<Record<ClusterId, string>> = {
  "minimum-wage": "/minimum-wage-2027",
  "social-insurance-rates": "/social-insurance-rates-2027",
  "civil-servant-pay": "/civil-servant-pay-2027",
  "tax-law-amendment": "/tax-reform-2026",
  "year-end-tax": "/year-end-tax-2027",
  "earned-income-credit": "/earned-income-credit",
  "bok-base-rate": "/home-loan",
  "national-pension": "/calc/pension-hike-2027",
  "parental-leave": "/parental-leave",
  "unemployment-benefit": "/unemployment-benefit",
  "retirement-pension": "/retirement-pension-2026",
  "household-loan-policy": "/home-loan",
};

/** 발행 상한(하드) — config.json 은 더 조일 수만 있다 */
export const HARD_CAPS = {
  perKstDay: 1,
  perIsoWeek: 5,
  perMonth: 16,
  liveFirst90Days: 30,
  perSourceDoc: 1,
  perCluster30Days: 1,
} as const;
export type Caps = { -readonly [K in keyof typeof HARD_CAPS]: number };

/** 첫 발행 가능일 — 10/9 자동광고 판정 이후, 그 전에는 dry-run 만 */
export const FIRST_PUBLISH_NOT_BEFORE = "2026-10-10";

/** 본문 HTML 최소 길이(JS 문자 수) — GuidePageClient 3분할(1/3 GuideMidAd · 2/3 InArticleAd) 조건 */
export const HTML_MIN_JS_CHARS = 4000;

/**
 * 본문 HTML 최대 바이트(UTF-8). floor((620,000 − 전문 제외 피드 바이트 − 30 × 714) / 30 / 1.05) 를 100 단위 내림.
 * 8e37ceb8 실측: rss.xml 559,211B 중 content:encoded 318,504B → 전문 제외 240,707B → 11,361 → 11,300.
 * dry-run 이 다시 재서 고정한다(docs/trend-publishing-runbook.md §크기).
 */
export const HTML_BUDGET_BYTES = 11300;

/** 가시 텍스트(태그 제거) 길이 — 최소·최대 */
export const VISIBLE_TEXT = { min: 2400, max: 3300 } as const;

/** rss.xml 최악 투영(전문 30편이 모두 브리프일 때) 상한 — 이 값에 닿으면 SKIP. CI 테스트 상한은 RSS_CI_CAP. */
export const RSS_PROJECTION_LIMIT = 620000;
export const RSS_CI_CAP = 650000;
/** 전문 item 한 개의 비본문 오버헤드(바이트) — 예산 식의 714 */
export const RSS_ITEM_OVERHEAD = 714;

export const BANNED_TOKENS = ["속보", "단독", "충격", "경악", "역대급", "무조건", "대박", "긴급", "난리", "!!"] as const;

/**
 * 인용 가능한 공식 호스트(교집합: 이 목록 ∩ sourcePolicy.isOfficialSourceHost).
 * korea.kr 은 개별 기사·보도자료 페이지만(목록·검색·RSS 불가 — rules.isKoreaKrIndividualPage).
 */
export const BRIEF_CITATION_HOSTS = [
  "law.go.kr",
  "nts.go.kr",
  "korea.kr",
  "mofe.go.kr",
  "moef.go.kr",
  "moel.go.kr",
  "mohw.go.kr",
  "fsc.go.kr",
  "fss.or.kr",
  "bok.or.kr",
  "nps.or.kr",
  "nhis.or.kr",
  "mpm.go.kr",
  "mods.go.kr",
  "minimumwage.go.kr",
  "ei.go.kr",
] as const;

/** 유사도·카니발 임계값 (guardrails SIMILARITY) */
export const SIMILARITY = {
  /** 브리프 5-gram 중 다른 글에 있는 비율 상한 (가이드 전편·허브·정적 페이지) */
  containmentMax: 0.25,
  titleJaccardMax: 0.6,
  hubTitleJaccardMax: 0.35,
  /** 1차 출처 스냅숏 대비 8-gram 포함률 상한 (인용·표 제외) */
  sourceNgram8Max: 0.2,
  /** 21일 안에 본 헤드라인과의 최장 공통 부분 문자열 상한 */
  headlineLcsMax: 14,
  headlineWindowDays: 21,
} as const;

export const QUOTE_LIMITS = { maxCount: 2, maxCharsEach: 300, maxShare: 0.1 } as const;
export const OFFICIAL_SUMMARY_MAX_SHARE = 0.25;
export const TITLE_MAX_CODEPOINTS = 32;
export const DESCRIPTION_CHARS = { min: 60, max: 110 } as const;
export const MAX_TAGS = 5;
export const PRIMARY_MAX_AGE_DAYS = 7;
export const REVIEW_BY_DAYS = 60;
export const CALCULATOR_LINKS = { min: 1, max: 4 } as const;
export const INTERNAL_LINKS = { min: 2, max: 8 } as const;
export const FAQ_MIN = 3;

export const EVENT_KINDS = ["고시", "공포", "보도자료", "설명자료", "입법예고", "행정예고", "정부안", "예산안", "통계"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];
/** 아직 확정되지 않은 발표 — 제목·리드에 PROPOSED_MARKERS 중 하나, 본문에 '확정' 금지 */
export const PROPOSED_EVENT_KINDS: readonly EventKind[] = ["입법예고", "행정예고", "정부안", "예산안"];
export const PROPOSED_MARKERS = ["정부안", "예고", "예산안", "잠정", "추진"] as const;

export const SOURCE_ROLES = ["primary", "secondary", "statute"] as const;
export type SourceRole = (typeof SOURCE_ROLES)[number];
export const LEVELS = ["초급", "중급", "고급"] as const;
export type BriefLevel = (typeof LEVELS)[number];
export const HUMAN_REVIEW = ["none", "operator-approved"] as const;
export type HumanReview = (typeof HUMAN_REVIEW)[number];

/** 고정 H2(5·6번째)와 작성 방식 상자 */
export const FAQ_HEADING = "자주 묻는 질문";
export const SOURCES_HEADING = "출처와 작성 방식";
export const HOW_MADE_HEADING = "이 글은 이렇게 만들었습니다";
/** 사람 검토 상태 문구 — '검수 완료' 는 절대 쓰지 않는다 */
export const HUMAN_REVIEW_TEXT: Readonly<Record<HumanReview, string>> = {
  none: "사람 검토 없이 자동 검사만 거쳤습니다",
  "operator-approved": "운영자가 발행을 승인했습니다(내용 검수 아님)",
};
export const NOT_ADVICE_TEXT =
  "이 글은 공식 발표를 정리한 일반 정보이며 세무·금융 자문이 아닙니다. 개인별 적용은 담당 기관이나 전문가에게 확인하세요.";

// ─────────────────────────────────────────────────────────────
// 초안 스키마 (writer 가 쓰는 JSON — scripts/trend-publish/writer-rules.md)
// ─────────────────────────────────────────────────────────────
export interface BriefEvent {
  name: string;
  kind: EventKind;
  ministry: string;
  announcedDate: string;
  effectiveDate?: string;
  status: "final" | "proposed";
}
export interface BriefSource {
  id: string;
  url: string;
  title: string;
  publishedDate: string;
  fetchedAt: string;
  sha256: string;
  role: SourceRole;
  /** 공공누리 유형 1~4 (페이지에 표시된 경우). 3·4유형이면 인용 0개. */
  kogl?: 1 | 2 | 3 | 4;
}
export interface BriefQuote {
  text: string;
  sourceId: string;
}
export interface BriefNumber {
  /** 본문에 쓴 숫자 표기 그대로 (예: "3.9%", "1,200만원") */
  token: string;
  /** 출처 id · 'assumption'(가정·예시) · 'const:<NAME>'(정본 상수) */
  sourceId: string;
  /** 출처 안 위치(문단·표·조항) 또는 가정 설명 */
  locator: string;
}
export interface TrendBriefDraft {
  schemaVersion: 1;
  slug: string;
  title: string;
  description: string;
  category: BriefCategory;
  tags: string[];
  level: BriefLevel;
  publishedDate: string;
  modifiedDate: string;
  cluster: ClusterId;
  event: BriefEvent;
  sources: BriefSource[];
  lead: string;
  officialSummary: { heading: string; paragraphs: string[]; quotes: BriefQuote[] };
  impact: {
    heading: string;
    intro: string;
    table: { kind: string; params: Record<string, unknown>; caption: string };
    notes: string[];
  };
  effective: {
    heading: string;
    paragraphs: string[];
    beforeAfter: { label: string; before: string; after: string }[];
    caveats: string[];
  };
  calculators: { heading: string; links: { href: string; label: string; why: string }[] };
  faq: { q: string; a: string }[];
  numbers: BriefNumber[];
  humanReview: HumanReview;
}
export interface TrendBriefSkip {
  skip: true;
  reason: string;
}

export type ValidateResult =
  | { ok: true; draft: TrendBriefDraft; skip?: undefined; errors?: undefined }
  | { ok: true; skip: TrendBriefSkip; draft?: undefined; errors?: undefined }
  | { ok: false; errors: string[]; draft?: undefined; skip?: undefined };

// ─────────────────────────────────────────────────────────────
// 손으로 쓴 검증기 (zod 없음 — 의존성 추가 금지)
// ─────────────────────────────────────────────────────────────
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX64_RE = /^[0-9a-f]{64}$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** 실재 달력 날짜(YYYY-MM-DD) */
export function isIsoDate(v: unknown): v is string {
  if (typeof v !== "string" || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

const DRAFT_KEYS = [
  "schemaVersion",
  "slug",
  "title",
  "description",
  "category",
  "tags",
  "level",
  "publishedDate",
  "modifiedDate",
  "cluster",
  "event",
  "sources",
  "lead",
  "officialSummary",
  "impact",
  "effective",
  "calculators",
  "faq",
  "numbers",
  "humanReview",
] as const;

/** 초안 JSON 검증. {skip:true, reason} 도 유효한 초안이다(writer 가 쓸 수 없다고 판단한 날). */
export function validateDraft(input: unknown): ValidateResult {
  const errors: string[] = [];
  if (!isRecord(input)) return { ok: false, errors: ["초안이 JSON 객체가 아님"] };
  if (input.skip === true) {
    const extra = Object.keys(input).filter((k) => k !== "skip" && k !== "reason");
    if (typeof input.reason !== "string" || !input.reason.trim()) errors.push("skip 초안에 reason 없음");
    if (extra.length) errors.push(`skip 초안에 다른 필드: ${extra.join(", ")}`);
    return errors.length ? { ok: false, errors } : { ok: true, skip: { skip: true, reason: String(input.reason) } };
  }
  if ("metaDescription" in input) errors.push("metaDescription 금지 (guideFactCorrections 가 39편 고정)");
  for (const k of Object.keys(input)) {
    if (!(DRAFT_KEYS as readonly string[]).includes(k)) errors.push(`알 수 없는 필드: ${k}`);
  }
  const str = (v: unknown, path: string, min = 1) => {
    if (typeof v !== "string" || v.trim().length < min) errors.push(`${path}: 문자열 필요${min > 1 ? `(${min}자 이상)` : ""}`);
  };
  const strArr = (v: unknown, path: string, minItems = 0) => {
    if (!Array.isArray(v) || v.length < minItems || v.some((x) => typeof x !== "string" || !x.trim())) {
      errors.push(`${path}: 문자열 배열 필요${minItems ? `(${minItems}개 이상)` : ""}`);
    }
  };
  const oneOf = (v: unknown, list: readonly string[], path: string) => {
    if (typeof v !== "string" || !list.includes(v)) errors.push(`${path}: ${list.join("|")} 중 하나`);
  };
  const date = (v: unknown, path: string) => {
    if (!isIsoDate(v)) errors.push(`${path}: YYYY-MM-DD 실재 날짜`);
  };

  if (input.schemaVersion !== TREND_BRIEF_SCHEMA_VERSION) errors.push("schemaVersion 은 1");
  if (typeof input.slug !== "string" || !SLUG_RE.test(input.slug)) errors.push("slug: ASCII kebab-case");
  str(input.title, "title");
  str(input.description, "description");
  oneOf(input.category, BRIEF_CATEGORIES, "category");
  strArr(input.tags, "tags");
  oneOf(input.level, LEVELS, "level");
  date(input.publishedDate, "publishedDate");
  date(input.modifiedDate, "modifiedDate");
  oneOf(input.cluster, CLUSTER_IDS, "cluster");

  if (!isRecord(input.event)) errors.push("event: 객체 필요");
  else {
    str(input.event.name, "event.name");
    oneOf(input.event.kind, EVENT_KINDS, "event.kind");
    str(input.event.ministry, "event.ministry");
    date(input.event.announcedDate, "event.announcedDate");
    if (input.event.effectiveDate !== undefined) date(input.event.effectiveDate, "event.effectiveDate");
    oneOf(input.event.status, ["final", "proposed"], "event.status");
  }

  if (!Array.isArray(input.sources) || input.sources.length === 0) errors.push("sources: 1개 이상");
  else {
    input.sources.forEach((s, i) => {
      const p = `sources[${i}]`;
      if (!isRecord(s)) {
        errors.push(`${p}: 객체 필요`);
        return;
      }
      str(s.id, `${p}.id`);
      if (typeof s.url !== "string" || !s.url.startsWith("https://")) errors.push(`${p}.url: https URL`);
      str(s.title, `${p}.title`);
      date(s.publishedDate, `${p}.publishedDate`);
      if (typeof s.fetchedAt !== "string" || Number.isNaN(Date.parse(s.fetchedAt))) errors.push(`${p}.fetchedAt: ISO 시각`);
      if (typeof s.sha256 !== "string" || !HEX64_RE.test(s.sha256)) errors.push(`${p}.sha256: 64자리 소문자 hex`);
      oneOf(s.role, SOURCE_ROLES, `${p}.role`);
      if (s.kogl !== undefined && ![1, 2, 3, 4].includes(s.kogl as number)) errors.push(`${p}.kogl: 1~4`);
    });
  }

  str(input.lead, "lead");
  if (!isRecord(input.officialSummary)) errors.push("officialSummary: 객체 필요");
  else {
    str(input.officialSummary.heading, "officialSummary.heading");
    strArr(input.officialSummary.paragraphs, "officialSummary.paragraphs", 1);
    if (!Array.isArray(input.officialSummary.quotes)) errors.push("officialSummary.quotes: 배열 필요");
    else
      input.officialSummary.quotes.forEach((q, i) => {
        if (!isRecord(q)) errors.push(`officialSummary.quotes[${i}]: 객체 필요`);
        else {
          str(q.text, `officialSummary.quotes[${i}].text`);
          str(q.sourceId, `officialSummary.quotes[${i}].sourceId`);
        }
      });
  }
  if (!isRecord(input.impact)) errors.push("impact: 객체 필요");
  else {
    str(input.impact.heading, "impact.heading");
    str(input.impact.intro, "impact.intro");
    const t = input.impact.table;
    if (!isRecord(t)) errors.push("impact.table: 객체 필요");
    else {
      str(t.kind, "impact.table.kind");
      if (!isRecord(t.params)) errors.push("impact.table.params: 객체 필요");
      str(t.caption, "impact.table.caption");
    }
    strArr(input.impact.notes, "impact.notes");
  }
  if (!isRecord(input.effective)) errors.push("effective: 객체 필요");
  else {
    str(input.effective.heading, "effective.heading");
    strArr(input.effective.paragraphs, "effective.paragraphs", 1);
    if (!Array.isArray(input.effective.beforeAfter) || input.effective.beforeAfter.length === 0) {
      errors.push("effective.beforeAfter: 1개 이상");
    } else
      input.effective.beforeAfter.forEach((b, i) => {
        if (!isRecord(b)) errors.push(`effective.beforeAfter[${i}]: 객체 필요`);
        else {
          str(b.label, `effective.beforeAfter[${i}].label`);
          str(b.before, `effective.beforeAfter[${i}].before`);
          str(b.after, `effective.beforeAfter[${i}].after`);
        }
      });
    strArr(input.effective.caveats, "effective.caveats", 1);
  }
  if (!isRecord(input.calculators)) errors.push("calculators: 객체 필요");
  else {
    str(input.calculators.heading, "calculators.heading");
    if (!Array.isArray(input.calculators.links) || input.calculators.links.length === 0) {
      errors.push("calculators.links: 1개 이상");
    } else
      input.calculators.links.forEach((l, i) => {
        if (!isRecord(l)) errors.push(`calculators.links[${i}]: 객체 필요`);
        else {
          if (typeof l.href !== "string" || !l.href.startsWith("/")) errors.push(`calculators.links[${i}].href: 사이트 내부 경로`);
          str(l.label, `calculators.links[${i}].label`);
          str(l.why, `calculators.links[${i}].why`);
        }
      });
  }
  if (!Array.isArray(input.faq)) errors.push("faq: 배열 필요");
  else
    input.faq.forEach((f, i) => {
      if (!isRecord(f)) errors.push(`faq[${i}]: 객체 필요`);
      else {
        str(f.q, `faq[${i}].q`);
        str(f.a, `faq[${i}].a`);
      }
    });
  if (!Array.isArray(input.numbers)) errors.push("numbers: 배열 필요");
  else
    input.numbers.forEach((n, i) => {
      if (!isRecord(n)) errors.push(`numbers[${i}]: 객체 필요`);
      else {
        str(n.token, `numbers[${i}].token`);
        str(n.sourceId, `numbers[${i}].sourceId`);
        str(n.locator, `numbers[${i}].locator`);
      }
    });
  oneOf(input.humanReview, HUMAN_REVIEW, "humanReview");

  if (errors.length) return { ok: false, errors };
  const draft = input as unknown as TrendBriefDraft;
  // TREND_BRIEF_TAG 자동 추가 (태그 5개 한도는 규칙 tags 가 본다)
  const tags = draft.tags.includes(TREND_BRIEF_TAG) ? draft.tags : [...draft.tags, TREND_BRIEF_TAG];
  return { ok: true, draft: { ...draft, tags } };
}

// ─────────────────────────────────────────────────────────────
// 초안 해시 — 승인은 이 값에 묶인다(날짜·fetchedAt·humanReview 제외)
// ─────────────────────────────────────────────────────────────
/** 키 정렬 JSON (배열 순서 유지) */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isRecord(value)) {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

/** 승인 해시의 입력 — publishedDate·modifiedDate·sources[].fetchedAt·humanReview 를 뺀 초안 */
export function draftHashInput(draft: TrendBriefDraft): unknown {
  const rest: Record<string, unknown> = { ...draft };
  delete rest.publishedDate;
  delete rest.modifiedDate;
  delete rest.humanReview;
  rest.sources = draft.sources.map((s) => {
    const copy: Record<string, unknown> = { ...s };
    delete copy.fetchedAt;
    return copy;
  });
  return rest;
}

export function draftSha256(draft: TrendBriefDraft): string {
  return sha256Hex(canonicalJson(draftHashInput(draft)));
}

// 순수 JS SHA-256 (FIPS 180-4) — UTF-8 문자열 입력, 소문자 hex 출력.
const K256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
  0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
  0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

export function sha256Hex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  const bitLen = bytes.length * 8;
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(padded.length - 4, bitLen >>> 0);
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K256[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }
  return h.map((x) => x.toString(16).padStart(8, "0")).join("");
}
