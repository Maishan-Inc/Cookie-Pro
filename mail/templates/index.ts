import { verificationTemplateEn } from "@/mail/templates/verification.en";
import { verificationTemplateZh } from "@/mail/templates/verification.zh";

type TemplateDefinition = {
  subject: string;
  body: string;
};

export const defaultTemplates: Record<
  string,
  Record<string, TemplateDefinition>
> = {
  verification_code: {
    en: verificationTemplateEn,
    zh: verificationTemplateZh,
  },
};
