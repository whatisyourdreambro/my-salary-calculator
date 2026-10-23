import opinionDomainSuffixes from "@/data/opinionDomainSuffixes";

/** Small deterministic input policy. No network, logging, storage, or text rewriting.
 * This catches the listed expressions and bounded spelling evasions, not every
 * harmful meaning. Keep the original accepted text separate from the scan copy.
 */
export const CONTENT_POLICY_VERSION = "ko-input-v3";
export type ContentIssue = "CONTENT_NOT_ALLOWED" | "PERSONAL_DATA_NOT_ALLOWED" | "INVALID_TEXT";

const LEADING = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
const VOWELS = [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"];
const TRAILING = [..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];
// Remove format controls and invisible selectors from the scan copy only. ZWJ
// emoji and other accepted visitor text are never rewritten in storage or UI.
const INVISIBLE = /[\p{Cf}\u034f\ufe00-\ufe0f\u{e0100}-\u{e01ef}]/gu;
const UNSAFE_FORMAT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]|<[^>]*>/;
const BLOCKED_DOMAIN_SUFFIXES = new Set(opinionDomainSuffixes.tlds);
// Offline, bounded bare-domain coverage includes .dev/.xyz and selected IDNs.
// Unlisted bare suffixes may pass; schemes/www are checked independently.
// A generic word.word ban would also reject filenames and Korean sentences.
const DOMAIN_LABEL = "[\\p{L}\\p{N}](?:[\\p{L}\\p{M}\\p{N}-]{0,62}\\.){1,20}";
const ASCII_DOMAIN = new RegExp(`${DOMAIN_LABEL}(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})(?=$|[^a-z0-9-])`, "gu");
const UNICODE_DOMAIN = new RegExp(`${DOMAIN_LABEL}[\\p{L}\\p{M}]{1,63}(?=$|[^\\p{L}\\p{M}\\p{N}-])`, "gu");

function containsOpinionLink(text: string): boolean {
  if (/(?:[a-z][a-z0-9+.-]{0,31}:\/\/|(?:https?|mailto|tel|sms):|www\.)/i.test(text)) return true;
  const domains = text.replace(/[\u3002\uff61]/g, ".");
  for (const pattern of [ASCII_DOMAIN, UNICODE_DOMAIN]) {
    for (const match of domains.matchAll(pattern)) {
      try {
        // Parsing normalizes IDN hostnames without resolving or visiting them.
        const hostname = new URL(`https://${match[0]}`).hostname;
        if (BLOCKED_DOMAIN_SUFFIXES.has(hostname.split(".").at(-1)!)) return true;
      } catch { /* Invalid domain syntax is not a link. */ }
    }
  }
  for (const match of domains.matchAll(/(?:^|[^\d.])((?:\d{1,3}\.){3}\d{1,3})(?=$|[^\d.])/g)) {
    if (match[1].split(".").every(octet => Number(octet) <= 255)) return true;
  }
  return false;
}

function foldedJamo(text: string): string {
  return [...text.normalize("NFD")].map(char => {
    const value = char.codePointAt(0)!;
    if (value >= 0x1100 && value <= 0x1112) return LEADING[value - 0x1100];
    if (value >= 0x1161 && value <= 0x1175) return VOWELS[value - 0x1161];
    if (value >= 0x11a8 && value <= 0x11c2) return TRAILING[value - 0x11a8];
    return char;
  }).join("");
}

// Bounded separators, literal letters, and bounded input avoid nested unbounded
// regex repetition. No fuzzy matching of ordinary financial vocabulary.
const KOREAN_BLOCKED = [
  "씨발", "시발", "씨팔", "시팔", "개새끼", "개새꺄", "개색끼", "쌍놈", "쌍년",
  "병신", "븅신", "미친놈", "미친년", "좆", "지랄", "꺼져", "닥쳐",
  "죽여버리", "죽여버릴", "죽여버려", "죽이겠다",
].map(word => new RegExp([...foldedJamo(word)].join("[\\s\\p{P}\\p{S}]{0,2}"), "u"));
const SEPARATOR = "[\\s\\p{P}\\p{S}]{0,2}";
const TOKEN_START = "(?:^|[^\\p{L}\\p{N}\\p{M}])";
const TOKEN_END = "(?=$|[^\\p{L}\\p{N}\\p{M}])";
// Initials are ambiguous inside longer names/acronyms. Match only standalone
// tokens, not every consonant pair found in an ordinary word or longer initialism.
const KOREAN_INITIALS_BLOCKED = new RegExp(`${TOKEN_START}(?:${["ㅅㅂ", "ㅆㅂ", "ㅂㅅ"].map(word => [...word].join(SEPARATOR)).join("|")})${TOKEN_END}`, "u");
const ENGLISH_BLOCKED = new RegExp(`${TOKEN_START}(?:${[
  "fuck", "fucking", "fucker", "fuckers", "fucked", "shit", "bullshit", "bitch", "bitches", "asshole",
].map(word => [...word].join(SEPARATOR)).join("|")})${TOKEN_END}`, "u");

/** Null means the bounded text passed this policy, not that it is fact-checked. */
export function contentIssue(text: string, mode: "contact" | "opinion" = "contact"): ContentIssue | null {
  if (typeof text !== "string" || text.length > (mode === "opinion" ? 200 : 500)) return "INVALID_TEXT";
  try {
    const normalized = text.normalize("NFKC").toLowerCase();
    if (normalized.length > 4000 || UNSAFE_FORMAT.test(normalized)) return "INVALID_TEXT";
    const visible = normalized.replace(INVISIBLE, "");
    // Only mask the harmless word span, never the whole sentence containing it.
    const scan = visible.replace(/시\s?발\s?(?:점|역|열차)/g, " ");
    const jamo = foldedJamo(scan);
    if (KOREAN_BLOCKED.some(pattern => pattern.test(jamo)) || KOREAN_INITIALS_BLOCKED.test(jamo) || ENGLISH_BLOCKED.test(scan)) return "CONTENT_NOT_ALLOWED";
    if (mode === "opinion" && (
      containsOpinionLink(visible) ||
      /[^\s@]{1,64}@[^\s@]{1,100}\.[a-z]{2,20}/i.test(visible) ||
      /(?:^|[^0-9])0[0-9]{1,2}[ .-]?[0-9]{3,4}[ .-]?[0-9]{4}(?:$|[^0-9])/.test(visible) ||
      /(?:^|[^0-9])[0-9]{6}[ -]?[1-8][0-9]{6}(?:$|[^0-9])/.test(visible)
    )) return "PERSONAL_DATA_NOT_ALLOWED";
    return null;
  } catch {
    return "INVALID_TEXT";
  }
}
