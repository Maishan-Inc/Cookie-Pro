import type { NextRequest } from "next/server";

import { errorResponse, jsonResponse } from "@/lib/http";
import { CollectPayloadSchema } from "@/lib/validation";
import type { Json } from "@/types/supabase";

import {
  getDevice,
  getSiteByKey,
  insertEvents,
  latestConsent,
  upsertDevice,
} from "@/lib/repositories";
import { saltedDeviceId } from "@/lib/crypto";
import { extractClientIP, truncateOrHashIP } from "@/lib/ip";
import { shouldEnforceCaptcha, verifyCaptchaToken } from "@/lib/captcha";
import { filterEventsByConsent } from "@/lib/telemetry";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isOriginAllowed } from "@/lib/origin";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = CollectPayloadSchema.safeParse(body);

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
          status: 403,
          code: "CAPTCHA_REQUIRED",
          message: "Captcha token required",
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

    const consent = await latestConsent(site.id, deviceId);
    const filtered = filterEventsByConsent({
      events: payload.events,
      consent: (consent?.choices as Record<string, boolean>) ?? null,
    });

    if (!filtered.length) {
      return jsonResponse({ accepted: 0 }, { status: 202 });
    }

    const rate = consumeRateLimit({
      key: `${site.id}:${deviceId}:collect`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return errorResponse({
        status: 429,
        code: "RATE_LIMITED",
        message: "Too many events",
      });
    }

    const ipTruncated = truncateOrHashIP(
      extractClientIP(request.headers),
      site.site_salt,
    );
    const ua = request.headers.get("user-agent");

    await insertEvents(
      filtered.map((event) => ({
        site_id: site.id,
        device_id: deviceId,
        type: event.type,
        url: event.url ?? null,
        referrer: event.referrer ?? null,
        ua,
        ip_truncated: ipTruncated,
        ts: event.ts ? new Date(event.ts).toISOString() : undefined,
        payload: (event.payload as Json | undefined) ?? null,
        purpose: event.purpose ?? null,
      })),
    );

    await upsertDevice(site.id, deviceId);

    return jsonResponse({ accepted: filtered.length }, { status: 202 });
  } catch (error) {
    logger.error("collect endpoint failed", {
      message: (error as Error).message,
    });
    return errorResponse({
      status: 500,
      code: "COLLECT_ERROR",
      message: "Unable to record events",
    });
  }
}
