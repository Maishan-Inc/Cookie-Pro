"use client";

import { useEffect, useRef } from "react";

export type CaptchaProvider = "recaptcha" | "hcaptcha" | "turnstile";

type Props = {
  provider?: CaptchaProvider | null;
  siteKey?: string | null;
  onToken?(token: string): void;
};

async function loadScript(src: string) {
  if (document.querySelector(`script[data-cookie-pro="${src}"]`)) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.cookiePro = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export function Captcha({ provider, siteKey, onToken }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!provider || !siteKey || !ref.current) return;
    let disposed = false;

    async function mount() {
      if (provider === "turnstile") {
        await loadScript(
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
        );
        const widgetId = window.turnstile.render(ref.current!, {
          sitekey: siteKey,
          callback(token: string) {
            onToken?.(token);
          },
        });
        return () => window.turnstile.reset(widgetId);
      }

      if (provider === "hcaptcha") {
        await loadScript("https://js.hcaptcha.com/1/api.js?render=explicit");
        const widgetId = window.hcaptcha.render(ref.current!, {
          sitekey: siteKey,
          callback(token: string) {
            onToken?.(token);
          },
        });
        return () => window.hcaptcha.reset(widgetId);
      }

      await loadScript("https://www.google.com/recaptcha/api.js?render=explicit");
      const widgetId = window.grecaptcha.render(ref.current!, {
        sitekey: siteKey,
        callback(token: string) {
          onToken?.(token);
        },
      });
      return () => window.grecaptcha.reset(widgetId);
    }

    let cleanup: (() => void) | undefined;
    mount()
      .then((dispose) => {
        if (disposed) {
          dispose?.();
        } else {
          cleanup = dispose;
        }
      })
      .catch((error) => {
        console.error("[captcha] failed", error);
      });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [provider, siteKey, onToken]);

  if (!provider || !siteKey) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        CAPTCHA disabled for this site.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        CAPTCHA preview ({provider})
      </p>
      <div
        ref={ref}
        className="min-h-24 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
        data-provider={provider}
      />
    </div>
  );
}
