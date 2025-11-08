import type { NextRequest } from "next/server";

import { errorResponse, jsonResponse } from "@/lib/http";
import {
  ConsentPayloadSchema,
  sanitizeChoices,
  type ConsentChoices,
} from "@/lib/validation";
import { getSiteByKey, getDevice, insertConsent, upsertDevice } from "@/lib/repositories";
import { saltedDeviceId } from "@/lib/crypto";
import { extractClientIP, truncateOrHashIP } from "@/lib/ip";
import { verifyCaptchaToken, shouldEnforceCaptcha } from "@/lib/captcha";
import { isOriginAllowed } from "@/lib/origin";
import { consumeRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = ConsentPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse({
      status: 400,
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }

  const payload = parsed.data;

  try {
    const site = await getSiteByKey(payload.site_key);

    if (
      !isOriginAllowed({
        originHeader: request.headers.get("origin"),
        refererHeader: request.headers.get("referer"),
        site,
      })
    ) {
      return errorResponse({
        status: 403,
        code: "ORIGIN_NOT_ALLOWED",
        message: "Origin not allowed for this site",
      });
    }

    const deviceId = saltedDeviceId(payload.visitorId, site.site_salt);
    const device = await getDevice(site.id, deviceId);
    const enforceCaptcha = shouldEnforceCaptcha({
      site,
      deviceSeen: Boolean(device),
    });

    if (enforceCaptcha) {
      if (!payload.captcha) {
        return errorResponse({
          status: 400,
          code: "CAPTCHA_REQUIRED",
          message: "Captcha token required for new devices",
        });
      }
      const captchaValid = await verifyCaptchaToken({
        provider: payload.captcha.provider,
        token: payload.captcha.token,
        remoteIp: extractClientIP(request.headers),
        secret: site.captcha_secret ?? undefined,
      });
      if (!captchaValid) {
        return errorResponse({
          status: 400,
          code: "CAPTCHA_INVALID",
          message: "Captcha validation failed",
        });
      }
    }

    const rate = consumeRateLimit({
      key: `${site.id}:${deviceId}:consent`,
      limit: 5,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return errorResponse({
        status: 429,
        code: "RATE_LIMITED",
        message: "Too many consent updates",
      });
    }

    const sanitized = sanitizeChoices(payload.choices) as ConsentChoices;
    const ip = truncateOrHashIP(
      extractClientIP(request.headers),
      site.site_salt,
    );
    const userAgent = request.headers.get("user-agent");

    await insertConsent({
      siteId: site.id,
      deviceId,
      policyVersion: payload.policy_version,
      choices: sanitized,
      userAgent,
      ipTruncated: ip,
    });

    await upsertDevice(site.id, deviceId);

    return jsonResponse(
      { deviceId, storedAt: new Date().toISOString() },
      { status: 201 },
    );
  } catch (error) {
    logger.error("consent write failed", { message: (error as Error).message });
    return errorResponse({
      status: 500,
      code: "CONSENT_ERROR",
      message: "Unable to record consent",
    });
  }
}
