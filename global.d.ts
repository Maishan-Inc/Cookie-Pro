declare global {
  interface Window {
    FingerprintJS?: {
      load: (config?: Record<string, unknown>) => Promise<{
        get: () => Promise<{ visitorId: string }>;
      }>;
    };
    turnstile: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback(token: string): void },
      ) => string;
      reset: (id: string) => void;
    };
    hcaptcha: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback(token: string): void },
      ) => string;
      reset: (id: string) => void;
      getResponse: (id: string | null) => string;
    };
    grecaptcha: {
      render: (
        el: HTMLElement,
        options: { sitekey: string; callback?: (token: string) => void },
      ) => string;
      reset: (id: string) => void;
      getResponse: (id: string) => string;
    };
  }
}

export {};
