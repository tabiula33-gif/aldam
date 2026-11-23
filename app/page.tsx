import Link from "next/link";
import { activeProducts, bestSellerIds, coverUrl, type Product } from "@/lib/db";
import { num, t } from "@/lib/i18n";
import ProductCard from "./components/ProductCard";
import ProductRow from "./components/ProductRow";
import { IconArrow, kindIcon } from "./components/icons";

export const dynamic = "force-dynamic";

const KINDS = ["planner", "pdf", "course"] as const;

export default async function Home() {
  const { lang, d } = await t();
  const [all, ranked] = await Promise.all([activeProducts(), bestSellerIds()]);
  const byId = new Map(all.map((p) => [p.id, p]));
  const best = ranked.map((id) => byId.get(id)).filter((p): p is Product => !!p);
  // Until there are sales, fill "best sellers" with the newest products.
  for (const p of all) if (best.length < 10 && !best.includes(p)) best.push(p);

  const firstCover = (k: Product["kind"]) => coverUrl(all.find((p) => p.kind === k && p.cover_path)?.cover_path ?? null);
  const card = (p: Product) => <ProductCard key={p.id} p={p} lang={lang} d={d} />;

  const banners = [
    { cls: "b-main", tag: d.b1Tag, title: d.b1Title, text: d.b1Text, href: "/shop?kind=planner", img: firstCover("planner"), Icon: kindIcon.planner },
    { cls: "b-red", title: d.b2Title, text: d.b2Text, href: "/shop?kind=course", img: firstCover("course"), Icon: kindIcon.course },
    { cls: "b-gold", title: d.b3Title, text: d.b3Text, href: "/shop?kind=pdf", img: firstCover("pdf"), Icon: kindIcon.pdf },
  ];

  return (
    <div className="wrap home">
      <div className="home-cols">
      <section className="banners">
        {banners.map((b) => (
          <Link key={b.cls} href={b.href} className={`banner ${b.cls}`}>
            <div className="banner-text">
              {b.tag && <span className="banner-tag vt">{b.tag}</span>}
              <h2 className="vt">{b.title}</h2>
              <p className="vt">{b.text}</p>
              <span className="banner-go" aria-hidden="true"><IconArrow size={18} /></span>
            </div>
            <div className="banner-art">
              {b.img ? <img src={b.img} alt="" /> : <b.Icon size={b.cls === "b-main" ? 120 : 72} />}
            </div>
          </Link>
        ))}
      </section>

      <div className="home-rows">
      {all.length === 0 ? (
        <p className="empty"><span className="vt">{d.empty}</span></p>
      ) : (
        <>
          <ProductRow title={d.bestSellers} viewAllHref="/shop" viewAllLabel={d.viewAll} count={num(lang, all.length)}>
            {best.slice(0, 10).map(card)}
          </ProductRow>
          {KINDS.map((k) => {
            const items = all.filter((p) => p.kind === k);
            if (items.length === 0) return null;
            return (
              <ProductRow key={k} title={d.kind[k]} viewAllHref={`/shop?kind=${k}`} viewAllLabel={d.viewAll} count={num(lang, items.length)}>
                {items.slice(0, 12).map(card)}
              </ProductRow>
            );
          })}
        </>
      )}
      </div>
      </div>
    </div>
  );
}
