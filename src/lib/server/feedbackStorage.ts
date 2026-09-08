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

/**
 * next-on-pages exposes request-scoped Cloudflare bindings through process.env.
 * Read dynamically inside the request; do not snapshot at module/build time.
 * A missing binding in plain next dev/start deliberately leaves the API closed.
 */
export function getFeedbackBindings(): FeedbackBindings {
  try {
    const environment = process.env as unknown as Record<string, unknown>;
    return {
      FEEDBACK_DB: environment["FEEDBACK_DB"] as FeedbackDatabase | undefined,
      FEEDBACK_RATE_LIMIT_SECRET: environment["FEEDBACK_RATE_LIMIT_SECRET"] as string | undefined,
      FEEDBACK_ALLOWED_ORIGIN: environment["FEEDBACK_ALLOWED_ORIGIN"] as string | undefined,
    };
  } catch {
    return {};
  }
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
export async function feedbackRateKey(secret: string, ip: string, windowStart: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`contact\0${windowStart}\0${ip}`)));
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
export function normalizeFeedbackPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 1 || value.length > 200) return null;
  let decoded: string;
  try { decoded = decodeURIComponent(value); } catch { return null; }
  if (!decoded.startsWith("/") || decoded.startsWith("//") || /[\\?#<>\s\u0000-\u001f\u007f]/.test(decoded)) return null;
  if (decoded.split("/").some(part => part === "." || part === "..")) return null;
  const path = new URL(decoded, "https://www.moneysalary.com").pathname;
  return path
    .replace(/^\/share(?:\/.*)?$/, "/share/[redacted]")
    .replace(/^\/salary\/(?:\d+(?:-manwon)?)(?=\/|$)/, "/salary/[amount]");
}
