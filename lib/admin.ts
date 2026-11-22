import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "admin";

function sign(value: string): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || secret.length < 16) throw new Error("ADMIN_SECRET must be set (16+ characters).");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(sign(input));
  const b = Buffer.from(sign(expected));
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminCookie() {
  const expires = Date.now() + 7 * 24 * 3600 * 1000;
  const value = `${expires}.${sign(String(expires))}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  try {
    const good = Buffer.from(sign(exp));
    const given = Buffer.from(sig);
    return good.length === given.length && timingSafeEqual(good, given);
  } catch {
    return false;
  }
}
