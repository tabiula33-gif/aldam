"use client";

// Vertical navigation for the Mongol bichig version: a rail on the left,
// read top-to-bottom like the script itself.
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IconAll, IconSearch, kindIcon } from "./icons";

type Labels = { home: string; all: string; pdf: string; planner: string; course: string; search: string };

export default function SideNav({ labels }: { labels: Labels }) {
  const path = usePathname();
  const kind = useSearchParams().get("kind");
  const items = [
    { href: "/shop", label: labels.all, on: path === "/shop" && !kind, Icon: IconAll, cls: "" },
    { href: "/shop?kind=pdf", label: labels.pdf, on: path === "/shop" && kind === "pdf", Icon: kindIcon.pdf, cls: "c-pdf" },
    { href: "/shop?kind=planner", label: labels.planner, on: path === "/shop" && kind === "planner", Icon: kindIcon.planner, cls: "c-planner" },
    { href: "/shop?kind=course", label: labels.course, on: path === "/shop" && kind === "course", Icon: kindIcon.course, cls: "c-course" },
  ];
  return (
    <nav className="snav" aria-label="Categories">
      {items.map(({ href, label, on, Icon, cls }) => (
        <Link key={href} href={href} className={`snav-item ${cls} ${on ? "on" : ""}`}>
          <span className="chip-ic"><Icon size={16} /></span>
          <span className="vt">{label}</span>
        </Link>
      ))}
      <Link href="/shop?search=1" className={`snav-item ${path === "/shop" && !kind ? "" : ""}`} aria-label={labels.search}>
        <span className="chip-ic"><IconSearch size={16} /></span>
        <span className="vt">{labels.search}</span>
      </Link>
    </nav>
  );
}
