"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { fetchAdminSettings } from "@/lib/admin-settings";
import { setAdminSession } from "@/lib/security/admin-session";

export async function authenticateAdmin({
  password,
  entry,
}: {
  password: string;
  entry: string;
}) {
  const settings = await fetchAdminSettings();
  if (!settings) {
    throw new Error("Installation incomplete.");
  }
  if (settings.admin_path !== entry) {
    throw new Error("Invalid admin alias.");
  }
  const ok = await bcrypt.compare(password, settings.admin_password_hash);
  if (!ok) {
    throw new Error("Incorrect password.");
  }
  await setAdminSession(settings.admin_password_hash);
  redirect("/admin-dashboard");
}
