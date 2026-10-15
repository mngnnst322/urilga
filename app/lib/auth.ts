import { cookies } from "next/headers";
import { createHash } from "crypto";

export const tokenOf = (pw: string) => createHash("sha256").update("urilga:" + pw).digest("hex");

export async function isAdmin() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return (await cookies()).get("admin")?.value === tokenOf(pw);
}
