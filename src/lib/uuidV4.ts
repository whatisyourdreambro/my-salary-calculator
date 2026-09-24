// src/lib/uuidV4.ts
//
// 접수 번호(submissionId)용 UUID v4 — 구형 브라우저 호환 (2026-09-25 감사 B3 · CLIENT-06).
// crypto.randomUUID 는 Safari 15.4+·보안 컨텍스트 전용이라, 그 밖의 환경에서 문의(ContactForm)는
// 제출 시 TypeError, 의견(PrivateFeedback)은 접수를 거부했다.
// ★ 서버는 submissionId 를 UUID v4 정규식으로 검증한다(src/lib/server/contactHandler.ts·fixedFeedbackHandler.ts
//   의 UUID_V4). workClock 식 "work-<시각>-<난수>" 는 INVALID_REQUEST 가 되므로 쓰지 않는다 —
//   폴백도 반드시 버전(4)·변형(8~b) 비트를 맞춘 RFC 4122 v4 형식으로 만든다.

type CryptoLike = {
  randomUUID?: () => string;
  getRandomValues?: <T extends ArrayBufferView | null>(array: T) => T;
};

function randomBytes(cryptoApi: CryptoLike | undefined): Uint8Array {
  const bytes = new Uint8Array(16);
  if (cryptoApi && typeof cryptoApi.getRandomValues === "function") {
    try {
      cryptoApi.getRandomValues(bytes);
      return bytes;
    } catch {
      // 일부 WebView 가 던진다 — 아래 Math.random 폴백.
    }
  }
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

/** RFC 4122 버전 4 UUID. randomUUID → getRandomValues → Math.random 순으로 쓴다(마지막은 중복 방지용일 뿐 보안 난수 아님). */
export function uuidV4(): string {
  const cryptoApi = (typeof globalThis !== "undefined" ? (globalThis as { crypto?: CryptoLike }).crypto : undefined);
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    try {
      return cryptoApi.randomUUID();
    } catch {
      // 비보안 컨텍스트 등 — 아래 폴백.
    }
  }
  const b = randomBytes(cryptoApi);
  b[6] = (b[6] & 0x0f) | 0x40; // version 4
  b[8] = (b[8] & 0x3f) | 0x80; // variant 10xx
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
