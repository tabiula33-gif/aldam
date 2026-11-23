import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { activeProducts, coverUrl, discountPercent, productBySlug } from "@/lib/db";
import { formatMnt, pick, t } from "@/lib/i18n";
import { createOrder } from "@/lib/orders";
import ProductCard from "../../components/ProductCard";
import ProductRow from "../../components/ProductRow";
import { IconBolt, IconHeart, IconShield, kindIcon } from "../../components/icons";

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
  const off = discountPercent(p);
  const Icon = kindIcon[p.kind];
  const title = pick(lang, p.title_mn, p.title_en);
  const desc = pick(lang, p.description_mn, p.description_en);
  const similar = (await activeProducts()).filter((x) => x.id !== p.id).sort((a, b) => Number(b.kind === p.kind) - Number(a.kind === p.kind)).slice(0, 10);

  return (
    <div className="wrap page">
      <nav className="crumbs">
        <Link href="/">{d.home}</Link> / <Link href={`/shop?kind=${p.kind}`}>{d.kind[p.kind]}</Link> / <span>{title}</span>
      </nav>
      <div className="pd">
        <div className={`pd-img tint-${p.kind}`}>
          {cover ? <img src={cover} alt="" /> : <Icon size={120} />}
          {off && <span className="badge-off big">−{off}%</span>}
        </div>
        <div className="pd-info">
          <h1>{title}</h1>
          <div className="pd-price">
            <strong>{formatMnt(p.price_mnt)}</strong>
            {off && <><s>{formatMnt(p.compare_at_mnt!)}</s><span className="save">{off}% {d.off}</span></>}
          </div>
          <form action={buy} className="buybox">
            <input type="hidden" name="slug" value={p.slug} />
            <label htmlFor="email">{d.email}</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" />
            <p className="hint">{d.emailHint}</p>
            {err === "email" && <p className="error">✕ {d.email}</p>}
            <button className="btn full" type="submit">{d.buy}</button>
          </form>
          <ul className="about">
            <li><span className="ab-ic"><IconBolt /></span>{d.aboutInstant}</li>
            <li><span className="ab-ic"><IconShield /></span>{d.aboutQpay}</li>
            <li><span className="ab-ic"><IconHeart /></span>{d.aboutLocal}</li>
          </ul>
        </div>
      </div>

      {desc && (
        <section className="pd-desc">
          <h2>{d.details}</h2>
          <p>{desc}</p>
        </section>
      )}

      {similar.length > 0 && (
        <ProductRow title={d.similar} viewAllLabel={d.viewAll}>
          {similar.map((x) => <ProductCard key={x.id} p={x} lang={lang} d={d} />)}
        </ProductRow>
      )}
    </div>
  );
}
