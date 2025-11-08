import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("blocks after limit reached", () => {
    const key = "site";
    expect(consumeRateLimit({ key, limit: 1, windowMs: 1000 }).allowed).toBe(true);
    const second = consumeRateLimit({ key, limit: 1, windowMs: 1000 });
    expect(second.allowed).toBe(false);
    expect(second.retryAfter).toBeGreaterThan(0);
  });
});
