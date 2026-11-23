import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { activeProducts, coverUrl, discountPercent, productBySlug } from "@/lib/db";
import { formatMnt, num, productText, t } from "@/lib/i18n";
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
  const text = productText(lang, p);
  const title = text.title;
  const desc = text.desc;
  const similar = (await activeProducts()).filter((x) => x.id !== p.id).sort((a, b) => Number(b.kind === p.kind) - Number(a.kind === p.kind)).slice(0, 10);

  return (
    <div className="wrap page">
      <nav className="crumbs">
        <Link href="/" className="vt">{d.home}</Link> / <Link href={`/shop?kind=${p.kind}`} className="vt">{d.kind[p.kind]}</Link> / <span className={text.script ? "vt" : ""}>{title}</span>
      </nav>
      <div className="pd">
        <div className={`pd-img tint-${p.kind}`}>
          {cover ? <img src={cover} alt="" /> : <Icon size={120} />}
          {off && <span className="badge-off big">−{num(lang, off)}%</span>}
        </div>
        <div className="pd-info">
          <h1 className={text.script ? "vt" : ""}>{title}</h1>
          <div className="pd-price">
            <strong>{formatMnt(p.price_mnt, lang)}</strong>
            {off && <><s>{formatMnt(p.compare_at_mnt!, lang)}</s><span className="save">{num(lang, off)}% <span className="vt">{d.off}</span></span></>}
          </div>
          <form action={buy} className="buybox">
            <input type="hidden" name="slug" value={p.slug} />
            <label htmlFor="email" className="vt">{d.email}</label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" />
            <p className="hint vt">{d.emailHint}</p>
            {err === "email" && <p className="error">✕ {d.email}</p>}
            <button className="btn full" type="submit"><span className="vt">{d.buy}</span></button>
          </form>
          <ul className="about">
            <li><span className="ab-ic"><IconBolt /></span><span className="vt">{d.aboutInstant}</span></li>
            <li><span className="ab-ic"><IconShield /></span><span className="vt">{d.aboutQpay}</span></li>
            <li><span className="ab-ic"><IconHeart /></span><span className="vt">{d.aboutLocal}</span></li>
          </ul>
        </div>
      </div>

      {desc && (
        <section className="pd-desc">
          <h2 className="vt">{d.details}</h2>
          <p className={text.descScript ? "vt desc-vt" : ""}>{desc}</p>
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
