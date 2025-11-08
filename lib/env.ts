import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE: z.string().min(1),
  NEXT_PUBLIC_FPJS_KEY: z.string().optional(),
  CAPTCHA_RECAPTCHA_SECRET: z.string().optional(),
  HCAPTCHA_SECRET: z.string().optional(),
  TURNSTILE_SECRET: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = serverEnvSchema.safeParse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE: process.env.SUPABASE_SERVICE_ROLE,
    NEXT_PUBLIC_FPJS_KEY: process.env.NEXT_PUBLIC_FPJS_KEY,
    CAPTCHA_RECAPTCHA_SECRET: process.env.CAPTCHA_RECAPTCHA_SECRET,
    HCAPTCHA_SECRET: process.env.HCAPTCHA_SECRET,
    TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`,
    );
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export const optionalSecrets = {
  recaptcha: () => process.env.CAPTCHA_RECAPTCHA_SECRET ?? "",
  hcaptcha: () => process.env.HCAPTCHA_SECRET ?? "",
  turnstile: () => process.env.TURNSTILE_SECRET ?? "",
};
