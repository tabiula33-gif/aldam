import Link from "next/link";
import { activeProducts, discountPercent, type Product } from "@/lib/db";
import { t } from "@/lib/i18n";
import ProductCard from "../components/ProductCard";

export const dynamic = "force-dynamic";

type SP = { kind?: string; q?: string; price?: string; sort?: string; sale?: string };

const PRICE = [
  (p: Product) => p.price_mnt < 10000,
  (p: Product) => p.price_mnt >= 10000 && p.price_mnt <= 30000,
  (p: Product) => p.price_mnt > 30000,
];

export default async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { lang, d } = await t();
  let items = await activeProducts();

  const kind = (["pdf", "planner", "course"] as const).find((k) => k === sp.kind);
  if (kind) items = items.filter((p) => p.kind === kind);
  const q = (sp.q ?? "").trim().toLowerCase();
  if (q) items = items.filter((p) => [p.title_mn, p.title_en, p.description_mn, p.description_en].some((s) => s.toLowerCase().includes(q)));
  const priceIdx = Number(sp.price);
  if (PRICE[priceIdx]) items = items.filter(PRICE[priceIdx]);
  if (sp.sale === "1") items = items.filter((p) => discountPercent(p));
  if (sp.sort === "low") items = [...items].sort((a, b) => a.price_mnt - b.price_mnt);
  if (sp.sort === "high") items = [...items].sort((a, b) => b.price_mnt - a.price_mnt);

  // Build a link that changes one filter and keeps the rest.
  const link = (patch: Partial<SP>) => {
    const next = { ...sp, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };
  const opt = (on: boolean, href: string, label: string) => (
    <Link href={href} className={`opt ${on ? "on" : ""}`}><span className="radio" /><span className="vt">{label}</span></Link>
  );

  return (
    <div className="wrap page">
      <nav className="crumbs"><Link href="/" className="vt">{d.home}</Link> / <span className="vt">{kind ? d.kind[kind] : d.shop}</span></nav>
      <div className="shop">
        <aside className="filters">
          <div className="filters-head">
            <strong className="vt">{d.filters}</strong>
            <Link href="/shop" className="muted vt">{d.reset}</Link>
          </div>
          <div className="fgroup">
            <h4 className="vt">{d.type}</h4>
            {opt(!kind, link({ kind: undefined }), d.any)}
            {(["pdf", "planner", "course"] as const).map((k) => opt(kind === k, link({ kind: k }), d.kind[k]))}
          </div>
          <div className="fgroup">
            <h4 className="vt">{d.price}</h4>
            {opt(!PRICE[priceIdx], link({ price: undefined }), d.any)}
            {d.priceRanges.map((label, i) => opt(priceIdx === i && !!sp.price, link({ price: String(i) }), label))}
          </div>
          <div className="fgroup">
            <h4 className="vt">{d.sort}</h4>
            {opt(!sp.sort, link({ sort: undefined }), d.sortNew)}
            {opt(sp.sort === "low", link({ sort: "low" }), d.sortLow)}
            {opt(sp.sort === "high", link({ sort: "high" }), d.sortHigh)}
          </div>
          <div className="fgroup">
            {opt(sp.sale === "1", link({ sale: sp.sale === "1" ? undefined : "1" }), d.onSale)}
          </div>
        </aside>
        <section>
          <div className="shop-head">
            <h1 className={q ? "" : "vt"}>{q ? `“${sp.q}”` : kind ? d.kind[kind] : d.shop}</h1>
            <span className="muted">{items.length} <span className="vt">{d.results}</span></span>
          </div>
          {items.length === 0 ? (
            <p className="empty"><span className="vt">{d.noResults}</span></p>
          ) : (
            <div className="pgrid">{items.map((p) => <ProductCard key={p.id} p={p} lang={lang} d={d} />)}</div>
          )}
        </section>
      </div>
    </div>
  );
}
