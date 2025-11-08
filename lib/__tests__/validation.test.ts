import { describe, expect, it } from "vitest";
import { ConsentPayloadSchema } from "@/lib/validation";

describe("schema validation", () => {
  it("requires necessary category", () => {
    const result = ConsentPayloadSchema.safeParse({
      site_key: "site",
      policy_version: "v1",
      choices: { necessary: true, ads: false },
      visitorId: "visitor",
    });
    expect(result.success).toBe(true);
  });

  it("fails when necessary missing", () => {
    const result = ConsentPayloadSchema.safeParse({
      site_key: "site",
      policy_version: "v1",
      choices: { ads: false },
      visitorId: "visitor",
    });
    expect(result.success).toBe(false);
  });
});
