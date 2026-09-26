// scripts/trend-radar/lib/parse.mjs
// 공식 목록 파서 — 제목·링크·날짜만 읽는다.
//   · RSS: <item> 안의 title, link, pubDate 또는 dc:date 만. <description>·<content:encoded> 는
//     파싱 전에 통째로 잘라 내 절대 읽지 않는다(금융위·인사처·복지부 RSS 는 본문 전문을 싣는다).
//   · 국세청(nts)·고용노동부 보도자료(moel) 목록 HTML: 목록 행의 제목·번호·날짜만.
//   · 구글 트렌드 RSS: title, ht:approx_traffic, pubDate. ht:news_item_title 은 헤드라인 파일용으로
//     메모리에만 들고 있다가 headlines-<date>.json 에만 쓴다(보고서·후보에는 절대 안 들어감).
//   · 국가법령정보 DRF XML: 법령명한글, 공포일자, 시행일자, 제개정구분명, 소관부처명, 법령일련번호.
// 날짜는 모두 ISO 8601 +09:00(KST)로 정규화한다.

// 배열 뒤에 붙이기(발행기 외 트렌드 스크립트에는 배열 메서드 이름까지 포함해 '푸시' 문자열을 두지 않는다 — trend-publish 게이트).
const put = (arr, ...vals) => {
  for (const v of vals) arr[arr.length] = v;
  return arr.length;
};

const NAMED = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  middot: "·",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsaquo: "‹",
  rsaquo: "›",
  laquo: "«",
  raquo: "»",
};

/** CDATA 벗기기 + 엔티티 해석 + 공백 정리. */
export function decodeText(s) {
  return String(s ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => safeCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => safeCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => (NAMED[n.toLowerCase()] !== undefined ? NAMED[n.toLowerCase()] : m))
    .replace(/\s+/g, " ")
    .trim();
}

function safeCodePoint(n) {
  try {
    return String.fromCodePoint(n);
  } catch {
    return "";
  }
}

/** 공식 기관 호스트(.go.kr·.or.kr·.re.kr)의 http 링크를 https 로. */
export function isOfficialHost(host) {
  return /(^|\.)(go\.kr|or\.kr)$/i.test(String(host || ""));
}

export function normalizeLink(link, base) {
  const raw = decodeText(link);
  if (!raw) return "";
  let u;
  try {
    u = base ? new URL(raw, base) : new URL(raw);
  } catch {
    return raw;
  }
  if (u.protocol === "http:" && isOfficialHost(u.hostname)) u.protocol = "https:";
  u.hostname = u.hostname.toLowerCase();
  return u.href;
}

const pad = (n) => String(n).padStart(2, "0");

