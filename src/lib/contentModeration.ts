/** Small deterministic input policy. No network, logging, storage, or text rewriting.
 * This catches the listed expressions and bounded spelling evasions, not every
 * harmful meaning. Keep the original accepted text separate from the scan copy.
 */
export const CONTENT_POLICY_VERSION = "ko-input-v2";
export type ContentIssue = "CONTENT_NOT_ALLOWED" | "PERSONAL_DATA_NOT_ALLOWED" | "INVALID_TEXT";

const LEADING = [..."ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"];
const VOWELS = [..."ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"];
const TRAILING = [..."ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"];
// Remove format controls and invisible selectors from the scan copy only. ZWJ
// emoji and other accepted visitor text are never rewritten in storage or UI.
const INVISIBLE = /[\p{Cf}\u034f\ufe00-\ufe0f\u{e0100}-\u{e01ef}]/gu;
const UNSAFE_FORMAT = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]|<[^>]*>/;

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
      /(?:https?:\/\/|www\.)/i.test(visible) ||
      /[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,62})\.(?:com|net|org|io|kr|co\.kr)(?:\b|\/)/u.test(visible) ||
      /[^\s@]{1,64}@[^\s@]{1,100}\.[a-z]{2,20}/i.test(visible) ||
      /(?:^|[^0-9])0[0-9]{1,2}[ .-]?[0-9]{3,4}[ .-]?[0-9]{4}(?:$|[^0-9])/.test(visible) ||
      /(?:^|[^0-9])[0-9]{6}[ -]?[1-8][0-9]{6}(?:$|[^0-9])/.test(visible)
    )) return "PERSONAL_DATA_NOT_ALLOWED";
    return null;
  } catch {
    return "INVALID_TEXT";
  }
}
