import { randomBytes } from "node:crypto";

export function generateRequestId() {
  return randomBytes(8).toString("hex");
}
