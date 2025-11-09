"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";

import { findUserByEmail } from "@/lib/users";
import { setUserSession, clearUserSession } from "@/lib/security/user-session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input." };
  }
  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);
  if (!user) {
    return { error: "Account not found." };
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return { error: "Invalid credentials." };
  }
  await setUserSession(user);
  return { success: true };
}

export async function logoutAction() {
  await clearUserSession();
}
