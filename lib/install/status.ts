import { fetchAdminSettings } from "@/lib/admin-settings";

export async function needsInstallation() {
  try {
    const settings = await fetchAdminSettings();
    return !settings || settings.install_complete !== true;
  } catch {
    return true;
  }
}
