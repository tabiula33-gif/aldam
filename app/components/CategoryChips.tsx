"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconAll, kindIcon } from "./icons";

type Labels = { all: string; pdf: string; planner: string; course: string };

export default function CategoryChips({ labels }: { labels: Labels }) {
  const path = usePathname();
  const kind = useSearchParams().get("kind");
  const items = [
    { href: "/shop", label: labels.all, k: null, Icon: IconAll },
    { href: "/shop?kind=pdf", label: labels.pdf, k: "pdf", Icon: kindIcon.pdf },
    { href: "/shop?kind=planner", label: labels.planner, k: "planner", Icon: kindIcon.planner },
    { href: "/shop?kind=course", label: labels.course, k: "course", Icon: kindIcon.course },
  ];
  return (
    <nav className="chips" aria-label="Categories">
      {items.map(({ href, label, k, Icon }) => (
        <Link key={href} href={href} className={`chip ${k ? `c-${k}` : ""} ${path === "/shop" && kind === k ? "on" : ""}`}>
          <span className="chip-ic"><Icon size={15} /></span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
