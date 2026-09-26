// src/lib/trendBriefs/rules.ts
//
// 브리프 게이트 규칙 — 순수 함수. 규칙마다 {id, ok, detail, value, threshold} 를 돌려준다.
// 하나라도 ok=false 면 그날은 SKIP(발행하지 않음 — noindex 발행 같은 우회 없음).
// 입력(원장·달력·스냅숏·기존 글·헤드라인)은 scripts/trend-publish/gate.ts 가 모아 RuleContext 로 넘긴다.
// 임계값: types.ts (정책 근거 guardrails — 런북 docs/trend-publishing-runbook.md).
import { extractGuideFaqs } from "@/lib/guideFaq";
import { isOfficialSourceHost } from "@/lib/simpleCalculators/sourcePolicy";
import { CANONICAL_CONSTS, IMPACT_KINDS, escapeHtml, impactDisclosure, impactTable, pct, provisionalDisclosure, validateImpactParams } from "./impacts";
import { inlinePlain, parseInline, prepare, proseFields, segmentsToHtml, draftToEntrySource, type Inline } from "./render";
import {
  containment,
  guideSegments,
  longestCommonSubstring,
  normalizeForShingles,
  shingles,
  titleJaccard,
  utf8Bytes,
  visibleText,
} from "./text";
import {
  BANNED_TOKENS,
  BRIEF_CITATION_HOSTS,
  BRIEF_ELIGIBLE_CLUSTERS,
  CALCULATOR_LINKS,
  CLUSTER_CATEGORIES,
  CLUSTER_HUBS,
  DESCRIPTION_CHARS,
  FAQ_HEADING,
  FAQ_MIN,
  FIRST_PUBLISH_NOT_BEFORE,
  HARD_CAPS,
  HOW_MADE_HEADING,
  HTML_BUDGET_BYTES,
  HTML_MIN_JS_CHARS,
  INTERNAL_LINKS,
  MAX_TAGS,
  OFFICIAL_SUMMARY_MAX_SHARE,
  PRIMARY_MAX_AGE_DAYS,
  PROPOSED_EVENT_KINDS,
  PROPOSED_MARKERS,
  QUOTE_LIMITS,
  SIMILARITY,
  SOURCES_HEADING,
  TITLE_MAX_CODEPOINTS,
  TREND_BRIEF_TAG,
  VISIBLE_TEXT,
  type Caps,
  type TrendBriefDraft,
} from "./types";

export interface RuleResult {
  id: string;
  ok: boolean;
  detail: string;
  value?: string | number | boolean | null;
  threshold?: string | number | null;
}

export interface LedgerEntry {
  slug: string;
  publishedDate: string;
  cluster: string;
  eventName: string;
  eventKind: string;
  eventStatus: string;
  primary: { url: string; sha256: string; fetchedAt: string; publishedDate: string };
  sources: { url: string; sha256: string }[];
  reviewBy: string;
  status: "live" | "retired";
  approvedAt?: string;
  retiredAt?: string;
  retiredTo?: string;
}

export interface CalendarConfig {
  firstPublishNotBefore: string;
  freezes: { from: string; to: string; reason?: string }[];
  verdictWindows: { date: string; reason?: string }[];
  deployBatches: { date: string; reason?: string }[];
  deployBlackoutDaysAfter: number;
  /** 이 날짜 이후 재개는 D+28 파일럿 판정(decide.mjs --pilot-verdict continue) 이 있어야 한다 */
  resumeRequiresPilotVerdictAfter?: string;
  /**
   * 파일럿 기간(운영자 결정 2026-09-27: 10/13~10/31). from 은 첫 발행일로도 쓰이고(늦은 쪽이 이긴다),
   * to 가 지나면 파일럿 판정(decide.mjs --pilot-verdict continue) 전까지 발행을 막는다.
   */
  pilot?: { from: string; to: string; reason?: string };
}
export interface LocalCalendar {
  blackouts?: (string | { from: string; to?: string; reason?: string })[];
}

export interface SourceSnapshot {
  /** source-snapshot.ts --id — daily 는 레이더 후보를 'primary', 보조 출처를 'secondary-N' 으로 받는다 */
  id?: string;
  url: string;
  finalUrl?: string;
  fetchedAt: string;
  sha256: string;
  text: string;
  httpStatus?: number;
  robotsAllowed: boolean;
  kogl?: number | null;
  title?: string;
}

export interface ExistingDoc {
  key: string;
  title: string;
  text: string;
}

export interface HeadlineRecord {
  /** 원문 제목(로컬 TREND_HOME 에만 존재) — 있으면 최장 공통 부분 문자열을 직접 잰다 */
  title?: string;
  /** 정규화 제목의 15자 조각 FNV-1a 해시 — 원문 없이 'LCS ≥ 15' 를 판정 */
  shingles15?: number[];
}

export interface TaxPattern {
  name: string;
  re: RegExp;
}

/**
 * daily prepare 가 고른 레이더 후보(TREND_HOME/state/<날짜>-candidate.json · PROPOSE 보관본의 candidate).
 * writer 가 적은 1차 출처·게시일·발표 종류를 이 기록과 대조한다 — writer 의 선언만 믿지 않는다(critic fix 2026-09-26).
 */
export interface BriefCandidate {
  url: string;
  publishedDate: string;
  /** 레이더 원 필드(sourceKind) 또는 daily 정규화 필드(eventKind) — 고시·공포·보도자료·설명자료·입법예고·행정예고·통계·공고 */
  sourceKind?: string;
  eventKind?: string;
  route?: "new-brief" | "update-existing" | string;
  title?: string;
  cluster?: string;
}

export interface RuleContext {
  mode: "dryrun" | "publish";
  phase: "pre" | "post";
  today: string;
  ledger: LedgerEntry[];
  capsConfig?: Partial<Caps>;
  calendar: CalendarConfig;
  localCalendar?: LocalCalendar;
  pilotVerdict?: boolean;
  existingGuides: ExistingDoc[];
  staticPages: ExistingDoc[];
  cannibalHubs: { route: string; headTerms: string[]; title?: string }[];
  existingSlugs: readonly string[];
  redirectSlugs: readonly string[];
  routeExists: (path: string) => boolean;
  staleRoutes: readonly string[];
  snapshots: readonly SourceSnapshot[];
  headlines: readonly HeadlineRecord[];
  taxPatterns: readonly TaxPattern[];
  tripWires: readonly string[];
  /** 레이더가 이 후보를 기존 글 갱신(update-existing)으로 분류했으면 새 브리프 불가 (없으면 candidate.route) */
  candidateRoute?: "new-brief" | "update-existing";
  /** 레이더 후보 기록 — 새 브리프(--update 아님)는 필수. 1차 출처 URL·게시일·발표 종류를 대조한다 */
  candidate?: BriefCandidate;
  /** 등록부(trendBriefGuides)에 실제로 들어간 같은 slug 본문 — 생성 모듈이 렌더 규칙(결정 전 값 고지 등)을 담았는지 본다 */
  renderedHtml?: string;
  /** --update(같은 slug 수정 발행) 이면 slug·중복 검사에서 자기 자신을 뺀다 */
  updateOf?: string;
}

/** 1차 출처 제목·후보 제목에 이 표현이 있으면 확정 발표가 아니라 예고·정부안으로 본다 */
export const PROPOSAL_TITLE_RE = /입법예고|행정예고|정부안|예산안/;

