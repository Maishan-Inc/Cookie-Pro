import type { NextRequest } from "next/server";

import { jsonResponse, errorResponse } from "@/lib/http";
import { ConsentStatusQuerySchema } from "@/lib/validation";
import { getSiteByKey, getDevice, latestConsent } from "@/lib/repositories";
import { saltedDeviceId } from "@/lib/crypto";
import { shouldEnforceCaptcha } from "@/lib/captcha";
import { isOriginAllowed } from "@/lib/origin";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = ConsentStatusQuerySchema.safeParse({
    site_key: searchParams.get("site_key"),
    visitorId: searchParams.get("visitorId") ?? undefined,
  });

  if (!parsed.success) {
    return errorResponse({
      status: 400,
      message: parsed.error.errors.map((err) => err.message).join(", "),
    });
  }

  const { site_key, visitorId } = parsed.data;

  try {
    const site = await getSiteByKey(site_key);

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

    let deviceSeen = false;
    let consent: Awaited<ReturnType<typeof latestConsent>> = null;

    if (visitorId) {
      const deviceId = saltedDeviceId(visitorId, site.site_salt);
      const device = await getDevice(site.id, deviceId);
      deviceSeen = Boolean(device);
      if (deviceSeen) {
        consent = await latestConsent(site.id, deviceId);
      }
    }

    const needCaptcha = shouldEnforceCaptcha({ site, deviceSeen });
    const needConsent =
      !consent || consent.policy_version !== site.policy_version;

    return jsonResponse({
      needCaptcha,
      needConsent,
      policyVersion: site.policy_version,
      deviceSeen,
      choices: consent?.choices ?? null,
      captcha:
        needCaptcha && site.captcha_site_key
        ? {
            provider: site.captcha_provider,
            siteKey: site.captcha_site_key,
          }
        : null,
    });
  } catch (error) {
    logger.error("status handler failed", {
      message: (error as Error).message,
    });
    return errorResponse({
      status: 500,
      code: "STATUS_ERROR",
      message: "Unable to load consent status",
    });
  }
}
