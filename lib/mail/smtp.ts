import nodemailer from "nodemailer";

import { getServiceRoleClient } from "@/lib/supabase";

export type SmtpSettings =
  | {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
      from_name: string;
      from_email: string;
    }
  | null;

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const client = getServiceRoleClient();
  const { data, error } = await client.from("smtp_settings").select("*").limit(1).maybeSingle();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ?? null;
}

export async function upsertSmtpSettings(settings: SmtpSettings & { id?: number }) {
  const client = getServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from("smtp_settings") as any).upsert(settings, { onConflict: "id" });
  if (error) throw error;
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const settings = await getSmtpSettings();
  if (!settings) {
    throw new Error("SMTP settings not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });

  await transporter.sendMail({
    from: `${settings.from_name} <${settings.from_email}>`,
    to,
    subject,
    html,
  });
}
