import type { Database } from "@/types/supabase";
import { optionalSecrets } from "@/lib/env";

const CAPTCHA_ENDPOINT: Record<
  NonNullable<Database["public"]["Tables"]["sites"]["Row"]["captcha_provider"]>,
  string
> = {
  recaptcha: "https://www.google.com/recaptcha/api/siteverify",
  hcaptcha: "https://hcaptcha.com/siteverify",
  turnstile: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
};

type Provider = keyof typeof CAPTCHA_ENDPOINT;

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 5000;

export async function verifyCaptchaToken({
  provider,
  token,
  remoteIp,
  secret,
}: {
  provider: Provider;
  token: string;
  remoteIp?: string | null;
  secret?: string | null;
}): Promise<boolean> {
  const endpoint = CAPTCHA_ENDPOINT[provider];
  const resolvedSecret = secret ?? optionalSecrets[provider]?.();
  if (!resolvedSecret) return false;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: resolvedSecret,
          response: token,
          remoteip: remoteIp ?? "",
        }).toString(),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const payload = (await res.json()) as { success?: boolean };
      if (payload.success) return true;
      return false;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS - 1) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, 100 * Math.pow(2, attempt)),
      );
    }
  }

  return false;
}

export function shouldEnforceCaptcha({
  site,
  deviceSeen,
}: {
  site: Database["public"]["Tables"]["sites"]["Row"];
  deviceSeen: boolean;
}): boolean {
  if (!site.captcha_provider) return false;
  return !deviceSeen;
}
