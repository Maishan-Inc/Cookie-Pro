export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: number;
          name: string;
          site_key: string;
          site_salt: string;
          policy_version: string;
          captcha_provider: "recaptcha" | "hcaptcha" | "turnstile" | null;
          captcha_site_key: string | null;
          captcha_secret: string | null;
          origin_whitelist: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sites"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["sites"]["Row"]>;
      };
      devices: {
        Row: {
          id: number;
          site_id: number;
          device_id: string;
          first_seen_at: string;
          last_seen_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["devices"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["devices"]["Row"]>;
      };
      consents: {
        Row: {
          id: number;
          site_id: number;
          device_id: string;
          policy_version: string;
          choices: Json;
          user_agent: string | null;
          ip_truncated: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["consents"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["consents"]["Row"]>;
      };
      events: {
        Row: {
          id: number;
          site_id: number;
          device_id: string;
          type: string;
          url: string | null;
          referrer: string | null;
          ua: string | null;
          ip_truncated: string | null;
          ts: string;
          payload: Json | null;
          purpose: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
      };
    };
    Functions: {
      get_consent_dashboard: {
        Args: { p_site_key: string };
        Returns: Array<{
          d: string;
          total: number;
          necessary_ok: number;
          ads_ok: number;
        }>;
      };
    };
  };
}
