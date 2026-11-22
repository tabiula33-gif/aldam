import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { coverUrl, productBySlug } from "@/lib/db";
import { formatMnt, pick, t } from "@/lib/i18n";
import { createOrder } from "@/lib/orders";
import { Ulzii } from "../../ornaments";

export const dynamic = "force-dynamic";

async function buy(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const product = await productBySlug(slug);
  if (!product || !product.active) notFound();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`/p/${slug}?err=email`);
  const order = await createOrder(product, email);
  redirect(`/order/${order.id}`);
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  const { slug } = await params;
  const { err } = await searchParams;
  const { lang, d } = await t();
  const p = await productBySlug(slug);
  if (!p || !p.active) notFound();
  const cover = coverUrl(p.cover_path);
  return (
    <div className="wrap page">
      <Link href="/" className="back">← {d.back}</Link>
      <div className="detail">
        <div>
          {cover ? (
            <img className="cover" src={cover} alt="" />
          ) : (
            <div className={`cover placeholder ${p.kind}`} style={{ borderRadius: 14 }}><Ulzii size={96} /></div>
          )}
        </div>
        <div>
          <span className={`tag ${p.kind}`}>{d.kind[p.kind]}</span>
          <h1>{pick(lang, p.title_mn, p.title_en)}</h1>
          <p className="price">{formatMnt(p.price_mnt)}</p>
          <p className="desc">{pick(lang, p.description_mn, p.description_en)}</p>
          <form action={buy} className="panel">
            <input type="hidden" name="slug" value={p.slug} />
            <label htmlFor="email">{d.email}</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" />
            <p className="muted" style={{ fontSize: "0.8rem", margin: "6px 0 0" }}>{d.emailHint}</p>
            {err === "email" && <p className="error">✕ {d.email}</p>}
            <button className="btn full" type="submit">{d.buy} · {formatMnt(p.price_mnt)}</button>
            <ul className="assure">
              <li>{d.secure}</li>
              <li>{d.whatYouGet}</li>
            </ul>
          </form>
        </div>
      </div>
    </div>
  );
}
