import { CONSENT_CATEGORIES } from "@/lib/constants";

export const runtime = "edge";
export const revalidate = 86400;

const TRANSLATIONS = {
  "en-US": {
    title: "We respect your privacy",
    description:
      "Select which categories we may use. Necessary cookies stay on so the site works.",
    acceptAll: "Accept all",
    rejectAll: "Necessary only",
    save: "Save choices",
    captchaHint: "Complete the CAPTCHA to continue",
  },
  "zh-CN": {
    title: "\u6211\u4eec\u5c0a\u91cd\u60a8\u7684\u9690\u79c1",
    description:
      "\u8bf7\u9009\u62e9\u5141\u8bb8\u7684\u7c7b\u76ee\u3002\u5fc5\u8981\u7c7b\u59cb\u7ec8\u5f00\u542f\u4ee5\u4fdd\u969c\u7ad9\u70b9\u53ef\u7528\u3002",
    acceptAll: "\u5168\u90e8\u5141\u8bb8",
    rejectAll: "\u4ec5\u5fc5\u8981\u7c7b",
    save: "\u4fdd\u5b58\u9009\u62e9",
    captchaHint: "\u8bf7\u5148\u5b8c\u6210\u9a8c\u8bc1\u7801",
  },
};

const LABELS = {
  "en-US": {
    necessary: "Necessary",
    ads: "Advertising",
    other: "Other",
  },
  "zh-CN": {
    necessary: "\u5fc5\u8981",
    ads: "\u5e7f\u544a",
    other: "\u5176\u4ed6",
  },
};

