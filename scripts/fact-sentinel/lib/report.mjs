// scripts/fact-sentinel/lib/report.mjs
// 보고서 조립: sentinel-<date>.json(기계용) + sentinel-<date>.md(운영자용, 한국어).
// 갱신 슬롯(refresh-slots.json) 계산·문서 줄 확인도 여기서 한다.

import { formatValue } from "./classify.mjs";
import { publicPath, SHARED_ROUTE } from "./scan.mjs";

export const REPORT_SCHEMA_VERSION = 1;
const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const ms = (d) => Date.parse(`${d}T00:00:00Z`);

// ── 갱신 슬롯 ──

export function validateSlots(json) {
  const errs = [];
  if (!json || !Array.isArray(json.slots)) return ["refresh-slots.json 에 slots 배열 없음"];
  const ids = new Set();
  const md = /^\d{2}-\d{2}$/;
  for (const s of json.slots) {
    if (!s.id || ids.has(s.id)) errs[errs.length] = `슬롯 id 누락·중복: ${s.id}`;
    ids.add(s.id);
    const hasDate = typeof s.date === "string" && md.test(s.date);
    const hasWin = s.window && md.test(s.window.from || "") && md.test(s.window.to || "");
    if (!hasDate && !hasWin) errs[errs.length] = `${s.id}: date(MM-DD) 또는 window{from,to} 필요`;
    if (!Array.isArray(s.docRefs) || !s.docRefs.length) errs[errs.length] = `${s.id}: docRefs 필요(문서 근거 없는 슬롯 금지)`;
    for (const r of s.docRefs || []) {
      if (!/^docs\/[^:]+\.md:\d+$/.test(r.ref || "") || !r.anchor) errs[errs.length] = `${s.id}: docRef 형식 오류 ${r.ref}`;
    }
  }
  return errs;
}

/** 문서 줄 확인: 그 줄에 anchor 가 있으면 ok, 없으면 파일에서 다시 찾아 현재 줄을 알려 준다. */
export function checkDocRef(ref, anchor, readText) {
  const [path, lineStr] = ref.split(":");
  const line = Number(lineStr);
  let text;
  try {
    text = readText(path);
  } catch {
    return { ref, ok: null, note: "문서 없음(이 저장소에서 확인 불가)" };
  }
  const lines = text.split(/\r?\n/);
  if (lines[line - 1] && lines[line - 1].includes(anchor)) return { ref, ok: true };
  const k = lines.findIndex((L) => L.includes(anchor));
  if (k >= 0) return { ref, ok: false, now: `${path}:${k + 1}`, note: `문구가 ${k + 1}행으로 이동` };
  return { ref, ok: false, note: "문구를 찾지 못함 — 슬롯 근거 재확인 필요" };
}

/** 오늘부터 horizon 일 안에 창이 걸리는 슬롯. */
export function computeRefreshDue(slots, today, readText, horizonDays = 30) {
  const t = ms(today);
  const end = t + horizonDays * DAY;
  const due = [];
  const year = Number(today.slice(0, 4));
  for (const s of slots) {
    const from = s.date || s.window.from;
    const to = s.date || s.window.to;
    let hit = null;
    for (const y of [year - 1, year, year + 1]) {
      const a = ms(`${y}-${from}`);
      const b = ms(`${to < from ? y + 1 : y}-${to}`);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      if (b >= t && a <= end) {
        hit = { start: iso(a), end: iso(b), a };
        break;
      }
    }
    if (!hit) continue;
    const daysUntil = Math.max(0, Math.round((hit.a - t) / DAY));
    due[due.length] = {
      id: s.id,
      title: s.title,
      start: hit.start,
      end: hit.end,
      daysUntil,
      status: hit.a <= t ? "진행 중" : `D-${daysUntil}`,
      files: s.files || [],
      pages: s.pages || [],
      docRefs: (s.docRefs || []).map((r) => checkDocRef(r.ref, r.anchor, readText)),
      note: s.note || "",
    };
  }
  due.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return due;
}

// ── 수정 제안 ──

export function suggestionFor(f, fact) {
  const expected = formatValue(fact, fact.current.value);
  const since = fact.current.since ? `${fact.current.since}부터` : "현재";
  if (f.block && f.reasons && f.reasons.some((r) => r.startsWith("블록"))) {
    return `블록 L${f.block[0]}–L${f.block[1]}을 현재 기준(${expected}, ${since})으로 다시 쓰기 — 블록 안에 현재값이 없음`;
  }
  if (f.meta) return `메타(키워드·제목·설명)의 '${f.found}' → '${expected}'`;
  const oldEntry = fact.old.find((o) => Math.abs(o.value - f.value) < 1e-6);
  const when = oldEntry && oldEntry.from ? `${oldEntry.from.slice(0, 4)}년 ${Number(oldEntry.from.slice(5, 7))}월 당시 ` : "과거 시점 ";
  return `'${f.found}' → '${expected}'(${since}) 로 갱신하거나, 과거 수치로 남길 거면 시점 명시(예: '${when}${f.found}')`;
}

