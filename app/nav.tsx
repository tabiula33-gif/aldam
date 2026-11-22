"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Labels = { all: string; pdf: string; planner: string; course: string };

export default function Nav({ labels }: { labels: Labels }) {
  const path = usePathname();
  const kind = useSearchParams().get("kind");
  const items: [string, string, string | null][] = [
    ["/", labels.all, null],
    ["/?kind=pdf", labels.pdf, "pdf"],
    ["/?kind=planner", labels.planner, "planner"],
    ["/?kind=course", labels.course, "course"],
  ];
  return (
    <nav className="nav" aria-label="Categories">
      {items.map(([href, label, k]) => (
        <Link key={href} href={href} className={path === "/" && kind === k ? "on" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
