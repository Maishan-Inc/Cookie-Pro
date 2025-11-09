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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      admin_settings: {
        Row: {
          id: number;
          admin_name: string;
          admin_password_hash: string;
          admin_path: string;
          install_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          admin_name: string;
          admin_password_hash: string;
          admin_path: string;
          install_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          admin_name?: string;
          admin_password_hash?: string;
          admin_path?: string;
          install_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: number;
          email: string;
          name: string;
          password_hash: string;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          name: string;
          password_hash: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          name?: string;
          password_hash?: string;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      smtp_settings: {
        Row: {
          id: number;
          host: string;
          port: number;
          secure: boolean;
          username: string;
          password: string;
          from_name: string;
          from_email: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          host: string;
          port?: number;
          secure?: boolean;
          username: string;
          password: string;
          from_name: string;
          from_email: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          host?: string;
          port?: number;
          secure?: boolean;
          username?: string;
          password?: string;
          from_name?: string;
          from_email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_templates: {
        Row: {
          id: number;
          template_key: string;
          locale: string;
          subject: string;
          body: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          template_key: string;
          locale?: string;
          subject: string;
          body: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          template_key?: string;
          locale?: string;
          subject?: string;
          body?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_codes: {
        Row: {
          id: number;
          email: string;
          code_hash: string;
          purpose: string;
          expires_at: string;
          consumed: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          email: string;
          code_hash: string;
          purpose: string;
          expires_at: string;
          consumed?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          email?: string;
          code_hash?: string;
          purpose?: string;
          expires_at?: string;
          consumed?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          id: number;
          product_name: string;
          default_locale: string;
          theme_preference: string;
          allow_self_signup: boolean;
          support_email: string | null;
          telemetry_retention_days: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          product_name?: string;
          default_locale?: string;
          theme_preference?: string;
          allow_self_signup?: boolean;
          support_email?: string | null;
          telemetry_retention_days?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          product_name?: string;
          default_locale?: string;
          theme_preference?: string;
          allow_self_signup?: boolean;
          support_email?: string | null;
          telemetry_retention_days?: number;
          updated_at?: string;
        };
        Relationships: [];
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
      pg_version_text: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_usage_overview: {
        Args: Record<PropertyKey, never>;
        Returns: Array<{
          sites: number;
          devices: number;
          consents: number;
          events: number;
          events_24h: number;
          consents_24h: number;
          last_event: string | null;
          last_consent: string | null;
        }>;
      };
      get_usage_by_site: {
        Args: { p_limit?: number };
        Returns: Array<{
          site_id: number;
          site_name: string;
          site_key: string;
          total_events: number;
          events_24h: number;
          total_consents: number;
          consents_24h: number;
          last_event: string | null;
        }>;
      };
    };
  };
}
