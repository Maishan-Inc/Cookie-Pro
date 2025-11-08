import { createHash, randomBytes } from "node:crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function saltedDeviceId(visitorId: string, siteSalt: string): string {
  return sha256(`${visitorId}:${siteSalt}`);
}

export function generateSiteSalt(): string {
  return randomBytes(32).toString("hex");
}
