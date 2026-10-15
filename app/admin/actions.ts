"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { remove } from "../lib/store";
import { isAdmin, tokenOf } from "../lib/auth";

export async function login(formData: FormData) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || formData.get("password") !== pw) redirect("/admin?e=1");
  (await cookies()).set("admin", tokenOf(pw), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete({ name: "admin", path: "/admin" });
  redirect("/admin");
}

export async function deleteRsvp(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  await remove(String(formData.get("id")));
  redirect("/admin");
}
