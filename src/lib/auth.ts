import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDemo } from "./db";

const COOKIE = "dbs_admin";
// Di mode demo kata sandi bawaan "admin". Di produksi wajib isi ADMIN_PASSWORD.
const password = process.env.ADMIN_PASSWORD || (isDemo ? "admin" : "");
const token = () => createHash("sha256").update(`dibersamai:${password}:${process.env.ADMIN_SECRET ?? ""}`).digest("hex");

export async function isAdmin() {
  return !!password && (await cookies()).get(COOKIE)?.value === token();
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function login(input: string) {
  if (!password || input !== password) return false;
  (await cookies()).set(COOKIE, token(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  return true;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}
