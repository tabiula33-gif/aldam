"use client";

import Link from "next/link";
import { useRef } from "react";
import { IconArrow } from "./icons";

export default function ProductRow({
  title, viewAllHref, viewAllLabel, count, children,
}: {
  title: string; viewAllHref?: string; viewAllLabel: string; count?: number; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="prow">
      <div className="prow-head">
        <h2>{title}</h2>
        <div className="prow-actions">
          {viewAllHref && (
            <Link href={viewAllHref} className="pill">
              {viewAllLabel}{typeof count === "number" ? ` (${count})` : ""} <IconArrow size={14} />
            </Link>
          )}
          <button className="round" onClick={() => scroll(-1)} aria-label="Previous"><IconArrow size={16} dir="left" /></button>
          <button className="round" onClick={() => scroll(1)} aria-label="Next"><IconArrow size={16} /></button>
        </div>
      </div>
      <div className="prow-track" ref={ref}>{children}</div>
    </section>
  );
}
