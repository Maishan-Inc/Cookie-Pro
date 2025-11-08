import { z } from "zod";
import { CONSENT_CATEGORIES, NECESSARY_CATEGORY } from "@/lib/constants";

export const ConsentChoicesSchema = z
  .record(z.boolean())
  .superRefine((val, ctx) => {
    if (val[NECESSARY_CATEGORY] !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "necessary category must be accepted",
      });
    }
  });

export type ConsentChoices = z.infer<typeof ConsentChoicesSchema>;

export const ConsentPayloadSchema = z.object({
  site_key: z.string().min(1),
  policy_version: z.string().min(1),
  choices: ConsentChoicesSchema,
  visitorId: z.string().min(6),
  captcha: z
    .object({
      provider: z.enum(["recaptcha", "hcaptcha", "turnstile"]),
      token: z.string().min(5),
    })
    .optional(),
});

export const ConsentStatusQuerySchema = z.object({
  site_key: z.string().min(1),
  visitorId: z.string().optional(),
});

export const EventSchema = z.object({
  type: z.string().min(1),
  url: z.string().url().optional(),
  referrer: z.string().url().optional(),
  ua: z.string().optional(),
  ts: z.number().optional(),
  purpose: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});

export const CollectPayloadSchema = z.object({
  site_key: z.string().min(1),
  visitorId: z.string().min(6),
  events: z.array(EventSchema).min(1),
  captcha: z
    .object({
      provider: z.enum(["recaptcha", "hcaptcha", "turnstile"]),
      token: z.string().min(5),
    })
    .optional(),
});

export type CollectPayload = z.infer<typeof CollectPayloadSchema>;

export function sanitizeChoices(
  choices: ConsentChoices,
): Partial<Record<(typeof CONSENT_CATEGORIES)[number], boolean>> {
  const safe: Partial<Record<
    (typeof CONSENT_CATEGORIES)[number],
    boolean
  >> = {};

  for (const key of CONSENT_CATEGORIES) {
    if (typeof choices[key] === "boolean") {
      safe[key] = choices[key];
    }
  }
  return safe;
}