/** UTC 밀리초 → 'YYYY-MM-DDTHH:MM:SS+09:00' */
export function toKstIso(ms) {
  const d = new Date(ms + 9 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(
    d.getUTCMinutes(),
  )}:${pad(d.getUTCSeconds())}+09:00`;
}

function kstParts(y, mo, d, h = 0, mi = 0, s = 0) {
  const ms = Date.UTC(+y, +mo - 1, +d, +h - 9, +mi, +s);
  return Number.isFinite(ms) ? toKstIso(ms) : null;
}

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const ZONES = { gmt: 0, ut: 0, utc: 0, z: 0, kst: 540, pdt: -420, pst: -480, edt: -240, est: -300 };

/**
 * 소스별 날짜 형식을 ISO +09:00 으로.
 *   mofe   'YYYY-MM-DD HH:MM:SS.0' · 'YYYYMMDDHHMMSS'
 *   dc:date 'YYYY-MM-DD HH:MM:SS' (KST)
 *   ISO    'YYYY-MM-DDTHH:MM:SS+0900' (오프셋 있음)
 *   RFC-822 'Wed, 23 Sep 2026 07:06:00 GMT' · '-0700'
 *   NTS    'YYYY.MM.DD.' (마지막 점 생략 허용 — 고용노동부 목록 'YYYY.MM.DD')
 * @returns {string|null}
 */
export function parseDate(input) {
  const s = decodeText(input);
  if (!s) return null;
  let m = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(s);
  if (m) return kstParts(m[1], m[2], m[3], m[4], m[5], m[6]);
  m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})$/.exec(s);
  if (m) {
    const off = m[7] === "Z" ? 0 : (m[7][0] === "-" ? -1 : 1) * (+m[7].slice(1, 3) * 60 + +m[7].slice(-2));
    const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)) - off * 60000;
    return toKstIso(ms);
  }
  m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/.exec(s);
  if (m) return kstParts(m[1], m[2], m[3], m[4] || 0, m[5] || 0, m[6] || 0);
  m = /^(\d{4})\.\s?(\d{1,2})\.\s?(\d{1,2})\.?$/.exec(s);
  if (m) return kstParts(m[1], m[2], m[3]);
  m = /^(?:[A-Za-z]{3},\s*)?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+(\d{2}):(\d{2})(?::(\d{2}))?\s*([+-]\d{4}|[A-Za-z]{1,3})?$/.exec(s);
  if (m) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (mon === undefined) return null;
    let off = 0;
    if (m[7]) {
      if (/^[+-]\d{4}$/.test(m[7])) off = (m[7][0] === "-" ? -1 : 1) * (+m[7].slice(1, 3) * 60 + +m[7].slice(3));
      else if (ZONES[m[7].toLowerCase()] !== undefined) off = ZONES[m[7].toLowerCase()];
      else return null;
    }
    const ms = Date.UTC(+m[3], mon, +m[1], +m[4], +m[5], +(m[6] || 0)) - off * 60000;
    return toKstIso(ms);
  }
  return null;
}

function tagText(block, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i");
  const m = re.exec(block);
  return m ? m[1] : "";
}

/** 본문성 요소를 파싱 전에 제거 — 이후 어떤 정규식도 본문을 볼 수 없다. */
export function stripBodies(xml) {
  return String(xml || "")
    .replace(/<description(?:\s[^>]*)?\/>/gi, "")
    .replace(/<description(?:\s[^>]*)?>[\s\S]*?<\/description>/gi, "")
    .replace(/<content:encoded(?:\s[^>]*)?>[\s\S]*?<\/content:encoded>/gi, "")
    .replace(/<ht:news_item_snippet(?:\s[^>]*)?>[\s\S]*?<\/ht:news_item_snippet>/gi, "");
}

/**
 * RSS 2.0 → [{title, link, publishedAt}] (제목·링크·날짜만)
 * @param {string} xml
 * @returns {{title: string, link: string, publishedAt: string|null}[]}
 */
export function parseRss(xml) {
  const clean = stripBodies(xml);
  const out = [];
  for (const m of clean.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const block = m[1];
    const title = decodeText(tagText(block, "title"));
    const link = normalizeLink(tagText(block, "link"));
    const date = tagText(block, "pubDate") || tagText(block, "dc:date");
    if (!title || !link) continue;
    put(out, { title, link, publishedAt: parseDate(date) });
  }
  return out;
}

/** 국세청 보도자료 목록 HTML → 행별 {title, link, publishedAt} */
export function parseNtsList(html) {
  const out = [];
  for (const row of String(html || "").split(/<tr[\s>]/i).slice(1)) {
    const a = /<a\b[^>]*\bdata-id="(\d+)"[^>]*\btitle="([^"]*)"[^>]*\bclass="nttInfoBtn"[^>]*>/i.exec(row);
    if (!a) continue;
    const d = /data-table="date"[^>]*>\s*([0-9.\s]+?)\s*</i.exec(row);
    put(out, {
      title: decodeText(a[2]),
      link: `https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=2201&nttSn=${a[1]}`,
      publishedAt: d ? parseDate(d[1]) : null,
    });
  }
  return out;
}

/** 고용노동부 보도자료 목록 HTML → 행별 {title, link, publishedAt} */
export function parseMoelList(html) {
  const out = [];
  for (const row of String(html || "").split(/<tr[\s>]/i).slice(1)) {
    const a = /<a\b[^>]*\bhref="enewsView\.do\?news_seq=(\d+)"[^>]*\btitle="([^"]*)"/i.exec(row);
    if (!a) continue;
    const d = /aria-label="등록일"[^>]*>\s*([0-9.]+)\s*</.exec(row);
    put(out, {
      title: decodeText(a[2]),
      link: `https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=${a[1]}`,
      publishedAt: d ? parseDate(d[1]) : null,
    });
  }
  return out;
}

/**
 * 구글 트렌드 KR RSS → {items:[{title, traffic, publishedAt}], newsTitles:[...]}
 * newsTitles 는 헤드라인 겹침 게이트 전용(보고서·후보에 쓰지 않는다).
 */
export function parseGtrends(xml) {
  const clean = stripBodies(xml);
  const items = [];
  const newsTitles = [];
  for (const m of clean.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const block = m[1];
    const title = decodeText(tagText(block.replace(/<ht:news_item>[\s\S]*?<\/ht:news_item>/gi, ""), "title"));
    if (!title) continue;
    put(items, {
      title,
      traffic: decodeText(tagText(block, "ht:approx_traffic")),
      publishedAt: parseDate(tagText(block, "pubDate")),
    });
    for (const n of block.matchAll(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/gi)) {
      const t = decodeText(n[1]);
      if (t) put(newsTitles, t);
    }
  }
  return { items, newsTitles };
}

/** 'YYYYMMDD' → 'YYYY-MM-DD' */
function ymd(s) {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(String(s || "").trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/**
 * 국가법령정보 DRF 목록 XML → [{name, shortName, promulgatedAt, effectiveAt, changeType, ministry, serial}]
 * (상세 링크 필드는 읽지 않는다 — 링크는 https://www.law.go.kr/법령/<법령명> 으로 새로 만든다)
 */
export function parseLawDrf(xml) {
  const out = [];
  for (const m of String(xml || "").matchAll(/<law(?:\s[^>]*)?>([\s\S]*?)<\/law>/gi)) {
    const b = m[1];
    const name = decodeText(tagText(b, "법령명한글"));
    if (!name) continue;
    put(out, {
      name,
      shortName: decodeText(tagText(b, "법령약칭명")),
      promulgatedAt: ymd(decodeText(tagText(b, "공포일자"))),
      effectiveAt: ymd(decodeText(tagText(b, "시행일자"))),
      changeType: decodeText(tagText(b, "제개정구분명")),
      ministry: decodeText(tagText(b, "소관부처명")),
      serial: decodeText(tagText(b, "법령일련번호")),
    });
  }
  return out;
}

/** DRF 응답이 오류 문서인지(키 누락·검증 실패). */
export function lawDrfError(xml) {
  const s = String(xml || "");
  if (/<LawSearch[\s>]/i.test(s)) return null;
  const msg = decodeText(tagText(s, "msg") || tagText(s, "result"));
  return msg || "DRF 응답 형식 아님";
}
