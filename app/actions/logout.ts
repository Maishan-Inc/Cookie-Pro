"use server";

import { redirect } from "next/navigation";

import { clearUserSession } from "@/lib/security/user-session";

export async function logoutUser() {
  await clearUserSession();
  redirect("/");
}
