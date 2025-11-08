import { describe, expect, it } from "vitest";
import { filterEventsByConsent } from "@/lib/telemetry";

describe("filterEventsByConsent", () => {
  it("allows only minimal events when consent missing", () => {
    const events = [
      { type: "page_view_minimal" },
      { type: "ads_event", purpose: "ads" },
    ];
    const filtered = filterEventsByConsent({ events, consent: null });
    expect(filtered).toHaveLength(1);
  });

  it("allows purpose when consent true", () => {
    const events = [{ type: "ads_event", purpose: "ads" }];
    const filtered = filterEventsByConsent({
      events,
      consent: { necessary: true, ads: true },
    });
    expect(filtered).toHaveLength(1);
  });

  it("blocks when consent false", () => {
    const events = [{ type: "ads_event", purpose: "ads" }];
    const filtered = filterEventsByConsent({
      events,
      consent: { necessary: true, ads: false },
    });
    expect(filtered).toHaveLength(0);
  });
});
