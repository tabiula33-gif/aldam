import Link from "next/link";
import { activeProducts, coverUrl, type Product } from "@/lib/db";
import { formatMnt, pick, t, type Dict, type Lang } from "@/lib/i18n";
import { KeyBorder, Ulzii } from "./ornaments";

export const dynamic = "force-dynamic";

const KINDS = ["pdf", "planner", "course"] as const;

function ProductCard({ p, lang, d }: { p: Product; lang: Lang; d: Dict }) {
  const cover = coverUrl(p.cover_path);
  return (
    <Link href={`/p/${p.slug}`} className="card">
      {cover ? (
        <img className="cover" src={cover} alt="" loading="lazy" />
      ) : (
        <div className={`cover placeholder ${p.kind}`}><Ulzii size={56} /></div>
      )}
      <div className="body">
        <span className={`tag ${p.kind}`}>{d.kind[p.kind]}</span>
        <h3>{pick(lang, p.title_mn, p.title_en)}</h3>
        <span className="price">{formatMnt(p.price_mnt)}</span>
      </div>
    </Link>
  );
}

const perkIcons = ["₮", "↓", "★"];

export default async function Home({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const { lang, d } = await t();
  const all = await activeProducts();
  const filter = KINDS.find((k) => k === kind);
  const products = filter ? all.filter((p) => p.kind === filter) : all;

  return (
    <>
      <section className="hero">
        <Ulzii size={420} className="ulzii-bg" />
        <div className="wrap">
          <h1>{d.heroTitle}</h1>
          <p>{d.heroText}</p>
          <a href="#products" className="btn gold">{d.browse}</a>
        </div>
        <KeyBorder />
      </section>

      <div className="wrap">
        <div className="perks">
          {d.perks.map((perk, i) => (
            <div className="perk" key={perk}>
              <span className="dot">{perkIcons[i]}</span>
              {perk}
            </div>
          ))}
        </div>

        <div className="section-head" id="products">
          <h2>{filter ? d.kind[filter] : d.newest}</h2>
          <span className="muted">{products.length}</span>
        </div>

        {products.length === 0 ? (
          <div className="empty">
            <Ulzii size={40} />
            <p>{d.empty}</p>
          </div>
        ) : (
          <div className="grid">
            {products.map((p) => <ProductCard key={p.id} p={p} lang={lang} d={d} />)}
          </div>
        )}
      </div>
    </>
  );
}