// ─────────────────────────────────────────────────────────────
// guideSpec.test.ts FORBIDDEN 복제 — 브리프는 허용목록(가이드 워크플로 소유)에 오를 수 없으므로 적중 0 이어야 한다.
// id 목록·정규식 원문이 guideSpec 과 같은지 trendBriefRules.test.ts 가 원본 파일을 읽어 대조한다(드리프트 가드).
// ─────────────────────────────────────────────────────────────
export const GUIDESPEC_FORBIDDEN: readonly { id: string; re: RegExp }[] = [
  { id: "health-settle-july", re: /7월.{0,8}(?:건보|건강보험).{0,6}정산/g },
  { id: "nps-rate-4.5", re: /국민연금\s?4\.5\s?%/g },
  { id: "nps-cap-590", re: /(?:^|[^\d,.])590만/g },
  { id: "other-income-expense-80", re: /필요경비\s?80\s?%/g },
  {
    id: "youth-leap-invite",
    re: /도약계좌.{0,40}(?:가입하세요|가입해\s?(?:두|보)세요|가입을 서두르|지금 가입|바로 가입|활용하세요|신청하세요|개설하세요|가입 추천|가입 필수|꼭 가입)/g,
  },
  { id: "base-rate-2.75", re: /연 2\.75%/g },
  { id: "card-over-1.2eok-200", re: /1\.2억 초과.{0,6}200만/g },
  { id: "jongbu-joint-each-6eok", re: /각 6억/g },
  { id: "infertility-20", re: /난임.{0,12}20\s?%/g },
  { id: "transfer-loss-carry", re: /양도.{0,12}이월(?!과세)/g },
  { id: "crypto-5y-carry", re: /가상자산.{0,10}5년 이월/g },
  { id: "stock-10y-carry", re: /주식의 10년/g },
  { id: "stock-loss-carry", re: /(?:주식|RSU|양도)[^.]{0,40}손실[^.]{0,12}이월\s?가능|손실 시 이월 가능/g },
  { id: "card-tier-1.2eok", re: /(?:7,000만\s?원?|7천만?\s?원?)\s*(?:초과)?\s*[~∼]\s*1\.2억/g },
  { id: "card-extra-each-100", re: /(?:각|별도 한도)\s?100만\s?원?씩?\s?추가|\(한도 100만\s?원?\s?추가\)/g },
  { id: "rent-salary-7000", re: new RegExp("월세.{0,40}(?<!종합소득(?:금액)?[이은]?\\s?)(?:7,000만|7천만)", "g") },
  { id: "rent-cap-750", re: /월세.{0,40}750만/g },
  { id: "postpartum-70-7", re: /산후조리[^.]{0,30}?[^\d,.](?:70|7)만/g },
  {
    id: "child-credit-old",
    re: /자녀\s?세액\s?공제.{0,30}(?:1명|첫째|1인)[^0-9]{0,6}15만|자녀\s?세액\s?공제.{0,40}(?:2명|두 명)[^0-9]{0,6}(?:30|35)만|자녀\s?세액\s?공제.{0,40}둘째[^0-9]{0,6}20만/g,
  },
  { id: "child-credit-30-70", re: /자녀\s?세액\s?공제(?:(?!출산|입양)[^.+·]){0,12}30\s?~\s?70만|자녀\s?\(30\s?~\s?70만/g },
  { id: "transit-80", re: /대중교통.{0,20}80\s?%/g },
  {
    id: "hometown-15",
    re: /고향사랑.{0,60}10만\s?원?\s?초과(?:분)?\s?(?:은|는)?\s?[:：]?\s?(?:15|16\.5)\s?%|고향사랑.{0,60}10만\s?원?\s?(?:초과)?\s?[~∼]\s?20만\s?원?\s?(?:이하)?[^0-9%]{0,6}(?:15|16\.5)\s?%/g,
  },
  { id: "crypto-loss-carry-5y", re: /5년\s?이월\s?결손금|이월결손금\s?[:：]?\s?5년/g },
];

/** 주제 금지 목록 — 제목·설명·리드·발표명·요약 문단에 건다 (본문 FAQ 의 곁가지 언급까지 막지 않도록) */
export const TOPIC_DENYLIST: readonly { id: string; re: RegExp }[] = [
  { id: "stocks-crypto-funds", re: /주가|종목 추천|코스피|코스닥|비트코인|가상자산|암호화폐|코인 투자|펀드 추천|ETF 추천/ },
  { id: "price-forecast", re: /집값 전망|부동산 전망|가격 전망|오를까|내릴까|폭등|폭락/ },
  { id: "politics", re: /선거|대선|총선|지방선거|여당|야당|국민의힘|더불어민주당|정쟁/ },
  { id: "celebrity-sports", re: /연예인|아이돌|배우 .{0,6}(?:결혼|열애)|야구|축구|올림픽|월드컵/ },
  { id: "accident-crime-disaster", re: /사망|숨져|숨진|참사|살인|범죄|구속 기소|화재 사고|지진|태풍 피해|홍수 피해/ },
  { id: "health", re: /질병|감염병|코로나|독감|암 환자|의료 사고/ },
  { id: "lottery", re: /로또|복권 당첨/ },
  { id: "credit-score", re: /신용점수|신용등급|올크레딧|NICE지키미/ },
  { id: "bank-rate-ranking", re: /금리 순위|금리 비교표|최고 금리 (?:예금|적금)|예금 금리 TOP|적금 추천/ },
  { id: "bonus-rumor", re: /성과급 (?:루머|카더라|전망)|지급률 전망|노조 타결 임박|OPI 전망|PS 전망/ },
];

/** 정본 데이터 발표 — 새 브리프가 아니라 기존 허브 갱신(update-existing) 대상 */
export const CANONICAL_RELEASE_RE =
  /최저임금.{0,12}(?:고시|결정|의결)|(?:보험료율|요율).{0,8}(?:결정|고시|확정)|봉급표|보수표|기준소득월액.{0,8}(?:상한|하한)|구직급여.{0,8}상한액|기준금리.{0,6}(?:결정|인상|인하|동결)/;

/** '확정' 의 부정·미래 문맥 — 이 표현은 허용 */
const CONFIRM_NEGATION_RE = /미확정|확정되지|확정\s?전|확정\s?아님|확정이 아닌|확정되면|확정될|확정\s?시|확정\s?후|확정\s?여부|확정\s?예정|확정하지/g;

/** verify-tax-constants.mjs 의 PATTERNS 를 읽는다 — guideSpec.test.ts verifyTaxPatterns 와 같은 파서 */
export function parseVerifyTaxPatterns(scriptText: string): TaxPattern[] {
  const block = /const PATTERNS = \[([\s\S]*?)\n\];/.exec(scriptText.replace(/\r\n/g, "\n"))?.[1] ?? "";
  const declared = (block.match(/\bname:\s*"/g) ?? []).length;
  const parsed = [...block.matchAll(/\{\s*name:\s*"([^"]+)",\s*re:\s*\/((?:\\.|[^/\\\n])+)\/([a-z]*)\s*\}/g)].map((m) => ({
    name: m[1],
    re: new RegExp(m[2], m[3]),
  }));
  if (declared === 0 || parsed.length !== declared) {
    throw new Error(`verify-tax-constants.mjs PATTERNS 파싱 실패 (선언 ${declared}개, 읽음 ${parsed.length}개)`);
  }
  return parsed;
}

// ─────────────────────────────────────────────────────────────
// 날짜 도구 (UTC 자정 기준 — 날짜 문자열만 다룬다)
// ─────────────────────────────────────────────────────────────
const DAY = 86_400_000;
const toMs = (d: string) => Date.parse(`${d}T00:00:00Z`);
export const addDays = (d: string, n: number) => new Date(toMs(d) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a: string, b: string) => Math.round((toMs(b) - toMs(a)) / DAY);
/** ISO 주 키 'YYYY-Www' */
export function isoWeekKey(d: string): string {
  const date = new Date(toMs(d));
  const dow = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dow + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / DAY / 7 - ((firstThursday.getUTCDay() + 6) % 7 - 3) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
/** KST 오늘 */
export function kstToday(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3_600_000).toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────
// 발행 한도·달력 — daily.mjs 의 같은 이름 함수와 같은 결과여야 한다(trendBriefRules.test.ts 대조)
// ─────────────────────────────────────────────────────────────
export function effectiveCaps(config?: Partial<Caps>): Caps {
  const out = { ...HARD_CAPS } as Caps;
  for (const k of Object.keys(HARD_CAPS) as (keyof Caps)[]) {
    const v = config?.[k];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[k] = Math.min(out[k], v);
  }
  return out;
}

/** 오늘 새 브리프 1편을 더해도 한도 안인가 — 막는 사유 목록(빈 배열이면 가능) */
export function capViolations(
  today: string,
  ledger: readonly LedgerEntry[],
  capsConfig: Partial<Caps> | undefined,
  candidate?: { cluster?: string; primaryUrl?: string; primarySha?: string; slug?: string }
): string[] {
  const caps = effectiveCaps(capsConfig);
  const out: string[] = [];
  const entries = ledger.filter((e) => e.slug !== candidate?.slug);
  const sameDay = entries.filter((e) => e.publishedDate === today).length;
  if (sameDay + 1 > caps.perKstDay) out.push(`하루 ${caps.perKstDay}편 한도 (오늘 ${sameDay}편)`);
  const wk = isoWeekKey(today);
  const sameWeek = entries.filter((e) => isoWeekKey(e.publishedDate) === wk).length;
  if (sameWeek + 1 > caps.perIsoWeek) out.push(`주 ${caps.perIsoWeek}편 한도 (${wk} ${sameWeek}편)`);
  const sameMonth = entries.filter((e) => e.publishedDate.slice(0, 7) === today.slice(0, 7)).length;
  if (sameMonth + 1 > caps.perMonth) out.push(`월 ${caps.perMonth}편 한도 (${today.slice(0, 7)} ${sameMonth}편)`);
  const first = entries.map((e) => e.publishedDate).sort()[0] ?? today;
  if (daysBetween(first, today) < 90) {
    const live = entries.filter((e) => e.status === "live").length;
    if (live + 1 > caps.liveFirst90Days) out.push(`첫 90일 게시 ${caps.liveFirst90Days}편 한도 (게시 중 ${live}편)`);
  }
  if (candidate?.primaryUrl || candidate?.primarySha) {
    const sameDoc = entries.filter(
      (e) => (candidate.primaryUrl && e.primary.url === candidate.primaryUrl) || (candidate.primarySha && e.primary.sha256 === candidate.primarySha)
    ).length;
    if (sameDoc + 1 > caps.perSourceDoc) out.push(`공식 문서 1건당 ${caps.perSourceDoc}편 (이미 ${sameDoc}편)`);
  }
  if (candidate?.cluster) {
    const recent = entries.filter((e) => e.cluster === candidate.cluster && daysBetween(e.publishedDate, today) < 30).length;
    if (recent + 1 > caps.perCluster30Days) out.push(`군집 ${candidate.cluster} 30일 ${caps.perCluster30Days}편 (최근 ${recent}편)`);
  }
  return out;
}

/** 달력 차단 사유 목록 (빈 배열이면 발행 가능 날짜) */
export function calendarBlocks(today: string, cal: CalendarConfig, local?: LocalCalendar, pilotVerdict?: boolean): string[] {
  const out: string[] = [];
  const first = [cal.firstPublishNotBefore, FIRST_PUBLISH_NOT_BEFORE, cal.pilot?.from].filter((d): d is string => Boolean(d)).sort().reverse()[0];
  if (today < first) out.push(`첫 발행일 ${first} 이전`);
  for (const f of cal.freezes ?? []) if (today >= f.from && today <= f.to) out.push(`동결 ${f.from}~${f.to}${f.reason ? ` (${f.reason})` : ""}`);
  for (const w of cal.verdictWindows ?? []) if (today === w.date) out.push(`판정일 ${w.date}${w.reason ? ` (${w.reason})` : ""}`);
  for (const b of cal.deployBatches ?? []) {
    const end = addDays(b.date, cal.deployBlackoutDaysAfter ?? 2);
    if (today >= b.date && today <= end) out.push(`배포 배치 ${b.date} + ${cal.deployBlackoutDaysAfter ?? 2}일`);
  }
  for (const x of local?.blackouts ?? []) {
    const from = typeof x === "string" ? x : x.from;
    const to = typeof x === "string" ? x : (x.to ?? x.from);
    if (today >= from && today <= to) out.push(`calendar.local.json 차단 ${from}${to !== from ? `~${to}` : ""}`);
  }
  if (cal.resumeRequiresPilotVerdictAfter && today > cal.resumeRequiresPilotVerdictAfter && !pilotVerdict) {
    out.push(`${cal.resumeRequiresPilotVerdictAfter} 이후 재개는 D+28 파일럿 판정 필요`);
  }
  if (cal.pilot?.to && today > cal.pilot.to && !pilotVerdict) {
    out.push(`파일럿 ${cal.pilot.from}~${cal.pilot.to} 종료 — 재개는 D+28 파일럿 판정 필요`);
  }
  return out;
}

/** 기존 글 수정(--update)에 적용하는 달력 차단 — 판정일·배포 배치·로컬 차단만 (daily.mjs 와 같은 규칙) */
export function updateCalendarBlocks(reasons: readonly string[]): string[] {
  return reasons.filter((r) => /^(?:판정일|배포 배치|calendar\.local)/.test(r));
}

// ─────────────────────────────────────────────────────────────
// 본문 분석 도구
// ─────────────────────────────────────────────────────────────
/** 출처 섹션(6번째 H2) 앞까지 — 모든 브리프에 공통인 작성 방식 상자는 유사도에서 뺀다 */
export function bodyBeforeSources(html: string): string {
  const at = html.indexOf(`<h2>${SOURCES_HEADING}</h2>`);
  return at < 0 ? html : html.slice(0, at);
}
const stripQuotesTables = (html: string) => html.replace(/<blockquote>[\s\S]*?<\/blockquote>/g, " ").replace(/<table\b[\s\S]*?<\/table>/g, " ");

/** 브리프 5-gram 조각(공통 상자 제외) */
export function briefShingles(html: string): Set<number> {
  return shingles(visibleText(bodyBeforeSources(html)));
}

const DATE_SPANS: readonly RegExp[] = [
  /\d{4}-\d{2}-\d{2}/g,
  /\d{4}\.\s?\d{1,2}\.\s?\d{1,2}\.?/g,
  /\d{4}년\s?\d{1,2}월\s?\d{1,2}일/g,
  /\d{4}년\s?\d{1,2}월/g,
  /\d{1,2}월\s?\d{1,2}일/g,
  /(?:19|20)\d{2}\s?년(?:도)?/g,
  /(?:19|20)\d{2}(?=\s?(?:귀속|년|상반기|하반기|회계연도|예산|이직자|적용|기준))/g,
  /\b(?:19|20)\d{2}\b(?![,.]?\d)/g,
  /\d{1,2}월/g,
];
const ORDINAL_SPANS: readonly RegExp[] = [
  /제\s?\d+\s?(?:조|항|호|차|장|절|기|회)(?:의\s?\d+)?/g,
  /§\s?\d+(?:의\s?\d+)?/g,
  /\d+\s?(?:차|번째|째|호봉|급|분기|단계|등급)/g,
  /\d+\s?대\s?(?:보험|사회보험)/g,
  /\d+\s?(?:조|항)(?:의\s?\d+)?(?=\s|[,.)]|$)/g,
];
const NUM_TOKEN_RE = /\d+(?:,\d{3})*(?:\.\d+)?(?:\s?(?:%p|%포인트|%|만\s?원|억\s?원|천\s?원|원|만|억|배|명|곳|건|개월|년|일|시간|세|개|달))?/g;

/** 날짜·서수·조항 번호를 지운 뒤의 숫자 토큰 (공백 제거 정규화) */
export function numericTokens(text: string): string[] {
  let s = text;
  for (const re of [...DATE_SPANS, ...ORDINAL_SPANS]) s = s.replace(re, (m) => " ".repeat(m.length));
  return [...s.matchAll(NUM_TOKEN_RE)].map((m) => m[0].replace(/\s+/g, ""));
}
const normTok = (t: string) => t.replace(/\s+/g, "");
const normText = (t: string) => t.replace(/\s+/g, "");

/** 마크업 토큰({{…}})·링크 주소를 뺀 평문 — 숫자 출처 검사용(엔진·정본 보간은 이미 출처가 있다) */
function plainWithoutInterpolations(nodes: Inline[]): string {
  return nodes
    .map((n) => (n.t === "text" ? n.v : n.t === "bold" || n.t === "link" ? plainWithoutInterpolations(n.children) : " "))
    .join("");
}

function flattenNumbers(v: unknown, out: number[] = []): number[] {
  if (typeof v === "number") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => flattenNumbers(x, out));
  else if (v && typeof v === "object") Object.values(v as Record<string, unknown>).forEach((x) => flattenNumbers(x, out));
  return out;
}
/** 가정 숫자 토큰 → 값 후보 (단위 환산) */
function tokenValues(tok: string): number[] {
  const m = /^([\d,]+(?:\.\d+)?)(.*)$/.exec(tok);
  if (!m) return [];
  const n = Number(m[1].replace(/,/g, ""));
  const unit = m[2];
  if (/^만원?$/.test(unit)) return [n * 10_000];
  if (/^억원?$/.test(unit)) return [n * 100_000_000];
  if (/^천원$/.test(unit)) return [n * 1000];
  if (/^%/.test(unit)) return [n, n / 100];
  return [n];
}

