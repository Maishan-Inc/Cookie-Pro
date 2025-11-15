import { notFound, redirect } from "next/navigation";

import { fetchAdminSettings } from "@/lib/admin-settings";

type Props = {
  params: { entry: string };
};

export default async function AdminEntryPage({ params }: Props) {
  const settings = await fetchAdminSettings();
  if (!settings) {
    redirect("/install");
  }

  const requested = decodeURIComponent(params.entry ?? "");
  if (!requested || requested.toLowerCase() !== settings.admin_path.toLowerCase()) {
    notFound();
  }

  redirect(`/admin-login?entry=${settings.admin_path}`);
}