// ── 보고서 ──

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

export function buildReport({ today, mode, generatedAt, facts, liveResult, liveImpl, canonical, findings, refreshDue, cost, notes }) {
  const byId = new Map(facts.map((f) => [f.id, f]));
  const counts = { ok: 0, historical: 0, stale: 0, unknown: 0 };
  for (const f of findings) counts[f.class] += 1;

  const stale = findings.filter((f) => f.class === "stale");
  const staleRoutes = [...new Set(stale.map((f) => publicPath(f.route)).filter(Boolean))].sort();
  const staleShared = [...new Set(stale.filter((f) => f.route === SHARED_ROUTE).map((f) => f.file))].sort();

  const topLines = [];
  const factRows = facts.map((fact) => {
    const isBok = fact.id === "bok-base-rate";
    const live = isBok && liveResult
      ? { method: liveResult.method, value: liveResult.value, ok: liveResult.ok, since: liveResult.since ?? null, sinceOk: liveResult.sinceOk ?? null, requests: liveResult.requests, reason: liveResult.reason || null, attempts: liveResult.attempts || [] }
      : { method: "none", value: null, ok: null, reason: isBok ? "오프라인 실행(--live 없음)" : "저장소 정본 — 공식 대조 기록은 facts.json verification" };
    if (isBok && liveResult && liveResult.method !== "none" && liveResult.ok === false) {
      topLines[topLines.length] = `FACTS 갱신 필요: ${fact.label} facts.json ${formatValue(fact, fact.current.value)} ≠ 공식 ${liveResult.value}%(변경일 ${liveResult.since || "창 밖"}) — 운영자 세션에서 facts.json 갱신`;
    } else if (isBok && liveResult && liveResult.method !== "none" && liveResult.sinceOk === false) {
      topLines[topLines.length] = `FACTS 갱신 필요: ${fact.label} 값은 같으나 변경일이 다름(facts ${fact.current.since} / 공식 ${liveResult.since})`;
    }
    return {
      id: fact.id,
      label: fact.label,
      kind: fact.kind,
      unit: fact.unit,
      current: fact.kind === "official" ? fact.current.raw : String(fact.current.value),
      display: formatValue(fact, fact.current.value),
      since: fact.current.since || null,
      source: fact.source,
      verifiedAt: fact.verifiedAt,
      old: fact.old.map((o) => ({ value: formatValue(fact, o.value), from: o.from, to: o.to })),
      upcoming: fact.upcoming.map((u) => ({ value: formatValue(fact, u.value), from: u.from, status: u.status || null })),
      live,
    };
  });

  const status2027 = {};
  for (const [k, v] of Object.entries(canonical.values)) {
    const m = /^insurance\.2027\.status\.(\w+)$/.exec(k);
    if (m) status2027[m[1]] = v;
  }

  const json = {
    schemaVersion: REPORT_SCHEMA_VERSION,
    generatedAt,
    today,
    mode,
    topLines,
    facts: factRows,
    counts,
    findings: findings.map((f) => ({
      file: f.file,
      line: f.line,
      route: f.route,
      owner: f.owner,
      factId: f.factId,
      found: f.found,
      expected: formatValue(byId.get(f.factId), byId.get(f.factId).current.value),
      class: f.class,
      context: f.context,
      reasons: f.reasons,
      block: f.block || null,
      meta: Boolean(f.meta),
      suggestion: f.class === "stale" ? suggestionFor(f, byId.get(f.factId)) : undefined,
    })),
    staleRoutes,
    staleShared,
    refreshDue,
    canonical: { status2027, files: canonical.files },
    live: { impl: liveImpl || null, requests: liveResult ? liveResult.requests || 0 : 0 },
    notes,
    cost,
  };
  return { json, md: renderMarkdown(json) };
}

const MODE_KO = { live: "라이브(공식 확인 포함)", fixtures: "픽스처(네트워크 없음)", offline: "오프라인(저장소만)" };
const METHOD_KO = { ecos: "ECOS Open API", "bok-portal": "한국은행 누리집 표", none: "확인 안 함" };

