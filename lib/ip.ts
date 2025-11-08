import { sha256 } from "@/lib/crypto";

const IPV4_REGEX =
  /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;

export function extractClientIP(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const candidates = forwarded.split(",").map((part) => part.trim());
    if (candidates.length) return candidates[0];
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return null;
}

export function isIPv4(ip: string): boolean {
  return IPV4_REGEX.test(ip);
}

export function truncateOrHashIP(ip: string | null, siteSalt: string): string | null {
  if (!ip) return null;
  if (isIPv4(ip)) {
    const segments = ip.split(".");
    return [...segments.slice(0, 3), "0"].join(".");
  }

  return sha256(`${ip}:${siteSalt}`);
}
