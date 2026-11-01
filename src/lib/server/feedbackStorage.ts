/** Server-only storage primitives, shared with future fixed-reason feedback. */

export interface FeedbackStatement {
  bind(...values: (string | number | null)[]): FeedbackStatement;
}

export interface FeedbackResult {
  success: boolean;
  meta: { changes?: number };
  results: Record<string, unknown>[];
}

export interface FeedbackDatabase {
  prepare(sql: string): FeedbackStatement;
  batch(statements: FeedbackStatement[]): Promise<FeedbackResult[]>;
}

export interface FeedbackBindings {
  FEEDBACK_DB?: FeedbackDatabase;
  FEEDBACK_RATE_LIMIT_SECRET?: string;
  /** Optional exact preview origin. Omit in production to use the main site. */
  FEEDBACK_ALLOWED_ORIGIN?: string;
}

export function hasFeedbackStorage(bindings: FeedbackBindings): bindings is FeedbackBindings & {
  FEEDBACK_DB: FeedbackDatabase;
  FEEDBACK_RATE_LIMIT_SECRET: string;
} {
  return typeof bindings.FEEDBACK_DB?.prepare === "function"
    && typeof bindings.FEEDBACK_DB?.batch === "function"
    && typeof bindings.FEEDBACK_RATE_LIMIT_SECRET === "string"
    && bindings.FEEDBACK_RATE_LIMIT_SECRET.trim().length >= 32
    && bindings.FEEDBACK_RATE_LIMIT_SECRET.length <= 512;
}

export const FEEDBACK_WINDOW_SECONDS = 10 * 60;
export const CONTACT_WINDOW_LIMIT = 5;
export const CONTACT_RETENTION_SECONDS = 90 * 24 * 60 * 60;

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, "0")).join("");
}

export async function feedbackPayloadHash(value: string): Promise<string> {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

/** The IP is used only for this HMAC, never returned or stored with a receipt. */
export async function feedbackRateKey(secret: string, ip: string, windowStart: number, scope: "contact" | "feedback" | "opinion" | "reaction" = "contact"): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${scope}\0${windowStart}\0${rateLimitSubject(ip)}`)));
}

/**
 * One IPv6 subscriber usually controls a whole /64, so rotating the interface ID
 * must not open a fresh bucket (SEC-07). IPv4 and IPv4-mapped addresses stay exact.
 */
export function rateLimitSubject(ip: string): string {
  const host = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host.includes(":")) return host;
  const [head, tail = ""] = host.split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = host.includes("::") ? [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right] : left;
  if (groups.length !== 8 || !groups.every(group => /^[a-f\d]{1,4}$/.test(group))) return host;
  const words = groups.map(group => parseInt(group, 16));
  if (words.slice(0, 5).every(word => word === 0) && words[5] === 0xffff) {
    return [words[6] >> 8, words[6] & 255, words[7] >> 8, words[7] & 255].join(".");
  }
  return `${words.slice(0, 4).map(word => word.toString(16)).join(":")}::/64`;
}

/** Trust only the header Cloudflare supplies; never use X-Forwarded-For. */
export function feedbackClientIp(request: Request): string | null {
  const value = request.headers.get("cf-connecting-ip");
  if (!value || value.length > 45) return null;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    const parts = value.split(".");
    return parts.every(part => Number(part) <= 255 && String(Number(part)) === part) ? value : null;
  }
  if (!/^[a-f\d:.]+$/i.test(value) || !value.includes(":")) return null;
  try {
    return new URL(`http://[${value}]`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Store route context, never query/hash parameters, share tokens or salary inputs. */
// Frozen contact-v1 canonicalization. A later contract needs its own normalizer.
export function normalizeFeedbackPathV1(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 1 || value.length > 200) return null;
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return null; }
  // Reject nested encodings instead of storing a second spelling that bypasses
  // the amount/share redaction below. Ordinary percent-encoded Korean paths work.
  if (/%[\da-f]{2}/i.test(decoded)) return null;
  if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\?#<>\s\u0000-\u001f\u007f]/.test(decoded)) return null;
  if (decoded.split("/").some(part => part === "." || part === "..")) return null;
  const path = new URL(decoded, "https://www.moneysalary.com").pathname;
  return path
    .replace(/^\/share(?:\/.*)?$/, "/share/[redacted]")
    .replace(/^\/(salary|monthly)\/\d+(?:-manwon|(?:-5)?-eok)?(?=\/|$)/, "/$1/[amount]");
}

export const normalizeFeedbackPath = normalizeFeedbackPathV1;
