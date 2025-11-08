import { describe, expect, it } from "vitest";
import { extractClientIP, truncateOrHashIP } from "@/lib/ip";

describe("ip helpers", () => {
  it("extracts first forwarded ip", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.1.1.1, 2.2.2.2",
    });
    expect(extractClientIP(headers)).toBe("1.1.1.1");
  });

  it("truncates ipv4 and hashes ipv6", () => {
    expect(truncateOrHashIP("192.168.0.1", "salt")).toBe("192.168.0.0");
    const hashed = truncateOrHashIP("2a00:1450:4009:80b::200e", "salt");
    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
  });
});