function sentencesContaining(text: string, token: string): string[] {
  return splitSentences(text).filter((s) => normText(s).includes(token));
}

/** 문장 단위로 자르기 — 뒤보기 정규식 리터럴 없이(타깃 ES2017) */
export function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?。])\s+/g, "$1\n")
    .split("\n")
    .filter((x) => x.trim());
}

const codepoints = (s: string) => [...s].length;
const EMOJI_RE = new RegExp("\\p{Extended_Pictographic}", "u");
const hasEmoji = (s: string) => EMOJI_RE.test(s);

function isKoreaKrIndividualPage(url: URL): boolean {
  return /View\.do$/i.test(url.pathname) && /(?:^|&)(?:newsId|id)=\d+/.test(url.search.slice(1));
}
export function isBriefCitationUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  const listed = BRIEF_CITATION_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  if (!listed || !isOfficialSourceHost(host)) return false;
  if (host === "korea.kr" || host.endsWith(".korea.kr")) return isKoreaKrIndividualPage(u);
  return true;
}

function snapshotFor(ctx: RuleContext, url: string): SourceSnapshot | undefined {
  return ctx.snapshots.find((s) => s.url === url || s.finalUrl === url);
}

/** 초안의 모든 링크(문장 속 [라벨](주소) + 계산기 링크) */
function allLinks(d: TrendBriefDraft): string[] {
  const out: string[] = [];
  const walk = (nodes: Inline[]) =>
    nodes.forEach((n) => {
      if (n.t === "link") {
        out.push(n.href);
        walk(n.children);
      } else if (n.t === "bold") walk(n.children);
    });
  for (const f of proseFields(d)) walk(parseInline(f.text, d.impact.table.kind));
  for (const l of d.calculators.links) out.push(l.href);
  return out;
}
const pathOf = (href: string) => href.split(/[?#]/)[0].replace(/\/$/, "") || "/";

// ─────────────────────────────────────────────────────────────
// 규칙 실행
// ─────────────────────────────────────────────────────────────
export interface Evaluated {
  draft: TrendBriefDraft;
  html: string;
  text: string;
  source: string;
}

/** 초안 → 정본 치환·렌더 결과 (규칙과 gate 가 같은 값을 본다). 파라미터 오류면 null */
export function evaluateDraft(draft: TrendBriefDraft): Evaluated | null {
  try {
    const { draft: d, segments } = prepare(draft);
    const html = segmentsToHtml(segments);
    return { draft: d, html, text: visibleText(html), source: draftToEntrySource(draft) };
  } catch {
    return null;
  }
}

const r = (id: string, ok: boolean, detail: string, value?: RuleResult["value"], threshold?: RuleResult["threshold"]): RuleResult => ({
  id,
  ok,
  detail,
  value: value ?? null,
  threshold: threshold ?? null,
});

export const RULE_IDS = [
  "impact-kind",
  "no-meta-description",
  "caps",
  "calendar",
  "dates",
  "citations",
  "robots-kogl",
  "canonical-release",
  "structure",
  "shares",
  "title",
  "description",
  "tags",
  "category",
  "slug",
  "links",
  "link-freshness",
  "numeric-provenance",
  "unannounced-facts",
  "topic-denylist",
  "forbidden-facts",
  "tax-literals",
  "similarity-guides",
  "similarity-static",
  "similarity-title",
  "similarity-source",
  "similarity-headline",
] as const;
export type RuleId = (typeof RULE_IDS)[number];

export function runRules(input: TrendBriefDraft, ctx: RuleContext): RuleResult[] {
  const out: RuleResult[] = [];
  const kind = IMPACT_KINDS[input.impact.table.kind];
  const paramErrors = validateImpactParams(input.impact.table.kind, input.impact.table.params);

  // impact-kind
  {
    const errs: string[] = [];
    if (!kind) errs.push(`영향 표 종류 없음: ${input.impact.table.kind}`);
    if (!BRIEF_ELIGIBLE_CLUSTERS.includes(input.cluster)) errs.push(`브리프 대상 군집 아님: ${input.cluster}`);
    if (kind && !kind.clusters.includes(input.cluster)) errs.push(`${kind.id} 는 ${input.cluster} 군집용이 아님`);
    errs.push(...paramErrors);
    if (kind && !paramErrors.length) {
      const t = impactTable(kind.id, input.impact.table.params);
      if (t.rows.length < 3) errs.push(`표 행 ${t.rows.length}개 < 3`);
      if (kind.columns.length - 1 < 2) errs.push("값 열 2개 미만");
    }
    out.push(r("impact-kind", !errs.length, errs.join(" · ") || `${input.impact.table.kind} (${input.cluster})`));
  }
  const ev = kind && !paramErrors.length ? evaluateDraft(input) : null;
  if (!ev) {
    for (const id of RULE_IDS.slice(1)) out.push(r(id, false, "영향 표를 계산할 수 없어 검사 불가"));
    return out;
  }
  const { draft: d, html, text } = ev;
  const bodyText = visibleText(bodyBeforeSources(html));

  // no-meta-description
  out.push(r("no-meta-description", !("metaDescription" in (input as unknown as Record<string, unknown>)), "metaDescription 금지(39편 고정)"));

  // caps
  {
    const primary = d.sources.find((s) => s.role === "primary");
    const v = capViolations(ctx.today, ctx.ledger, ctx.capsConfig, {
      cluster: d.cluster,
      primaryUrl: primary?.url,
      primarySha: primary?.sha256,
      // render --write 가 원장에 이 브리프를 먼저 올려 두므로 자기 자신은 센다(같은 slug 재사용은 render·slug 규칙이 막는다)
      slug: d.slug,
    });
    if (ctx.updateOf) out.push(r("caps", true, "--update: 기존 글 수정(신규 URL 아님)"));
    else if (ctx.mode === "dryrun") out.push(r("caps", true, v.length ? `[dry-run 참고] 발행 시 차단: ${v.join(" · ")}` : "한도 여유"));
    else out.push(r("caps", !v.length, v.join(" · ") || "한도 여유"));
  }

  // calendar
  {
    const all = calendarBlocks(ctx.today, ctx.calendar, ctx.localCalendar, ctx.pilotVerdict);
    // --update(수치 정정 등 기존 글 수정)은 새 URL 이 아니라 동결·첫 발행일·파일럿 판정과 무관 — 판정일·배포 배치·로컬 차단만 본다
    const v = ctx.updateOf ? updateCalendarBlocks(all) : all;
    if (ctx.mode === "dryrun") out.push(r("calendar", true, v.length ? `[dry-run 참고] 발행 시 차단: ${v.join(" · ")}` : "발행 가능일"));
    else out.push(r("calendar", !v.length, v.join(" · ") || "발행 가능일"));
  }

  // dates
  {
    const errs: string[] = [];
    if (ctx.mode === "publish" && d.publishedDate !== ctx.today && !ctx.updateOf) errs.push(`발행일 ${d.publishedDate} ≠ 오늘(KST) ${ctx.today}`);
    if (ctx.updateOf && d.modifiedDate !== ctx.today) errs.push(`--update 수정일 ${d.modifiedDate} ≠ 오늘 ${ctx.today}`);
    if (d.publishedDate > ctx.today) errs.push("발행일이 미래");
    if (d.modifiedDate > ctx.today) errs.push("수정일이 미래");
    if (d.modifiedDate < d.publishedDate) errs.push("수정일 < 발행일");
    if (d.event.announcedDate > ctx.today) errs.push("발표일이 미래");
    for (const s of d.sources) if (s.publishedDate > ctx.today) errs.push(`출처 ${s.id} 게시일이 미래`);
    out.push(r("dates", !errs.length, errs.join(" · ") || `발행 ${d.publishedDate} · 수정 ${d.modifiedDate}`));
  }

  // citations
  {
    const errs: string[] = [];
    const ok = d.sources.filter((s) => isBriefCitationUrl(s.url));
    const distinct = new Set(ok.map((s) => s.url));
    if (distinct.size < 2) errs.push(`공식 출처 ${distinct.size}건 < 2 (BRIEF_CITATION_HOSTS ∩ isOfficialSourceHost, korea.kr 은 개별 페이지만)`);
    for (const s of d.sources) if (!isBriefCitationUrl(s.url)) errs.push(`허용 밖 출처: ${s.url}`);
    const primaries = d.sources.filter((s) => s.role === "primary");
    if (primaries.length !== 1) errs.push(`1차 출처 ${primaries.length}개 (정확히 1개)`);
    const p = primaries[0];
    if (p && daysBetween(p.publishedDate, ctx.today) > PRIMARY_MAX_AGE_DAYS) {
      errs.push(`1차 출처 ${daysBetween(p.publishedDate, ctx.today)}일 경과 > ${PRIMARY_MAX_AGE_DAYS}일`);
    }
    for (const s of d.sources) {
      const snap = snapshotFor(ctx, s.url);
      if (!snap) errs.push(`스냅숏 없음: ${s.id}`);
      else {
        if (snap.sha256 !== s.sha256) errs.push(`sha256 불일치: ${s.id}`);
        if (snap.httpStatus !== undefined && snap.httpStatus !== 200) errs.push(`HTTP ${snap.httpStatus}: ${s.id}`);
      }
      if (!s.fetchedAt || !s.sha256) errs.push(`fetchedAt·sha256 없음: ${s.id}`);
    }
    const ids = new Set(d.sources.map((s) => s.id));
    if (ids.size !== d.sources.length) errs.push("출처 id 중복");
    // 레이더 후보 대조 (critic fix 2026-09-26) — 7일 신선도·1차 출처 판정을 writer 가 적은 role·publishedDate 에만 맡기지 않는다.
    // 역할을 바꿔 오래된 보조 출처를 1차로 올리거나 게시일을 새로 적으면 여기서 막힌다.
    const cand = ctx.candidate;
    if (!cand) {
      if (!ctx.updateOf) errs.push("레이더 후보 기록 없음(--candidate) — 1차 출처·게시일을 후보와 대조할 수 없음");
    } else if (p) {
      const cited = snapshotFor(ctx, p.url);
      if (![p.url, cited?.url, cited?.finalUrl].includes(cand.url)) errs.push(`1차 출처 ${p.id} 가 레이더 후보 문서가 아님`);
      const primarySnap = ctx.snapshots.find((s) => s.id === "primary");
      if (primarySnap && cited !== primarySnap) errs.push(`1차 출처 ${p.id} 가 daily 가 1차로 받은 스냅숏(primary)이 아님`);
      if (p.publishedDate !== cand.publishedDate) errs.push(`1차 출처 게시일 ${p.publishedDate} ≠ 레이더 후보 게시일 ${cand.publishedDate}`);
      if (d.event.announcedDate > cand.publishedDate) errs.push(`발표일 ${d.event.announcedDate} 이 레이더 후보 게시일 ${cand.publishedDate} 보다 늦음`);
    }
    out.push(r("citations", !errs.length, errs.join(" · ") || `공식 출처 ${distinct.size}건 · 1차 = 레이더 후보`, distinct.size, 2));
  }

  // robots-kogl
  {
    const errs: string[] = [];
    for (const s of d.sources) {
      const snap = snapshotFor(ctx, s.url);
      if (snap && !snap.robotsAllowed) errs.push(`robots 차단: ${s.id}`);
    }
    const restricted = d.sources.some((s) => s.kogl === 3 || s.kogl === 4 || [3, 4].includes(Number(snapshotFor(ctx, s.url)?.kogl)));
    if (restricted && d.officialSummary.quotes.length) errs.push("공공누리 3·4유형 출처가 있으면 인용 0개");
    out.push(r("robots-kogl", !errs.length, errs.join(" · ") || "robots 허용 · 공공누리 조건 충족"));
  }

  // canonical-release
  {
    const text2 = `${d.event.name} ${d.title}`;
    const route = ctx.candidateRoute ?? ctx.candidate?.route;
    const isCanonical = route === "update-existing" || (d.event.kind === "고시" && CANONICAL_RELEASE_RE.test(text2)) || CANONICAL_RELEASE_RE.test(d.event.name);
    out.push(
      r("canonical-release", !isCanonical, isCanonical ? "정본 데이터 발표(고시·요율·봉급표·기준금리)는 기존 허브 갱신(update-existing) 대상 — 새 브리프 불가" : "새 브리프 대상 발표")
    );
  }

  // structure
  {
    const errs: string[] = [];
    if (!html.startsWith('<p class="lead">')) errs.push('<p class="lead"> 로 시작하지 않음');
    const h2 = [...html.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/g)];
    if (h2.length !== 6) errs.push(`H2 ${h2.length}개 ≠ 6`);
    if (h2.some((m) => m[1] !== "")) errs.push("H2 에 속성");
    if (h2[4]?.[2] !== FAQ_HEADING) errs.push(`5번째 H2 ≠ ${FAQ_HEADING}`);
    if (h2[5]?.[2] !== SOURCES_HEADING) errs.push(`6번째 H2 ≠ ${SOURCES_HEADING}`);
    if ((html.match(/<table class="w-full text-sm">/g) ?? []).length !== 1) errs.push('<table class="w-full text-sm"> 1개가 아님');
    const faqs = extractGuideFaqs(html);
    if (faqs.length < FAQ_MIN) errs.push(`FAQ ${faqs.length}개 < ${FAQ_MIN}`);
    if (html.length < HTML_MIN_JS_CHARS) errs.push(`HTML ${html.length}자 < ${HTML_MIN_JS_CHARS}`);
    const bytes = utf8Bytes(html);
    if (bytes > HTML_BUDGET_BYTES) errs.push(`HTML ${bytes}B > 예산 ${HTML_BUDGET_BYTES}B`);
    // 분량 한도는 writer 가 쓴 글만 잰다 — 렌더가 붙이는 결정 전 값 고지 문장(고정)은 뺀다. 바이트 예산(HTML_BUDGET_BYTES)은 전부 센다.
    const disclosureText = impactDisclosure(d.impact.table.kind, d.impact.table.params);
    const writerLen = disclosureText ? text.replace(` ${disclosureText}`, "").length : text.length;
    if (writerLen < VISIBLE_TEXT.min || writerLen > VISIBLE_TEXT.max) errs.push(`가시 텍스트 ${writerLen}자 (${VISIBLE_TEXT.min}~${VISIBLE_TEXT.max}${disclosureText ? ", 고지 문장 제외" : ""})`);
    if (guideSegments(html).length !== 3) errs.push("본문 3분할 아님(GuideMidAd 1/3 · InArticleAd 2/3)");
    if (/<(?:img|iframe|script|style|object|embed|form)\b/i.test(html)) errs.push("img·iframe·script·style 금지");
    const classes = [...html.matchAll(/\sclass="([^"]*)"/g)].map((m) => m[1]).filter((c) => c !== "lead" && c !== "w-full text-sm");
    if (classes.length) errs.push(`새 class 금지: ${[...new Set(classes)].join(", ")}`);
    if (!html.includes("기준일")) errs.push("'기준일' 줄 없음");
    if (!html.includes(`<h3>${HOW_MADE_HEADING}</h3>`)) errs.push("작성 방식 상자 없음");
    if (!html.includes("세무·금융 자문이 아닙니다")) errs.push("자문 아님 고지 없음");
    if (html.includes("검수 완료")) errs.push("'검수 완료' 금지");
    out.push(
      r(
        "structure",
        !errs.length,
        errs.join(" · ") || `H2 6 · FAQ ${faqs.length} · ${html.length}자 · ${bytes}B · 가시 ${writerLen}자${disclosureText ? `(+고지 ${disclosureText.length + 1}자)` : ""}`,
        writerLen,
        `${VISIBLE_TEXT.min}~${VISIBLE_TEXT.max}`
      )
    );
  }

  // shares (요약 비중·인용)
  {
    const errs: string[] = [];
    const k = d.impact.table.kind;
    const plain = (t: string) => inlinePlain(parseInline(t, k), d);
    const summaryLen = d.officialSummary.paragraphs.map(plain).join("").length + d.officialSummary.quotes.map((q) => plain(q.text)).join("").length;
    const share = text.length ? summaryLen / text.length : 1;
    if (share > OFFICIAL_SUMMARY_MAX_SHARE) errs.push(`공식 요약 비중 ${(share * 100).toFixed(1)}% > ${OFFICIAL_SUMMARY_MAX_SHARE * 100}%`);
    const quotes = d.officialSummary.quotes;
    if (quotes.length > QUOTE_LIMITS.maxCount) errs.push(`인용 ${quotes.length}개 > ${QUOTE_LIMITS.maxCount}`);
    let quoteLen = 0;
    for (const q of quotes) {
      const qt = plain(q.text);
      quoteLen += qt.length;
      if (qt.length > QUOTE_LIMITS.maxCharsEach) errs.push(`인용 ${qt.length}자 > ${QUOTE_LIMITS.maxCharsEach}`);
      const src = d.sources.find((s) => s.id === q.sourceId);
      const snap = src ? snapshotFor(ctx, src.url) : undefined;
      if (!src) errs.push(`인용 출처 id 없음: ${q.sourceId}`);
      else if (!snap || !normText(snap.text).includes(normText(qt))) errs.push(`인용이 출처 원문과 글자 그대로 같지 않음: ${q.sourceId}`);
    }
    if (text.length && quoteLen / text.length > QUOTE_LIMITS.maxShare) errs.push(`인용 비중 ${((quoteLen / text.length) * 100).toFixed(1)}% > ${QUOTE_LIMITS.maxShare * 100}%`);
    out.push(r("shares", !errs.length, errs.join(" · ") || `요약 ${(share * 100).toFixed(1)}% · 인용 ${quotes.length}개`, Number(share.toFixed(3)), OFFICIAL_SUMMARY_MAX_SHARE));
  }

  // title
  {
    const errs: string[] = [];
    const t = d.title;
    if (codepoints(t) > TITLE_MAX_CODEPOINTS) errs.push(`${codepoints(t)}자 > ${TITLE_MAX_CODEPOINTS}`);
    if (hasEmoji(t)) errs.push("이모지");
    for (const b of BANNED_TOKENS) if (t.includes(b)) errs.push(`금지 표현 '${b}'`);
    if (!normText(t).includes(normText(d.event.name))) errs.push(`공식 발표명 '${d.event.name}' 미포함`);
    for (const tok of numericTokens(t)) if (!normText(text).includes(tok)) errs.push(`제목 숫자 ${tok} 가 본문에 없음`);
    out.push(r("title", !errs.length, errs.join(" · ") || t, codepoints(t), TITLE_MAX_CODEPOINTS));
  }

  // description
  {
    const errs: string[] = [];
    const len = codepoints(d.description);
    if (len < DESCRIPTION_CHARS.min || len > DESCRIPTION_CHARS.max) errs.push(`${len}자 (${DESCRIPTION_CHARS.min}~${DESCRIPTION_CHARS.max})`);
    if (hasEmoji(d.description)) errs.push("이모지");
    for (const b of BANNED_TOKENS) if (d.description.includes(b)) errs.push(`금지 표현 '${b}'`);
    for (const tok of numericTokens(d.description)) if (!normText(text).includes(tok)) errs.push(`설명 숫자 ${tok} 가 본문에 없음`);
    out.push(r("description", !errs.length, errs.join(" · ") || `${len}자`, len, `${DESCRIPTION_CHARS.min}~${DESCRIPTION_CHARS.max}`));
  }

  // tags
  {
    const errs: string[] = [];
    if (d.tags.length > MAX_TAGS) errs.push(`태그 ${d.tags.length}개 > ${MAX_TAGS} (${TREND_BRIEF_TAG} 포함)`);
    if (!d.tags.includes(TREND_BRIEF_TAG)) errs.push(`${TREND_BRIEF_TAG} 태그 없음`);
    if (new Set(d.tags).size !== d.tags.length) errs.push("태그 중복");
    for (const t of d.tags) {
      if (codepoints(t) > 20) errs.push(`태그 너무 김: ${t}`);
      if (BANNED_TOKENS.some((b) => t.includes(b))) errs.push(`태그 금지 표현: ${t}`);
    }
    out.push(r("tags", !errs.length, errs.join(" · ") || d.tags.join(", "), d.tags.length, MAX_TAGS));
  }

  // category
  {
    const allowed = CLUSTER_CATEGORIES[d.cluster] ?? [];
    const ok = allowed.includes(d.category) && (d.category !== "부동산" || d.cluster === "household-loan-policy");
    out.push(r("category", ok, ok ? d.category : `${d.cluster} 허용 카테고리: ${allowed.join("·")} (투자·주식 불가)`));
  }

  // slug
  {
    const errs: string[] = [];
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)) errs.push("ASCII kebab-case 아님");
    if (!/(?:^|-)20\d{2}(?:-|$)/.test(d.slug)) errs.push("연도(20YY) 없음");
    if (d.slug.length > 80) errs.push("80자 초과");
    if (d.slug !== ctx.updateOf && ctx.existingSlugs.includes(d.slug)) errs.push("기존 가이드 slug");
    if (ctx.redirectSlugs.includes(d.slug)) errs.push("next.config /guides 리디렉트 출발지");
    out.push(r("slug", !errs.length, errs.join(" · ") || d.slug));
  }

  // links
  const links = allLinks(d);
  {
    const errs: string[] = [];
    const internal = new Set<string>();
    for (const href of links) {
      if (href.startsWith("/")) {
        if (href.startsWith("//")) errs.push(`프로토콜 상대 링크 금지: ${href}`);
        else if (!ctx.routeExists(pathOf(href))) errs.push(`없는 경로: ${href}`);
        internal.add(pathOf(href));
      } else if (!isBriefCitationUrl(href)) errs.push(`외부 링크는 공식 https 만: ${href}`);
    }
    const calc = d.calculators.links;
    if (calc.length < CALCULATOR_LINKS.min || calc.length > CALCULATOR_LINKS.max) errs.push(`계산기 링크 ${calc.length}개 (${CALCULATOR_LINKS.min}~${CALCULATOR_LINKS.max})`);
    if (calc[0] && pathOf(calc[0].href) !== CLUSTER_HUBS[d.cluster]) errs.push(`첫 계산기 링크는 군집 허브 ${CLUSTER_HUBS[d.cluster]}`);
    if (internal.size < INTERNAL_LINKS.min || internal.size > INTERNAL_LINKS.max) errs.push(`내부 링크 ${internal.size}개 (${INTERNAL_LINKS.min}~${INTERNAL_LINKS.max})`);
    out.push(r("links", !errs.length, errs.join(" · ") || `내부 ${internal.size} · 계산기 ${calc.length}`, internal.size, `${INTERNAL_LINKS.min}~${INTERNAL_LINKS.max}`));
  }

  // link-freshness
  {
    const stale = links.filter((h) => h.startsWith("/") && ctx.staleRoutes.some((s) => pathOf(h) === pathOf(s)));
    out.push(r("link-freshness", !stale.length, stale.length ? `sentinel 이 낡았다고 표시한 경로 링크: ${stale.join(", ")}` : "낡은 경로 링크 없음"));
  }

  // numeric-provenance
  {
    const errs: string[] = [];
    const k = d.impact.table.kind;
    const sourceIds = new Set(d.sources.map((s) => s.id));
    const paramValues = flattenNumbers(d.impact.table.params);
    const okTokens = new Set<string>();
    for (const n of d.numbers) {
      const tok = normTok(n.token);
      if (n.sourceId === "assumption") {
        okTokens.add(`a:${tok}`);
        continue;
      }
      if (n.sourceId.startsWith("const:")) {
        const c = CANONICAL_CONSTS[n.sourceId.slice(6)];
        if (!c) errs.push(`알 수 없는 정본 상수: ${n.sourceId}`);
        else if (normTok(c.text) !== tok) errs.push(`정본 표기 불일치: ${n.token} ≠ ${c.text}`);
        else okTokens.add(tok);
        continue;
      }
      if (!sourceIds.has(n.sourceId)) {
        errs.push(`numbers ${n.token}: 출처 id 없음 (${n.sourceId})`);
        continue;
      }
      const src = d.sources.find((s) => s.id === n.sourceId)!;
      const snap = snapshotFor(ctx, src.url);
      if (!snap || !normText(snap.text).includes(tok)) errs.push(`numbers ${n.token}: 출처 ${n.sourceId} 원문에 같은 표기 없음`);
      else okTokens.add(tok);
    }
    const quoteSet = new Set(d.officialSummary.quotes.map((q) => q.text));
    for (const f of proseFields(d)) {
      if (quoteSet.has(f.text)) continue; // 인용은 원문 대조(shares)로 검증
      const plain = plainWithoutInterpolations(parseInline(f.text, k));
      for (const tok of numericTokens(plain)) {
        if (okTokens.has(tok)) continue;
        if (okTokens.has(`a:${tok}`)) {
          const labelled = sentencesContaining(plain, tok).some((s) => /가정|예시/.test(s));
          const inParams = tokenValues(tok).some((v) => paramValues.some((p) => Math.abs(p - v) < 1e-9));
          if (!labelled) errs.push(`${f.path}: 가정 숫자 ${tok} 옆에 '가정'·'예시' 표시 없음`);
          if (!inParams) errs.push(`${f.path}: 가정 숫자 ${tok} 가 표 파라미터와 다름`);
          continue;
        }
        errs.push(`${f.path}: 숫자 ${tok} 의 출처 없음 (엔진 {{engine}}·정본 {{const}}·출처 numbers·가정 중 하나)`);
      }
    }
    // 출처 요율 override 는 출처 원문에서 확인된 숫자여야 한다 (가정 불가)
    const ov = (d.impact.table.params as Record<string, unknown>).override;
    if (ov && typeof ov === "object") {
      for (const [key, v] of Object.entries(ov as Record<string, unknown>)) {
        if (typeof v !== "number") continue;
        const forms = new Set([pct(v), `${(v * 100).toFixed(1)}%`, `${(v * 100).toFixed(2)}%`]);
        const sourced = d.numbers.some((n) => sourceIds.has(n.sourceId) && forms.has(normTok(n.token)) && okTokens.has(normTok(n.token)));
        if (!sourced) errs.push(`override ${key}=${pct(v)} 가 출처 numbers 로 확인되지 않음`);
      }
    }
    out.push(r("numeric-provenance", !errs.length, errs.slice(0, 12).join(" · ") || "모든 숫자에 출처", errs.length, 0));
  }

  // unannounced-facts
  {
    const errs: string[] = [];
    // 예고·정부안 신호는 writer 의 event 선언만이 아니라 레이더 후보 종류·1차 출처 스냅숏 제목에서도 읽는다 (critic fix 2026-09-26)
    const cand = ctx.candidate;
    const candKind = cand?.sourceKind ?? cand?.eventKind;
    const primarySrc = d.sources.find((s) => s.role === "primary");
    const primarySnap = primarySrc ? snapshotFor(ctx, primarySrc.url) : undefined;
    const signals: string[] = [];
    if (candKind && (PROPOSED_EVENT_KINDS as readonly string[]).includes(candKind)) signals.push(`레이더 후보 종류 ${candKind}`);
    const titleHit = primarySnap?.title ? PROPOSAL_TITLE_RE.exec(primarySnap.title) : null;
    if (titleHit) signals.push(`1차 출처 제목의 '${titleHit[0]}'`);
    const candTitleHit = cand?.title ? PROPOSAL_TITLE_RE.exec(cand.title) : null;
    if (candTitleHit) signals.push(`후보 제목의 '${candTitleHit[0]}'`);
    if (signals.length && (!PROPOSED_EVENT_KINDS.includes(d.event.kind) || d.event.status !== "proposed")) {
      errs.push(`예고·정부안 문서(${signals.join(", ")})인데 event.kind=${d.event.kind}·status=${d.event.status} — kind 는 ${PROPOSED_EVENT_KINDS.join("/")} 중 하나, status 는 proposed`);
    }
    const proposed = d.event.status === "proposed" || PROPOSED_EVENT_KINDS.includes(d.event.kind) || signals.length > 0;
    const nonNegated = (s: string) => s.replace(CONFIRM_NEGATION_RE, "").includes("확정");
    if (proposed) {
      const lead = inlinePlain(parseInline(d.lead, d.impact.table.kind), d);
      if (!PROPOSED_MARKERS.some((m) => d.title.includes(m) || lead.includes(m))) errs.push(`정부안·예고 단계인데 제목·리드에 ${PROPOSED_MARKERS.join("/")} 없음`);
      if (nonNegated(text) || nonNegated(d.title) || nonNegated(d.description)) errs.push("정부안·예고 단계에 '확정' 표현");
    }
    if (d.event.effectiveDate && d.event.effectiveDate > d.publishedDate) {
      const [y, m, dd] = d.event.effectiveDate.split("-").map(Number);
      const forms = [d.event.effectiveDate, `${y}년 ${m}월 ${dd}일`, `${y}년${m}월${dd}일`, `${y}.${m}.${dd}`, `${m}월 ${dd}일`];
      for (const sentence of splitSentences(text)) {
        if (forms.some((f) => sentence.includes(f)) && !/예정|전망|계획|부터 적용될|시행될/.test(sentence)) {
          errs.push(`미래 시행일 문장에 '예정' 없음: ${sentence.slice(0, 40)}`);
        }
      }
    }
    const k = d.impact.table.kind;
    const provisional = impactTable(k, d.impact.table.params).provisional;
    const unconfirmedConsts = Object.entries(CANONICAL_CONSTS)
      .filter(([, c]) => !c.confirmed)
      .map(([n]) => n);
    for (const f of proseFields(d)) {
      const usesEngine = /\{\{engine:/.test(f.text) || f.path.startsWith("impact.");
      const usesUnconfirmed = unconfirmedConsts.some((n) => f.text.includes(`{{const:${n}}}`));
      if (((usesEngine && provisional.length) || usesUnconfirmed) && nonNegated(inlinePlain(parseInline(f.text, k), d))) {
        errs.push(`${f.path}: 확정되지 않은 값(${[...provisional, ...unconfirmedConsts.filter((n) => f.text.includes(n))].join(", ")})을 '확정'으로 표현`);
      }
    }
    // 표에 결정 전 값이 있으면 렌더가 붙이는 고정 고지 문장이 평가 HTML 과 등록된 본문(생성 모듈) 모두에 있어야 한다 (critic fix 2026-09-26)
    const disclosure = provisionalDisclosure(provisional);
    if (disclosure) {
      const needle = escapeHtml(disclosure);
      if (!html.includes(needle)) errs.push(`결정 전 값(${provisional.join(", ")}) 고지 문장이 렌더 HTML 에 없음`);
      if (ctx.renderedHtml !== undefined && !ctx.renderedHtml.includes(needle)) {
        errs.push(`등록된 본문(생성 모듈)에 결정 전 값(${provisional.join(", ")}) 고지 문장이 없음 — render.ts 로 다시 렌더`);
      }
    }
    out.push(
      r(
        "unannounced-facts",
        !errs.length,
        errs.join(" · ") || `${proposed ? "정부안·예고 표기 충족" : "확정 발표"}${disclosure ? ` · 결정 전 값 고지 있음(${provisional.join(", ")})` : ""}`
      )
    );
  }

  // topic-denylist
  {
    const k = d.impact.table.kind;
    const hay = [d.title, d.description, d.event.name, inlinePlain(parseInline(d.lead, k), d), ...d.officialSummary.paragraphs.map((p) => inlinePlain(parseInline(p, k), d))].join("\n");
    const hits = TOPIC_DENYLIST.filter((t) => t.re.test(hay)).map((t) => t.id);
    out.push(r("topic-denylist", !hits.length, hits.length ? `금지 주제: ${hits.join(", ")}` : "금지 주제 아님"));
  }

  // forbidden-facts (guideSpec FORBIDDEN + trip wires)
  {
    const hits: string[] = [];
    for (const field of [d.title, d.description, text]) {
      for (const p of GUIDESPEC_FORBIDDEN) {
        p.re.lastIndex = 0;
        if (p.re.test(field)) hits.push(p.id);
        p.re.lastIndex = 0;
      }
      for (const w of ctx.tripWires) {
        let re: RegExp | null = null;
        try {
          re = new RegExp(w);
        } catch {
          re = null;
        }
        if (re ? re.test(field) : field.includes(w)) hits.push(`trip:${w}`);
      }
    }
    out.push(r("forbidden-facts", !hits.length, hits.length ? `금지 사실·트립와이어: ${[...new Set(hits)].join(", ")}` : "적중 0"));
  }

  // tax-literals (verify:tax PATTERNS — 제목·설명·생성 소스)
  {
    const hits: string[] = [];
    for (const p of ctx.taxPatterns) {
      if (p.re.test(d.title) || p.re.test(d.description)) hits.push(`제목·설명: ${p.name}`);
      if (p.re.test(ev.source)) hits.push(`소스: ${p.name}`);
    }
    out.push(r("tax-literals", !hits.length, hits.length ? `verify:tax 리터럴: ${[...new Set(hits)].join(", ")}` : `감시 패턴 ${ctx.taxPatterns.length}개 적중 0`));
  }

  // similarity-guides
  const mine = briefShingles(html);
  {
    let worst = { key: "", v: 0 };
    for (const g of ctx.existingGuides) {
      if (g.key === d.slug) continue;
      const v = containment(mine, shingles(g.text));
      if (v > worst.v) worst = { key: g.key, v };
    }
    out.push(
      r("similarity-guides", worst.v <= SIMILARITY.containmentMax, `최대 포함률 ${worst.v.toFixed(3)} (${worst.key || "-"})`, Number(worst.v.toFixed(3)), SIMILARITY.containmentMax)
    );
  }

  // similarity-static (post 단계 — 프리렌더 허브·정적 페이지)
  {
    if (ctx.phase === "pre" || !ctx.staticPages.length) out.push(r("similarity-static", true, "post 단계에서 검사(프리렌더 HTML 필요)"));
    else {
      let worst = { key: "", v: 0 };
      for (const p of ctx.staticPages) {
        const v = containment(mine, shingles(p.text));
        if (v > worst.v) worst = { key: p.key, v };
      }
      out.push(r("similarity-static", worst.v <= SIMILARITY.containmentMax, `최대 포함률 ${worst.v.toFixed(3)} (${worst.key || "-"})`, Number(worst.v.toFixed(3)), SIMILARITY.containmentMax));
    }
  }

  // similarity-title
  {
    const errs: string[] = [];
    let worst = { key: "", v: 0 };
    for (const g of [...ctx.existingGuides, ...ctx.staticPages]) {
      if (g.key === d.slug) continue;
      if (g.title === d.title) errs.push(`제목 중복: ${g.key}`);
      const v = titleJaccard(d.title, g.title);
      if (v > worst.v) worst = { key: g.key, v };
    }
    if (worst.v > SIMILARITY.titleJaccardMax) errs.push(`제목 유사 ${worst.v.toFixed(2)} > ${SIMILARITY.titleJaccardMax} (${worst.key})`);
    for (const hub of ctx.cannibalHubs) {
      const hubTitle = hub.title ?? ctx.staticPages.find((p) => p.key === hub.route)?.title;
      if (hubTitle) {
        const v = titleJaccard(d.title, hubTitle);
        if (v > SIMILARITY.hubTitleJaccardMax) errs.push(`허브 ${hub.route} 제목 유사 ${v.toFixed(2)} > ${SIMILARITY.hubTitleJaccardMax}`);
      }
      for (const term of hub.headTerms) {
        const t = normText(term);
        const title = normText(d.title);
        if (new RegExp(`20\\d{2}년?${escapeRe(t)}|${escapeRe(t)}20\\d{2}`).test(title)) errs.push(`허브 핵심어+연도 '${term}' (${hub.route})`);
      }
    }
    out.push(r("similarity-title", !errs.length, errs.join(" · ") || `최대 ${worst.v.toFixed(2)} (${worst.key || "-"})`, Number(worst.v.toFixed(2)), SIMILARITY.titleJaccardMax));
  }

  // similarity-source (critic fix 2026-09-26) — 1차만이 아니라 writer 가 본 모든 출처 원문(인용한 출처 + 그날 스냅숏 전부)과
  // 그 합집합에 대해 8-gram 포함률(인용·표 제외). 보조 보도자료·법령 문장을 적용 시점·주의·FAQ 로 옮겨 적는 짜깁기를 막는다.
  {
    const errs: string[] = [];
    const max = SIMILARITY.sourceNgram8Max;
    const mine8 = shingles(visibleText(stripQuotesTables(bodyBeforeSources(html))), 8);
    const seen = new Set<SourceSnapshot>();
    const per: { id: string; v: number; set: Set<number> }[] = [];
    const measure = (id: string, snap: SourceSnapshot) => {
      if (seen.has(snap)) return;
      seen.add(snap);
      const set = shingles(snap.text, 8);
      per.push({ id, v: containment(mine8, set), set });
    };
    for (const s of d.sources) {
      const snap = snapshotFor(ctx, s.url);
      if (!snap) errs.push(`출처 스냅숏 없음: ${s.id}`);
      else measure(s.id, snap);
    }
    for (const snap of ctx.snapshots) measure(snap.id ?? snap.url, snap);
    const worst = per.reduce<{ id: string; v: number }>((a, b) => (b.v > a.v ? b : a), { id: "-", v: 0 });
    let hit = 0;
    mine8.forEach((x) => {
      if (per.some((p) => p.set.has(x))) hit++;
    });
    const union = mine8.size ? hit / mine8.size : 0;
    if (worst.v > max) errs.push(`출처 ${worst.id} 8-gram 포함률 ${worst.v.toFixed(3)} > ${max}`);
    if (union > max) errs.push(`출처 ${per.length}건 합산 8-gram 포함률 ${union.toFixed(3)} > ${max}`);
    const v = Math.max(worst.v, union);
    out.push(
      r(
        "similarity-source",
        !errs.length,
        errs.join(" · ") || `출처 ${per.length}건 8-gram 최대 ${worst.v.toFixed(3)} (${worst.id}) · 합산 ${union.toFixed(3)}`,
        Number(v.toFixed(3)),
        max
      )
    );
  }

  // similarity-headline (21일 안에 본 헤드라인)
  {
    const cmp = `${d.title}\n${d.description}\n${bodyText}`;
    let worst = 0;
    const brief15 = shingles(cmp, 15);
    for (const h of ctx.headlines) {
      if (h.title) worst = Math.max(worst, longestCommonSubstring(cmp, h.title, 20_000, SIMILARITY.headlineLcsMax + 1));
      else if (h.shingles15?.some((x) => brief15.has(x))) worst = Math.max(worst, 15);
      if (worst > SIMILARITY.headlineLcsMax) break;
    }
    out.push(r("similarity-headline", worst <= SIMILARITY.headlineLcsMax, `헤드라인 ${ctx.headlines.length}건 · 최장 공통 ${worst}자`, worst, SIMILARITY.headlineLcsMax));
  }

  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─────────────────────────────────────────────────────────────
// 합성 픽스처 도구 — gate.ts --self-test 와 trendBriefRules.test.ts 가 함께 쓴다
// ─────────────────────────────────────────────────────────────
/** '=== source: <id> ===' 구역으로 나뉜 합성 출처 원문 → {id: 텍스트} (LF 정규화·앞뒤 공백 제거) */
export function parseSnapshotSections(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const parts = text.replace(/\r\n/g, "\n").split(/^=== source: ([a-z0-9-]+) ===$/m);
  for (let i = 1; i < parts.length; i += 2) out[parts[i]] = parts[i + 1].trim();
  return out;
}

export interface BriefFixture {
  good: TrendBriefDraft;
  context: Partial<Omit<RuleContext, "routeExists" | "snapshots" | "existingGuides" | "staticPages">> & Record<string, unknown>;
  cases: { rule: string; draftPatch?: Record<string, unknown>; contextPatch?: Record<string, unknown> }[];
}

/** 경로('a.b[1].c')에 값 쓰기 — 사본을 돌려준다 */
export function patchPath<T>(obj: T, path: string, value: unknown): T {
  const copy = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur: Record<string, unknown> = copy;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] as Record<string, unknown>;
  cur[parts[parts.length - 1]] = value;
  return copy as T;
}

/**
 * 픽스처 → (초안, 문맥). sha256 은 호출자가 넘기는 해시 함수로 계산한 스냅숏 값과 초안 값이 같아야 통과한다.
 * base 는 호출자가 채우는 실데이터(기존 가이드·경로 확인·세법 패턴).
 */
export function fixtureCase(
  fx: BriefFixture,
  snapshotText: string,
  sha: (s: string) => string,
  base: Pick<RuleContext, "existingGuides" | "existingSlugs" | "redirectSlugs" | "routeExists" | "taxPatterns">,
  c?: BriefFixture["cases"][number]
): { draft: TrendBriefDraft; ctx: RuleContext } {
  let draft = JSON.parse(JSON.stringify(fx.good)) as TrendBriefDraft;
  for (const [p, v] of Object.entries(c?.draftPatch ?? {})) draft = patchPath(draft, p, v);
  const sections = parseSnapshotSections(snapshotText);
  const cp = (c?.contextPatch ?? {}) as Record<string, unknown>;
  const snapPatch = (cp.snapshotPatch ?? {}) as Record<string, Partial<SourceSnapshot>>;
  const snapshots: SourceSnapshot[] = fx.good.sources.map((s) => ({
    // daily 와 같은 이름 — 레이더 후보(1차) 스냅숏은 id 'primary'
    id: s.role === "primary" ? "primary" : s.id,
    url: s.url,
    fetchedAt: s.fetchedAt,
    sha256: sha(sections[s.id] ?? ""),
    text: sections[s.id] ?? "",
    httpStatus: 200,
    robotsAllowed: true,
    kogl: s.kogl ?? null,
    title: s.title,
    ...(snapPatch[s.id] ?? {}),
  }));
  const fc = fx.context as Record<string, unknown>;
  const ctx: RuleContext = {
    mode: (fc.mode as RuleContext["mode"]) ?? "publish",
    phase: (fc.phase as RuleContext["phase"]) ?? "pre",
    today: String(fc.today),
    ledger: (fc.ledger as LedgerEntry[]) ?? [],
    calendar: fc.calendar as CalendarConfig,
    cannibalHubs: (fc.cannibalHubs as RuleContext["cannibalHubs"]) ?? [],
    staleRoutes: (fc.staleRoutes as string[]) ?? [],
    headlines: (fc.headlines as HeadlineRecord[]) ?? [],
    tripWires: (fc.tripWires as string[]) ?? [],
    staticPages: [],
    snapshots,
    candidate: (fc.candidate as BriefCandidate | undefined) ?? undefined,
    ...base,
  };
  for (const key of ["mode", "phase", "today", "ledger", "staleRoutes", "candidateRoute", "headlines", "candidate"] as const) {
    if (key in cp) (ctx as unknown as Record<string, unknown>)[key] = cp[key] ?? undefined;
  }
  const ev = evaluateDraft(draft);
  const briefText = ev ? visibleText(bodyBeforeSources(ev.html)) : "";
  if (cp.secondaryContainsBrief) {
    // 1차가 아닌 출처(보조·법령) 원문에 브리프 본문이 들어 있는 경우 — 짜깁기
    const other = fx.good.sources.find((s) => s.role !== "primary");
    ctx.snapshots = ctx.snapshots.map((s) => (other && s.url === other.url ? { ...s, text: `${s.text}\n${briefText}` } : s));
  }
  if (cp.renderedWithoutDisclosure && ev) {
    // 등록된 생성 모듈이 결정 전 값 고지 문장 없이 만들어진 경우(옛 렌더·손 편집)
    const needle = ` ${escapeHtml(impactDisclosure(draft.impact.table.kind, draft.impact.table.params))}`;
    ctx.renderedHtml = ev.html.split(needle).join("");
  }
  if (cp.cloneBriefAsGuide) ctx.existingGuides = [...ctx.existingGuides, { key: "clone-guide", title: "복제 가이드", text: briefText }];
  if (cp.cloneBriefAsStatic) {
    ctx.phase = "post";
    ctx.staticPages = [{ key: "/clone-static", title: "복제 정적 페이지", text: briefText }];
  }
  if (cp.duplicateTitle) ctx.existingGuides = [...ctx.existingGuides, { key: "dup-title", title: draft.title, text: "무관한 본문" }];
  if (cp.primaryContainsBrief) {
    const primary = draft.sources.find((s) => s.role === "primary");
    ctx.snapshots = ctx.snapshots.map((s) => (primary && s.url === primary.url ? { ...s, text: `${s.text}\n${briefText}` } : s));
  }
  if (typeof cp.headlineFromLead === "number" && ev) {
    const lead = visibleText(ev.html.slice(0, ev.html.indexOf("</p>")));
    ctx.headlines = [{ title: lead.slice(5, 5 + cp.headlineFromLead) }];
  }
  if (cp.addMetaDescription) (draft as unknown as Record<string, unknown>).metaDescription = "검색 설명";
  return { draft, ctx };
}

/** 헤드라인 기록용 15자 조각 해시 — 레이더가 원문 대신 저장할 수 있다 */
export function headlineShingles15(title: string): number[] {
  return [...shingles(title, 15)];
}

/** 정규화 텍스트 (외부 도구용 재노출) */
export { normalizeForShingles };
