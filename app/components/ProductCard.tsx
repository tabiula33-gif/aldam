import Link from "next/link";
import { coverUrl, discountPercent, type Product } from "@/lib/db";
import { formatMnt, productText, type Dict, type Lang } from "@/lib/i18n";
import { kindIcon } from "./icons";

export default function ProductCard({ p, lang, d }: { p: Product; lang: Lang; d: Dict }) {
  const cover = coverUrl(p.cover_path);
  const off = discountPercent(p);
  const Icon = kindIcon[p.kind];
  const text = productText(lang, p);
  return (
    <Link href={`/p/${p.slug}`} className="pcard">
      <div className={`pcard-img tint-${p.kind}`}>
        {cover ? <img src={cover} alt="" loading="lazy" /> : <span className="pcard-icon"><Icon size={44} /></span>}
        {off && <span className="badge-off">−{off}%</span>}
      </div>
      <div className={`pcard-name${text.script ? " vt" : ""}`}>{text.title}</div>
      <div className="pcard-price">
        <strong>{formatMnt(p.price_mnt)}</strong>
        {off && <s>{formatMnt(p.compare_at_mnt!)}</s>}
      </div>
      <div className={`pcard-kind k-${p.kind}`}><span className="vt">{d.kind[p.kind]}</span></div>
    </Link>
  );
}
