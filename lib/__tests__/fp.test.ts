import { describe, expect, it } from "vitest";
import { fallbackVisitorId } from "@/lib/fp";

describe("fallbackVisitorId", () => {
  it("creates deterministic hash from inputs", () => {
    const first = fallbackVisitorId({
      userAgent: "UA",
      language: "en-US",
      languages: ["en-US", "fr-FR"],
      timezone: "UTC",
      platform: "MacIntel",
      hardwareConcurrency: 8,
      deviceMemory: 16,
      screen: { width: 1440, height: 900, pixelRatio: 2, colorDepth: 24 },
    });

    const second = fallbackVisitorId({
      userAgent: "UA",
      language: "en-US",
      languages: ["en-US", "fr-FR"],
      timezone: "UTC",
      platform: "MacIntel",
      hardwareConcurrency: 8,
      deviceMemory: 16,
      screen: { width: 1440, height: 900, pixelRatio: 2, colorDepth: 24 },
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(64);
  });

  it("changes hash when data differs", () => {
    const first = fallbackVisitorId({ userAgent: "A" });
    const second = fallbackVisitorId({ userAgent: "B" });
    expect(first).not.toEqual(second);
  });
});
