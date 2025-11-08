export const CONSENT_CATEGORIES = ["necessary", "ads", "other"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export const NECESSARY_CATEGORY: ConsentCategory = "necessary";
export const NECESSARY_ONLY_EVENTS = new Set(["page_view_minimal", "heartbeat"]);

export const DEFAULT_POLICY_VERSION = "2025.11.0";

export const LOCALSTORAGE_KEYS = {
  consentSnapshot: (siteKey: string) => `cookie-pro-consent-${siteKey}`,
  visitorId: (siteKey: string) => `cookie-pro-device-${siteKey}`,
};
