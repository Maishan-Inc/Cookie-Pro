import { sha256 } from "@/lib/crypto";

export type FallbackFingerprintInput = {
  userAgent?: string | null;
  language?: string | null;
  languages?: string[] | null;
  timezone?: string | null;
  platform?: string | null;
  hardwareConcurrency?: number | null;
  deviceMemory?: number | null;
  screen?: {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
  } | null;
};

export function fallbackVisitorId(input: FallbackFingerprintInput): string {
  const parts = [
    input.userAgent ?? "",
    input.language ?? "",
    (input.languages ?? []).join(","),
    input.timezone ?? "",
    input.platform ?? "",
    String(input.hardwareConcurrency ?? ""),
    String(input.deviceMemory ?? ""),
  ];

  if (input.screen) {
    parts.push(
      [
        input.screen.width,
        input.screen.height,
        input.screen.pixelRatio,
        input.screen.colorDepth,
      ].join("x"),
    );
  }

  return sha256(parts.join("|"));
}