const scriptSource = String.raw`(() => {
  "use strict";
  const CATEGORIES = ${JSON.stringify(CONSENT_CATEGORIES)};
  const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS)};
  const LABELS = ${JSON.stringify(LABELS)};
  const STORAGE_KEYS = {
    consent(siteKey) { return "cookie-pro-consent-" + siteKey; },
    visitor(siteKey) { return "cookie-pro-device-" + siteKey; }
  };
  const FPJS_SRC = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@4/dist/fp.min.js";

  function getStrings(locale) {
    if (!locale) return TRANSLATIONS["en-US"];
    const normalized = locale.toLowerCase();
    if (normalized.startsWith("zh")) return TRANSLATIONS["zh-CN"];
    return TRANSLATIONS["en-US"];
  }

  function getLabels(locale) {
    if (!locale) return LABELS["en-US"];
    const normalized = locale.toLowerCase();
    if (normalized.startsWith("zh")) return LABELS["zh-CN"];
    return LABELS["en-US"];
  }

  function fallbackVisitorId() {
    const nav = window.navigator;
    const screen = window.screen;
    const parts = [
      nav.userAgent,
      nav.language,
      (nav.languages || []).join(","),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      nav.platform,
      String(nav.hardwareConcurrency || ""),
      String(nav.deviceMemory || ""),
      screen ? [screen.width, screen.height, window.devicePixelRatio || 1, screen.colorDepth || 24].join("x") : ""
    ];
    const encoder = new TextEncoder();
    const data = encoder.encode(parts.join("|"));
    return crypto.subtle.digest("SHA-256", data).then((buffer) => {
      const bytes = Array.from(new Uint8Array(buffer));
      return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
    });
  }

  function loadScript(src, attrs = {}) {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[data-cookie-pro="' + src + '"]')) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.cookiePro = src;
      Object.entries(attrs).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  async function loadFingerprintVisitorId(fpKey) {
    try {
      await loadScript(FPJS_SRC, fpKey ? { "data-fpjs-key": fpKey } : {});
      if (!window.FingerprintJS) return null;
      const fp = await window.FingerprintJS.load({ monitoring: false });
      const result = await fp.get();
      return result.visitorId;
    } catch (error) {
      console.warn("[cookie-pro] fingerprint fallback", error);
      return null;
    }
  }

  function readJSON(key) {
    try {
      const value = window.localStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  }

  function persistVisitorId(siteKey, visitorId) {
    writeJSON(STORAGE_KEYS.visitor(siteKey), { visitorId, storedAt: Date.now() });
  }

  function getVisitorSnapshot(siteKey) {
    const entry = readJSON(STORAGE_KEYS.visitor(siteKey));
    return entry?.visitorId ?? null;
  }

  async function ensureVisitorId(siteKey) {
    const cached = getVisitorSnapshot(siteKey);
    if (cached) return cached;
    const script = document.currentScript;
    const fpKey = script?.dataset.fpjsKey || script?.getAttribute("data-fpjs-key");
    const fromFp = await loadFingerprintVisitorId(fpKey);
    const visitorId = fromFp || (await fallbackVisitorId());
    persistVisitorId(siteKey, visitorId);
    return visitorId;
  }

  function getApiBase(scriptElement) {
    try {
      const src = scriptElement?.src;
      if (!src) return window.location.origin;
      return new URL(src).origin;
    } catch {
      return window.location.origin;
    }
  }

  async function fetchStatus({ apiBase, siteKey, visitorId }) {
    const url = new URL("/api/consent/status", apiBase);
    url.searchParams.set("site_key", siteKey);
    if (visitorId) url.searchParams.set("visitorId", visitorId);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      credentials: "omit",
    });
    if (!res.ok) throw new Error("Failed to load consent status");
    return res.json();
  }

  async function submitConsent({ apiBase, body }) {
    const res = await fetch(apiBase + "/api/consent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "omit",
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      const error = payload?.error?.message || "Failed to store consent";
      throw new Error(error);
    }
    return res.json();
  }

  async function sendMinimalTelemetry({ apiBase, payload }) {
    try {
      await fetch(apiBase + "/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit",
      });
    } catch (error) {
      console.warn("[cookie-pro] telemetry failed", error);
    }
  }

  function shouldShowModal(status, snapshot) {
    if (!status) return true;
    if (status.needConsent) return true;
    if (!snapshot) return false;
    return snapshot.policyVersion !== status.policyVersion;
  }

  function createModal({ strings, labels, siteKey, defaultChoices, captchaConfig }) {
    const host = document.createElement("div");
    host.setAttribute("data-cookie-pro", siteKey);
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = \`
      :host { all: initial; }
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 15, 15, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2147483646;
      }
      .modal {
        width: min(480px, 90vw);
        background: #fff;
        color: #111;
        border-radius: 16px;
        padding: 24px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        box-shadow: 0 20px 45px rgba(0,0,0,0.25);
      }
      h2 { margin: 0 0 8px; font-size: 1.25rem; }
      p { margin: 0 0 16px; line-height: 1.4; }
      label {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        font-size: 0.95rem;
      }
      label:last-of-type { border-bottom: none; }
      .controls {
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      button {
        flex: 1;
        padding: 10px 14px;
        border-radius: 999px;
        border: none;
        font-size: 0.95rem;
        cursor: pointer;
      }
      button.primary { background: #111; color: #fff; }
      button.secondary { background: #f4f4f5; color: #111; }
      .captcha {
        margin-top: 16px;
      }
      .captcha-hint {
        font-size: 0.85rem;
        color: #555;
        margin-bottom: 8px;
      }
    \`;
    shadow.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const modal = document.createElement("div");
    modal.className = "modal";

    const title = document.createElement("h2");
    title.textContent = strings.title;
    modal.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = strings.description;
    modal.appendChild(desc);

    const form = document.createElement("form");
    form.setAttribute("aria-live", "polite");

    const state = { ...defaultChoices };
    CATEGORIES.forEach((category) => {
      const label = document.createElement("label");
      label.htmlFor = "cookie-pro-" + category;
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = "cookie-pro-" + category;
      input.name = category;
      input.checked = Boolean(state[category]);
      if (category === "necessary") {
        input.disabled = true;
        input.checked = true;
      } else {
        input.addEventListener("change", (event) => {
          state[category] = event.target.checked;
        });
      }
      const span = document.createElement("span");
      span.textContent = labels[category] || category;
      label.appendChild(input);
      label.appendChild(span);
      form.appendChild(label);
    });

    const captchaWrapper = document.createElement("div");
    captchaWrapper.className = "captcha";
    if (captchaConfig) {
      const hint = document.createElement("div");
      hint.className = "captcha-hint";
      hint.textContent = strings.captchaHint;
      captchaWrapper.appendChild(hint);
      const slot = document.createElement("div");
      slot.id = "cookie-pro-captcha";
      captchaWrapper.appendChild(slot);
      form.appendChild(captchaWrapper);
    }

    modal.appendChild(form);

    const controls = document.createElement("div");
    controls.className = "controls";

    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "primary";
    accept.textContent = strings.acceptAll;

    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "secondary";
    reject.textContent = strings.rejectAll;

    const save = document.createElement("button");
    save.type = "submit";
    save.className = "secondary";
    save.textContent = strings.save;

    controls.appendChild(accept);
    controls.appendChild(reject);
    controls.appendChild(save);
    modal.appendChild(controls);

    overlay.appendChild(modal);
    shadow.appendChild(overlay);

    function setAll(value) {
      CATEGORIES.forEach((category) => {
        if (category === "necessary") return;
        state[category] = value;
        const input = form.querySelector('#cookie-pro-' + category);
        if (input) input.checked = value;
      });
    }

    return {
      element: host,
      form,
      controls,
      captchaContainer: captchaWrapper.querySelector("#cookie-pro-captcha") || null,
      onAccept(handler) {
        accept.addEventListener("click", handler);
      },
      onReject(handler) {
        reject.addEventListener("click", handler);
      },
      onSubmit(handler) {
        form.addEventListener("submit", handler);
      },
      setAll,
      getState() {
        return { ...state, necessary: true };
      },
      close() {
        host.remove();
      },
    };
  }

  function createCaptchaManager({ provider, siteKey, container }) {
    if (!provider || !siteKey || !container) return null;
    if (provider === "turnstile") {
      return loadScript("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit").then(() => {
        let latestToken = "";
        const widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback(token) {
            latestToken = token;
          },
        });
        return {
          async getToken() {
            if (latestToken) return latestToken;
            throw new Error("Solve captcha first");
          },
          reset() {
            window.turnstile.reset(widgetId);
            latestToken = "";
          },
        };
      });
    }

    if (provider === "hcaptcha") {
      return loadScript("https://js.hcaptcha.com/1/api.js?render=explicit").then(() => {
        let widgetId = null;
        let latestToken = "";
        widgetId = window.hcaptcha.render(container, {
          sitekey: siteKey,
          callback(token) {
            latestToken = token;
          },
        });
        return {
          async getToken() {
            if (latestToken) return latestToken;
            latestToken = window.hcaptcha.getResponse(widgetId);
            if (latestToken) return latestToken;
            throw new Error("Solve captcha first");
          },
          reset() {
            window.hcaptcha.reset(widgetId);
            latestToken = "";
          },
        };
      });
    }

    // default recaptcha
    return loadScript("https://www.google.com/recaptcha/api.js?render=explicit").then(() => {
      let widgetId = null;
      widgetId = window.grecaptcha.render(container, {
        sitekey: siteKey,
      });
      return {
        async getToken() {
          const token = window.grecaptcha.getResponse(widgetId);
          if (!token) throw new Error("Solve captcha first");
          return token;
        },
        reset() {
          window.grecaptcha.reset(widgetId);
        },
      };
    });
  }

  async function init() {
    const script = document.currentScript;
    if (!script) return;
    const siteKey = script.dataset.siteKey || script.getAttribute("data-site-key");
    const locale = script.dataset.locale || script.getAttribute("data-locale") || navigator.language || "en-US";
    const policyVersion = script.dataset.policyVersion || script.getAttribute("data-policy-version") || "";
    if (!siteKey) {
      console.warn("[cookie-pro] data-site-key missing");
      return;
    }

    const strings = getStrings(locale);
    const labels = getLabels(locale);
    const apiBase = getApiBase(script);

    const visitorId = await ensureVisitorId(siteKey);
    const localSnapshot = readJSON(STORAGE_KEYS.consent(siteKey));

    const status = await fetchStatus({ apiBase, siteKey, visitorId }).catch((error) => {
      console.warn("[cookie-pro] status failed", error);
      return null;
    });

    if (!status) return;

    const snapshotToPersist = status.choices
      ? { policyVersion: status.policyVersion, choices: status.choices }
      : localSnapshot;
    if (snapshotToPersist) {
      writeJSON(STORAGE_KEYS.consent(siteKey), snapshotToPersist);
    }

    await sendMinimalTelemetry({
      apiBase,
      payload: {
        site_key: siteKey,
        visitorId,
        events: [
          {
            type: "page_view_minimal",
            url: window.location.href,
            referrer: document.referrer || undefined,
            ua: navigator.userAgent,
            ts: Date.now(),
          },
        ],
      },
    });

    if (!shouldShowModal(status, localSnapshot ?? null)) {
      return;
    }

    const defaultChoices = Object.assign(
      { necessary: true },
      localSnapshot?.choices || status.choices || { necessary: true },
    );

    const modal = createModal({
      strings,
      labels,
      siteKey,
      defaultChoices,
      captchaConfig: status.needCaptcha ? status.captcha : null,
    });

    let captchaManagerPromise = null;
    if (status.needCaptcha && modal.captchaContainer) {
      captchaManagerPromise = createCaptchaManager({
        provider: status.captcha?.provider,
        siteKey: status.captcha?.siteKey,
        container: modal.captchaContainer,
      }).catch((error) => {
        console.warn("[cookie-pro] captcha failed", error);
        return null;
      });
    }

    modal.onAccept(async () => {
      modal.setAll(true);
      modal.form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });

    modal.onReject(() => {
      modal.setAll(false);
      modal.form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
    });

    modal.onSubmit(async (event) => {
      event.preventDefault();
      const choices = modal.getState();
      let captchaToken = null;
      if (status.needCaptcha && captchaManagerPromise) {
        const manager = await captchaManagerPromise;
        if (manager) {
          captchaToken = await manager.getToken();
        }
      }

      try {
        await submitConsent({
          apiBase,
          body: {
            site_key: siteKey,
            policy_version: policyVersion || status.policyVersion,
            choices,
            visitorId,
            captcha: captchaToken
              ? {
                  provider: status.captcha?.provider,
                  token: captchaToken,
                }
              : undefined,
          },
        });
        writeJSON(STORAGE_KEYS.consent(siteKey), {
          policyVersion: policyVersion || status.policyVersion,
          choices,
        });
        await sendMinimalTelemetry({
          apiBase,
          payload: {
            site_key: siteKey,
            visitorId,
            events: [
              {
                type: "consent_submit",
                purpose: "necessary",
                url: window.location.href,
                referrer: document.referrer || undefined,
                ua: navigator.userAgent,
                ts: Date.now(),
              },
            ],
          },
        });
        modal.close();
      } catch (error) {
        alert(error.message);
      }
    });

    document.body.appendChild(modal.element);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", () => init(), { once: true });
  }
})();`;

export function GET() {
  return new Response(scriptSource, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}





