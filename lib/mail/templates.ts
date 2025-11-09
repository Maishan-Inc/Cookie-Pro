import { defaultTemplates } from "@/mail/templates";
import { getServiceRoleClient } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export async function getTemplate({
  key,
  locale,
}: {
  key: string;
  locale: "en" | "zh";
}) {
  const client = getServiceRoleClient();
  const { data } = await client
    .from("email_templates")
    .select("*")
    .eq("template_key", key)
    .eq("locale", locale)
    .maybeSingle();
  if (data) {
    const template = data as Database["public"]["Tables"]["email_templates"]["Row"];
    return { subject: template.subject, body: template.body };
  }
  const fallback =
    defaultTemplates[key]?.[locale] ??
    defaultTemplates[key]?.en ?? {
      subject: `${key}`,
      body: "{{CODE}}",
    };
  return fallback;
}

export async function upsertTemplate({
  key,
  locale,
  subject,
  body,
}: {
  key: string;
  locale: "en" | "zh";
  subject: string;
  body: string;
}) {
  const client = getServiceRoleClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (client.from("email_templates") as any).upsert({
    template_key: key,
    locale,
    subject,
    body,
  });
  if (error) throw error;
}