export function renderMarkdown(r) {
  const L = [];
  const add = (s = "") => {
    L[L.length] = s;
  };
  add(`# 공식 수치 감시기 보고서 — ${r.today}`);
  add();
  for (const t of r.topLines) add(`> **${t}**`);
  if (r.topLines.length) add();
  add(`- 실행: ${MODE_KO[r.mode] || r.mode} · 생성 ${r.generatedAt}`);
  add(`- 결과: 낡음 **${r.counts.stale}** · 확인 필요 ${r.counts.unknown} · 과거 서술 ${r.counts.historical} · 정상 ${r.counts.ok}`);
  add(`- 낡은 수치가 있는 경로(링크 금지 대상): ${r.staleRoutes.length ? r.staleRoutes.map((x) => `\`${x}\``).join(" ") : "없음"}`);
  if (r.staleShared.length) add(`- 공용 파일(경로 미특정): ${r.staleShared.map((x) => `\`${x}\``).join(" ")}`);
  add(`- 비용: ${r.cost.ms}ms · 메모리 ${r.cost.rssMB}MB · 파일 ${r.cost.files}개 · 요청 ${r.cost.requests}회`);
  add();

  add("## 낡은 숫자 (stale)");
  add();
  const stale = r.findings.filter((f) => f.class === "stale");
  if (!stale.length) add("없음.");
  else {
    add("| 위치 | 경로 | 담당 | 항목 | 찾은 값 | 현재 값 | 수정 제안 | 맥락 |");
    add("|---|---|---|---|---|---|---|---|");
    for (const f of stale) {
      add(`| \`${f.file}:${f.line}\` | ${esc(f.route)} | ${esc(f.owner || "-")} | ${esc(f.factId)} | ${esc(f.found)} | ${esc(f.expected)} | ${esc(f.suggestion)} | ${esc(f.context)} |`);
    }
  }
  add();

  add("## 확인 필요 (unknown)");
  add();
  const unk = r.findings.filter((f) => f.class === "unknown");
  if (!unk.length) add("없음.");
  else {
    add("과거값이 시점 표지 없이 쓰였습니다. 현재 상황으로 읽히면 낡은 숫자로 고치고, 과거 이야기면 시점을 밝혀 두세요.");
    add();
    add("| 위치 | 경로 | 담당 | 항목 | 찾은 값 | 현재 값 | 맥락 |");
    add("|---|---|---|---|---|---|---|");
    for (const f of unk) {
      add(`| \`${f.file}:${f.line}\` | ${esc(f.route)} | ${esc(f.owner || "-")} | ${esc(f.factId)} | ${esc(f.found)} | ${esc(f.expected)} | ${esc(f.context)} |`);
    }
  }
  add();

  add("## 다가오는 갱신 슬롯 (30일 이내)");
  add();
  if (!r.refreshDue.length) add("없음.");
  else {
    add("| 상태 | 기간 | 할 일 | 파일·페이지 | 문서 근거 |");
    add("|---|---|---|---|---|");
    for (const s of r.refreshDue) {
      const where = [...s.files.map((x) => `\`${x}\``), ...s.pages.map((x) => `\`${x}\``)].join(" ") || "-";
      const refs = s.docRefs.map((d) => `\`${d.ref}\`${d.ok === true ? "" : d.ok === false ? ` (⚠ ${d.note}${d.now ? ` → ${d.now}` : ""})` : ` (${d.note})`}`).join(" ");
      add(`| ${s.status} | ${s.start === s.end ? s.start : `${s.start} ~ ${s.end}`} | ${esc(s.title)}${s.note ? ` — ${esc(s.note)}` : ""} | ${where} | ${refs} |`);
    }
  }
  add();

  add("## 공식 수치 확인 결과");
  add();
  add("| 항목 | 현재(정본) | 적용 시작 | 과거값 | 예정 | 출처(대조일) | 라이브 확인 |");
  add("|---|---|---|---|---|---|---|");
  for (const f of r.facts) {
    const live = f.live.method === "none"
      ? `${METHOD_KO.none}${f.live.reason ? ` — ${esc(f.live.reason)}` : ""}`
      : `${METHOD_KO[f.live.method]} ${f.live.value}% ${f.live.ok ? "✅ 일치" : "❌ 불일치"}${f.live.since ? ` (변경일 ${f.live.since})` : ""}`;
    const old = f.old.map((o) => `${o.value}${o.to ? `(~${o.to})` : ""}`).join(", ") || "-";
    const up = f.upcoming.map((u) => `${u.from} ${u.value}${u.status ? `(${u.status === "confirmed" ? "확정" : "미확정"})` : ""}`).join(", ") || "-";
    add(`| ${esc(f.label)} | ${f.display} | ${f.since || "-"} | ${esc(old)} | ${esc(up)} | ${f.source} (${f.verifiedAt}) | ${live} |`);
  }
  add();
  const st = Object.entries(r.canonical.status2027 || {});
  if (st.length) {
    add(`2027 요율 확정 상태(taxConstants2027 INSURANCE_RATES_2027_STATUS): ${st.map(([k, v]) => `${k} ${v === "confirmed" ? "확정" : "미확정"}`).join(" · ")}`);
    add();
  }
  if (r.notes.length) {
    add("## 참고");
    add();
    for (const n of r.notes) add(`- ${n}`);
    add();
  }
  add("---");
  add("이 보고서는 읽기 전용 점검 결과입니다. 사이트 파일은 수정하지 않았습니다. 한국은행 ECOS 수치는 보고서 내부 확인용이며 페이지 본문에 옮기지 않습니다.");
  return L.join("\n") + "\n";
}
