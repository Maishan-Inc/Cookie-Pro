import { describe, expect, it } from "vitest";
import { generateSiteSalt, saltedDeviceId, sha256 } from "@/lib/crypto";

describe("crypto helpers", () => {
  it("produces deterministic sha256 hash", () => {
    expect(sha256("cookie-pro")).toEqual(sha256("cookie-pro"));
  });

  it("mixes salt and visitor id", () => {
    const salt = "abc";
    const hash = saltedDeviceId("visitor", salt);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates random site salt", () => {
    const saltA = generateSiteSalt();
    const saltB = generateSiteSalt();
    expect(saltA).toHaveLength(64);
    expect(saltA).not.toEqual(saltB);
  });
});
