import { describe, expect, it } from "vitest";
import { feedbackRateKey, rateLimitSubject } from "@/lib/server/feedbackStorage";

const SECRET = "s".repeat(32);

describe("rate-limit subject (SEC-07)", () => {
  it("keeps IPv4 exact and folds IPv4-mapped IPv6 back to IPv4", () => {
    expect(rateLimitSubject("192.0.2.10")).toBe("192.0.2.10");
    expect(rateLimitSubject("[::ffff:c000:20a]")).toBe("192.0.2.10");
  });
  it("groups every interface ID inside one IPv6 /64", () => {
    expect(rateLimitSubject("[2001:db8:1:2::1]")).toBe("2001:db8:1:2::/64");
    expect(rateLimitSubject("[2001:db8:1:2:aaaa:bbbb:cccc:dddd]")).toBe("2001:db8:1:2::/64");
    expect(rateLimitSubject("2001:db8:1:3::1")).toBe("2001:db8:1:3::/64");
    expect(rateLimitSubject("[::1]")).toBe("0:0:0:0::/64");
  });
  it("uses one HMAC bucket per /64 and separate buckets for different prefixes", async () => {
    const a = await feedbackRateKey(SECRET, "[2001:db8:1:2::1]", 600);
    const b = await feedbackRateKey(SECRET, "[2001:db8:1:2:ffff::9]", 600);
    const c = await feedbackRateKey(SECRET, "[2001:db8:1:3::1]", 600);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(await feedbackRateKey(SECRET, "192.0.2.10", 600)).not.toBe(await feedbackRateKey(SECRET, "192.0.2.11", 600));
  });
});
