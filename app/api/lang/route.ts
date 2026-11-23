import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const req2 = url.searchParams.get("to");
  const to = req2 === "en" || req2 === "mong" ? req2 : "mn";
  // Only return to a page on this site.
  let path = "/";
  const ref = req.headers.get("referer");
  if (ref) {
    try {
      const r = new URL(ref);
      if (r.host === url.host) path = r.pathname + r.search;
    } catch {}
  }
  const res = NextResponse.redirect(new URL(path, url));
  res.cookies.set("lang", to, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  return res;
}
