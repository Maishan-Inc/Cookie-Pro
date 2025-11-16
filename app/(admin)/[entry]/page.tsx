import { notFound, redirect } from "next/navigation";

import { fetchAdminSettings } from "@/lib/admin-settings";

type Props = {
  params: { entry?: string };
};

export default async function AdminAliasPage({ params }: Props) {
  const settings = await fetchAdminSettings();
  if (!settings) {
    redirect("/install");
  }

  const requested = decodeURIComponent(params.entry ?? "").replace(/^\//, "");
  if (!requested || requested !== settings.admin_path) {
    notFound();
  }

  redirect(`/admin-login?entry=${settings.admin_path}`);
}

