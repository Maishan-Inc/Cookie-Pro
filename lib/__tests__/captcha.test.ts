import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyCaptchaToken } from "@/lib/captcha";

describe("captcha verification", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when upstream validates token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await verifyCaptchaToken({
      provider: "turnstile",
      token: "token",
      secret: "secret",
    });

    expect(result).toBe(true);
  });

  it("returns false when secret missing", async () => {
    const result = await verifyCaptchaToken({
      provider: "recaptcha",
      token: "token",
    });

    expect(result).toBe(false);
  });

  it("retries and throws when fetch keeps failing", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));

    await expect(
      verifyCaptchaToken({
        provider: "hcaptcha",
        token: "token",
        secret: "secret",
      }),
    ).rejects.toThrow("boom");
  });
});
