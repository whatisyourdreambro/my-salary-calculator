// scripts/fact-sentinel/lib/classify.mjs
// 언급 하나를 ok / historical / stale / unknown 으로 나눈다.
//   ok         — 값 = 현재값
//   historical — 맥락(±60자, 주석 제외)에 과거 시점 표지: 대체된 기간의 명시 날짜·연도, 전환(→, 'N에서'),
//                과거 표지어(인상 전·당시·이전·종전·추이 …), 또는 같은 맥락에 현재값이 함께 나와 흐름을 설명
//   stale      — 과거값(oldValues·history)인데 현재 시제(현재·현행·지금·적용 중·최신·'인상 — 예·적금' …)이거나
//                메타(키워드·제목·설명)에 있고, historical 이 아님
//   unknown    — 그 밖의 과거값 언급(사람 확인 필요)
// 블록 규칙: 빈 줄로 나뉜 블록 안에서 같은 사실의 stale 이 있고 현재값(ok)이 하나도 없으면,
//   그 블록의 나머지 과거값 언급(historical·unknown)도 stale 로 올린다 — '최신 소식' 상자처럼
//   과거 서술로 보이는 문장이 사실상 현재 상황으로 제시되는 경우(예: /savings-interest-2026 L117–136).

import { blockOf, numericTokens } from "./scan.mjs";

export const CLASSES = ["ok", "historical", "stale", "unknown"];

const PRESENT_RE = /현재|현행|지금|적용\s?중|시행\s?중|최신|올해|이번|인상\s*[—–-]+\s*예·?적금/;
const PAST_WORD_RE = /추이|당시|인상\s*전|인하\s*전|이전|종전|과거|지난해|작년|전년/;
const ARROW_RE = /→|⟶|->|➜/;
/** 수치 바로 뒤 '에서' — '2.50%에서 2.75%로', '637만원에서 659만원으로'. */
const FROM_RE = /\d[\d.,]*\s*(?:%|원|만\s*원?)?\s*에서(?=[\s{<]|$)/;

const near = (a, b) => Math.abs(a - b) < 1e-6;
const pad = (n) => String(n).padStart(2, "0");
const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** 맥락 속 날짜 표기 → 각 표기가 가리키는 기간의 끝 날짜(YYYY-MM-DD) 목록. */
export function datesInContext(ctx) {
  const ends = [];
  const add = (s) => {
    ends[ends.length] = s;
  };
  let rest = ctx;
  const take = (re, fn) => {
    rest = rest.replace(re, (...m) => {
      fn(m);
      return " ";
    });
  };
  const okDate = (y, m, d) => y >= 1990 && y <= 2100 && m >= 1 && m <= 12 && (!d || (d >= 1 && d <= 31));
  take(/(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g, (m) => {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (okDate(y, mo, d)) add(`${y}-${pad(mo)}-${pad(d)}`);
  });
  take(/(\d{4})\s*[-.]\s*(\d{1,2})\s*[-.]\s*(\d{1,2})(?!\d)/g, (m) => {
    const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (okDate(y, mo, d)) add(`${y}-${pad(mo)}-${pad(d)}`);
  });
  take(/(\d{4})\s*년\s*(\d{1,2})\s*월/g, (m) => {
    const [y, mo] = [Number(m[1]), Number(m[2])];
    if (okDate(y, mo)) add(`${y}-${pad(mo)}-${pad(lastDay(y, mo))}`);
  });
  take(/(?<!\d)(\d{4})\.(\d{1,2})(?![\d])/g, (m) => {
    const [y, mo] = [Number(m[1]), Number(m[2])];
    if (okDate(y, mo)) add(`${y}-${pad(mo)}-${pad(lastDay(y, mo))}`);
  });
  take(/(?<!\d)(\d{4})\s*년/g, (m) => {
    const y = Number(m[1]);
    if (okDate(y, 1)) add(`${y}-12-31`);
  });
  take(/[’'‘](\d{2})\s*(?:년|\.)/g, (m) => add(`20${m[1]}-12-31`));
  return ends;
}

/**
 * @param {object} mention findMentions() 원소
 * @param {object} fact resolveFacts() 원소
 * @returns {{class: string, reasons: string[]}}
 */
export function classifyMention(mention, fact) {
  if (near(mention.value, fact.current.value)) return { class: "ok", reasons: ["현재값"] };
  const ctx = mention.maskedContext.replace(/\s+/g, " ");
  const hist = [];
  const pw = PAST_WORD_RE.exec(ctx);
  if (pw) hist[hist.length] = `과거 표지어 '${pw[0]}'`;
  if (ARROW_RE.test(ctx)) hist[hist.length] = "전환 화살표";
  if (FROM_RE.test(ctx)) hist[hist.length] = "전환 'N에서'";
  if (fact.current.since) {
    const past = datesInContext(ctx).filter((d) => d < fact.current.since);
    if (past.length) hist[hist.length] = `과거 시점 날짜(${past[0]})`;
  }
  if (numericTokens(ctx, 0, ctx.length, fact.unit).some((t) => near(t.value, fact.current.value))) {
    hist[hist.length] = "현재값 병기";
  }
  if (hist.length) return { class: "historical", reasons: hist };
  const present = [];
  const pm = PRESENT_RE.exec(ctx);
  if (pm) present[present.length] = `현재 시제 '${pm[0]}'`;
  if (mention.meta) present[present.length] = "메타(키워드·제목·설명)";
  if (present.length) return { class: "stale", reasons: present };
  return { class: "unknown", reasons: ["시점 표지 없음"] };
}

/** 블록 규칙 적용(같은 파일의 finding 배열을 제자리 갱신). lines = 파일 줄 배열. */
export function applyBlockRule(findings, lines) {
  const byFact = new Map();
  for (const f of findings) {
    if (!byFact.has(f.factId)) byFact.set(f.factId, []);
    const arr = byFact.get(f.factId);
    arr[arr.length] = f;
  }
  for (const arr of byFact.values()) {
    const seeds = arr.filter((f) => f.class === "stale" && !f.block);
    for (const seed of seeds) {
      const [a, b] = blockOf(lines, seed.line);
      const inBlock = arr.filter((f) => f.line >= a && f.line <= b);
      if (inBlock.some((f) => f.class === "ok")) continue;
      for (const f of inBlock) {
        if (f.class === "historical" || f.class === "unknown") {
          f.class = "stale";
          f.block = [a, b];
          f.reasons = [...(f.reasons || []), `블록 L${a}–L${b}: 현재값 없이 낡은 서술과 함께 제시`];
        } else if (f.class === "stale" && !f.block) {
          f.block = [a, b];
        }
      }
    }
  }
  return findings;
}

/** 표시용 값 문자열. */
export function formatValue(fact, v) {
  if (v === null || v === undefined) return "";
  if (fact.unit === "%") {
    const s = fact.decimals !== undefined ? Number(v).toFixed(fact.decimals) : String(Number(Number(v).toFixed(6)));
    return `${s}%`;
  }
  return `${Math.round(Number(v)).toLocaleString("en-US")}원`;
}
