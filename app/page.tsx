import Link from "next/link";
import { activeProducts, coverUrl } from "@/lib/db";
import { formatMnt, pick, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { lang, d } = await t();
  const products = await activeProducts();
  return (
    <>
      <h1>{d.all}</h1>
      <p className="muted">{d.tagline}</p>
      {products.length === 0 && <p className="muted">{d.empty}</p>}
      <div className="grid">
        {products.map((p) => {
          const cover = coverUrl(p.cover_path);
          return (
            <Link key={p.id} href={`/p/${p.slug}`} className="card">
              {cover ? <img className="cover" src={cover} alt="" /> : <div className="cover" />}
              <div className="body">
                <span className="tag">{d.kind[p.kind]}</span>
                <h3>{pick(lang, p.title_mn, p.title_en)}</h3>
                <span className="price">{formatMnt(p.price_mnt)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
