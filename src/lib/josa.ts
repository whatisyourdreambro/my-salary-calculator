// src/lib/josa.ts
//
// 한국어 조사 자동 선택 — "삼성전자은(는)" 같은 자리표시 조사를 없애기 위한 헬퍼 (2026-09-25 B12).
// 회사명·용어명·업종명처럼 템플릿에 끼워 넣는 단어 뒤의 은/는·이/가·과/와·을/를·이란/란·으로/로를
// 마지막 글자의 받침(발음)으로 고른다. 모듈 로드 비용 0, 호출당 O(1) — edge 라우트(용어집)에서도 안전.
//
// 판정 순서
//  1) 끝의 공백·' (…)'·'(…)' 괄호 병기를 떼고(토스(비바리퍼블리카) → 토스, 구글 (Google) → 구글),
//     닫는 따옴표·괄호·마침표를 뗀다(JYP Ent. → JYP Ent) — 조사는 괄호 앞 말에 맞춘다.
//  2) 한글 음절: (code − 0xAC00) % 28 로 받침 유무, 종성 8(ㄹ)은 '으로/로'에서 '로'.
//  3) 영문: 알려진 단어(ELECTRIC·Lab 등)는 단어 발음표, 대문자로 끝나면 알파벳 이름 발음
//     (L·R=ㄹ받침, M·N=받침, 나머지 모음 끝), 소문자로 끝나는 미등록 단어는 판정 불가.
//  4) 숫자: 0(영)·3(삼)·6(육)=받침, 1(일)·7(칠)·8(팔)=ㄹ받침, 2·4·5·9=모음 끝. %(퍼센트)=모음 끝.
//  5) 판정할 수 없으면 기존 병기 형식('은(는)'·'(으)로')을 그대로 쓴다 — 틀린 조사보다 병기가 낫다.

export type JosaPair = "은/는" | "이/가" | "과/와" | "을/를" | "이란/란" | "으로/로";

/** 마지막 소리: 모음 끝 · ㄹ 받침 · 그 외 받침 · 판정 불가 */
type FinalSound = "vowel" | "rieul" | "consonant" | null;

/** 알파벳 이름 발음의 끝소리 (A 에이, B 비 … L 엘, M 엠, N 엔, R 알 …) */
const LETTER_FINAL: Record<string, Exclude<FinalSound, null>> = {
  L: "rieul",
  R: "rieul",
  M: "consonant",
  N: "consonant",
};

/** 숫자 읽기의 끝소리 — 10·100·1000·10000(십·백·천·만)도 0 으로 끝나 받침으로 일치 */
const DIGIT_FINAL: Record<string, Exclude<FinalSound, null>> = {
  "0": "consonant",
  "1": "rieul",
  "2": "vowel",
  "3": "consonant",
  "4": "vowel",
  "5": "vowel",
  "6": "consonant",
  "7": "rieul",
  "8": "rieul",
  "9": "vowel",
};

/** 약어가 아니라 단어로 읽는 영문 끝 단어(대문자 정규화) — 실제 데이터에 나오는 것만 등재 */
const LATIN_WORD_FINAL: Record<string, Exclude<FinalSound, null>> = {
  ELECTRIC: "consonant", // LS ELECTRIC — 일렉트릭
  LAB: "consonant", // KT AI Lab — 랩
  ENT: "vowel", // JYP Ent. — 엔터
  TIER: "vowel", // 티어
  MATCH: "vowel", // 구글 대표 복지 '401k Match' — 매치
  POP: "consonant", // 문화 키워드 'K-pop' — 케이팝
};

/** 끝의 괄호 병기와 닫는 따옴표·괄호·문장부호를 떼어 조사가 붙을 실제 말만 남긴다. */
function stripTrailing(word: string): string {
  let w = word.trim();
  for (;;) {
    const next = w
      .replace(/\s*\([^()]*\)$/, "")
      .replace(/[\s"'”’」』》〉\].,…!?]+$/, "");
    if (next === w) return w;
    w = next;
  }
}

function finalSound(word: string): FinalSound {
  const w = stripTrailing(word);
  if (!w) return null;
  const last = w[w.length - 1];
  const code = last.charCodeAt(0);

  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    if (jong === 0) return "vowel";
    return jong === 8 ? "rieul" : "consonant";
  }

  if (last in DIGIT_FINAL) return DIGIT_FINAL[last];
  if (last === "%") return "vowel"; // 퍼센트

  if (/[A-Za-z]/.test(last)) {
    const tail = w.match(/[A-Za-z]+$/)![0];
    const known = LATIN_WORD_FINAL[tail.toUpperCase()];
    if (known) return known;
    if (/[A-Z]/.test(last)) return LETTER_FINAL[last] ?? "vowel";
    return null; // 소문자로 끝나는 미등록 영단어 — 발음 추정 금지
  }

  return null;
}

/** 조사만 반환 (예: josaParticle("삼성전자", "은/는") → "는"). JSX 에서 이름을 <strong> 으로 감쌀 때 사용. */
export function josaParticle(word: string, pair: JosaPair): string {
  const [withBatchim, withoutBatchim] = pair.split("/");
  const sound = finalSound(word);
  if (sound === null) {
    return pair === "으로/로" ? "(으)로" : `${withBatchim}(${withoutBatchim})`;
  }
  if (pair === "으로/로") return sound === "consonant" ? "으로" : "로";
  return sound === "vowel" ? withoutBatchim : withBatchim;
}

/** 단어 + 조사 (예: josa("네이버", "은/는") → "네이버는", josa("S-OIL", "이/가") → "S-OIL이"). */
export function josa(word: string, pair: JosaPair): string {
  return `${word}${josaParticle(word, pair)}`;
}
